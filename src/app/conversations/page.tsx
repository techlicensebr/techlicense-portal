'use client';

import React, { useState, useMemo } from 'react';
import { Search, MessageSquare, AlertCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { apiClient, ConversationData, MessageData } from '@/lib/api';

type StatusFilterType = 'all' | 'active' | 'closed' | 'archived';

export default function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const { data: conversationsData, loading: conversationsLoading, error: conversationsError } = useApi(
    () => apiClient.getConversations({ limit: 50 }),
    { autoFetch: true }
  );

  const { data: messagesData, loading: messagesLoading } = useApi(
    () => (selectedConversationId ? apiClient.getConversationMessages(selectedConversationId) : Promise.resolve(null)),
    { autoFetch: !!selectedConversationId }
  );

  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.messages || [];

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv: ConversationData) => {
      const matchesSearch =
        (conv.user_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.bot_id || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [conversations, searchQuery, statusFilter]);

  const selectedConversation = conversations.find((c: ConversationData) => c.id === selectedConversationId);

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: 'Ativo',
      closed: 'Concluído',
      archived: 'Arquivado',
    };
    return statusMap[status] || status;
  };

  const getStatusBadgeColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      active: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      closed: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      archived: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    };
    return colorMap[status] || colorMap.archived;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Conversas</h1>
        <p className="text-slate-600 dark:text-slate-400">Visualize e gerencie conversas com clientes</p>
      </div>

      {/* Error state */}
      {conversationsError && (
        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
          <p className="text-sm text-red-700 dark:text-red-300">
            Erro ao carregar conversas: {conversationsError.message}
          </p>
        </div>
      )}

      {/* Layout: 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
        {/* Left: Conversations list */}
        <div className="lg:col-span-1 card dark:bg-slate-800 flex flex-col">
          {/* Search and filters */}
          <div className="space-y-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'active', 'closed', 'archived'] as StatusFilterType[]).map((status) => {
                const labels: Record<StatusFilterType, string> = {
                  all: 'Todos',
                  active: 'Ativos',
                  closed: 'Concluídos',
                  archived: 'Arquivados',
                };

                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {labels[status]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {conversationsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-600 dark:text-slate-400 text-sm">Nenhuma conversa encontrada</p>
              </div>
            ) : (
              filteredConversations.map((conversation: ConversationData) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedConversationId === conversation.id
                      ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{conversation.user_id || 'Usuário'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{conversation.bot_id}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">({conversation.message_count} mensagens)</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getStatusBadgeColor(conversation.status)}`}>
                      {getStatusLabel(conversation.status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {new Date(conversation.started_at).toLocaleTimeString('pt-BR')}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Message thread */}
        {selectedConversationId && selectedConversation ? (
          <div className="lg:col-span-2 card dark:bg-slate-800 flex flex-col">
            {/* Header */}
            <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedConversation.user_id || 'Usuário'}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedConversation.bot_id} • {selectedConversation.message_count} mensagens
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedConversation.status)}`}>
                  {getStatusLabel(selectedConversation.status)}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Nenhuma mensagem encontrada</p>
                </div>
              ) : (
                messages.map((message: MessageData) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.role === 'assistant'
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                          : 'bg-blue-600 dark:bg-blue-500 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.role === 'assistant'
                            ? 'text-slate-600 dark:text-slate-400'
                            : 'text-blue-100 dark:text-blue-200'
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Info message */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Esta conversa é apenas leitura para fins de gerenciamento.
              </p>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 card dark:bg-slate-800 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Selecione uma conversa para visualizar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
