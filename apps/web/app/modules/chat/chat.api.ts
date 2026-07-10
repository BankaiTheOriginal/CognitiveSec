import { api } from "@/app/common/api";
import { useAuthStore } from "../auth/auth.store";
import {
  Chat,
  CreateChatInput,
  Message,
  SendMessageInput,
  UpdateChatTitleInput,
} from "./chat.types";

const getBaseUrl = () => {
  const orgId = useAuthStore.getState().activeOrganizationId;
  return `${process.env.NEXT_PUBLIC_API_URL}/organizations/${orgId}/chats`;
};

export async function getChats(): Promise<Chat[]> {
  const response = await api.get(getBaseUrl());
  return response.data;
}

export async function getChat(id: string): Promise<Chat> {
  const response = await api.get(`${getBaseUrl()}/${id}`);
  return response.data;
}

export async function createChat(data: CreateChatInput): Promise<Chat> {
  const response = await api.post(getBaseUrl(), { ...data });
  return response.data;
}

export async function deleteChat(id: string): Promise<void> {
  await api.delete(`${getBaseUrl()}/${id}`);
}

export async function updateChatTitle(
  id: string,
  data: UpdateChatTitleInput,
): Promise<Chat> {
  const response = await api.patch(`${getBaseUrl()}/${id}/title`, { ...data });
  return response.data;
}

export async function getMessages(id: string): Promise<Message[]> {
  const response = await api.get(`${getBaseUrl()}/${id}/messages`);
  return response.data;
}

export async function sendMessage(
  id: string,
  data: SendMessageInput,
): Promise<Message> {
  const response = await api.post(`${getBaseUrl()}/${id}/messages`, {
    ...data,
  });
  return response.data;
}
