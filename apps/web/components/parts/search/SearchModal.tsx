"use client";

import { useSearch } from "@/app/modules/search/search.hook";
import { Search, X, BookOpenText, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function truncate(text: string, max = 120) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

export default function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { data, isFetching } = useSearch(debouncedQuery);

  useEffect(() => {
    if (!open) return;

    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const hasQuery = query.trim().length > 1;
  const chatResults = data?.chats || [];
  const documentResults = data?.documents || [];

  const summary = useMemo(() => {
    if (!hasQuery) return "Search chats and documents";
    const total = chatResults.length + documentResults.length;
    return total > 0 ? `${total} result${total === 1 ? "" : "s"} found` : "No results found";
  }, [chatResults.length, documentResults.length, hasQuery]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 z-0 h-full w-full bg-slate-950/45 backdrop-blur-md"
      />

      <div className="absolute left-1/2 top-16 z-10 w-[min(92vw,960px)] -translate-x-1/2 rounded-3xl border border-white/20 bg-white/95 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats and documents"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close search modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              {summary}
            </span>
            {isFetching ? (
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Searching
              </span>
            ) : null}
          </div>

          {!hasQuery ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Search className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900">
                Search your workspace
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Find chats by title or message content, and documents by file name or chunk text.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Chats</h3>
                </div>
                <div className="space-y-2">
                  {chatResults.length > 0 ? (
                    chatResults.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => {
                          onClose();
                          router.push(`/copilot/${chat.id}`);
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {chat.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {chat.matchType === "title"
                                ? "Title matched your search"
                                : truncate(chat.snippet || "Chat message match")}
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Open
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      No chat matches found.
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpenText className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
                </div>
                <div className="space-y-2">
                  {documentResults.length > 0 ? (
                    documentResults.map((document) => (
                      <button
                        key={document.id}
                        onClick={() => {
                          onClose();
                          router.push(`/knowledge?document=${document.id}`);
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {document.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {document.matchType === "name"
                                ? "Document name matched your search"
                                : truncate(document.snippet || "Chunk match")}
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                            View
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                      No document matches found.
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
