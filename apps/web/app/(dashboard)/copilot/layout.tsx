import DocumentPanel from "@/components/parts/copilot/DocumentPanel";
import CopilotSidebar from "@/components/parts/copilot/Sidebar";
import React from "react";

export default function CopilotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2 min-h-[90vh]">
      <CopilotSidebar />
      {children}
      <DocumentPanel />
    </div>
  );
}
