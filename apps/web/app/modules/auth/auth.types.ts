export interface User {
  id: string;
  name: string;
  email: string;
}
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  activeOrganizationId: string | null;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  setAuthData: (data: {
    user: User;
    accessToken: string;
    organizationId: string;
    role: any;
  }) => void;
  setUserInfo: (user: any, role: any) => void;
  updateAccessToken: (token: string) => void;
  clearAuth: () => void;
  switchActiveWorkspace: (organizationId: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface Login {
  email: string;
  password: string;
}

export interface SignUp {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}
