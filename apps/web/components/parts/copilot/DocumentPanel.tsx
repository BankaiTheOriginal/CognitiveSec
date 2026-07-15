"use client";
import { useDocuments } from "@/app/modules/documents/documents.hook";
import { Book } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function DocumentPanel() {
  const { data: documents } = useDocuments();
  const loadedDocuments = documents?.filter(
    (document) => document.status === "READY",
  );
  return (
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
  );
}
