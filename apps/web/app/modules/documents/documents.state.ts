import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  chunks,
  deleteDocument,
  getDocument,
  getDocuments,
  reindex,
  status,
  upload,
} from "./documents.api";

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });
}

export function useUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => getDocument(id),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useReindexDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reindex(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documents", variables] });
    },
  });
}

export function useChunks(id: string) {
  return useQuery({
    queryKey: ["documents", id, "chunks"],
    queryFn: () => chunks(id),
  });
}

export function useStatus(id: string) {
  return useQuery({
    queryKey: ["documents", id, "status"],
    queryFn: () => status(id),
  });
}
