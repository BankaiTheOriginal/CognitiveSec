import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AiStorageService } from '../integrations/ai-storage.service';
import { DocumentConsumerProcessor } from './document-consumer.processor';
import { DocumentProducerService } from './document-producer.service';
import * as crypto from 'crypto';
import { DocStatus } from 'generated/prisma/enums';
@Injectable()
export class DocumentService {
  private readonly maxUploadSizeBytes = 20 * 1024 * 1024;
  private readonly allowedExtensions = ['.pdf', '.docx', '.txt', '.csv'];

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: AiStorageService,
    private documentProducer: DocumentProducerService,
    private documentConsumer: DocumentConsumerProcessor,
  ) {}

  private async recordActivity(input: {
    organizationId: string;
    actorId: string;
    action: string;
    entityType: string;
    entityId?: string;
    message: string;
    metadata?: unknown;
  }) {
    const actor = await this.prisma.user.findUnique({
      where: { id: input.actorId },
    });

    return this.prisma.activityEvent.create({
      data: {
        organizationId: input.organizationId,
        actorId: input.actorId,
        actorName: actor?.name ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        message: input.message,
        metadata: input.metadata as any,
      },
    });
  }

  private validateUpload(file: Express.Multer.File) {
    if (file.size > this.maxUploadSizeBytes) {
      throw new BadRequestException(
        `File ${file.originalname} is too large. Max size is 20MB.`,
      );
    }

    const lowerName = file.originalname.toLowerCase();
    const isAllowed = this.allowedExtensions.some((extension) =>
      lowerName.endsWith(extension),
    );

    if (!isAllowed) {
      throw new BadRequestException(
        `Unsupported file type for ${file.originalname}. Upload PDF, DOCX, TXT, or CSV files.`,
      );
    }
  }

  private validateUploads(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files were uploaded');
    }

    files.forEach((file) => this.validateUpload(file));
  }

  async getDocuments(organizationId: string) {
    const documents = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    return documents?.documents;
  }

  async uploadDocument(
    file: Express.Multer.File,
    userId: string,
    organization_id: string,
  ) {
    this.validateUpload(file);

    const fileName = file.originalname;
    const fileKey = `${fileName.toLowerCase().replace(/\s+/g, '-')}-${crypto.randomUUID()}`;
    await this.documentConsumer.extractTextFromBuffer(
      file.buffer,
      fileName,
    );
    await this.r2.uploadFileToR2(fileKey, file.buffer);

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

    await this.recordActivity({
      organizationId: organization_id,
      actorId: userId,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'document',
      entityId: document.id,
      message: `Uploaded ${fileName}`,
      metadata: {
        name: fileName,
        type: file.mimetype,
        fileKey,
      },
    });

    return document;
  }

  async uploadDocuments(
    files: Express.Multer.File[],
    userId: string,
    organization_id: string,
  ) {
    this.validateUploads(files);

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

    await this.r2.deleteFileFromR2(document.fileKey);

    await this.prisma.document.delete({
      where: {
        id: document.id,
      },
    });

    await this.recordActivity({
      organizationId: organization_id,
      actorId: user_id,
      action: 'DOCUMENT_DELETED',
      entityType: 'document',
      entityId: document.id,
      message: `Deleted ${document.name}`,
      metadata: {
        name: document.name,
        fileKey: document.fileKey,
      },
    });
  }

  async reindex(document_id: string, organization_id: string, user_id: string) {
    const document = await this.getDocument(
      document_id,
      organization_id,
      user_id,
    );

    await this.prisma.document.update({
      where: { id: document.id },
      data: { status: DocStatus.INDEXING },
    });

    await this.recordActivity({
      organizationId: organization_id,
      actorId: user_id,
      action: 'DOCUMENT_REINDEX_REQUESTED',
      entityType: 'document',
      entityId: document.id,
      message: `Requested reindex for ${document.name}`,
      metadata: {
        name: document.name,
        fileKey: document.fileKey,
      },
    });

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
