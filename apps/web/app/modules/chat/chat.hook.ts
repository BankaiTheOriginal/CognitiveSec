import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createChat,
  deleteChat,
  getChat,
  getChats,
  getMessages,
  sendMessage,
  updateChatTitle,
} from "./chat.api";
import { SendMessageInput, UpdateChatTitleInput } from "./chat.types";

export const useGetChats = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: getChats,
  });
};

export const useGetChat = (id: string) => {
  return useQuery({
    queryKey: ["chats", id],
    queryFn: () => getChat(id),
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => createChat(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteChat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};

export const useUpdateChatTitle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChatTitleInput }) =>
      updateChatTitle(id, data),
    onSuccess: (returnedData, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chats", variables.id] });
    },
  });
};

export const useGetMessages = (id: string) => {
  return useQuery({
    queryKey: ["chats", id, "messages"],
    queryFn: () => getMessages(id),
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SendMessageInput }) =>
      sendMessage(id, data),
    onSuccess: (returnedData, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chats", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["chats", variables.id, "messages"],
      });
    },
  });
};
