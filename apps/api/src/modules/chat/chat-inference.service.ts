// src/modules/chat/chat-inference.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AiStorageService } from '../integrations/ai-storage.service';
import axios from 'axios';
import { PrismaService } from 'src/prisma.service';
import { DocumentConsumerProcessor } from '../document/document-consumer.processor';

@Injectable()
export class ChatInferenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiStorage: AiStorageService,
  ) {}

  async executeContextualSearchAndAnswer(
    chatId: string,
    organizationId: string,
    userQueryMessage: string,
  ) {
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, organizationId },
    });
    if (!chat)
      throw new NotFoundException(
        'Requested conversation thread context missing.',
      );

    const queryEmbedding =
      await this.aiStorage.generateOpenRouterEmbedding(userQueryMessage);
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    const contextMatches = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, document_id, section_title, content, (embedding <=> '${embeddingString}'::vector) AS distance
      FROM document_chunks
      WHERE organization_id = '${organizationId}'
      ORDER BY distance ASC
      LIMIT 4;
    `);

    const groundTruthContextText = contextMatches
      .map(
        (match, index) =>
          `[Source Reference Document ID: ${match.document_id} | Index: ${index + 1}] Title: ${match.section_title || 'N/A'}\nContent: ${match.content}`,
      )
      .join('\n\n---\n\n');

    const runtimeSystemPrompt = `
      You are an enterprise assistant. You have access to information extracted from the user's organization files.
      
      GROUND TRUTH DATA CONTEXT ARCHIVE:
      """
      ${groundTruthContextText}
      """
      
      STRICT OPERATIONAL DIRECTIVES:
      1. Base your answer *only* on the provided ground truth data context archive above.
      2. If the context data does not contain the answer to the user's query, state clearly: "I cannot find a reliable answer to this question within the uploaded organization knowledge documents." Do not invent details.
      3. For every claim you make, cite your source using the format: [Source Reference Document ID: <uuid>].
      4. Always return your response as a valid, parsable JSON object matching this schema structure:
         {
           "answer": "Your detailed answer string incorporating inline markdown citations...",
           "citationsUsed": [{"document_id_1", "snippet"}, {"document_id_2", "snippet"}]
         }
    `;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [
          { role: 'system', content: runtimeSystemPrompt },
          { role: 'user', content: userQueryMessage },
        ],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const completionPayload = JSON.parse(
      response.data.choices[0].message.content,
    );

    return await this.prisma.$transaction(async (tx) => {
      await tx.message.create({
        data: { chatId, role: 'user', text: userQueryMessage },
      });

      const savedAssistantMessage = await tx.message.create({
        data: {
          chatId,
          role: 'assistant',
          text: completionPayload.answer,
          citations: completionPayload.citationsUsed,
        },
      });

      return savedAssistantMessage;
    });
  }
}
