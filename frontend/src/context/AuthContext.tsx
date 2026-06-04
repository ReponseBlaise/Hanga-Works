import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
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

  useEffect(() => {
    if (!user) {
      return;
    }

    const storedToken = window.localStorage.getItem(AUTH_TOKEN_KEY);

    if (storedToken) {
      return;
    }

    void authService.refresh().then((data) => {
      if (!data?.access_token) {
        setAuthToken(null);
        setUser(null);
        return;
      }

      if (data.user) {
        setUser(data.user);
      }
    });
  }, [user]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
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