import KnowledgeClient from "./KnowledgeClient";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading knowledge base...</div>}>
      <KnowledgeClient />
    </Suspense>
  );
}
