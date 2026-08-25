export interface UpdateOrg {
  name: string;
  slug: string;
}

export type DocStatus = "INDEXING" | "READY" | "FAILED";
export interface Document {
  id: string;
  name: string;
  fileKey: string;
  type: string;
  status: DocStatus;
  uploadedAt: string;
  uploadedBy: string;
  chunksCount: number;
  organizationId: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  sectionTitle: string | null;
  content: string;
  organizationId?: string;
}

export interface DocumentWithChunks extends Document {
  chunks: DocumentChunk[];
}
