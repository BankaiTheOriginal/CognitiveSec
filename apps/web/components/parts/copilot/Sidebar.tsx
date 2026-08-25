"use client";
import {
  useCreateChat,
  useDeleteChat,
  useGetChats,
} from "@/app/modules/chat/chat.hook";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { CiChat1, CiTrash } from "react-icons/ci";

export default function CopilotSidebar() {
  const { data: chatData, isLoading: chatLoading } = useGetChats();
  const { mutateAsync: createChat, isPending } = useCreateChat();
  const [activeId, setActiveId] = useState<string | null | undefined>(null);
  const { mutateAsync: deleteChat } = useDeleteChat();
  const router = useRouter();

  function handleCreateNewChat() {
    router.push("/copilot");
  }
  return (
    <div className="flex flex-col row-span-2 bg-white p-4 shadow-sm border border-slate-200 rounded-xl gap-4">
      <div className="flex justify-center mt-4">
        <button
          className="flex items-center justify-center bg-indigo-600 py-3 px-10 rounded-xl text-white text-xs gap-2 w-[380px]"
          onClick={() => handleCreateNewChat()}
        >
          <Plus className="h-4 w-4" />
          <span className="font-semibold font-display">New Chat Thread</span>
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-display text-slate-400 font-semibold">
          SAVED CONVERSATIONS
        </span>
        <div className="border-t border-slate-200"></div>
      </div>
      <div className="h-full">
        {chatData && chatData.length > 0 ? (
          <div className="flex flex-col h-full gap-2">
            {chatData.map((chat) => {
              const isActive = activeId === chat.id;
              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    setActiveId(chat.id);
                    router.push(`/copilot/${chat.id}`);
                  }}
                  className={`group w-full px-3 py-3 rounded-lg text-left transition-colors text-sm
              ${
                isActive
                  ? "bg-indigo-50 text-indigo-500 border border-indigo-500"
                  : "bg-transparent text-slate-500 hover:bg-gray-100 border border-slate-100"
              }
            `}
                >
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <CiChat1 className="stroke-1 w-4 h-4" />
                      <span className="truncate">{chat.title}</span>
                    </div>
                    <div
                      className={`transition-opacity duration-200
                ${isActive ? "text-indigo-500 hover:text-red-500" : "text-gray-400 hover:text-red-500"}
                opacity-0 group-hover:opacity-100
              `}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                        console.log("Delete clicked for", chat.id);
                      }}
                    >
                      <CiTrash className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center gap-1">
              <CiChat1 className="w-10 h-10 stroke-1 stroke-slate-300" />
              <span className="text-slate-400 text-xs font-display font-semibold">
                No chat history yet
              </span>
              <span className="text-slate-400 text-xs font-display">
                Dive in create your first chat
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
