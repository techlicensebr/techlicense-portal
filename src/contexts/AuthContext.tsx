'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'viewer';
  organization_id: string;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://techlicense-chatbot-api.techlicensebr.workers.dev';
const TOKEN_KEY = 'tl_token';
const USER_KEY = 'tl_user';
const TOKEN_REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutos

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!token && !!user;

  // Recuperar token e usuário do localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao analisar usuário armazenado:', error);
        localStorage.removeItem(USER_KEY);
      }
    }

    setLoading(false);
  }, []);

  // Atualizar token automaticamente
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      refreshToken();
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, token]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao fazer login');
      }

      const data = await response.json();
      const { token: newToken, user: userData } = data;

      if (newToken && userData) {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
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
      const response = await fetch(`${API_URL}/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao enviar link mágico');
      }

      // Retornar sucesso - o usuário receberá email com o link
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
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao fazer login com Google');
      }

      const data = await response.json();
      const { token: newToken, user: userData } = data;

      if (newToken && userData) {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro de login com Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      // Tentar notificar o servidor sobre o logout
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {
          // Ignorar erros ao fazer logout no servidor
        });
      }

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Limpar dados locais mesmo se houver erro
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refreshToken = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token inválido ou expirado - fazer logout
        if (response.status === 401) {
          await logout();
          return;
        }
        throw new Error('Falha ao atualizar token');
      }

      const data = await response.json();
      const { token: newToken } = data;

      if (newToken) {
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
      }
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      await logout();
    }
  }, [token, logout]);

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
