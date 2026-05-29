'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import {
  setToken,
  setUser,
  removeToken,
  removeUser,
  getUser,
  type AuthUser,
} from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setUserState(getUser());
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const response = await authApi.login({ email, password });
    const { token, user: userData } = response.data.data as {
      token: string;
      user: AuthUser;
    };
    setToken(token);
    setUser(userData);
    setUserState(userData);
    router.push('/dashboard');
  }

  async function register(name: string, email: string, password: string): Promise<void> {
    const response = await authApi.register({ name, email, password });
    const { token, user: userData } = response.data.data as {
      token: string;
      user: AuthUser;
    };
    setToken(token);
    setUser(userData);
    setUserState(userData);
    router.push('/dashboard');
  }

  function logout(): void {
    removeToken();
    removeUser();
    setUserState(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
