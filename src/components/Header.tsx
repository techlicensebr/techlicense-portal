'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, LogOut, Settings, User, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, NotificationData } from '@/lib/api';

interface HeaderProps {
  onLogout?: () => void;
}

interface UserInfo {
  name: string;
  email: string;
  plan: string;
}

const getBreadcrumbLabel = (pathname: string): string => {
  const breadcrumbs: Record<string, string> = {
    '/': 'Painel',
    '/bots': 'Bots',
    '/conversations': 'Conversas',
    '/knowledge': 'Base de Conhecimento',
    '/analytics': 'Análises',
    '/api-keys': 'Chaves de API',
    '/webhooks': 'Webhooks',
    '/canais': 'Canais',
    '/contacts': 'Contatos',
    '/cobranca': 'Cobrança',
    '/settings': 'Configurações',
    '/profile': 'Meu Perfil',
    '/agent-workbench': 'Atendimento',
    '/team': 'Time',
    '/audit-logs': 'Auditoria',
  };

  return breadcrumbs[pathname] || 'Página';
};

const getNotificationColor = (type?: string) => {
  switch (type) {
    case 'warning':
      return 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500';
    case 'error':
      return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
    case 'success':
      return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
    default:
      return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
  }
};

const formatTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export default function Header({ onLogout }: HeaderProps) {
  const pathname = usePathname();
  const { user: authUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Real notification state
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const mockUser: UserInfo = {
    name: authUser?.name || 'Usuário',
    email: authUser?.email || '',
    plan: authUser?.plan === 'enterprise' ? 'Empresarial' : authUser?.plan === 'pro' ? 'Profissional' : 'Plano Gratuito',
  };

  const breadcrumbLabel = getBreadcrumbLabel(pathname);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const result = await apiClient.getNotifications({ page: 1, per_page: 15 });
      setNotifications(result.notifications);
      setUnreadCount(result.unread_count);
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, []);

  // Poll unread count (lightweight)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await apiClient.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silently fail
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();

    // Poll unread count every 30 seconds
    pollIntervalRef.current = setInterval(fetchUnreadCount, 30000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchNotifications, fetchUnreadCount]);

  // Full refresh when dropdown opens
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications, fetchNotifications]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    setNotifLoading(true);
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // Silently fail
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const handleDeleteNotification = useCallback(async (id: string) => {
    try {
      await apiClient.deleteNotification(id);
      const removed = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (removed && !removed.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch {
      // Silently fail
    }
  }, [notifications]);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Breadcrumb and Search */}
          <div className="flex items-center gap-4 flex-1">
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="text-slate-400 dark:text-slate-500">/</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {breadcrumbLabel}
              </span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-10 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  aria-label="Buscar"
                />
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative group"
                aria-label="Notificações"
                title="Notificações"
              >
                <Bell
                  size={20}
                  className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Notificações
                    </h3>
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group/item ${
                            !notif.read_at
                              ? getNotificationColor(notif.type)
                              : ''
                          }`}
                          role="article"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-0.5">
                                {notif.title}
                              </p>
                              <p className="text-sm text-slate-900 dark:text-white">
                                {notif.message}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {formatTimeAgo(notif.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0">
                              {!notif.read_at && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notif.id);
                                  }}
                                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400"
                                  title="Marcar como lida"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notif.id);
                                }}
                                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                                title="Excluir"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <Bell size={24} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm">Nenhuma notificação</p>
                      </div>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={handleMarkAllAsRead}
                        disabled={notifLoading}
                        className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50"
                      >
                        {notifLoading ? 'Marcando...' : 'Marcar todas como lidas'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                aria-label="Menu do usuário"
                title="Menu do usuário"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold group-hover:shadow-lg transition-shadow">
                  {getInitials(mockUser.name)}
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white hidden sm:inline">
                  {mockUser.name}
                </span>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                  {/* User Info Section */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {mockUser.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {mockUser.email}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2">
                      {mockUser.plan}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2 space-y-1">
                    <a
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                      <User size={16} />
                      Meu Perfil
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                      <Settings size={16} />
                      Configurações
                    </a>
                  </div>

                  {/* Logout Button */}
                  <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <LogOut size={16} />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
