"use client";

import { useGetChats } from "@/app/modules/chat/chat.hook";
import { Plus } from "lucide-react";

export default function page() {
  const { data: chatData } = useGetChats();

  return (
    <div className="grid grid-cols-4 gap-2 min-h-[90vh]">
      <div className="flex flex-col bg-white p-4 shadow-sm border border-slate-200 rounded-xl gap-4">
        <div className="flex justify-center mt-4">
          <button className="flex items-center justify-center bg-indigo-600 py-3 px-10 rounded-xl text-white text-xs gap-2 w-[380px]">
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
        <div className="bg-red-300 h-full">
          {chatData!.length > 0 ? <div></div> : <div></div>}
        </div>
      </div>
    </div>
  );
}
