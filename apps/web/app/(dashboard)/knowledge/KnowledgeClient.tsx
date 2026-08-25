"use client";

import {
  useDeleteDocument,
  useDocuments,
  useReindexDocument,
} from "@/app/modules/documents/documents.hook";
import { Database, RefreshCw, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import DocumentDrawer from "@/components/parts/knowledge/DocumentDrawer";

export default function KnowledgeClient() {
  const { data: documents } = useDocuments();
  const { mutateAsync: deleteDocument } = useDeleteDocument();
  const { mutateAsync: reindexDocument, isPending: isReindexing } =
    useReindexDocument();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDocumentId = searchParams.get("document");

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
  };

  const handleReindex = async (id: string) => {
    await reindexDocument(id);
  };

  const handleOpenDocument = (id: string) => {
    router.push(`/knowledge?document=${id}`);
  };

  const handleCloseDocument = () => {
    router.replace("/knowledge");
  };

  return (
    <>
      <div className="grid min-h-[90vh] grid-rows-2">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <Database className="h-5 w-5 text-indigo-600" />
                <span className="font-semibold font-display">
                  Corporate Context Store
                </span>
              </div>
              <span className="font-display text-xs text-slate-500">
                Review uploaded business assets and documents
              </span>
            </div>
          </div>
          <div className="border-t"></div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full table-auto">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Filename
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Format
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Chunks
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {documents?.map((document) => (
                  <tr
                    key={document.id}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                    onClick={() => handleOpenDocument(document.id)}
                    tabIndex={0}
                  >
                    <td className="px-4 py-4 text-sm font-semibold font-display tracking-tight truncate">
                      {document.name}
                    </td>

                    <td className="px-4 py-4 text-sm font-display tracking-tight text-slate-500">
                      {document.name.split(".").pop()}
                    </td>

                    {document.status === "READY" ? (
                      <td className="px-4 py-4">
                        <div className="flex w-fit items-center justify-center rounded-xl border border-green-500 bg-green-50 px-2 text-xs font-bold text-green-800 font-display">
                          <span>Ready</span>
                        </div>
                      </td>
                    ) : document.status === "FAILED" ? (
                      <td className="px-4 py-4">
                        <div className="flex w-fit items-center justify-center rounded-xl border border-red-500 bg-red-50 px-2 text-xs font-bold text-red-800 font-display">
                          <span>Needs reindex</span>
                        </div>
                      </td>
                    ) : document.status === "INDEXING" ? (
                      <td className="px-4 py-4">
                        <div className="flex w-fit items-center justify-center rounded-xl border border-yellow-500 bg-yellow-50 px-2 text-xs font-bold text-yellow-800 font-display">
                          <span>Indexing</span>
                        </div>
                      </td>
                    ) : (
                      <td className="px-4 py-4">
                        <div className="flex w-fit items-center justify-center rounded-xl border border-slate-500 bg-slate-300 px-2 text-xs font-bold text-slate-800 font-display">
                          <span>Unknown status</span>
                        </div>
                      </td>
                    )}

                    <td className="px-4 py-4 font-bold text-xs font-display">
                      {document.chunksCount} chunks
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReindex(document.id);
                          }}
                          disabled={isReindexing || document.status === "INDEXING"}
                          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                          title={
                            document.status === "FAILED"
                              ? "Retry indexing"
                              : "Reindex document"
                          }
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(document.id);
                          }}
                          className="rounded-full p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          title="Delete document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DocumentDrawer
        documentId={selectedDocumentId}
        onClose={handleCloseDocument}
      />
    </>
  );
}
