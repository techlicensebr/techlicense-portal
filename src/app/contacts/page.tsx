'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search,
  UserCircle,
  AlertCircle,
  Mail,
  Phone,
  Tag,
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
  Edit3,
  X,
  Check,
  Download,
  Shield,
} from 'lucide-react';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { apiClient, ContactData } from '@/lib/api';

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Partial<ContactData> | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // Fetch contacts list
  const { data: contactsData, loading, error, refetch } = useApi(
    () => apiClient.getContacts({ page, per_page: perPage }),
    { autoFetch: true }
  );

  // Fetch selected contact details
  const { data: contactDetail, loading: detailLoading, refetch: refetchDetail } = useApi(
    () => selectedContactId ? apiClient.getContact(selectedContactId) : Promise.resolve(null),
    { autoFetch: !!selectedContactId }
  );

  // Refetch when page changes
  useEffect(() => {
    refetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Refetch detail when selected contact changes
  useEffect(() => {
    if (selectedContactId) {
      refetchDetail();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContactId]);

  // Update mutation
  const updateContact = useApiMutation(
    async (payload: { id: string; data: Partial<ContactData> }) => {
      return apiClient.updateContact(payload.id, payload.data);
    }
  );

  const contacts = useMemo(() => {
    const raw = contactsData;
    if (!raw) return [];
    return (raw as Record<string, unknown>)?.contacts || (raw as Record<string, unknown>)?.data || [];
  }, [contactsData]) as ContactData[];

  const totalContacts = useMemo(() => {
    const raw = contactsData as Record<string, unknown> | null;
    if (!raw) return 0;
    const meta = raw.meta as Record<string, unknown> | undefined;
    return Number(raw.total || meta?.total || contacts.length);
  }, [contactsData, contacts]);

  const totalPages = Math.ceil(totalContacts / perPage);

  // Client-side search
  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter((c: ContactData) =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  const detail = useMemo(() => {
    if (!contactDetail) return null;
    return (contactDetail as unknown as Record<string, unknown>)?.data || contactDetail;
  }, [contactDetail]) as ContactData | null;

  const handleEditSave = useCallback(async () => {
    if (!editingContact || !selectedContactId) return;
    try {
      await updateContact.mutate({ id: selectedContactId, data: editingContact });
      setEditingContact(null);
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 3000);
      refetchDetail();
      refetch();
    } catch {
      // Error handled by useApiMutation
    }
  }, [editingContact, selectedContactId, updateContact, refetchDetail, refetch]);

  const handleExport = useCallback(async (contactId: string) => {
    try {
      // The API returns JSON for LGPD export
      const response = await fetch(
        `https://techlicense-chatbot-api.techlicensebr.workers.dev/v1/contacts/${contactId}/export`,
        {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contact-${contactId}-export.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Contatos</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gerencie seus contatos e dados de clientes
          </p>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {totalContacts} contato{totalContacts !== 1 ? 's' : ''} total
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 p-3">
          <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
          <p className="text-sm text-red-700 dark:text-red-300">
            Erro ao carregar contatos: {error.message}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 'calc(100vh - 300px)' }}>
        {/* Left: Contact List */}
        <div className="lg:col-span-1 card dark:bg-slate-800 p-0 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Contact list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-3 space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-14 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <UserCircle size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhum contato encontrado</p>
              </div>
            ) : (
              filteredContacts.map((contact: ContactData) => {
                const isSelected = selectedContactId === contact.id;
                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                    className={`w-full text-left px-3 py-3 border-b border-slate-100 dark:border-slate-700/50 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {(contact.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {contact.name || 'Sem nome'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {contact.email || contact.phone || 'Sem contato'}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {formatDate(contact.last_seen_at || contact.created_at)}
                      </span>
                    </div>
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 ml-12">
                        {contact.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length > 3 && (
                          <span className="text-[9px] text-slate-400">+{contact.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Contact Detail */}
        {selectedContactId && detail ? (
          <div className="lg:col-span-2 card dark:bg-slate-800 p-0 flex flex-col overflow-hidden">
            {/* Detail Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                    {(detail.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    {editingContact ? (
                      <input
                        type="text"
                        value={editingContact.name || ''}
                        onChange={(e) => setEditingContact(prev => ({ ...prev, name: e.target.value }))}
                        className="text-lg font-semibold bg-transparent border-b-2 border-blue-500 text-slate-900 dark:text-white outline-none"
                      />
                    ) : (
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {detail.name || 'Sem nome'}
                      </h2>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Criado em {formatDate(detail.created_at)}
                      {detail.last_seen_at && ` • Visto em ${formatDateTime(detail.last_seen_at)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingContact ? (
                    <>
                      <button
                        onClick={handleEditSave}
                        disabled={updateContact.loading}
                        className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingContact(null)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingContact({ name: detail.name, email: detail.email, phone: detail.phone })}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                      title="Editar contato"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                </div>
              </div>
              {editSuccess && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">Contato atualizado com sucesso!</p>
              )}
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {detailLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : (
                <>
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail size={14} className="text-slate-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Email</span>
                      </div>
                      {editingContact ? (
                        <input
                          type="email"
                          value={editingContact.email || ''}
                          onChange={(e) => setEditingContact(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full text-sm bg-transparent border-b border-blue-500 text-slate-900 dark:text-white outline-none"
                        />
                      ) : (
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{detail.email || '—'}</p>
                      )}
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone size={14} className="text-slate-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Telefone</span>
                      </div>
                      {editingContact ? (
                        <input
                          type="tel"
                          value={editingContact.phone || ''}
                          onChange={(e) => setEditingContact(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full text-sm bg-transparent border-b border-blue-500 text-slate-900 dark:text-white outline-none"
                        />
                      ) : (
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{detail.phone || '—'}</p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {detail.tags && detail.tags.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag size={14} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {detail.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conversation Stats */}
                  {detail.conversation_stats && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={14} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conversas</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                          <p className="text-lg font-bold text-slate-900 dark:text-white">{detail.conversation_stats.total}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Total</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{detail.conversation_stats.active}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Ativas</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">{detail.conversation_stats.closed}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Concluídas</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Conversations */}
                  {detail.conversations && detail.conversations.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Histórico Recente</span>
                      </div>
                      <div className="space-y-2">
                        {detail.conversations.map((conv) => {
                          const statusColors: Record<string, string> = {
                            active: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
                            closed: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
                          };
                          return (
                            <div key={conv.id} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                  {conv.bots?.name || conv.bot_id}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {conv.channel || 'api'} • {conv.message_count} msgs • {formatDateTime(conv.first_message_at)}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                statusColors[conv.status] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                              }`}>
                                {conv.status === 'active' ? 'Ativo' : conv.status === 'closed' ? 'Concluído' : conv.status}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* LGPD Actions */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield size={14} className="text-slate-400" />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Privacidade (LGPD)</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExport(detail.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Download size={14} />
                        Exportar Dados
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 card dark:bg-slate-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <UserCircle size={28} className="text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Selecione um contato</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Clique em um contato para ver detalhes e histórico de conversas
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
