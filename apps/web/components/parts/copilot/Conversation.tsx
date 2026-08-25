"use client";
import { useGetMessages, useSendMessage } from "@/app/modules/chat/chat.hook";
import type { Citation } from "@/app/modules/chat/chat.types";
import { useGetMyOrg } from "@/app/modules/organization/organization.hook";
import { ArrowUp, BookOpen } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SourceBrowser from "./SourceBrowser";

function getCitationDocumentId(citation: Citation) {
  return citation.documentId ?? citation.document_id ?? "";
}

function getCitationChunkId(citation: Citation) {
  return citation.chunkId ?? citation.chunk_id ?? "";
}

function getCitationDocumentName(citation: Citation) {
  return (
    citation.documentName ??
    citation.document_name ??
    `Document ${getCitationDocumentId(citation).slice(0, 8)}`
  );
}

function getCitationLabel(citation: Citation, index: number) {
  return (
    citation.sectionTitle ??
    citation.section_title ??
    getCitationDocumentName(citation) ??
    `Source ${index + 1}`
  );
}

export default function Conversation() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const pendingMessage = searchParams?.get("pendingMessage");
  const chatId = Array.isArray(id) ? id[0] : id;
  const chatIdString = chatId as string;
  const { data: messages, isFetching } = useGetMessages(chatIdString);
  const { data: organization } = useGetMyOrg();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(
    null,
  );
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const autoSentPendingMessageRef = useRef<string | null>(null);

  const { mutate, isPending: isSending } = useSendMessage();

  const handleInputChange = (value: string) => {
    setMessage(value);
  };
  const handleSubmit = (value: string) => {
    setMessage("");
    setOptimisticMessage(value);
    mutate(
      { id: chatIdString, data: { message: value } },
      {
        onSuccess: () => {
          setOptimisticMessage(null);
        },
      },
    );
  };

  useEffect(() => {
    if (!pendingMessage) return;
    if (autoSentPendingMessageRef.current === pendingMessage) return;

    autoSentPendingMessageRef.current = pendingMessage;

    setOptimisticMessage(pendingMessage);

    mutate(
      { id: chatIdString, data: { message: pendingMessage } },
      {
        onSuccess: () => {
          setOptimisticMessage(null);
          router.replace(`/copilot/${chatIdString}`);
        },
      },
    );
  }, [pendingMessage, chatIdString, mutate, router]);

  const displayMessages =
    optimisticMessage && isSending
      ? [
          ...(messages || []),
          {
            id: "optimistic-user",
            chatId: chatIdString,
            role: "user" as const,
            text: optimisticMessage,
            createdAt: new Date().toISOString(),
          },
          {
            id: "thinking",
            chatId: chatIdString,
            role: "assistant" as const,
            text: "",
            createdAt: new Date().toISOString(),
          },
        ]
      : messages || [];

  const renderCitationButtons = (citations?: Citation[] | null) => {
    if (!citations?.length) return null;

    return (
      <div className="mt-3 border-t border-slate-200/80 pt-3">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          <span className="font-display tracking-tight">{`REFERENCES CITED (${citations.length})`}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {citations.map((citation, index) => (
            <button
              key={`${getCitationDocumentId(citation)}-${getCitationChunkId(citation)}-${index}`}
              onClick={() => setActiveCitation(citation)}
              className="group inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              title={citation.snippet || getCitationLabel(citation, index)}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700">
                {index + 1}
              </span>
              <span className="truncate font-medium">
                {getCitationLabel(citation, index)}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="col-span-2 row-span-2 flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-end border-b border-slate-100 px-4 py-3">
          {isFetching ? (
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Syncing
            </span>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-between p-4">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
            {displayMessages
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime(),
              )
              .map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-900"
                    }`}
                  >
                    {msg.id === "thinking" ? (
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap leading-6">
                          {msg.text}
                        </p>
                        {msg.role === "assistant"
                          ? renderCitationButtons(msg.citations)
                          : null}
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <form
            className="mt-4 flex items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (message.trim()) {
                handleSubmit(message);
              }
            }}
          >
            <div className="relative flex flex-1 items-center">
              <input
                placeholder={`Ask me anything about ${organization?.name}`}
                className="w-full rounded-full border border-slate-200 p-4 pr-14 text-sm outline-none transition placeholder:text-sm focus:border-indigo-500"
                value={message}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 z-10 rounded-full bg-indigo-500 p-2 text-white transition hover:bg-indigo-800"
              >
                <ArrowUp />
              </button>
            </div>
          </form>
        </div>
      </div>

      <SourceBrowser
        citation={activeCitation}
        onClear={() => setActiveCitation(null)}
      />
    </>
  );
}
