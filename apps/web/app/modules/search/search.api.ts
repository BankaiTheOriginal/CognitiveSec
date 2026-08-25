import { api } from "@/app/common/api";
import type { SearchResponse } from "./search.types";

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/search`;

export async function search(q: string): Promise<SearchResponse> {
  const response = await api.get(baseUrl, {
    params: { q },
  });
  return response.data as SearchResponse;
}
