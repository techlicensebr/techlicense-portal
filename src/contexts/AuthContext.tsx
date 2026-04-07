'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'viewer' | 'owner' | 'agent';
  organization_id?: string;
  plan: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginMagicLink: (email: string) => Promise<void>;
  exchangeCode: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Flag cookie for Next.js SSR middleware (non-HttpOnly, just for redirect logic)
function setFlagCookie() {
  document.cookie = 'tl_token=active; path=/; max-age=3600; SameSite=Lax';
}

function clearFlagCookie() {
  document.cookie = 'tl_token=; path=/; max-age=0';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  // Check session on mount
  const refreshUser = useCallback(async () => {
    try {
      const data = await apiClient.getCurrentUser();
      if (data?.user) {
        setUser(data.user);
        setFlagCookie();
      } else {
        setUser(null);
        clearFlagCookie();
      }
    } catch {
      setUser(null);
      clearFlagCookie();
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiClient.login(email, password);
      if (data?.user) {
        setUser(data.user);
        setFlagCookie();
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro de login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginMagicLink = useCallback(async (email: string) => {
    setLoading(true);
    try {
      await apiClient.loginMagicLink(email);
    } catch (error) {
      console.error('Erro ao enviar link mágico:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const exchangeCode = useCallback(async (code: string) => {
    setLoading(true);
    try {
      const data = await apiClient.exchangeCode(code);
      if (data?.user) {
        setUser(data.user);
        setFlagCookie();
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiClient.logout();
    } finally {
      setUser(null);
      clearFlagCookie();
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    loginMagicLink,
    exchangeCode,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
