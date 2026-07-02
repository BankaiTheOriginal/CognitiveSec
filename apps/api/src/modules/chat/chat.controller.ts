import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { IsNotEmpty, IsString } from 'class-validator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { ChatInferenceService } from './chat-inference.service';

class QueryMessageDto {
  @IsString()
  @IsNotEmpty()
  message!: string;
}
@Controller('organizations/:orgId/chats')
@UseGuards(JwtGuard, TenantGuard)
export class ChatController {
  constructor(private readonly chatService: ChatInferenceService) {}

  @Post(':chatId/query')
  async postQuery(
    @Param('chatId') chatId: string,
    @Body() dto: QueryMessageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.chatService.executeContextualSearchAndAnswer(
      chatId,
      user.id,
      dto.message,
    );
  }
}
