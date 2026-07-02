import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { AiStorageService } from '../integrations/ai-storage.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'document-ingestion',
    }),
  ],
  controllers: [DocumentController],
  providers: [DocumentService, AiStorageService],
})
export class DocumentModule {}
