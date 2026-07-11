import { api } from "@/app/common/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState } from "./auth.types";
import { switchWorkspace } from "./auth.api";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      _hasHydrated: false,
      accessToken: null,
      activeOrganizationId: null,
      role: "VIEWER",
      isAuthenticated: false,

      setAuthData: (data) => {
        set({
          user: data.user,
          accessToken: data.accessToken,
          activeOrganizationId: data.organizationId,
          role: data.role,
          isAuthenticated: true,
        });
        localStorage.setItem("accessToken", data.accessToken);
      },

      setUserInfo: (user, role) => {
        set({ user, role });
      },

      updateAccessToken: (token) => {
        set({ accessToken: token });

        localStorage.setItem("accessToken", token);
      },

      switchActiveWorkspace: async (organizationId) => {
        try {
          const { access_token, user_context } =
            await switchWorkspace(organizationId);

          set({
            accessToken: access_token,
            activeOrganizationId: organizationId,
            role: user_context.role,
          });
          localStorage.setItem("accessToken", access_token);
        } catch (error) {
          console.error("Failed to change workspace environment context");
          throw error;
        }
      },
      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Backend logout confirmation rejected");
        } finally {
          set({
            user: null,
            accessToken: null,
            activeOrganizationId: null,
            role: "VIEWER",
            isAuthenticated: false,
          });
          localStorage.removeItem("accessToken");
        }
      },
    }),
    {
      name: "cognitive-sec-auth",
      onRehydrateStorage: () => (state) => {
        state!._hasHydrated = true;
      },
    },
  ),
);
