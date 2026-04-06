'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './globals.css';

// Nota: metadata não funciona em Client Components
// Será necessário usar um layout.tsx em server ou um root layout separado

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  // Rotas onde não mostramos Sidebar e Header
  const isLoginPage = pathname === '/login' || pathname === '/verify-magic-link';

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TechLicense Portal - Gerenciador de Chatbots IA</title>
        <meta name="description" content="Gerencie seus chatbots de IA com TechLicense" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-white dark:bg-slate-950">
        <ThemeProvider>
          <AuthProvider>
            {isLoginPage ? (
              // Layout simples para páginas de login
              <>{children}</>
            ) : (
              // Layout com sidebar para páginas autenticadas
              <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
                {/* Sidebar */}
                <Sidebar />

                {/* Main content */}
                <div className="flex-1 flex flex-col lg:ml-0 pt-16 lg:pt-0">
                  {/* Header */}
                  <Header />

                  {/* Page content */}
                  <main className="flex-1 overflow-y-auto">
                    <div className="p-6">{children}</div>
                  </main>
                </div>
              </div>
            )}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
