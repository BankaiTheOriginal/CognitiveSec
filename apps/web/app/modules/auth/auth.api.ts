import { api } from "@/app/common/api";
import { Login, SignUp } from "./auth.types";
import { useAuthStore } from "./auth.store";

const base_url = `${process.env.API_URL}/auth`;
export async function login(data: Login) {
  const response = await api.post(`${base_url}/login`, { data });
  const { access_token, user, role } = response.data;

  return { access_token, user, role };
}

export async function signUp(data: SignUp) {
  await api.post(`${base_url}/sign-up`, { data });
}

export async function me() {
  const response = await api.get(`${base_url}/me`);
  const { user, role } = response.data;

  useAuthStore.getState().setUserInfo(user, role);
}

export async function switchWorkspace(organizationId: string) {
  const response = await api.post(`${base_url}/switch-workspace`, {
    targetOrganizationId: organizationId,
  });
  return response.data;
}
