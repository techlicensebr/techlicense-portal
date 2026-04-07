'use client';

import React, { useState, useMemo } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';
import { BotData } from '@/lib/api';

export default function BotsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: botsData, loading, error, refetch } = useApi(
    () => apiClient.getBots(),
    { autoFetch: true }
  );

  const { mutate: deleteBotMutate, loading: deleteLoading } = useApiMutation(
    (id: string) => apiClient.deleteBot(id),
    {
      onSuccess: () => {
        setDeleteConfirm(null);
        setOpenMenu(null);
        refetch();
      },
    }
  );

  const { mutate: toggleStatusMutate } = useApiMutation(
    (id: string) => apiClient.toggleBotStatus(id),
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  const bots = botsData?.bots || [];

  const filteredBots = useMemo(() => {
    return bots.filter(
      (bot: BotData) =>
        bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bots, searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      await deleteBotMutate(id);
    } catch (err) {
      console.error('Erro ao deletar bot:', err);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatusMutate(id);
      setOpenMenu(null);
    } catch (err) {
      console.error('Erro ao alternar status:', err);
    }
  };

  const getAvatarColor = (name: string): string => {
    const colors = ['bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300', 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300', 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300', 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bots</h1>
          <p className="text-slate-600 dark:text-slate-400">Gerencie e configure seus chatbots</p>
        </div>
        <Link
          href="/bots/new"
          className="btn-primary flex items-center justify-center gap-2 md:w-auto"
        >
          <Plus size={20} />
          Novo Bot
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
          <p className="text-sm text-red-700 dark:text-red-300">
            Erro ao carregar bots: {error.message}
          </p>
        </div>
      )}

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar bots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
        </div>
      </div>

      {/* Bots grid */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-32 bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ))}
        </div>
      ) : filteredBots.length === 0 ? (
        <div className="card text-center py-12 dark:bg-slate-800">
          <Zap size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Nenhum bot encontrado</h3>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Comece criando seu primeiro chatbot</p>
          <Link href="/bots/new" className="btn-primary mt-4 inline-flex gap-2">
            <Plus size={18} />
            Criar Bot
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBots.map((bot: BotData) => (
            <div key={bot.id} className="card card-hover dark:bg-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${getAvatarColor(bot.name)}`}>
                    {bot.name.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/bots/${bot.id}`} className="group">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {bot.name}
                      </h3>
                    </Link>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{bot.description}</p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" />
                        <span>Conversas</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Activity size={16} className="text-green-600 dark:text-green-400" />
                        <span>Mensagens</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Zap size={16} className="text-yellow-600 dark:text-yellow-400" />
                        <span>Modelo: {(bot as any).ai_model || bot.model}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bot.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {bot.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === bot.id ? null : bot.id)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenu === bot.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10">
                        <Link
                          href={`/bots/${bot.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-slate-900 dark:text-white"
                        >
                          <Edit size={16} />
                          Editar
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(bot.id)}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-slate-900 dark:text-white"
                        >
                          <Eye size={16} />
                          {bot.status === 'active' ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(bot.id)}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={16} />
                          Deletar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delete confirmation */}
              {deleteConfirm === bot.id && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2 justify-end">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="btn-secondary"
                    disabled={deleteLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(bot.id)}
                    className="btn-primary bg-red-600 hover:bg-red-700"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deletando...' : 'Confirmar Exclusão'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
