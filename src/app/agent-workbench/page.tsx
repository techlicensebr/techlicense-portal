'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import {
  Headphones,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Loader,
  Hand,
  MessageSquare,
  ArrowRight,
  Plus,
  X,
  Settings,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

// =====================================================
// Types
// =====================================================

interface HandoffStats {
  waiting: number;
  assigned: number;
  resolved_today: number;
  avg_wait_time_ms: number;
  avg_wait_time_formatted: string;
}

interface HandoffRequest {
  id: string;
  conversation_id: string;
  bot_id: string;
  queue_id: string | null;
  status: 'waiting' | 'assigned' | 'resolved' | 'expired';
  trigger: string;
  trigger_reason: string | null;
  priority: number;
  notes: string | null;
  wait_started_at: string;
  assigned_at: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  assigned_user: { id: string; full_name: string | null; email: string } | null;
  conversation: { id: string; channel: string; contact_id: string | null; last_message_at: string; message_count: number } | null;
  bot: { id: string; name: string } | null;
  queue: { id: string; name: string } | null;
}

interface Queue {
  id: string;
  name: string;
  description: string | null;
  priority: number;
  max_concurrent: number;
  auto_assign: boolean;
  is_active: boolean;
  created_at: string;
  queue_assignments: Array<{
    id: string;
    user_id: string;
    is_available: boolean;
    current_load: number;
    users: { full_name: string | null; email: string } | null;
  }>;
}

// =====================================================
// Helpers
// =====================================================

function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const TRIGGER_LABELS: Record<string, string> = {
  keyword: 'Palavra-chave',
  sentiment: 'Sentimento negativo',
  manual: 'Manual',
  guardrail: 'Guardrail',
  timeout: 'Timeout',
  api: 'Via API',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  waiting: { bg: 'bg-yellow-400/10 border-yellow-400/30', text: 'text-yellow-400', label: 'Aguardando' },
  assigned: { bg: 'bg-blue-400/10 border-blue-400/30', text: 'text-blue-400', label: 'Em atendimento' },
  resolved: { bg: 'bg-green-400/10 border-green-400/30', text: 'text-green-400', label: 'Resolvido' },
  expired: { bg: 'bg-gray-400/10 border-gray-400/30', text: 'text-gray-400', label: 'Expirado' },
};

// =====================================================
// Stats Card
// =====================================================

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Create Queue Modal
// =====================================================

function CreateQueueModal({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxConcurrent, setMaxConcurrent] = useState(5);
  const [autoAssign, setAutoAssign] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.createHandoffQueue({ name: name.trim(), description: description.trim() || undefined, max_concurrent: maxConcurrent, auto_assign: autoAssign });
      onCreated();
      onClose();
      setName(''); setDescription(''); setMaxConcurrent(5); setAutoAssign(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar fila.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Nova Fila de Atendimento</h2>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/30">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nome</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Suporte Técnico"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#D4A843]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descrição</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Opcional"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#D4A843]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Max. conversas simultâneas por agente</label>
            <input type="number" value={maxConcurrent} onChange={e => setMaxConcurrent(Number(e.target.value))} min={1} max={50}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A843]" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-assign para agentes</label>
            <button type="button" onClick={() => setAutoAssign(!autoAssign)} className="text-[#D4A843]">
              {autoAssign ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-slate-500 dark:text-slate-400" />}
            </button>
          </div>
          <button type="submit" disabled={loading || !name.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-[#D4A843] to-[#B8860B] hover:from-[#E8C860] hover:to-[#C9982E] disabled:from-slate-300 dark:disabled:from-slate-700 disabled:to-slate-200 dark:disabled:to-slate-600 text-black font-semibold rounded-lg transition-all disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <Loader size={18} className="animate-spin" /> : <Plus size={18} />}
            Criar Fila
          </button>
        </form>
      </div>
    </div>
  );
}

// =====================================================
// Main Agent Workbench Page
// =====================================================

export default function AgentWorkbenchPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<HandoffStats | null>(null);
  const [requests, setRequests] = useState<HandoffRequest[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'requests' | 'queues'>('requests');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateQueue, setShowCreateQueue] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const canManage = user?.role === 'owner' || user?.role === 'admin';

  const loadData = useCallback(async () => {
    try {
      const [statsRes, requestsRes, queuesRes] = await Promise.all([
        apiClient.getHandoffStats(),
        apiClient.getHandoffRequests(statusFilter || undefined),
        apiClient.getHandoffQueues(),
      ]);
      setStats(statsRes.data);
      setRequests(requestsRes.data || []);
      setQueues(queuesRes.data || []);
    } catch (err) {
      console.error('Error loading handoff data:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [loadData]);

  const handleAssign = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await apiClient.assignHandoffRequest(requestId);
      await loadData();
    } catch (err) {
      console.error('Error assigning:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await apiClient.resolveHandoffRequest(requestId);
      await loadData();
    } catch (err) {
      console.error('Error resolving:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={32} className="animate-spin text-[#D4A843]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Headphones size={28} className="text-[#D4A843]" />
            Atendimento Humano
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie conversas transferidas dos bots para agentes humanos</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Clock size={20} className="text-yellow-400" />} label="Aguardando" value={stats.waiting} color="bg-yellow-400/10" />
          <StatCard icon={<Headphones size={20} className="text-blue-400" />} label="Em atendimento" value={stats.assigned} color="bg-blue-400/10" />
          <StatCard icon={<CheckCircle2 size={20} className="text-green-400" />} label="Resolvidos hoje" value={stats.resolved_today} color="bg-green-400/10" />
          <StatCard icon={<AlertCircle size={20} className="text-purple-400" />} label="Tempo médio espera" value={stats.avg_wait_time_formatted} color="bg-purple-400/10" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
        <button onClick={() => setTab('requests')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${tab === 'requests' ? 'bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
          Solicitações ({requests.length})
        </button>
        <button onClick={() => setTab('queues')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${tab === 'queues' ? 'bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
          Filas ({queues.length})
        </button>
      </div>

      {/* Requests Tab */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {/* Status filter */}
          <div className="flex gap-2">
            {['', 'waiting', 'assigned', 'resolved'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${statusFilter === s ? 'bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                {s === '' ? 'Todos' : STATUS_STYLES[s]?.label || s}
              </button>
            ))}
          </div>

          {requests.map(req => {
            const style = STATUS_STYLES[req.status] || STATUS_STYLES.waiting;
            return (
              <div key={req.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                    {req.status === 'waiting' ? <Hand size={20} className={style.text} /> :
                     req.status === 'assigned' ? <Headphones size={20} className={style.text} /> :
                     <CheckCircle2 size={20} className={style.text} />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-slate-900 dark:text-white font-medium">
                        {req.bot?.name || 'Bot'} → {req.queue?.name || 'Sem fila'}
                      </p>
                      <span className={`px-2 py-0.5 rounded text-xs border ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {TRIGGER_LABELS[req.trigger] || req.trigger}
                      {req.trigger_reason && ` — ${req.trigger_reason}`}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 dark:text-slate-500">
                      <span className="flex items-center gap-1"><MessageSquare size={10} /> Conv: {req.conversation?.message_count || 0} msgs</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {formatTimeAgo(req.wait_started_at)}</span>
                      {req.assigned_user && <span>Agente: {req.assigned_user.full_name || req.assigned_user.email}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'waiting' && (
                      <button onClick={() => handleAssign(req.id)} disabled={actionLoading === req.id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-sm hover:bg-blue-500/20 transition-colors disabled:opacity-50">
                        {actionLoading === req.id ? <Loader size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                        Atender
                      </button>
                    )}
                    {req.status === 'assigned' && (
                      <button onClick={() => handleResolve(req.id)} disabled={actionLoading === req.id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors disabled:opacity-50">
                        {actionLoading === req.id ? <Loader size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Resolver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {requests.length === 0 && (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <Headphones size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg">Nenhuma solicitação {statusFilter ? STATUS_STYLES[statusFilter]?.label.toLowerCase() : ''}</p>
              <p className="text-sm mt-1">Quando um bot transferir uma conversa, ela aparecerá aqui.</p>
            </div>
          )}
        </div>
      )}

      {/* Queues Tab */}
      {tab === 'queues' && (
        <div className="space-y-3">
          {canManage && (
            <div className="flex justify-end">
              <button onClick={() => setShowCreateQueue(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4A843] to-[#B8860B] hover:from-[#E8C860] hover:to-[#C9982E] text-black font-semibold rounded-xl transition-all text-sm">
                <Plus size={16} /> Nova Fila
              </button>
            </div>
          )}

          {queues.map(queue => (
            <div key={queue.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#D4A843]/10 flex items-center justify-center shrink-0">
                  <Settings size={20} className="text-[#D4A843]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-slate-900 dark:text-white font-medium">{queue.name}</p>
                    {queue.auto_assign && (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-400/10 text-green-400 border border-green-400/30">Auto-assign</span>
                    )}
                    {!queue.is_active && (
                      <span className="px-2 py-0.5 rounded text-xs bg-red-400/10 text-red-400 border border-red-400/30">Inativa</span>
                    )}
                  </div>
                  {queue.description && <p className="text-sm text-slate-500 dark:text-slate-400">{queue.description}</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 dark:text-slate-500">
                    <span className="flex items-center gap-1"><Users size={10} /> {queue.queue_assignments?.length || 0} agentes</span>
                    <span>Max: {queue.max_concurrent} conversas/agente</span>
                    <span>Prioridade: {queue.priority}</span>
                  </div>
                </div>

                {/* Agent avatars */}
                {queue.queue_assignments && queue.queue_assignments.length > 0 && (
                  <div className="flex -space-x-2">
                    {queue.queue_assignments.slice(0, 5).map(a => (
                      <div key={a.id} className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold ${a.is_available ? 'bg-green-400/20 text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                        title={`${a.users?.full_name || a.users?.email || 'Agente'} (${a.is_available ? 'Disponível' : 'Indisponível'})`}>
                        {(a.users?.full_name || a.users?.email || '?')[0].toUpperCase()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {queues.length === 0 && (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <Settings size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg">Nenhuma fila criada</p>
              <p className="text-sm mt-1">Crie filas para organizar o atendimento por departamento ou assunto.</p>
              {canManage && (
                <button onClick={() => setShowCreateQueue(true)}
                  className="mt-3 text-[#D4A843] hover:text-[#E8C860] text-sm font-medium">
                  Criar primeira fila
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Queue Modal */}
      <CreateQueueModal isOpen={showCreateQueue} onClose={() => setShowCreateQueue(false)} onCreated={loadData} />
    </div>
  );
}
