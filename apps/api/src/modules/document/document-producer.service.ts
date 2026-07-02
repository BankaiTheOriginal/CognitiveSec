// src/modules/document/document-producer.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface IngestionJobPayload {
  documentId: string;
  organizationId: string;
  fileUrl: string;
}

@Injectable()
export class DocumentProducerService {
  constructor(
    @InjectQueue('document-ingestion') private readonly ingestionQueue: Queue,
  ) {}

  async queueDocumentForParsing(payload: IngestionJobPayload): Promise<string> {
    const job = await this.ingestionQueue.add('parse-and-vectorize', payload, {
      jobId: payload.documentId,
    });
    return job.id!;
  }
}
