import { api } from "@/app/common/api";
import { Document } from "./documents.types";

const base_url = `${process.env.NEXT_PUBLIC_API_URL}/documents`;

export async function getDocuments(): Promise<Document[]> {
  const response = await api.get(base_url);
  return response.data;
}

export async function uploadFiles(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await api.post(`${base_url}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getDocument(id: string): Promise<Document> {
  const response = await api.get(`${base_url}/${id}`);
  return response.data;
}

export async function deleteDocument(id: string) {
  await api.delete(`${base_url}/${id}`);
}

export async function reindex(id: string) {
  const response = await api.post(`${base_url}/${id}/reindex`);
  return response.data;
}

export async function chunks(id: string) {
  const response = await api.get(`${base_url}/${id}/chunks`);
  return response.data;
}

export async function status(id: string) {
  const response = await api.get(`${base_url}/${id}/status`);
  return response.data;
}
