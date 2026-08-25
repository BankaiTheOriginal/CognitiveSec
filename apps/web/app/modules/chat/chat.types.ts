// apps/web/app/modules/chat/chat.types.ts

export interface Chat {
  id: string;
  title: string;
  organizationId: string;
  createdAt: string;
}

export interface Citation {
  documentId?: string;
  chunkId?: string;
  documentName?: string;
  sectionTitle?: string | null;
  snippet?: string;
  document_id?: string;
  chunk_id?: string;
  document_name?: string;
  section_title?: string | null;
}

export interface Message {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  text: string;
  citations?: Citation[] | null;
  createdAt: string;
}

export interface SendMessageInput {
  message: string;
}

export interface UpdateChatTitleInput {
  title: string;
}
