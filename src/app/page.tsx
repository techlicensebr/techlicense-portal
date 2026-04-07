'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  TrendingUp,
  Zap,
  Smile,
  Plus,
  Upload,
  BarChart3,
  ArrowRight,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { apiClient, ConversationData, AnalyticsData } from '@/lib/api';

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-24 bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card h-72 bg-slate-200 dark:bg-slate-700" />
        <div className="card h-72 bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString('pt-BR');
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

interface ChartDataPoint {
  date: string;
  conversations: number;
  messages: number;
  satisfaction: number;
}

export default function Dashboard() {
  const { data: analytics, loading: analyticsLoading, error: analyticsError } = useApi<AnalyticsData>(
    () => apiClient.getAnalyticsOverview(),
    { autoFetch: true }
  );

  const { data: chartResponse } = useApi<{ data: ChartDataPoint[] }>(
    () => apiClient.getConversationsChart({ start_date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0] }),
    { autoFetch: true }
  );

  const { data: botsPerf } = useApi(
    () => apiClient.getBotsPerformance(),
    { autoFetch: true }
  );

  const { data: conversationsData, loading: conversationsLoading } = useApi(
    () => apiClient.getConversations({ limit: 5 }),
    { autoFetch: true }
  );

  const chartData = useMemo(() => {
    return chartResponse?.data || [];
  }, [chartResponse]);

  const kpis = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        title: 'Conversas',
        value: formatNumber(analytics.total_conversations),
        subtitle: 'nos últimos 30 dias',
        icon: <MessageSquare size={22} />,
        color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300',
      },
      {
        title: 'Mensagens',
        value: formatNumber(analytics.total_messages),
        subtitle: 'total no período',
        icon: <TrendingUp size={22} />,
        color: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300',
      },
      {
        title: 'Tokens de IA',
        value: formatNumber(analytics.total_tokens || 0),
        subtitle: analytics.limits?.tokens_month
          ? `Limite: ${formatNumber(analytics.limits.tokens_month)}/mês`
          : 'consumidos no período',
        icon: <Zap size={22} />,
        color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300',
      },
      {
        title: 'Tempo Médio',
        value: analytics.avg_response_time > 0 ? formatLatency(analytics.avg_response_time) : '—',
        subtitle: analytics.satisfaction_score > 0
          ? `CSAT: ${analytics.satisfaction_score.toFixed(1)}/5`
          : 'latência de resposta',
        icon: <Clock size={22} />,
        color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300',
      },
    ];
  }, [analytics]);

  const botsList = useMemo(() => {
    return (botsPerf as Record<string, unknown>)?.bots as Array<Record<string, unknown>> || [];
  }, [botsPerf]);

  if (analyticsLoading) {
    return <SkeletonLoader />;
  }

  const maxChartVal = Math.max(...chartData.map(d => d.messages), 1);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Painel</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Bem-vindo! Aqui está seu resumo de desempenho.
          {analytics?.plan && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              Plano: {analytics.plan}
            </span>
          )}
        </p>
      </div>

      {/* Error state */}
      {analyticsError && (
        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
          <p className="text-sm text-red-700 dark:text-red-300">
            Erro ao carregar dados: {analyticsError.message}
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="card dark:bg-slate-800 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{kpi.title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{kpi.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{kpi.subtitle}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${kpi.color}`}>{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Bots performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart — real data */}
        <div className="lg:col-span-2 card dark:bg-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Atividade (14 dias)</h2>
            <Link href="/analytics" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">
              Ver completo →
            </Link>
          </div>

          {chartData.length > 0 ? (
            <div className="h-56 flex items-end gap-1.5 px-1">
              {chartData.map((data, index) => {
                const msgHeight = (data.messages / maxChartVal) * 100;
                const convHeight = (data.conversations / maxChartVal) * 100;
                const dayLabel = new Date(data.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1 group"
                    title={`${data.date}\n${data.conversations} conversas, ${data.messages} mensagens`}
                  >
                    <div className="w-full flex gap-0.5 items-end" style={{ height: '180px' }}>
                      <div
                        className="flex-1 bg-blue-500/30 dark:bg-blue-400/20 rounded-t transition-all group-hover:bg-blue-500/50"
                        style={{ height: `${Math.max(convHeight, 2)}%` }}
                      />
                      <div
                        className="flex-1 bg-blue-600 dark:bg-blue-500 rounded-t transition-all group-hover:bg-blue-700"
                        style={{ height: `${Math.max(msgHeight, 2)}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {chartData.length <= 14 ? dayLabel : (index % 2 === 0 ? dayLabel : '')}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Sem dados de atividade ainda</p>
              </div>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500/30 dark:bg-blue-400/20" /> Conversas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600 dark:bg-blue-500" /> Mensagens
              </span>
            </div>
          )}
        </div>

        {/* Bots Performance */}
        <div className="card dark:bg-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Bots</h2>
            <Link href="/bots" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">
              Ver todos →
            </Link>
          </div>

          {botsList.length > 0 ? (
            <div className="space-y-3">
              {botsList.slice(0, 5).map((bot, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(String(bot.name || '')).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{String(bot.name)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {Number(bot.conversations || 0)} conversas • {Number(bot.messages || 0)} msgs
                    </p>
                  </div>
                  {Number(bot.satisfaction) > 0 && (
                    <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-0.5">
                      <Smile size={12} />
                      {Number(bot.satisfaction).toFixed(1)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Quick actions when no bots */}
              <Link
                href="/bots"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Plus size={18} className="text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Criar Bot</p>
                </div>
                <ArrowRight size={16} className="text-slate-400 dark:text-slate-500" />
              </Link>

              <Link
                href="/knowledge"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Upload size={18} className="text-green-600 dark:text-green-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Enviar Base de Conhecimento</p>
                </div>
                <ArrowRight size={16} className="text-slate-400 dark:text-slate-500" />
              </Link>

              <Link
                href="/analytics"
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <BarChart3 size={18} className="text-purple-600 dark:text-purple-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Ver Análises</p>
                </div>
                <ArrowRight size={16} className="text-slate-400 dark:text-slate-500" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent conversations */}
      <div className="card dark:bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Conversas Recentes</h2>
          <Link href="/conversations" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
            Ver todas →
          </Link>
        </div>

        {conversationsLoading ? (
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
            ))}
          </div>
        ) : conversationsData?.conversations && conversationsData.conversations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contato</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Canal</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mensagens</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hora</th>
                </tr>
              </thead>
              <tbody>
                {conversationsData.conversations.slice(0, 5).map((conv: ConversationData) => {
                  const statusMap: Record<string, { badge: string; label: string }> = {
                    active: { badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300', label: 'Ativo' },
                    closed: { badge: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300', label: 'Concluído' },
                    archived: { badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300', label: 'Arquivado' },
                  };
                  const statusInfo = statusMap[conv.status] || statusMap.archived;
                  const lastTime = conv.last_message_at || conv.first_message_at || conv.started_at || '';
                  const timeStr = lastTime ? new Date(lastTime).toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                  }) : '—';

                  return (
                    <tr key={conv.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {(conv.contacts?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{conv.contacts?.name || 'Usuário'}</p>
                            {conv.contacts?.email && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">{conv.contacts.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-400">
                        {conv.channel || 'api'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {conv.message_count}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-500 dark:text-slate-500">
                        {timeStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma conversa encontrada</p>
            <Link href="/bots" className="text-blue-600 dark:text-blue-400 text-sm mt-2 inline-block hover:text-blue-700">
              Criar seu primeiro bot →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
