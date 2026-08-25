export interface SearchChatResult {
  id: string;
  title: string;
  createdAt: string;
  snippet: string | null;
  matchType: "title" | "message";
}

export interface SearchDocumentResult {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  snippet: string | null;
  sectionTitle: string | null;
  matchType: "name" | "chunk";
}

export interface SearchResponse {
  chats: SearchChatResult[];
  documents: SearchDocumentResult[];
}
