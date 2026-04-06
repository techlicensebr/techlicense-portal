'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Activity,
  MessageSquare,
  Zap,
} from 'lucide-react';

interface Bot {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  conversations: number;
  messages: number;
  tokens: number;
  createdAt: string;
  avatar?: string;
}

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([
    {
      id: '1',
      name: 'Support Agent',
      description: 'Customer support chatbot for technical issues',
      status: 'active',
      conversations: 1247,
      messages: 5834,
      tokens: 234000,
      createdAt: '2024-01-15',
      avatar: 'SA',
    },
    {
      id: '2',
      name: 'Sales Assistant',
      description: 'Helps qualify leads and answer pricing questions',
      status: 'active',
      conversations: 892,
      messages: 3421,
      tokens: 156000,
      createdAt: '2024-02-20',
      avatar: 'SA',
    },
    {
      id: '3',
      name: 'FAQ Bot',
      description: 'Handles frequently asked questions',
      status: 'inactive',
      conversations: 234,
      messages: 1023,
      tokens: 34000,
      createdAt: '2024-03-10',
      avatar: 'FB',
    },
    {
      id: '4',
      name: 'HR Assistant',
      description: 'Internal HR and employee onboarding bot',
      status: 'active',
      conversations: 156,
      messages: 678,
      tokens: 45000,
      createdAt: '2024-03-25',
      avatar: 'HR',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredBots = bots.filter(
    (bot) =>
      bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setBots(bots.filter((bot) => bot.id !== id));
    setOpenMenu(null);
  };

  const handleToggleStatus = (id: string) => {
    setBots(
      bots.map((bot) =>
        bot.id === id
          ? { ...bot, status: bot.status === 'active' ? 'inactive' : 'active' }
          : bot
      )
    );
    setOpenMenu(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Bots</h1>
          <p className="text-slate-600">Manage and configure your chatbots</p>
        </div>
        <Link
          href="/bots/new"
          className="btn-primary flex items-center justify-center gap-2 md:w-auto"
        >
          <Plus size={20} />
          Create Bot
        </Link>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search bots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Bots grid */}
      {filteredBots.length === 0 ? (
        <div className="card text-center py-12">
          <Zap size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No bots found</h3>
          <p className="text-slate-600 mt-2">Get started by creating your first chatbot</p>
          <Link href="/bots/new" className="btn-primary mt-4 inline-flex gap-2">
            <Plus size={18} />
            Create Bot
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBots.map((bot) => (
            <div key={bot.id} className="card card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-600 flex-shrink-0">
                    {bot.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/bots/${bot.id}`} className="group">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {bot.name}
                      </h3>
                    </Link>
                    <p className="text-slate-600 text-sm mt-1">{bot.description}</p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MessageSquare size={16} className="text-blue-600" />
                        <span>{bot.conversations} conversations</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Activity size={16} className="text-green-600" />
                        <span>{bot.messages.toLocaleString()} messages</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Zap size={16} className="text-yellow-600" />
                        <span>{bot.tokens.toLocaleString()} tokens</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bot.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {bot.status === 'active' ? 'Active' : 'Inactive'}
                  </span>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === bot.id ? null : bot.id)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenu === bot.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                        <Link
                          href={`/bots/${bot.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
                        >
                          <Edit size={16} />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(bot.id)}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
                        >
                          <Eye size={16} />
                          {bot.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(bot.id)}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
