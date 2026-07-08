import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { CreateChat } from './dto/chat.dto';
import { ChatInferenceService } from './chat-inference.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly chatInference: ChatInferenceService,
  ) {}

  async getChats(organization_id: string, user_id: string) {
    const membership = await this.authService.findUserInOrg(
      user_id,
      organization_id,
    );

    return this.prisma.chat.findMany({
      where: { organizationId: membership.organizationId },
      select: { title: true, createdAt: true },
    });
  }

  async createChat(organization_id: string, user_id: string, data: CreateChat) {
    const membership = await this.authService.findUserInOrg(
      user_id,
      organization_id,
    );

    const chat = await this.prisma.chat.create({
      data: {
        title: data.title,
        organizationId: membership.organizationId,
      },
    });
    return chat;
  }

  async getChat(organization_id: string, user_id: string, chat_id: string) {
    const membership = await this.authService.findUserInOrg(
      user_id,
      organization_id,
    );
    const chat = await this.prisma.chat.findFirst({
      where: { id: chat_id, organizationId: membership.organizationId },
    });

    if (!chat) throw new NotFoundException('Chat not found');

    return chat;
  }

  async deleteChat(organization_id: string, user_id: string, chat_id: string) {
    const chat_d = await this.getChat(organization_id, user_id, chat_id);
    await this.prisma.chat.delete({ where: { id: chat_d.id } });
    return { message: 'Chat deleted successfully' };
  }

  async updateChat(
    organization_id: string,
    user_id: string,
    chat_id: string,
    title: string,
  ) {
    const chat = await this.getChat(organization_id, user_id, chat_id);
    const updatedChat = await this.prisma.chat.update({
      where: { id: chat.id },
      data: { title },
    });

    return updatedChat;
  }

  async getMessages(organization_id: string, user_id: string, chat_id: string) {
    const membership = await this.authService.findUserInOrg(
      user_id,
      organization_id,
    );
    const chat = await this.prisma.chat.findFirst({
      where: {
        organizationId: membership.userId,
        id: chat_id,
      },
      select: { messages: true },
    });

    if (!chat) throw new NotFoundException('Chat messages not found');

    return chat;
  }

  async sendMessage(
    organization_id: string,
    chat_id: string,
    user_id: string,
    message: string,
  ) {
    const chat = await this.getChat(organization_id, user_id, chat_id);
    return this.chatInference.executeContextualSearchAndAnswer(
      chat.id,
      chat.organizationId,
      message,
    );
  }
}
