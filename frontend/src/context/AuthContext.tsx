import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type AuthUser = {
  id?: string;
  name: string;
  email: string;
  username?: string;
  role?: string;
  organizationId?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
};

const AUTH_STORAGE_KEY = 'sewi-platform-auth-user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [user]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    signIn: (nextUser) => {
      setUser(nextUser);
    },
    signOut: () => {
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}