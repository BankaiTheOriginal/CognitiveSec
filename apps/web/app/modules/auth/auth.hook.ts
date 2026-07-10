import { useMutation, useQuery } from "@tanstack/react-query";
import { login, me, signUp, switchWorkspace } from "./auth.api";
import { useAuthStore } from "./auth.store";
import { Login, SignUp } from "./auth.types";

export const useMeQuery = () => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: me,
  });
};

export const useSwitchWorkspaceMutation = () => {
  return useMutation({
    mutationFn: (organizationId: string) => switchWorkspace(organizationId),
    onSuccess: (data) => {
      useAuthStore.getState().switchActiveWorkspace(data.activeOrganizationId);
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: Login) => login(data),
    onSuccess: (data) => {
      useAuthStore.getState().setAuthData({
        user: data.user,
        accessToken: data.access_token,
        organizationId: data.user.organizationId,
        role: data.role,
      });
    },
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: (data: SignUp) => signUp(data),
  });
};
