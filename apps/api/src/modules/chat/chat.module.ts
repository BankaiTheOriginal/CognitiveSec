import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatInferenceService } from './chat-inference.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { AiStorageService } from '../integrations/ai-storage.service';

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatInferenceService,
    PrismaService,
    AiStorageService,
  ],
})
export class ChatModule {}
