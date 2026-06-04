import { createContext, useEffect, useState, type ReactNode } from 'react';
import { AUTH_TOKEN_KEY, setAuthToken } from '../services/api';
import authService from '../services/auth.service';
import type { AuthUser, AuthContextValue } from '../types/auth.types';

const AUTH_STORAGE_KEY = 'sewi-platform-auth-user';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setAuthToken(null);
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Always validate session on startup
  useEffect(() => {
    if (!readStoredUser()) {
      setIsReady(true);
      return;
    }

    void authService.refresh().then((data) => {
      if (!data?.access_token) {
        setAuthToken(null);
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
      } else if (data.user) {
        setUser(data.user);
      }
    }).finally(() => setIsReady(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isReady,
    signIn: (nextUser) => {
      setUser(nextUser);
    },
    signOut: () => {
      setAuthToken(null);
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
