'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  MessageSquare,
  MessageCircle,
  CreditCard,
  TrendingUp,
  Plus,
  BarChart3,
  Eye,
  Edit,
  AlertCircle,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

interface KPICard {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

export default function AdminDashboard() {
  const { data: dashboard, loading: dashboardLoading, error: dashboardError } = useApi(
    () => apiClient.getAdminDashboard(),
    { autoFetch: true }
  );

  const { data: tenants, loading: tenantsLoading } = useApi(
    () => apiClient.getAdminTenants({ per_page: 5 }),
    { autoFetch: true }
  );

  const kpis: KPICard[] = useMemo(() => {
    if (!dashboard) return [];

    return [
      {
        title: 'Total Clientes',
        value: (dashboard.totalTenants || dashboard.total_tenants || 0).toString(),
        icon: <Users size={24} />,
        color: 'from-[#D4A843] to-[#B8860B]',
      },
      {
        title: 'Usuários Ativos',
        value: (dashboard.totalUsers || dashboard.active_users || 0).toString(),
        icon: <UserCheck size={24} />,
        color: 'from-blue-500 to-blue-700',
      },
      {
        title: 'Conversas Total',
        value: (dashboard.totalConversations || dashboard.total_conversations || 0).toLocaleString('pt-BR'),
        icon: <MessageSquare size={24} />,
        color: 'from-green-500 to-green-700',
      },
      {
        title: 'Mensagens Total',
        value: (dashboard.totalMessages || dashboard.total_messages || 0).toLocaleString('pt-BR'),
        icon: <MessageCircle size={24} />,
        color: 'from-purple-500 to-purple-700',
      },
      {
        title: 'Assinaturas Ativas',
        value: (dashboard.activeSubscriptions || dashboard.active_subscriptions || 0).toString(),
        icon: <CreditCard size={24} />,
        color: 'from-orange-500 to-orange-700',
      },
      {
        title: 'MRR',
        value: `R$ ${((dashboard.mrr || 0) / 1000).toFixed(1)}k`,
        icon: <TrendingUp size={24} />,
        color: 'from-red-500 to-red-700',
      },
    ];
  }, [dashboard]);

  if (dashboardLoading) {
    return <SkeletonLoader />;
  }

  if (dashboardError) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
        <AlertCircle size={20} />
        <span>Erro ao carregar painel: {dashboardError.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Painel Administrativo</h1>
        <p className="text-slate-400">TechLicense Platform</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:border-[#D4A843] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{kpi.title}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{kpi.value}</p>
                {kpi.change && (
                  <p className="text-xs text-green-400 mt-2">{kpi.change}</p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white opacity-80`}>
                {kpi.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clientes Recentes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Clientes Recentes</h2>
          <Link
            href="/admin/clientes"
            className="text-[#D4A843] text-sm font-medium hover:text-[#E8B860] transition-colors"
          >
            Ver todos →
          </Link>
        </div>

        <div className="card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {tenantsLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          ) : tenants?.tenants && tenants.tenants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nome</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Plano</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Criado</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {tenants.tenants.map((tenant: any) => (
                    <tr key={tenant.id} className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{tenant.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-[#D4A843]/20 text-[#D4A843]">
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tenant.status === 'active'
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {tenant.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <Link
                          href={`/admin/clientes/${tenant.id}`}
                          className="p-2 rounded text-[#D4A843] hover:bg-amber-50 dark:hover:bg-[#D4A843]/10 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/admin/clientes/${tenant.id}/edit`}
                          className="p-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              <p>Nenhum cliente encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/clientes?create=true"
            className="p-4 rounded-lg bg-gradient-to-r from-[#D4A843] to-[#B8860B] text-black font-medium hover:from-[#C9982E] hover:to-[#A07520] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Novo Cliente
          </Link>
          <Link
            href="/admin/planos"
            className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-[#D4A843] text-[#D4A843] font-medium hover:bg-amber-50 dark:hover:bg-[#D4A843]/10 transition-colors flex items-center justify-center gap-2"
          >
            <BarChart3 size={20} />
            Ver Planos
          </Link>
          <Link
            href="/admin/relatorio"
            className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-600 dark:border-slate-300 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <BarChart3 size={20} />
            Relatório de Uso
          </Link>
        </div>
      </div>
    </div>
  );
}
