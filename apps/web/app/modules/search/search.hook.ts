import { useQuery } from "@tanstack/react-query";
import { search } from "./search.api";

export function useSearch(query: string) {
  const normalized = query.trim();

  return useQuery({
    queryKey: ["search", normalized],
    queryFn: () => search(normalized),
    enabled: normalized.length > 1,
  });
}
