'use client';

import React, { useState } from 'react';
import {
  Edit,
  Check,
  AlertCircle,
  Zap,
  Database,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  bots_limit: number;
  messages_limit: number;
  tokens_limit: number;
  storage_limit: number;
  features: string[];
  popular?: boolean;
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      ))}
    </div>
  );
}

export default function PlansManagement() {
  const { data: plansData, loading, error } = useApi(
    () => apiClient.getAdminPlans(),
    { autoFetch: true }
  );

  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  const plans: Plan[] = plansData?.plans || [
    {
      id: '1',
      name: 'Free',
      slug: 'free',
      price: 0,
      bots_limit: 1,
      messages_limit: 1000,
      tokens_limit: 10000,
      storage_limit: 1,
      features: ['1 Bot', 'Base de conhecimento limitada', 'Suporte por email'],
    },
    {
      id: '2',
      name: 'Starter',
      slug: 'starter',
      price: 99,
      bots_limit: 3,
      messages_limit: 10000,
      tokens_limit: 100000,
      storage_limit: 10,
      features: [
        '3 Bots',
        'Base de conhecimento completa',
        'Webhooks',
        'Suporte prioritário',
      ],
    },
    {
      id: '3',
      name: 'Pro',
      slug: 'pro',
      price: 299,
      bots_limit: 10,
      messages_limit: 100000,
      tokens_limit: 500000,
      storage_limit: 50,
      features: [
        '10 Bots',
        'Base de conhecimento ilimitada',
        'Webhooks',
        'API customizada',
        'Suporte 24/7',
      ],
      popular: true,
    },
    {
      id: '4',
      name: 'Enterprise',
      slug: 'enterprise',
      price: 999,
      bots_limit: -1,
      messages_limit: -1,
      tokens_limit: -1,
      storage_limit: -1,
      features: [
        'Bots ilimitados',
        'Mensagens ilimitadas',
        'Tokens ilimitados',
        'Storage ilimitado',
        'SLA garantido',
        'Onboarding dedicado',
        'Suporte dedicado',
      ],
    },
  ];

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
        <AlertCircle size={20} />
        <span>Erro ao carregar planos: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Planos</h1>
        <p className="text-slate-400">Gerenciar planos e limites da plataforma</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg border transition-all ${
              plan.popular
                ? 'bg-white dark:bg-slate-800 border-[#D4A843] shadow-lg shadow-[#D4A843]/20 md:scale-105'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-[#D4A843]'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#D4A843] to-[#B8860B] text-black">
                  MAIS POPULAR
                </span>
              </div>
            )}

            <div className="p-6">
              {/* Plan Header */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {plan.price === 0 ? 'Grátis' : `R$${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-slate-500 dark:text-slate-400 text-sm">/mês</span>
                )}
              </div>

              {/* Limits */}
              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Zap size={16} className="text-[#D4A843]" />
                  <span>
                    {plan.bots_limit === -1
                      ? 'Bots ilimitados'
                      : `${plan.bots_limit} ${plan.bots_limit === 1 ? 'Bot' : 'Bots'}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <MessageSquare size={16} className="text-[#D4A843]" />
                  <span>
                    {plan.messages_limit === -1
                      ? 'Mensagens ilimitadas'
                      : `${(plan.messages_limit / 1000).toFixed(0)}k mensagens`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Database size={16} className="text-[#D4A843]" />
                  <span>
                    {plan.tokens_limit === -1
                      ? 'Tokens ilimitados'
                      : `${(plan.tokens_limit / 1000).toFixed(0)}k tokens`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Users size={16} className="text-[#D4A843]" />
                  <span>
                    {plan.storage_limit === -1
                      ? 'Storage ilimitado'
                      : `${plan.storage_limit}GB storage`}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setEditingPlan(plan.id)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#D4A843] to-[#B8860B] text-black hover:from-[#C9982E] hover:to-[#A07520]'
                    : 'bg-slate-100 dark:bg-slate-700 text-[#D4A843] border border-[#D4A843] hover:bg-[#D4A843]/10'
                }`}
              >
                <Edit size={16} />
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Section */}
      {editingPlan && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Editando: {plans.find((p) => p.id === editingPlan)?.name}
            </h2>
            <button
              onClick={() => setEditingPlan(null)}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  defaultValue={plans.find((p) => p.id === editingPlan)?.price}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A843] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Limite de Bots
                </label>
                <input
                  type="number"
                  defaultValue={plans.find((p) => p.id === editingPlan)?.bots_limit}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A843] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Limite de Mensagens
                </label>
                <input
                  type="number"
                  defaultValue={plans.find((p) => p.id === editingPlan)?.messages_limit}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A843] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Limite de Tokens
                </label>
                <input
                  type="number"
                  defaultValue={plans.find((p) => p.id === editingPlan)?.tokens_limit}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#D4A843] transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="flex-1 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4A843] to-[#B8860B] text-black font-medium hover:from-[#C9982E] hover:to-[#A07520] transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
