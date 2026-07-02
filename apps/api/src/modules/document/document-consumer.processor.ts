import { Processor, WorkerHost } from '@nestjs/bullmq';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SemanticTextSplitter } from 'src/common/utils/text-splitter';
import { PrismaService } from 'src/prisma.service';
import { AiStorageService } from '../integrations/ai-storage.service';
import { Job } from 'bullmq';
import { IngestionJobPayload } from './document-producer.service';
import { DocStatus } from 'generated/prisma/enums';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

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
    const { documentId, organizationId, fileUrl } = job.data;
    this.logger.log(
      `Executing live ingestion worker pipeline for document token: ${documentId}`,
    );

    try {
      const fileBuffer = await this.aiStorage.downloadFileFromR2(fileUrl);
      const rawExtractedText = await this.extractTextFromBuffer(
        fileBuffer,
        job.data.fileUrl,
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
          VALUES (gen_random_uuid(), '${documentId}'::uuid, '${organizationId}'::uuid, 'Chunk ${i + 1}', $1, '${vectorString}'::vector)
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

  private async extractTextFromBuffer(
    buffer: Buffer,
    fileKey: string,
  ): Promise<string> {
    if (fileKey.endsWith('.csv') || fileKey.endsWith('.txt')) {
      return buffer.toString('utf-8');
    }

    if (fileKey.endsWith('.pdf')) {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();

      await parser.destroy();

      const text = result.text.trim();

      if (!text) {
        throw new BadRequestException('Could not extract text from PDF file');
      }

      return text;
    }

    if (fileKey.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });

      const text = result.value.trim();

      if (!text) {
        throw new BadRequestException('Could not extract text from DOCX file');
      }

      return text;
    }

    return buffer.toString('utf-8');
  }
}
