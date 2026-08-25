"use client";

import type { Citation } from "@/app/modules/chat/chat.types";
import { BookOpen, X } from "lucide-react";
import { useEffect, useState } from "react";

function getCitationDocumentId(citation: Citation | null) {
  return citation?.documentId ?? citation?.document_id ?? "";
}

function getCitationDocumentName(citation: Citation | null) {
  return (
    citation?.documentName ??
    citation?.document_name ??
    (citation ? `Document ${getCitationDocumentId(citation).slice(0, 8)}` : "")
  );
}

function getCitationSectionTitle(citation: Citation | null) {
  return (
    citation?.sectionTitle ?? citation?.section_title ?? "Relevant excerpt"
  );
}

export default function SourceBrowser({
  citation,
  onClear,
}: {
  citation: Citation | null;
  onClear: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!citation) return;

    setIsVisible(false);
    const raf = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClear();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [citation, onClear]);

  if (!citation) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Citation source drawer"
    >
      <button
        type="button"
        aria-label="Close citation drawer"
        onClick={onClear}
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/30 backdrop-blur-md"
      />

      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-white/20 bg-white/95 shadow-2xl shadow-slate-950/20 backdrop-blur-xl"
        style={{
          transform: isVisible ? "translateX(0)" : "translateX(100%)",
          opacity: isVisible ? 1 : 0,
          transition: "transform 300ms ease-out, opacity 300ms ease-out",
        }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-900">
                Source Citation
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Opened from the assistant answer
            </p>
          </div>
          <button
            onClick={onClear}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close source browser"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-2 rounded-2xl">
            <p className="text-xs font-semibold uppercase tracking-tight text-slate-400 font-display">
              Source Document Name
            </p>
            <div className="flex gap-2 items-center bg-gray-100 border border-slate-200 rounded-lg p-3">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <p className="text-sm font-semibold tracking-tight text-slate-900">
                {getCitationDocumentName(citation)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Segment
            </p>
            <div className="mt-2 rounded-2xl border border-slate-200 bg-gray-100 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                <BookOpen className="h-3.5 w-3.5" />
                {getCitationSectionTitle(citation)}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {citation.snippet || "No snippet available for this citation."}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-500">
            Tip: press <span className="font-semibold text-slate-700">Esc</span>{" "}
            or click outside the drawer to close it.
          </div>
        </div>
      </aside>
    </div>
  );
}
