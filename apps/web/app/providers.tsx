import { useRouter } from "next/navigation";
import { useAuthStore } from "./modules/auth/auth.store";
import { useEffect } from "react";
import { me } from "./modules/auth/auth.api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      if (!accessToken) {
        router.push("/login");
        return;
      }

      try {
        await me();
        if (window.location.pathname === "/login") {
          router.push("/dashboard");
        }
      } catch (error) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [accessToken, router]);

  return <>{children}</>;
}
