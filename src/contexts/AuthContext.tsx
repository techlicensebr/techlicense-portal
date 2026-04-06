'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'viewer';
  organization_id?: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginMagicLink: (email: string) => Promise<void>;
  loginGoogle: (googleToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'tl_token';
const USER_KEY = 'tl_user';
const TOKEN_REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutos

function setCookie(token: string) {
  document.cookie = `tl_token=${token}; path=/; max-age=86400; SameSite=Lax`;
}

function clearCookie() {
  document.cookie = 'tl_token=; path=/; max-age=0';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!token && !!user;

  // Recuperar token e usuário do localStorage na montagem
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken) {
      setToken(storedToken);
      setCookie(storedToken);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }

    setLoading(false);
  }, []);

  // Auto-refresh do token
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      refreshToken();
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const saveAuth = useCallback((newToken: string, userData: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setCookie(newToken);
    setToken(newToken);
    setUser(userData);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearCookie();
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiClient.login(email, password);

      if (data.token && data.user) {
        saveAuth(data.token, data.user);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro de login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

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

  const loginGoogle = useCallback(async (googleToken: string) => {
    setLoading(true);
    try {
      const data = await apiClient.loginGoogle(googleToken);

      if (data.token && data.user) {
        saveAuth(data.token, data.user);
      }
    } catch (error) {
      console.error('Erro de login com Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiClient.logout();
    } catch {
      // Ignorar erro do servidor no logout
    } finally {
      clearAuth();
      setLoading(false);
    }
  }, [clearAuth]);

  const refreshToken = useCallback(async () => {
    if (!token) return;
    // TODO: implementar refresh real quando endpoint estiver pronto
    // Por enquanto o token dura 24h e não precisa de refresh
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    loginMagicLink,
    loginGoogle,
    logout,
    refreshToken,
    setUser,
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
