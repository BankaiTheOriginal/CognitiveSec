import { Processor, WorkerHost } from '@nestjs/bullmq';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SemanticTextSplitter } from 'src/common/utils/text-splitter';
import { PrismaService } from 'src/prisma.service';
import { AiStorageService } from '../integrations/ai-storage.service';
import { Job } from 'bullmq';
import { IngestionJobPayload } from './document-producer.service';
import { DocStatus } from 'generated/prisma/enums';
import * as pdfModule from 'pdf-parse';
import mammoth from 'mammoth';

const pdf = (pdfModule as any).default;

@Processor('document-ingestion')
@Injectable()
export class DocumentConsumerProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentConsumerProcessor.name);
  private readonly splitter = new SemanticTextSplitter();

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiStorage: AiStorageService,
  ) {
    super();
  }

  async process(job: Job<IngestionJobPayload, any, string>): Promise<any> {
    const { documentId, organizationId, fileKey, fileName } = job.data;
    this.logger.log(
      `Executing live ingestion worker pipeline for document token: ${documentId}`,
    );

    try {
      const fileBuffer = await this.aiStorage.downloadFileFromR2(fileKey);
      const rawExtractedText = await this.extractTextFromBuffer(
        fileBuffer,
        fileName,
      );
      const chunks = this.splitter.splitText(rawExtractedText);

      if (chunks.length === 0)
        throw new Error('Target document contains no extractable text strings');

      await this.prisma.documentChunk.deleteMany({
        where: { documentId },
      });

      for (let i = 0; i < chunks.length; i++) {
        const contentSegment = chunks[i];

        const liveEmbeddingVector =
          await this.aiStorage.generateOpenRouterEmbedding(contentSegment);
        const vectorString = `[${liveEmbeddingVector.join(',')}]`;

        await this.prisma.$executeRawUnsafe(
          `
          INSERT INTO "document_chunks" (id, document_id, organization_id, section_title, content, embedding)
          VALUES (gen_random_uuid(), '${documentId}', '${organizationId}', 'Chunk ${i + 1}', $1, '${vectorString}'::vector)
        `,
          contentSegment,
        );
      }
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: DocStatus.READY,
          chunksCount: chunks.length,
        },
      });
      return { success: true, chunksVectorized: chunks.length };
    } catch (error: any) {
      this.logger.error(
        `Fatal processing failure on document tracking ID: ${documentId}`,
        error.stack,
      );

      await this.prisma.document
        .update({
          where: { id: documentId },
          data: { status: DocStatus.FAILED },
        })
        .catch((dbErr) =>
          this.logger.error(
            'Failed to change target status state to FAILED',
            dbErr,
          ),
        );

      throw error;
    }
  }

  async extractTextFromBuffer(
    buffer: Buffer,
    fileName: string,
  ): Promise<string> {
    const lowerName = fileName.toLowerCase();

    if (lowerName.endsWith('.csv') || lowerName.endsWith('.txt')) {
      return buffer.toString('utf-8');
    }

    if (lowerName.endsWith('.pdf')) {
      try {
        const parsedData = await pdf(buffer);
        const text = parsedData.text.trim();

        if (!text) {
          throw new BadRequestException('Could not extract text from PDF file');
        }

        return text;
      } catch (error: any) {
        throw new BadRequestException(`PDF Parsing failed: ${error.message}`);
      }
    }

    if (lowerName.endsWith('.docx')) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value.trim();

        if (!text) {
          throw new BadRequestException(
            'Could not extract text from DOCX file',
          );
        }

        return text;
      } catch (error: any) {
        throw new BadRequestException(`DOCX Parsing failed: ${error.message}`);
      }
    }
    return buffer.toString('utf-8');
  }
}
