'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Activity,
  Loader,
  Calendar,
  X,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

// =====================================================
// Types
// =====================================================

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    full_name: string | null;
    email: string;
  } | null;
}

// =====================================================
// Helpers
// =====================================================

function getActionColor(action: string): string {
  if (action.includes('create') || action.includes('invite')) return 'bg-green-400/10 text-green-400 border-green-400/30';
  if (action.includes('delete') || action.includes('remove')) return 'bg-red-400/10 text-red-400 border-red-400/30';
  if (action.includes('update') || action.includes('assign')) return 'bg-blue-400/10 text-blue-400 border-blue-400/30';
  if (action.includes('export')) return 'bg-purple-400/10 text-purple-400 border-purple-400/30';
  if (action.includes('test')) return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30';
  return 'bg-gray-400/10 text-gray-400 border-gray-400/30';
}

function getResourceIcon(resourceType: string): string {
  const icons: Record<string, string> = {
    bots: '🤖',
    conversations: '💬',
    webhooks: '🔗',
    team: '👥',
    'api-keys': '🔑',
    knowledge: '🧠',
    channels: '📱',
    settings: '⚙️',
    handoff: '🎧',
    billing: '💳',
    contacts: '📇',
  };
  return icons[resourceType] || '📋';
}

function formatAction(action: string): string {
  return action
    .replace(/\./g, ' → ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffHour < 24) return `${diffHour}h atrás`;
  if (diffDay < 7) return `${diffDay}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

// =====================================================
// Main Page
// =====================================================

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 25;

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  // Load available actions for filter dropdown
  useEffect(() => {
    const loadActions = async () => {
      try {
        const res = await apiClient.getAuditActions();
        setAvailableActions(res.data || []);
      } catch {
        // Silently fail — filter just won't have pre-loaded options
      }
    };
    loadActions();
  }, []);

  // Load audit logs
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: perPage };
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource_type = resourceFilter;
      if (dateFrom) params.from = new Date(dateFrom).toISOString();
      if (dateTo) params.to = new Date(dateTo + 'T23:59:59').toISOString();

      const res = await apiClient.getAuditLogs(params);
      setLogs(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, resourceFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Client-side search filtering (on top of server filters)
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.resource_type.toLowerCase().includes(q) ||
      (log.user?.full_name || '').toLowerCase().includes(q) ||
      (log.user?.email || '').toLowerCase().includes(q) ||
      (log.ip_address || '').includes(q)
    );
  });

  const totalPages = Math.ceil(total / perPage);

  // Export CSV
  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await apiClient.exportAuditLogs({
        from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
        to: dateTo ? new Date(dateTo + 'T23:59:59').toISOString() : undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setActionFilter('');
    setResourceFilter('');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    setPage(1);
  };

  const hasActiveFilters = actionFilter || resourceFilter || dateFrom || dateTo;

  // Resource types for filter
  const resourceTypes = [
    'bots', 'conversations', 'webhooks', 'team', 'api-keys',
    'knowledge', 'channels', 'settings', 'handoff', 'billing', 'contacts',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Shield size={28} className="text-[#D4A843]" />
            Logs de Auditoria
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Rastreie todas as ações realizadas na plataforma
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4A843] text-black rounded-lg font-medium hover:bg-[#C9982E] transition-colors disabled:opacity-50"
        >
          {exporting ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
          Exportar CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
              <Activity size={20} className="text-[#D4A843]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total de Logs</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-400/10 flex items-center justify-center">
              <Clock size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {logs.length > 0 ? timeAgo(logs[0].created_at) : '—'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Último Evento</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
              <User size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {new Set(logs.map((l) => l.user?.email).filter(Boolean)).size}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Usuários Ativos</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
              <Filter size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{availableActions.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tipos de Ação</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ação, recurso, usuário, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#D4A843]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              hasActiveFilters
                ? 'bg-[#D4A843]/10 border-[#D4A843]/30 text-[#D4A843]'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <Filter size={16} />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#D4A843]" />
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <X size={14} />
              Limpar
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ação</label>
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#D4A843]"
              >
                <option value="">Todas</option>
                {availableActions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Recurso</label>
              <select
                value={resourceFilter}
                onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#D4A843]"
              >
                <option value="">Todos</option>
                {resourceTypes.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                <Calendar size={12} className="inline mr-1" />De
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#D4A843]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                <Calendar size={12} className="inline mr-1" />Até
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#D4A843]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={32} className="animate-spin text-[#D4A843]" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16">
            <Shield size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              {total === 0 ? 'Nenhum log de auditoria registrado ainda.' : 'Nenhum resultado para os filtros aplicados.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quando</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usuário</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ação</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recurso</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">IP</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">{timeAgo(log.created_at)}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4A843] to-[#B8860B] flex items-center justify-center text-black text-xs font-bold">
                            {(log.user?.full_name || log.user?.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm text-slate-900 dark:text-white truncate max-w-[120px]">
                              {log.user?.full_name || '—'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                              {log.user?.email || ((log.details as Record<string, unknown>)?.auth_type === 'api_key' ? 'API Key' : '—')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${getActionColor(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span>{getResourceIcon(log.resource_type)}</span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">{log.resource_type}</span>
                        </div>
                        {log.resource_id && (
                          <div className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate max-w-[100px]" title={log.resource_id}>
                            {log.resource_id.slice(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                          {log.ip_address || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-slate-500 dark:text-slate-400 max-w-[150px]">
                          {log.details && typeof log.details === 'object' && 'method' in log.details && (
                            <span className="inline-block px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-mono mr-1">
                              {String((log.details as Record<string, unknown>).method)}
                            </span>
                          )}
                          {log.details && typeof log.details === 'object' && 'status_code' in log.details && (
                            <span className={`inline-block px-1.5 py-0.5 rounded font-mono ${
                              Number((log.details as Record<string, unknown>).status_code) < 300
                                ? 'bg-green-400/10 text-green-400'
                                : 'bg-red-400/10 text-red-400'
                            }`}>
                              {String((log.details as Record<string, unknown>).status_code)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Mostrando {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-slate-500 dark:text-slate-400 px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-amber-50 dark:bg-[#D4A843]/5 border border-amber-200 dark:border-[#D4A843]/20 rounded-xl p-4">
        <p className="text-sm text-amber-700 dark:text-[#D4A843]">
          <strong>Auditoria:</strong> Todas as ações de criação, edição e exclusão são automaticamente registradas.
          Os logs são retidos por 90 dias e podem ser exportados em CSV a qualquer momento.
        </p>
      </div>
    </div>
  );
}
