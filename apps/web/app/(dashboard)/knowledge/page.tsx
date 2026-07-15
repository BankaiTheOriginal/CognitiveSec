"use client";
import {
  useDeleteDocument,
  useDocuments,
} from "@/app/modules/documents/documents.hook";
import { Database, Plus, Trash, Trash2 } from "lucide-react";

export default function page() {
  const { data: documents } = useDocuments();
  const { mutateAsync: deleteDocument } = useDeleteDocument();
  const handleDelete = async (id: string) => {
    await deleteDocument(id);
  };
  return (
    <div className="grid grid-rows-2 min-h-[90vh]">
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              <span className="font-semibold font-display">
                Corporate Context Store
              </span>
            </div>
            <span className="text-slate-500 font-display text-xs">
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
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-4 text-sm font-semibold font-display tracking-tight truncate">
                    {document.name}
                  </td>

                  <td className="px-4 py-4 text-sm font-display tracking-tight text-slate-500">
                    {document.name.split(".").pop()}
                  </td>

                  {document.status && document.status === "READY" ? (
                    <td className="px-4 py-4">
                      <div className="bg-green-50 rounded-xl border border-green-500 items-center justify-center flex w-fit px-2 text-xs text-green-800 font-bold font-display">
                        <span>Active Vector</span>
                      </div>
                    </td>
                  ) : document.status === "FAILED" ? (
                    <td className="px-4 py-4">
                      <div className="bg-red-50 rounded-xl border border-red-500 items-center justify-center flex w-fit px-2 text-xs text-red-800 font-bold font-display">
                        <span>Active Vector</span>
                      </div>
                    </td>
                  ) : document.status === "INDEXING" ? (
                    <td className="px-4 py-4">
                      <div className="bg-yellow-50 rounded-xl border border-yellow-500 items-center justify-center flex w-fit px-2 text-xs text-yellow-800 font-bold font-display">
                        <span>Active Vector</span>
                      </div>
                    </td>
                  ) : (
                    <td className="px-4 py-4">
                      <div className="bg-slate-300 rounded-xl border border-slate-500 items-center justify-center flex w-fit px-2 text-xs text-slate-800 font-bold font-display">
                        <span>Unkown status</span>
                      </div>
                    </td>
                  )}

                  <td className="px-4 py-4 font-bold text-xs font-display">
                    {document.chunksCount} chunks
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button onClick={() => handleDelete(document.id)}>
                      <Trash2 className="w-4 h-4 text-slate-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
