"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { BiBrain } from "react-icons/bi";
import { CiChat1 } from "react-icons/ci";
import { FiLogOut, FiSettings, FiUsers, FiCpu } from "react-icons/fi";
import { useAuthStore } from "@/app/modules/auth/auth.store";

const SidebarSects = [
  {
    name: "AI Copilot",
    icon: CiChat1,
    location: "/copilot",
  },
  {
    name: "Knowledge Base",
    icon: BiBrain,
    location: "/knowledge",
  },
  //   {
  //     name: "Team Settings",
  //     icon: FiUsers,
  //     location: "/settings/team",
  //   },
  {
    name: "Settings",
    icon: FiSettings,
    location: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "CS";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "EDITOR":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  return (
    <div className="min-h-screen w-64 md:w-[260px] overflow-hidden bg-[#0A0D14] border-r border-[#1B1E26] flex flex-col justify-between font-sans">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-6 h-20 border-b border-[#1B1E26]">
          <div className="flex flex-col">
            <span className="text-white text-base font-bold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              CognitiveSec
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Suite v1.0
              </span>
            </div>
          </div>
        </div>

        {user && (
          <div className="px-4">
            <div className="p-3.5 rounded-xl bg-[#10141E]/60 border border-[#1C202E] flex flex-col gap-2.5">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  Active Workspace
                </span>
                <span className="text-slate-200 text-xs font-semibold truncate mt-0.5">
                  Default Organization
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${getRoleBadgeColor(role)}`}
                >
                  {role || "VIEWER"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5 px-4">
          <span className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">
            Main Applications
          </span>
          <div className="flex flex-col gap-1">
            {SidebarSects.map((item) => {
              const isActive =
                pathname === item.location ||
                pathname?.startsWith(item.location + "/");
              return (
                <Link
                  key={item.name}
                  href={item.location}
                  className={`flex gap-3 items-center px-3 py-2.5 rounded-lg transition-all duration-200 group border-l-2 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500/10 to-indigo-500/0 text-indigo-200 border-indigo-500 font-medium"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#10141E]/40 hover:pl-4"
                  }`}
                >
                  <item.icon
                    className={`h-4.5 w-4.5 transition-colors duration-200 ${
                      isActive
                        ? "text-indigo-400"
                        : "text-slate-400 group-hover:text-slate-300"
                    }`}
                  />
                  <span className="text-xs tracking-tight">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {user && (
        <div className="border-t border-[#1B1E26] bg-[#080B10] p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-lg shadow-indigo-500/10">
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-slate-200 font-semibold text-xs truncate">
                {user.name}
              </span>
              <span className="text-slate-400 text-[10px] truncate mt-0.5">
                {user.email}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg border border-[#1C202E] hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/5 text-xs font-semibold transition-all duration-200 cursor-pointer"
          >
            <FiLogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
