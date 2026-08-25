import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@Controller('organizations/:orgId/chats')
@UseGuards(JwtGuard, TenantGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('')
  async getChats(@CurrentUser() user: AuthenticatedUser) {
    return this.chatService.getChats(user.organizationId, user.id);
  }

  @Post('')
  async createChat(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { title?: string } = {},
  ) {
    return this.chatService.createChat(
      user.organizationId,
      user.id,
      body.title,
    );
  }

  @Get(':id')
  async getChat(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.chatService.getChat(user.organizationId, user.id, id);
  }

  @Delete(':id')
  async deleteChat(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.chatService.deleteChat(user.organizationId, user.id, id);
  }

  @Patch(':id/title')
  async updateChatTitle(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('title') title: string,
  ) {
    return this.chatService.updateChat(user.organizationId, user.id, id, title);
  }

  @Get(':id/messages')
  async getMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.chatService.getMessages(user.organizationId, user.id, id);
  }

  @Post(':id/messages')
  async sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('message') message: string,
  ) {
    return this.chatService.sendMessage(
      user.organizationId,
      id,
      user.id,
      message,
    );
  }
}
