"use client";

import NavBar from "@/components/parts/Navbar";
import Sidebar from "@/components/parts/Sidebar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 px-4 py-5 overflow-y-auto">
        <NavBar />
        <div className="mt-4">{children}</div>
      </main>
    </div>
  );
}
