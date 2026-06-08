export type AuthUser = {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  username?: string;
  role?: string;
  organizationId?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  headline?: string | null;
  location?: string | null;
  skills?: Array<{
    id: string;
    skill: { id: string; name: string };
    level?: string;
  }>;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
};
