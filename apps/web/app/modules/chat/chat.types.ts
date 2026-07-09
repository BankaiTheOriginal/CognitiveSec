export interface Chat {
  id: string;
  title: string;
  organizationId: string;
  teamId?: string | null;
  createdAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  text: string;
  citations?: any[];
  createdAt: Date;
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
