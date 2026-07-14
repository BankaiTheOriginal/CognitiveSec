export interface UpdateOrg {
  name: string;
  slug: string;
}

export type DocStatus = "INDEXING" | "READY" | "FAILED";
export interface Document {
  id: string;
  name: string;
  fileKey: string;
  type: string;
  status: DocStatus;
  uploadedAt: string;
  uploadedBy: string;
  chunksCount: string;
  organizationId: string;
}
