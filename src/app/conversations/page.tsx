'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Radio,
  Clock,
  User,
  Bot,
  Download,
  ArrowDown,
} from 'lucide-react';
import { usePolling } from '@/hooks/usePolling';
import { apiClient, ConversationData, MessageData } from '@/lib/api';

type StatusFilterType = 'all' | 'active' | 'closed' | 'archived';

export default function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [newMessageCount, setNewMessageCount] = useState(0);

  // ---- Real-time polling for conversations list ----
  const {
    data: conversationsPolled,
    loading: conversationsLoading,
    error: conversationsError,
    lastUpdated: conversationsLastUpdated,
    isActive: pollingActive,
    refetch: refetchConversations,
  } = usePolling({
    fetcher: () => apiClient.getConversations({ limit: 50 }),
    interval: 5000,
    idleInterval: 15000,
    enabled: true,
    compareKey: (data) => {
      const convs = data?.conversations || [];
      // Hash based on message counts and last_message_at to detect changes
      return convs.map((c: ConversationData) =>
        `${c.id}:${c.message_count}:${c.last_message_at || ''}`
      ).join('|');
    },
  });

  // ---- Real-time polling for selected conversation messages ----
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {
    data: messagesPolled,
    loading: messagesLoading,
    lastUpdated: messagesLastUpdated,
    refetch: refetchMessages,
  } = usePolling<Record<string, unknown> | null>({
    fetcher: () =>
      selectedConversationId
        ? (apiClient.getConversation(selectedConversationId) as unknown as Promise<Record<string, unknown>>)
        : Promise.resolve(null),
    interval: 3000,
    idleInterval: 10000,
    enabled: !!selectedConversationId,
    compareKey: (data) => {
      if (!data) return '';
      const msgs = (data as Record<string, unknown>)?.messages as MessageData[] || [];
      return `${msgs.length}:${msgs[msgs.length - 1]?.id || ''}`;
    },
    onUpdate: (data) => {
      if (!data) return;
      const msgs = (data as Record<string, unknown>)?.messages as MessageData[] || [];
      const prevCount = messagesRef.current.length;
      if (msgs.length > prevCount && prevCount > 0) {
        setNewMessageCount(prev => prev + (msgs.length - prevCount));
        if (autoScroll) {
          scrollToBottom();
        }
      }
    },
  });

  // Track messages in ref for comparison
  const messagesRef = useRef<MessageData[]>([]);
  const conversations = useMemo(() => {
    if (!conversationsPolled) return [];
    return conversationsPolled?.conversations || [];
  }, [conversationsPolled]);

  const selectedConversationData = useMemo((): Record<string, unknown> | null => {
    if (!messagesPolled) return null;
    return messagesPolled as Record<string, unknown>;
  }, [messagesPolled]);

  const messages = useMemo((): MessageData[] => {
    const msgs = (selectedConversationData?.messages as MessageData[]) || [];
    messagesRef.current = msgs;
    return msgs;
  }, [selectedConversationData]);

  const selectedConversation = useMemo((): ConversationData | null => {
    if (selectedConversationData) {
      // Return the full conversation data from the detail endpoint
      return selectedConversationData as unknown as ConversationData;
    }
    // Fallback to list data
    return conversations.find((c: ConversationData) => c.id === selectedConversationId) || null;
  }, [selectedConversationData, conversations, selectedConversationId]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMessageCount(0);
  }, []);

  // Handle scroll position to detect if user scrolled up
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const el = messagesContainerRef.current;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setAutoScroll(isAtBottom);
    if (isAtBottom) setNewMessageCount(0);
  }, []);

  // Reset new message count when selecting a different conversation
  useEffect(() => {
    setNewMessageCount(0);
    setAutoScroll(true);
  }, [selectedConversationId]);

  // Auto-scroll on initial load
  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, autoScroll, scrollToBottom]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv: ConversationData) => {
      const matchesSearch =
        (conv.contacts?.name || conv.contact_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.bot_id || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [conversations, searchQuery, statusFilter]);

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

  const formatTime = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Export conversations CSV
  const handleExport = async () => {
    try {
      const blob = await apiClient.exportConversations({});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversas_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const active = conversations.filter((c: ConversationData) => c.status === 'active').length;
    const closed = conversations.filter((c: ConversationData) => c.status === 'closed').length;
    const totalMessages = conversations.reduce((sum: number, c: ConversationData) => sum + (c.message_count || 0), 0);
    return { total: conversations.length, active, closed, totalMessages };
  }, [conversations]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page header with real-time indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Conversas</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Monitoramento em tempo real de conversas
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            <Radio
              size={14}
              className={`text-green-600 dark:text-green-400 ${pollingActive ? 'animate-pulse' : ''}`}
            />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              {pollingActive ? 'AO VIVO' : 'PAUSADO'}
            </span>
            {conversationsLastUpdated && (
              <span className="text-xs text-green-600 dark:text-green-400">
                {formatTime(conversationsLastUpdated.toISOString())}
              </span>
            )}
          </div>

          {/* Manual refresh */}
          <button
            onClick={refetchConversations}
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Atualizar agora"
          >
            <RefreshCw size={16} className={`text-slate-600 dark:text-slate-400 ${conversationsLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm text-slate-700 dark:text-slate-300"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card dark:bg-slate-800 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="card dark:bg-slate-800 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Ativas</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.active}</p>
        </div>
        <div className="card dark:bg-slate-800 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Concluídas</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.closed}</p>
        </div>
        <div className="card dark:bg-slate-800 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Mensagens</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.totalMessages}</p>
        </div>
      </div>

      {/* Error state */}
      {conversationsError && (
        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 p-3">
          <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
          <p className="text-sm text-red-700 dark:text-red-300">
            Erro ao carregar conversas: {conversationsError.message}
          </p>
        </div>
      )}

      {/* Layout: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: 'calc(100vh - 380px)' }}>
        {/* Left: Conversations list */}
        <div className="lg:col-span-1 card dark:bg-slate-800 flex flex-col p-0 overflow-hidden">
          {/* Search and filters */}
          <div className="p-3 space-y-3 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex gap-1.5">
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
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {labels[status]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading && conversations.length === 0 ? (
              <div className="p-3 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma conversa encontrada</p>
              </div>
            ) : (
              filteredConversations.map((conversation: ConversationData) => {
                const isSelected = selectedConversationId === conversation.id;
                const isActive = conversation.status === 'active';

                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full text-left px-3 py-3 border-b border-slate-100 dark:border-slate-700/50 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-600 dark:border-l-blue-400'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                          )}
                          <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                            {conversation.contacts?.name || 'Usuário'}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {conversation.channel || 'api'} • {conversation.message_count} msgs
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusBadgeColor(conversation.status)}`}>
                          {getStatusLabel(conversation.status)}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {formatTime(conversation.last_message_at || conversation.first_message_at)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* List footer */}
          <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
              {filteredConversations.length} de {conversations.length} conversas
            </p>
          </div>
        </div>

        {/* Right: Message thread with real-time updates */}
        {selectedConversationId && selectedConversation ? (
          <div className="lg:col-span-2 card dark:bg-slate-800 flex flex-col p-0 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                    {(selectedConversation.contacts?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedConversation.contacts?.name || 'Usuário'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedConversation.channel || 'api'} • {selectedConversation.message_count || messages.length} msgs
                      {selectedConversation.contacts?.email && ` • ${selectedConversation.contacts.email}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {messagesLastUpdated && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      Atualizado {formatTime(messagesLastUpdated.toISOString())}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedConversation.status)}`}>
                    {getStatusLabel(selectedConversation.status)}
                  </span>
                  <button
                    onClick={refetchMessages}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Atualizar mensagens"
                  >
                    <RefreshCw size={14} className={`text-slate-400 ${messagesLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative"
            >
              {messagesLoading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma mensagem encontrada</p>
                </div>
              ) : (
                messages.map((message: MessageData, idx: number) => {
                  const isUser = message.role === 'user';
                  const isNew = idx >= messagesRef.current.length - newMessageCount && newMessageCount > 0;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isNew ? 'animate-fadeIn' : ''}`}
                    >
                      <div className="flex items-end gap-2 max-w-[75%]">
                        {!isUser && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mb-1">
                            <Bot size={12} className="text-white" />
                          </div>
                        )}
                        <div
                          className={`px-3 py-2 rounded-2xl ${
                            isUser
                              ? 'bg-blue-600 dark:bg-blue-500 text-white rounded-br-md'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${
                            isUser ? 'justify-end' : 'justify-start'
                          }`}>
                            <Clock size={10} className={isUser ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'} />
                            <p className={`text-[10px] ${
                              isUser ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        {isUser && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mb-1">
                            <User size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* New messages indicator */}
            {newMessageCount > 0 && !autoScroll && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
                <button
                  onClick={scrollToBottom}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-medium shadow-lg hover:bg-blue-700 transition-colors animate-bounce"
                >
                  <ArrowDown size={12} />
                  {newMessageCount} nova{newMessageCount > 1 ? 's' : ''} mensagem{newMessageCount > 1 ? 'ns' : ''}
                </button>
              </div>
            )}

            {/* Footer info */}
            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                Monitoramento em tempo real • As mensagens são atualizadas automaticamente
              </p>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 card dark:bg-slate-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={28} className="text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Selecione uma conversa</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Clique em uma conversa para visualizar as mensagens em tempo real
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
