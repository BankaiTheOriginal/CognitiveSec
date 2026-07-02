import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AiStorageService } from '../integrations/ai-storage.service';
import { ChatInferenceService } from './chat-inference.service';

@Module({
  imports: [AiStorageService],
  controllers: [ChatController],
  providers: [ChatInferenceService],
})
export class ChatModule {}
