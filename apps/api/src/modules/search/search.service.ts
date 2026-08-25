import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

type SearchChatResult = {
  id: string;
  title: string;
  createdAt: Date;
  snippet: string | null;
  matchType: 'title' | 'message';
};

type SearchDocumentResult = {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  snippet: string | null;
  sectionTitle: string | null;
  matchType: 'name' | 'chunk';
};

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  private truncate(text: string, max = 140) {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned.length <= max) return cleaned;
    return `${cleaned.slice(0, max - 1).trimEnd()}…`;
  }

  async search(organizationId: string, userId: string, q: string) {
    const query = q.trim();
    if (!query) {
      return { chats: [], documents: [] };
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) {
      return { chats: [], documents: [] };
    }

    const [chats, documents] = await Promise.all([
      this.prisma.chat.findMany({
        where: {
          organizationId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            {
              messages: {
                some: { text: { contains: query, mode: 'insensitive' } },
              },
            },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          title: true,
          createdAt: true,
          messages: {
            where: { text: { contains: query, mode: 'insensitive' } },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { text: true },
          },
        },
      }),
      this.prisma.document.findMany({
        where: {
          organizationId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            {
              chunks: {
                some: {
                  OR: [
                    { content: { contains: query, mode: 'insensitive' } },
                    { sectionTitle: { contains: query, mode: 'insensitive' } },
                  ],
                },
              },
            },
          ],
        },
        orderBy: { uploadedAt: 'desc' },
        take: 8,
        select: {
          id: true,
          name: true,
          status: true,
          uploadedAt: true,
          chunks: {
            where: {
              OR: [
                { content: { contains: query, mode: 'insensitive' } },
                { sectionTitle: { contains: query, mode: 'insensitive' } },
              ],
            },
            orderBy: { id: 'asc' },
            take: 1,
            select: { sectionTitle: true, content: true },
          },
        },
      }),
    ]);

    const chatResults: SearchChatResult[] = chats.map((chat) => {
      const matchedMessage = chat.messages[0];
      const titleMatched = chat.title
        .toLowerCase()
        .includes(query.toLowerCase());

      return {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        matchType: titleMatched ? 'title' : 'message',
        snippet: titleMatched
          ? 'Chat title matched your search'
          : matchedMessage
            ? this.truncate(matchedMessage.text)
            : null,
      };
    });

    const documentResults: SearchDocumentResult[] = documents.map((document) => {
      const matchedChunk = document.chunks[0];
      const nameMatched = document.name
        .toLowerCase()
        .includes(query.toLowerCase());

      return {
        id: document.id,
        name: document.name,
        status: document.status,
        createdAt: document.uploadedAt,
        matchType: nameMatched ? 'name' : 'chunk',
        sectionTitle: matchedChunk?.sectionTitle ?? null,
        snippet: nameMatched
          ? 'Document name matched your search'
          : matchedChunk
            ? this.truncate(matchedChunk.content)
            : null,
      };
    });

    return {
      chats: chatResults,
      documents: documentResults,
    };
  }
}
