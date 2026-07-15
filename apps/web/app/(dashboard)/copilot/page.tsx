"use client";

import { useMeQuery } from "@/app/modules/auth/auth.hook";
import { useAuthStore } from "@/app/modules/auth/auth.store";
import {
  useCreateChat,
  useDeleteChat,
  useGetChats,
} from "@/app/modules/chat/chat.hook";
import { Chat, CreateChatInput } from "@/app/modules/chat/chat.types";
import { useDocuments } from "@/app/modules/documents/documents.hook";
import { useGetMyOrg } from "@/app/modules/organization/organization.hook";
import { ArrowUp, Book, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CiChat1, CiTrash } from "react-icons/ci";
export default function page() {
  const { data: chatData, isLoading: chatLoading } = useGetChats();
  const { data: me } = useMeQuery();
  const { data: documents } = useDocuments();
  const { mutateAsync: createChat } = useCreateChat();
  const { data: organization } = useGetMyOrg();

  const { mutateAsync: deleteChat } = useDeleteChat();
  const [activeId, setActiveId] = useState<string | null>(null);
  const firstName = me?.user.name.split(" ").shift();
  const loadedDocuments = documents?.filter(
    (document) => document.status === "READY",
  );
  const [chat, setChat] = useState<string>("");
  function createChatTitle(value: string) {
    const title = value.split(" ").slice(0, 5).join(" ");
    setChat(title);
  }
  function handleNewChat(title: string) {
    createChat(title);
  }

  // if (chatLoading) {
  //   return <div>Loading...</div>;
  // }

  const mockChats: Chat[] = [
    {
      id: "chat_cl8y2n1000001",
      title: "Company Announcements",
      organizationId: "org_alpha_99",
      teamId: null,
      createdAt: "2026-07-10T09:00:00.000Z",
    },
    {
      id: "chat_cl8y2n2110002",
      title: "Q3 Product Launch Plan",
      organizationId: "org_alpha_99",
      teamId: "team_product_01",
      createdAt: "2026-07-11T14:22:15.000Z",
    },
    {
      id: "chat_cl8y2n3220003",
      title: "Bug Triaging & Critical Fixes",
      organizationId: "org_alpha_99",
      teamId: "team_engineering_02",
      createdAt: "2026-07-11T18:45:30.000Z",
    },
    {
      id: "chat_cl8y2n4330004",
      title: "Design System Feedback",
      organizationId: "org_alpha_99",
      teamId: "team_design_03",
      createdAt: "2026-07-11T20:10:00.000Z",
    },
    {
      id: "chat_cl8y2n5440005",
      title: "Watercooler & Random Links",
      organizationId: "org_alpha_99",
      teamId: null,
      createdAt: "2026-07-11T20:35:12.000Z",
    },
  ];

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2 min-h-[90vh]">
      <div className="flex flex-col row-span-2 bg-white p-4 shadow-sm border border-slate-200 rounded-xl gap-4">
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
        <div className="h-full">
          {chatData && chatData.length > 0 ? (
            <div className="flex flex-col h-full gap-2">
              {chatData.map((chat) => {
                const isActive = activeId === chat.id;
                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveId(chat.id)}
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
      <div className="flex flex-col col-span-2 row-span-2 bg-white shadow-sm border border-slate-200 rounded-xl">
        {activeId === null ? (
          <div className="flex flex-col h-full items-center justify-center">
            <div className="flex flex-col gap-4">
              <span className="text-3xl ">
                Hello{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-900 bg-[length:200%_auto] bg-clip-text font-extrabold text-transparent animate-gradient">{`${firstName}`}</span>{" "}
                where should we start today
              </span>
              <div className="flex relative items-center">
                <input
                  placeholder={`Ask me anything about ${organization?.name}`}
                  className="border w-full p-4 rounded-full border-slate-200 focus:border-indigo-500 focus:outline-none placeholder:text-sm"
                  onChange={(e) => createChatTitle(e.target.value)}
                ></input>
                <button
                  className=" absolute bg-indigo-500 p-2 rounded-full text-white right-2 z-10 transition delay-100 hover:bg-indigo-800 cursor-pointer"
                  onClick={() => handleNewChat(chat)}
                >
                  <ArrowUp className="" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <div className="flex flex-col row-span-1 bg-white shadow-sm border border-slate-200 rounded-xl p-4 justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex gap-2 items-center">
              <Book className="w-4 h-4 text-indigo-600" />
              <span className="font-display text-xs font-semibold">
                Company Library
              </span>
            </div>
            <div className="flex">
              {loadedDocuments && loadedDocuments?.length > 0 ? (
                <span className="text-xs font-display text-slate-500 font-semibold">{`${loadedDocuments.length} Loaded`}</span>
              ) : (
                <span className="text-xs font-display text-slate-500 font-semibold">
                  No Documents Loaded
                </span>
              )}
            </div>
          </div>
          <div className="border-t-1 border border-slate-100"></div>
          {loadedDocuments &&
            loadedDocuments.slice(0, 3).map((document) => (
              <Link
                key={document.id}
                className="flex flex-col transition hover:bg-slate-50 rounded-lg border border-slate-100"
                href={`/knowledge`}
              >
                <div className="flex gap-2 items-center  rounded-lg p-2">
                  <div className="flex bg-indigo-100 py-3 px-1 rounded-lg items-center">
                    <span className="uppercase text-[9px] tracking-tight text-indigo-800 font-semibold">
                      {document.name
                        .slice(document.name.lastIndexOf(".") + 1)
                        .toLowerCase()}
                    </span>
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold font-display truncate">
                      {document.name}
                    </span>
                    <span className="text-xs text-slate-300 font-display">
                      {document.chunksCount} vectors
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
        <Link
          className="flex justify-center items-center bg-slate-100 border-1 border-slate-200 p-2 rounded-lg  text-[10px] font-bold text-slate-500 tracking-tight"
          href={`/knowledge`}
        >
          Manage Full Library
        </Link>
      </div>
    </div>
  );
}
