import React from 'react';
import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'TechLicense Chatbot - Admin Portal',
  description: 'Manage your AI chatbots with TechLicense',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect fill="%232563eb" width="32" height="32"/><text x="50%" y="50%" font-size="16" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">TL</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen bg-gray-50">
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
      </body>
    </html>
  );
}
