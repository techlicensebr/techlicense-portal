'use client';

import React, { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, LogOut, Settings, User } from 'lucide-react';

interface HeaderProps {
  onLogout?: () => void;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  unread: boolean;
  type?: 'info' | 'warning' | 'success' | 'error';
}

interface UserInfo {
  name: string;
  email: string;
  plan: string;
}

// Mock notifications - replace with real data from API/context
const mockNotifications: Notification[] = [
  {
    id: 1,
    message: 'Bot "Agente de Suporte" recebeu 150 novas conversas',
    time: 'há 2 horas',
    unread: true,
    type: 'info',
  },
  {
    id: 2,
    message: 'Cota de API em 85% de uso',
    time: 'há 4 horas',
    unread: true,
    type: 'warning',
  },
  {
    id: 3,
    message: 'Atualização da base de conhecimento concluída',
    time: 'há 1 dia',
    unread: false,
    type: 'success',
  },
];

// Mock user data - replace with actual useAuth hook when AuthContext is available
const mockUser: UserInfo = {
  name: 'Usuário',
  email: 'usuario@techlicense.com.br',
  plan: 'Plano Premium',
};

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
    '/cobranca': 'Cobrança',
    '/settings': 'Configurações',
    '/profile': 'Meu Perfil',
  };

  return breadcrumbs[pathname] || 'Página';
};

export default function Header({ onLogout }: HeaderProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = useMemo(
    () => mockNotifications.filter((n) => n.unread).length,
    []
  );

  const breadcrumbLabel = getBreadcrumbLabel(pathname);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  const handleMarkAllAsRead = () => {
    // Implement mark all as read logic here
    console.log('Mark all notifications as read');
  };

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
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount}
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
                    {mockNotifications.length > 0 ? (
                      mockNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                            notif.unread
                              ? getNotificationColor(notif.type)
                              : ''
                          }`}
                          role="article"
                        >
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {notif.message}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {notif.time}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <p className="text-sm">Nenhuma notificação</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={handleMarkAllAsRead}
                      className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      Marcar todas como lidas
                    </button>
                  </div>
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
