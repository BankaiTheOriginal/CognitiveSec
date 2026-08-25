import Conversation from "@/components/parts/copilot/Conversation";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading conversation...</div>}>
      <Conversation />
    </Suspense>
  );
}
