import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiStorageService {
  private readonly logger = new Logger(AiStorageService.name);
  private readonly r2Client: S3Client;

  private readonly openRouterKey = process.env.OPENROUTER_API_KEY;
  private readonly openRouterUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async downloadFileFromR2(fileKey: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: 'cognitive-sec',
      Key: fileKey,
    });

    const response = await this.r2Client.send(command);
    if (!response.Body) {
      throw new Error(
        `Cloudflare R2 returned an empty body for resource object: ${fileKey}`,
      );
    }

    const chunks: Buffer[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async generateOpenRouterEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        `${this.openRouterUrl}/embeddings`,
        {
          model: 'openai/text-embedding-3-small',
          input: text,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_SITE_URL || 'http://localhost:3000',
            'X-Title': 'Enterprise Multi-Tenant RAG Backend',
          },
        },
      );
      return response.data.data[0].embedding;
    } catch (error: any) {
      this.logger.error(
        'OpenRouter Embeddings engine invocation failed:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to generate semantic high-dimensional vector.');
    }
  }
}
