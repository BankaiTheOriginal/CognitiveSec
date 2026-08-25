import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { ChatInferenceService } from './chat-inference.service';

const DEFAULT_CHAT_TITLE = 'New chat';

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
      where: {
        organizationId: membership.organizationId,
      },
    });
  }

  private generateChatTitleFromMessage(message: string) {
    const cleaned = message
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[?!.]+$/g, '')
      .replace(/[^\w\s'-]/g, '');

    const stopWords = new Set([
      'a',
      'an',
      'and',
      'are',
      'as',
      'at',
      'be',
      'but',
      'by',
      'can',
      'could',
      'do',
      'does',
      'for',
      'from',
      'how',
      'i',
      'if',
      'in',
      'is',
      'it',
      'me',
      'my',
      'need',
      'of',
      'on',
      'or',
      'please',
      'should',
      'tell',
      'that',
      'the',
      'to',
      'up',
      'us',
      'was',
      'what',
      'when',
      'where',
      'which',
      'who',
      'why',
      'with',
      'would',
      'you',
      'your',
    ]);

    const words = cleaned.split(' ').filter(Boolean);
    const meaningfulWords = words.filter(
      (word, index) => !stopWords.has(word.toLowerCase()) || index === 0,
    );
    const titleWords = (meaningfulWords.length ? meaningfulWords : words)
      .slice(0, 6)
      .map((word) =>
        word
          .split('-')
          .map((segment) =>
            segment
              ? segment[0].toUpperCase() + segment.slice(1).toLowerCase()
              : segment,
          )
          .join('-'),
      );

    const title =
      titleWords.join(' ').trim() || DEFAULT_CHAT_TITLE;

    return title.length > 60 ? `${title.slice(0, 57).trimEnd()}...` : title;
  }

  async createChat(organization_id: string, user_id: string, title?: string) {
    const membership = await this.authService.findUserInOrg(
      user_id,
      organization_id,
    );

    const chat = await this.prisma.chat.create({
      data: {
        title: title?.trim() || DEFAULT_CHAT_TITLE,
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
        organizationId: membership.organizationId,
        id: chat_id,
      },
      select: { messages: true },
    });

    if (!chat) throw new NotFoundException('Chat messages not found');

    return chat.messages;
  }

  async sendMessage(
    organization_id: string,
    chat_id: string,
    user_id: string,
    message: string,
  ) {
    const chat = await this.getChat(organization_id, user_id, chat_id);
    const shouldAutoTitle =
      chat.title === DEFAULT_CHAT_TITLE &&
      (await this.prisma.message.count({ where: { chatId: chat.id } })) === 0;
    const autoTitlePromise = shouldAutoTitle
      ? this.chatInference
          .generateChatTitle(message)
          .catch(() => this.generateChatTitleFromMessage(message))
      : Promise.resolve<string | null>(null);

    const [assistantMessage, autoTitle] = await Promise.all([
      this.chatInference.executeContextualSearchAndAnswer(
        chat.id,
        chat.organizationId,
        message,
      ),
      autoTitlePromise,
    ]);

    if (autoTitle) {
      await this.prisma.chat.update({
        where: { id: chat.id },
        data: { title: autoTitle },
      });
    }

    return assistantMessage;
  }
}
