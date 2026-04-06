'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  MessageSquare,
  Users,
  Clock,
  Zap,
  Download,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';

interface ChartPoint {
  date: string;
  conversations: number;
  messages: number;
  satisfaction: number;
}

export default function AnalisesPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  const getPeriodParams = () => {
    const end = new Date();
    const start = new Date();
    if (dateRange === '7d') {
      start.setDate(start.getDate() - 7);
    } else if (dateRange === '30d') {
      start.setDate(start.getDate() - 30);
    } else {
      start.setDate(start.getDate() - 90);
    }
    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    };
  };

  // Fetch analytics overview
  const { data: analytics, loading: analyticsLoading } = useApi(
    () => apiClient.getAnalyticsOverview(getPeriodParams()),
    { autoFetch: true }
  );

  // Fetch chart data
  const { data: chartResponse, loading: chartLoading } = useApi(
    () =>
      apiClient.getConversationsChart({
        ...getPeriodParams(),
        interval: dateRange === '7d' ? 'day' : 'week',
      }),
    { autoFetch: true }
  );

  // Fetch bot performance
  const { data: performanceResponse, loading: performanceLoading } = useApi(
    () => apiClient.getBotsPerformance({ limit: 10 }),
    { autoFetch: true }
  );

  const chartData: ChartPoint[] = chartResponse?.data || [];
  const botStats = performanceResponse?.bots || [];

  const maxConversations = Math.max(
    ...(chartData.map((d) => d.conversations) || [1])
  );

  const handleExport = async () => {
    try {
      const blob = await apiClient.exportAnalytics({
        format: 'csv',
        ...getPeriodParams(),
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabeçalho da página */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Análises
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Monitore o desempenho e uso dos seus chatbots
          </p>
        </div>
        <button
          onClick={handleExport}
          className="btn-secondary flex items-center justify-center gap-2 md:w-auto dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
        >
          <Download size={18} />
          Exportar Relatório
        </button>
      </div>

      {/* Seletor de período */}
      <div className="flex gap-2 flex-wrap">
        {(['7d', '30d', '90d'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === range
                ? 'bg-blue-600 text-white dark:bg-blue-600'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {range === '7d' ? 'Hoje' : range === '30d' ? '7 dias' : '30 dias'}
          </button>
        ))}
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total de Conversas */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Total de Conversas
              </p>
              {analyticsLoading ? (
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2 w-32" />
              ) : (
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {(analytics?.total_conversations || 0).toLocaleString('pt-BR')}
                </p>
              )}
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                +12% do período anterior
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MessageSquare size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total de Mensagens */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Total de Mensagens
              </p>
              {analyticsLoading ? (
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2 w-32" />
              ) : (
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {(analytics?.total_messages || 0).toLocaleString('pt-BR')}
                </p>
              )}
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                +18% do período anterior
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Taxa de Resolução */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Taxa de Resolução
              </p>
              {analyticsLoading ? (
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2 w-32" />
              ) : (
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {((analytics?.satisfaction_score || 0) * 20).toFixed(0)}%
                </p>
              )}
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                -0,5% do período anterior
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Tempo Médio de Resposta */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Tempo Médio de Resposta
              </p>
              {analyticsLoading ? (
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2 w-32" />
              ) : (
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {(analytics?.avg_response_time || 0).toFixed(1)}s
                </p>
              )}
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                -0,2s do período anterior
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <TrendingUp size={24} className="text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Satisfação dos Usuários */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Satisfação dos Usuários
              </p>
              {analyticsLoading ? (
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2 w-32" />
              ) : (
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {(analytics?.satisfaction_score || 0).toFixed(1)}/5
                </p>
              )}
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                +0,1 do período anterior
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Zap size={24} className="text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Usuários Ativos */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Usuários Ativos
              </p>
              {analyticsLoading ? (
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2 w-32" />
              ) : (
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {(analytics?.active_users || 0).toLocaleString('pt-BR')}
                </p>
              )}
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                +34% do período anterior
              </p>
            </div>
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Users size={24} className="text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversas por Dia */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">
            Conversas por Dia
          </h2>
          {chartLoading ? (
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
              Sem dados disponíveis
            </div>
          ) : (
            <div className="h-64 flex items-end gap-2">
              {chartData.map((data, index) => {
                const height = (data.conversations / maxConversations) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-blue-600 dark:bg-blue-500 rounded-t hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${data.conversations} conversas`}
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {data.date}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tendência de Satisfação */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">
            Tendência de Satisfação
          </h2>
          {chartLoading ? (
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
              Sem dados disponíveis
            </div>
          ) : (
            <div className="h-64 flex items-end gap-2">
              {chartData.map((data, index) => {
                const height = (data.satisfaction / 5) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-green-600 dark:bg-green-500 rounded-t hover:bg-green-700 dark:hover:bg-green-600 transition-colors cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${data.satisfaction}/5`}
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {data.date}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Desempenho dos Bots */}
      <div className="card dark:bg-slate-800 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Desempenho dos Bots
        </h2>
        {performanceLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
              />
            ))}
          </div>
        ) : botStats.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Sem dados de desempenho disponíveis
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Bot
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Conversas
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Mensagens
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Satisfação
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Resolução
                  </th>
                </tr>
              </thead>
              <tbody>
                {botStats.map((bot: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {bot.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {(bot.conversations || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {(bot.messages || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600 dark:bg-green-500"
                            style={{
                              width: `${((bot.satisfaction || 0) / 5) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium dark:text-slate-400">
                          {(bot.satisfaction || 0).toFixed(1)}/5
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {((bot.satisfaction || 0) * 20).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
