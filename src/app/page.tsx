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
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-24 bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: analytics, loading: analyticsLoading, error: analyticsError } = useApi(
    () => apiClient.getAnalyticsOverview(),
    { autoFetch: true }
  );

  const { data: conversationsData, loading: conversationsLoading } = useApi(
    () => apiClient.getConversations({ limit: 5 }),
    { autoFetch: true }
  );

  const kpis = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        title: 'Conversas Ativas',
        value: analytics.total_conversations.toLocaleString('pt-BR'),
        change: '+12% de ontem',
        icon: <MessageSquare size={24} />,
        color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
      },
      {
        title: 'Mensagens Hoje',
        value: analytics.total_messages.toLocaleString('pt-BR'),
        change: '+8% de ontem',
        icon: <TrendingUp size={24} />,
        color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
      },
      {
        title: 'Tokens de IA',
        value: '2.3M',
        change: '+15% de ontem',
        icon: <Zap size={24} />,
        color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300',
      },
      {
        title: 'Satisfação (CSAT)',
        value: analytics.satisfaction_score.toFixed(1),
        change: '+0.2 de ontem',
        icon: <Smile size={24} />,
        color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
      },
    ];
  }, [analytics]);

  const chartData = useMemo(() => {
    return [
      { time: '00:00', messages: 45 },
      { time: '04:00', messages: 32 },
      { time: '08:00', messages: 156 },
      { time: '12:00', messages: 389 },
      { time: '16:00', messages: 521 },
      { time: '20:00', messages: 478 },
      { time: '23:59', messages: 234 },
    ];
  }, []);

  if (analyticsLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Painel</h1>
        <p className="text-slate-600 dark:text-slate-400">Bem-vindo! Aqui está seu resumo de desempenho.</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="card dark:bg-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{kpi.title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{kpi.value}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">{kpi.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${kpi.color}`}>{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card dark:bg-slate-800">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Mensagens ao Longo do Tempo</h2>
          <div className="h-64 flex items-end gap-2">
            {chartData.map((data, index) => {
              const maxMessages = Math.max(...chartData.map(d => d.messages));
              const height = (data.messages / maxMessages) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2 group"
                  title={`${data.messages} mensagens às ${data.time}`}
                >
                  <div
                    className="w-full bg-blue-600 dark:bg-blue-500 rounded-t hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 text-center">{data.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card dark:bg-slate-800">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Ações Rápidas</h2>
          <div className="space-y-3">
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
        </div>
      </div>

      {/* Recent conversations */}
      <div className="card dark:bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Conversas Recentes</h2>
          <Link href="/conversations" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
            Ver todas
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Contato</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Bot</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Última Mensagem</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Hora</th>
                </tr>
              </thead>
              <tbody>
                {conversationsData.conversations.slice(0, 5).map((conv) => {
                  const statusMap: Record<string, { badge: string; label: string }> = {
                    active: { badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300', label: 'Ativo' },
                    closed: { badge: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300', label: 'Concluído' },
                    archived: { badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300', label: 'Arquivado' },
                  };
                  const statusInfo = statusMap[conv.status] || statusMap.archived;

                  return (
                    <tr key={conv.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">{conv.user_id || 'Usuário'}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{conv.bot_id}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">({conv.message_count} mensagens)</td>
                      <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-500">{new Date(conv.started_at).toLocaleTimeString('pt-BR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-400 text-sm">Nenhuma conversa encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
