import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { DocumentProducerService } from './document-producer.service';
import { DocumentConsumerProcessor } from './document-consumer.processor';
import { AiStorageService } from '../integrations/ai-storage.service';
import { PrismaService } from 'src/prisma.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'document-ingestion',
    }),
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    DocumentProducerService,
    DocumentConsumerProcessor,
    AiStorageService,
    PrismaService,
  ],
})
export class DocumentModule {}
