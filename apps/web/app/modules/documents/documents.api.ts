import { api } from "@/app/common/api";

const base_url = `${process.env.API_URL}/documents`;

export async function getDocuments() {
  const response = await api.get(base_url);
  return response.data;
}

export async function upload(file: File) {
  const response = await api.post(`${base_url}/upload`, { file });
  return response.data;
}

export async function getDocument(id: string) {
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
