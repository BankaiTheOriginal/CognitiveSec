import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AiStorageService } from '../integrations/ai-storage.service';
import { DocumentConsumerProcessor } from './document-consumer.processor';
import { DocumentProducerService } from './document-producer.service';
import * as crypto from 'crypto';
@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: AiStorageService,
    private documentProducer: DocumentProducerService,
    private documentConsumer: DocumentConsumerProcessor,
  ) {}

  async getDocuments(organizationId: string) {
    const documents = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { documents: true },
    });

    return documents?.documents;
  }

  async uploadDocument(
    file: Express.Multer.File,
    userId: string,
    organization_id: string,
  ) {
    const fileName = file.originalname;
    const fileKey = `${fileName.toLowerCase().replace(/\s+/g, '-')}-${crypto.randomUUID()}`;
    await this.r2.uploadFileToR2(fileKey, file.buffer);

    const fileContent = await this.documentConsumer.extractTextFromBuffer(
      file.buffer,
      fileName,
    );

    const document = await this.prisma.document.create({
      data: {
        name: fileName,
        fileKey,
        type: file.mimetype,
        uploadedBy: userId,
        organizationId: organization_id,
      },
    });
    await this.documentProducer.queueDocumentForParsing({
      documentId: document.id,
      organizationId: organization_id,
      fileKey,
      fileName,
    });
    return document;
  }

  async uploadDocuments(
    files: Express.Multer.File[],
    userId: string,
    organization_id: string,
  ) {
    const results = await Promise.all(
      files.map((file) => this.uploadDocument(file, userId, organization_id)),
    );
    return results;
  }

  async getDocument(
    document_id: string,
    organization_id: string,
    user_id: string,
  ) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user_id,
          organizationId: organization_id,
        },
      },
    });
    if (!membership)
      throw new ForbiddenException('User not a member of organization');

    const document = await this.prisma.document.findFirst({
      where: { id: document_id, organizationId: organization_id },
    });

    if (!document) throw new NotFoundException('Document not found');

    return document;
  }

  async deleteDocument(
    document_id: string,
    user_id: string,
    organization_id: string,
  ) {
    const document = await this.getDocument(
      document_id,
      organization_id,
      user_id,
    );

    await this.prisma.document.delete({
      where: {
        id: document.id,
      },
    });
  }

  async reindex(document_id: string, organization_id: string, user_id: string) {
    const document = await this.getDocument(
      document_id,
      organization_id,
      user_id,
    );
    return this.documentProducer.queueDocumentForParsing({
      documentId: document.id,
      organizationId: document.organizationId,
      fileKey: document.fileKey,
      fileName: document.name,
    });
  }

  async getChunks(
    document_id: string,
    organization_id: string,
    user_id: string,
  ) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user_id,
          organizationId: organization_id,
        },
      },
    });
    if (!membership)
      throw new ForbiddenException('User not a member of organization');

    const document = await this.prisma.document.findFirst({
      where: { id: document_id, organizationId: organization_id },
      include: { chunks: true },
    });

    if (!document) throw new NotFoundException('Document not found');

    return document;
  }

  async getStatus(
    document_id: string,
    organization_id: string,
    user_id: string,
  ) {
    const document = await this.getDocument(
      document_id,
      organization_id,
      user_id,
    );
    return document.status;
  }
}
