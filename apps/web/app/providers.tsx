"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./modules/auth/auth.store";
import { useEffect } from "react";
import { me } from "./modules/auth/auth.api";

const queryClient = new QueryClient();

function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, _hasHydrated } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      if (!_hasHydrated) return;
      if (!accessToken) {
        router.push("/login");
        return;
      }

      try {
        await me();
        if (window.location.pathname === "/login") {
          router.push("/copilot");
        }
      } catch (error) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [accessToken, router]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthCheck>{children}</AuthCheck>
    </QueryClientProvider>
  );
}
