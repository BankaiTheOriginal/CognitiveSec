// apps/web/app/modules/chat/chat.types.ts

export interface Chat {
  id: string;
  title: string;
  organizationId: string;
  teamId?: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  text: string;
  citations?: {
    documentId: string;
    chunkId: string;
    snippet: string;
  }[];
  createdAt: string;
}

export interface CreateChatInput {
  title: string;
}

export interface SendMessageInput {
  message: string;
}

export interface UpdateChatTitleInput {
  title: string;
}

export type ChatsResponse = Chat[];
export type ChatResponse = Chat;
export type MessagesResponse = Message[];
export type MessageResponse = Message;

// Optional: For chat list item in UI
export interface ChatListItem extends Chat {
  lastMessage?: string;
  lastMessageAt?: string;
}
