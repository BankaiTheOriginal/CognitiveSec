interface SplitterOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export class SemanticTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(options?: SplitterOptions) {
    this.chunkSize = options?.chunkSize || 1500;
    this.chunkOverlap = options?.chunkOverlap || 300;

    if (this.chunkOverlap >= this.chunkSize) {
      throw new Error(
        'Overlap size cannot be greater than or equal to the total chunk size.',
      );
    }
  }

  splitText(rawText: string): string[] {
    if (!rawText || rawText.trim().length === 0) return [];

    const paragraphs = rawText.split(/\n{2,}/);
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const paragraph of paragraphs) {
      const cleanParagraph = paragraph.trim();
      if (!cleanParagraph) continue;

      if (cleanParagraph.length > this.chunkSize) {
        const sentences = cleanParagraph.match(/[^.!?]+[.!?]+(\s|$)/g) || [
          cleanParagraph,
        ];
        for (const sentence of sentences) {
          const cleanSentence = sentence.trim();
          if (
            currentLength + cleanSentence.length > this.chunkSize &&
            currentChunk.length > 0
          ) {
            chunks.push(currentChunk.join(' '));
            currentChunk = this.getOverlappingBuffer(currentChunk);
            currentLength = currentChunk.join(' ').length;
          }
          currentChunk.push(cleanSentence);
          currentLength += cleanSentence.length + 1;
        }
      } else {
        if (
          currentLength + cleanParagraph.length > this.chunkSize &&
          currentChunk.length > 0
        ) {
          chunks.push(currentChunk.join('\n\n'));
          currentChunk = this.getOverlappingBuffer(currentChunk);
          currentLength = currentChunk.join('\n\n').length;
        }
        currentChunk.push(cleanParagraph);
        currentLength += cleanParagraph.length + 2;
      }
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n\n'));
    }

    return chunks;
  }

  private getOverlappingBuffer(wordArray: string[]): string[] {
    const buffer: string[] = [];
    let accumulatedSize = 0;

    for (let i = wordArray.length - 1; i >= 0; i--) {
      const item = wordArray[i];
      if (accumulatedSize + item.length <= this.chunkOverlap) {
        buffer.unshift(item);
        accumulatedSize = item.length;
      } else {
        break;
      }
    }
    return buffer;
  }
}
