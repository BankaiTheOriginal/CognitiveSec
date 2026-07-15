"use client";
import { useMeQuery } from "@/app/modules/auth/auth.hook";
import { sendMessage } from "@/app/modules/chat/chat.api";
import { useGetMessages, useSendMessage } from "@/app/modules/chat/chat.hook";
import { useGetMyOrg } from "@/app/modules/organization/organization.hook";
import { ArrowUp } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Conversation() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const pendingMessage = searchParams?.get("pendingMessage");
  const chatId = Array.isArray(id) ? id[0] : id;
  const chatIdString = chatId as string;
  const { data: messages, isFetching } = useGetMessages(chatIdString);
  const { data: organization } = useGetMyOrg();
  const { data: me } = useMeQuery();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [optimisticMessage, setOptimisticMessage] = useState<string | null>(
    null,
  );

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
  return (
    <div className="flex flex-col col-span-2 row-span-2 bg-white shadow-sm border border-slate-200 rounded-xl">
      <div className="flex flex-col justify-between h-full p-4">
        <div className="flex flex-col gap-4">
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
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100"
                  }`}
                >
                  {msg.id === "thinking" ? (
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
        </div>

        <div className="flex relative items-center">
          <input
            placeholder={`Ask me anything about ${organization?.name}`}
            className="border w-full p-4 rounded-full border-slate-200 focus:border-indigo-500 focus:outline-none placeholder:text-sm"
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && message.trim()) {
                handleSubmit(message);
              }
            }}
          ></input>
          <button
            className=" absolute bg-indigo-500 p-2 rounded-full text-white right-2 z-10 transition delay-100 hover:bg-indigo-800 cursor-pointer"
            onClick={() => handleSubmit(message)}
          >
            <ArrowUp className="" />
          </button>
        </div>
      </div>
    </div>
  );
}
