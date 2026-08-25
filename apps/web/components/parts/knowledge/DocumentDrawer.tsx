"use client";

import { useChunks, useDocument } from "@/app/modules/documents/documents.hook";
import { BookOpenText, CalendarDays, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function DocumentDrawer({
  documentId,
  onClose,
}: {
  documentId: string | null;
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { data: document, isLoading: documentLoading } = useDocument(
    documentId || "",
    Boolean(documentId),
  );
  const { data: documentWithChunks, isLoading: chunksLoading } = useChunks(
    documentId || "",
    Boolean(documentId),
  );

  useEffect(() => {
    if (!documentId) return;

    setIsVisible(false);
    const raf = window.requestAnimationFrame(() => setIsVisible(true));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [documentId, onClose]);

  if (!documentId) return null;

  const chunks = documentWithChunks?.chunks || [];

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close document drawer"
        onClick={onClose}
        className="absolute inset-0 z-0 h-full w-full bg-slate-950/35 backdrop-blur-md"
      />

      <aside
        className="absolute right-0 top-0 z-10 flex h-full w-full max-w-2xl flex-col border-l border-white/20 bg-white/95 shadow-2xl shadow-slate-950/20 backdrop-blur-xl"
        style={{
          transform: isVisible ? "translateX(0)" : "translateX(100%)",
          opacity: isVisible ? 1 : 0,
          transition: "transform 300ms ease-out, opacity 300ms ease-out",
        }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <BookOpenText className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-900">
                Document Preview
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Search results can open documents directly here
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close document preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-tight font-display text-slate-400">
              Document Name
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
              {document?.name || "Loading document..."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {document?.uploadedAt
                  ? new Date(document.uploadedAt).toLocaleDateString()
                  : "Unknown date"}
              </span>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-display font-semibold uppercase tracking-tight text-slate-400">
                Segments
              </p>
              {chunks.length > 0 ? (
                <span className="text-[10px] font-medium text-slate-500">
                  {chunks.length} chunk{chunks.length === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>

            <div className="mt-2 space-y-2">
              {documentLoading || chunksLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                  Loading document segments...
                </div>
              ) : chunks.length > 0 ? (
                chunks.map((chunk, index) => (
                  <div
                    key={chunk.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {chunk.sectionTitle || `Segment ${index + 1}`}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {chunk.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                  No segments available for this document yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
