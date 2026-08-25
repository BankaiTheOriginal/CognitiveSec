import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  chunks,
  deleteDocument,
  getDocument,
  getDocuments,
  reindex,
  status,
  uploadFilesWithProgress,
} from "./documents.api";
import { toast } from "sonner";
export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
    refetchInterval: (query) =>
      query.state.data?.some((document) => document.status === "INDEXING")
        ? 5000
        : false,
  });
}

export function useUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      files,
      onProgress,
    }: {
      files: File[];
      onProgress?: (progress: number) => void;
    }) => uploadFilesWithProgress(files, onProgress),
    onMutate: () => {
      const toastId = toast.loading("Uploading documents", {
        description: "Files are being validated and queued",
      });
      return { toastId };
    },
    onSuccess: (data, _variables, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      toast.success("Files uploaded successfully", {
        description: `${data?.length || 0} file(s) queued for processing`,
      });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.refetchQueries({ queryKey: ["documents"] });
    },
    onError: (error: any, _variables, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      toast.error("Upload failed", {
        description: error?.message || "Please check the file type and size.",
      });
    },
  });
}

export function useDocument(id: string, enabled = true) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => getDocument(id),
    enabled: enabled && Boolean(id),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted");
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
      toast.success("Reindex queued");
    },
  });
}

export function useChunks(id: string, enabled = true) {
  return useQuery({
    queryKey: ["documents", id, "chunks"],
    queryFn: () => chunks(id),
    enabled: enabled && Boolean(id),
  });
}

export function useStatus(id: string) {
  return useQuery({
    queryKey: ["documents", id, "status"],
    queryFn: () => status(id),
    enabled: Boolean(id),
  });
}
