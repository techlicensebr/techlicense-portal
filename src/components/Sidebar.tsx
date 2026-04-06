'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: 'Bots',
    href: '/bots',
    icon: <Zap size={20} />,
  },
  {
    label: 'Conversations',
    href: '/conversations',
    icon: <MessageSquare size={20} />,
  },
  {
    label: 'Knowledge Base',
    href: '/knowledge',
    icon: <Brain size={20} />,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 size={20} />,
  },
  {
    label: 'API Keys',
    href: '/api-keys',
    icon: <Key size={20} />,
  },
  {
    label: 'Webhooks',
    href: '/webhooks',
    icon: <Webhook size={20} />,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings size={20} />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-blue-600 text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-text shadow-lg transform transition-transform duration-300 ease-in-out z-40 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
              TL
            </div>
            <span className="text-xl font-bold">TechLicense</span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-sidebar-text hover:bg-sidebar-hover'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700">
          <div className="text-xs text-slate-400">
            <p className="mb-2">TechLicense Chatbot</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
