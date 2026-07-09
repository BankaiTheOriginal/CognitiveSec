import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  chunks,
  deleteDocument,
  getDocument,
  getDocuments,
  reindex,
  status,
  upload,
} from "./documents.api";

export const useDocuments = () => {
  return useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });
};

export const useUpload = () => {
  const queryClient = new QueryClient();
  return useMutation({
    mutationFn: upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => getDocument(id),
  });
};

export const useDeleteDocument = () => {
  const queryClient = new QueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};

export const useReindexDocument = () => {
  const queryClient = new QueryClient();
  return useMutation({
    mutationFn: (id: string) => reindex(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};

export const useChunks = (id: string) => {
  return useQuery({
    queryKey: ["documents", id, "chunks"],
    queryFn: () => chunks(id),
  });
};

export const useStatus = (id: string) => {
  return useQuery({
    queryKey: ["documents", id, "status"],
    queryFn: () => status(id),
  });
};
