'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  BarChart3,
  Key,
  Webhook,
  Settings,
  Menu,
  X,
  Zap,
  Smartphone,
  CreditCard,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Painel',
    href: '/',
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: 'Bots',
    href: '/bots',
    icon: <Zap size={20} />,
  },
  {
    label: 'Conversas',
    href: '/conversations',
    icon: <MessageSquare size={20} />,
  },
  {
    label: 'Base de Conhecimento',
    href: '/knowledge',
    icon: <Brain size={20} />,
  },
  {
    label: 'Análises',
    href: '/analytics',
    icon: <BarChart3 size={20} />,
  },
  {
    label: 'Chaves de API',
    href: '/api-keys',
    icon: <Key size={20} />,
  },
  {
    label: 'Webhooks',
    href: '/webhooks',
    icon: <Webhook size={20} />,
  },
  {
    label: 'Canais',
    href: '/canais',
    icon: <Smartphone size={20} />,
  },
  {
    label: 'Cobrança',
    href: '/cobranca',
    icon: <CreditCard size={20} />,
  },
  {
    label: 'Configurações',
    href: '/settings',
    icon: <Settings size={20} />,
  },
];

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Mock user data - replace with actual useAuth hook when AuthContext is available
  const user: UserInfo = {
    name: 'Usuário',
    email: 'usuario@techlicense.com.br',
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    // Call logout logic here
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-lg dark:shadow-xl border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out z-40 lg:relative lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity group"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg flex items-center justify-center font-bold text-white group-hover:shadow-lg transition-shadow">
              TL
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">TechLicense</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Chatbot IA</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium border-l-4 border-blue-600 dark:border-blue-500'
                    : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer - User Info */}
        <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* User Button */}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group relative"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold group-hover:shadow-lg transition-shadow">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
            <ChevronDown
              size={16}
              className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                showUserMenu ? 'rotate-180' : ''
              }`}
            />

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-t-lg transition-colors"
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsOpen(false);
                  }}
                >
                  Meu Perfil
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsOpen(false);
                  }}
                >
                  Configurações
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowUserMenu(false);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            )}
          </button>

          {/* Version Info */}
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
            <p className="font-medium">TechLicense</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
