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
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-gradient-to-r from-[#D4A843] to-[#B8860B] text-black hover:from-[#C9982E] hover:to-[#A07520] transition-colors"
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
        className={`fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] text-slate-100 shadow-lg shadow-black/20 border-r border-[#1a1a1a] transform transition-transform duration-300 ease-in-out z-40 lg:relative lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 mb-8 hover:opacity-90 transition-opacity group"
            onClick={() => setIsOpen(false)}
          >
            <img src="/logo-icon.svg" alt="TechLicense" className="w-9 h-9" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-silver-300" style={{ color: '#C0C0C0' }}>TechLicense</span>
              <span className="text-xs" style={{ color: '#D4A843' }}>Chatbot IA</span>
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
                    ? 'bg-[#D4A843]/10 text-[#D4A843] font-medium border-l-4 border-[#D4A843]'
                    : 'text-[#A0A0A0] hover:bg-[#1a1a1a] hover:text-[#C0C0C0]'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer - User Info */}
        <div className="mt-auto p-6 border-t border-[#1a1a1a] space-y-3">
          {/* User Button */}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors group relative"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4A843] to-[#B8860B] rounded-full flex items-center justify-center text-black text-sm font-bold group-hover:shadow-lg group-hover:shadow-[#D4A843]/20 transition-shadow">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[#C0C0C0]">{user.name}</p>
              <p className="text-xs text-[#707070] truncate">{user.email}</p>
            </div>
            <ChevronDown
              size={16}
              className={`text-[#707070] transition-transform duration-200 ${
                showUserMenu ? 'rotate-180' : ''
              }`}
            />

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#111111] border border-[#2a2a2a] rounded-lg shadow-lg shadow-black/40 z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-[#C0C0C0] hover:bg-[#1a1a1a] hover:text-[#D4A843] rounded-t-lg transition-colors"
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsOpen(false);
                  }}
                >
                  Meu Perfil
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-[#C0C0C0] hover:bg-[#1a1a1a] hover:text-[#D4A843] transition-colors"
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
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-b-lg transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            )}
          </button>

          {/* Version Info */}
          <div className="text-xs text-[#505050] space-y-1 pt-3 border-t border-[#1a1a1a]">
            <p className="font-medium" style={{ color: '#D4A843' }}>TechLicense</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
