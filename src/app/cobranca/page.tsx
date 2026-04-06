'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Download,
  CheckCircle,
  AlertCircle,
  Zap,
  HardDrive,
  MessageSquare,
  Cpu,
  ArrowUpRight,
} from 'lucide-react';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';

interface Plan {
  id: string;
  name: string;
  price: number;
  annual_price?: number;
  conversations_limit: number;
  bots_limit: number;
  storage_limit: number;
  tokens_limit: number;
  features: string[];
}

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'Pago' | 'Pendente' | 'Vencido';
  download_url?: string;
}

interface UsageData {
  conversations_used: number;
  conversations_limit: number;
  bots_used: number;
  bots_limit: number;
  storage_used: number;
  storage_limit: number;
  tokens_used: number;
  tokens_limit: number;
}

interface BillingPageData {
  current_plan: Plan & { status: string };
  payment_method?: {
    last_four: string;
    brand: string;
  };
  available_plans: Plan[];
  invoices: Invoice[];
  usage: UsageData;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    conversations_limit: 100,
    bots_limit: 1,
    storage_limit: 5,
    tokens_limit: 0,
    features: [
      '100 conversas/mês',
      '1 bot',
      '5MB armazenamento',
      'Suporte por email',
    ],
  },
  {
    id: 'professional',
    name: 'Profissional',
    price: 197,
    annual_price: 1970,
    conversations_limit: 5000,
    bots_limit: 10,
    storage_limit: 100,
    tokens_limit: 5000000,
    features: [
      '5.000 conversas/mês',
      '10 bots',
      '100MB armazenamento',
      'Canais WhatsApp/Telegram',
      'Suporte prioritário',
      'Analytics avançado',
    ],
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 497,
    annual_price: 4970,
    conversations_limit: -1,
    bots_limit: -1,
    storage_limit: -1,
    tokens_limit: -1,
    features: [
      'Conversas ilimitadas',
      'Bots ilimitados',
      'Armazenamento ilimitado',
      'API dedicada',
      'Webhooks avançados',
      'Suporte 24/7',
      'SLA garantido',
      'Integração customizada',
    ],
  },
];

export default function CobrancaPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Fetch billing data
  const { data: billingData, loading: billingLoading } = useApi(
    async () => {
      const [subscription, invoices, usage] = await Promise.all([
        apiClient.getSubscription(),
        apiClient.getInvoices({ limit: 10 }),
        apiClient.getUsage(),
      ]);

      return {
        current_plan: subscription as any,
        available_plans: [],
        invoices: invoices.invoices || [],
        usage: usage,
      } as BillingPageData;
    },
    { autoFetch: true }
  );

  // Checkout mutation
  const { mutate: checkout, loading: checkoutLoading } = useApiMutation(
    async (planId: string) => {
      const response = await apiClient.checkoutSubscription(planId);
      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      }
      return response;
    }
  );

  const currentPlan = billingData?.current_plan || plans[0];
  const userInvoices = billingData?.invoices || [];
  const usage = billingData?.usage;

  const getPrice = (plan: Plan) => {
    if (billingCycle === 'annual' && plan.annual_price) {
      return Math.floor((plan.annual_price / 12) * 0.8); // Show monthly equivalent with 20% discount
    }
    return plan.price;
  };

  const formatStorageSize = (mb: number) => {
    if (mb < 1024) return `${mb}MB`;
    return `${(mb / 1024).toFixed(1)}GB`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens < 1000000) return `${tokens.toLocaleString()}`;
    return `${(tokens / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="space-y-8 animate-fadeIn dark:bg-slate-950">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Cobrança</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gerencie seu plano, métodos de pagamento e faturas
        </p>
      </div>

      {/* Current Plan Section */}
      {!billingLoading && (
        <div className="card dark:bg-slate-900 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Plano Atual
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {currentPlan.name}
                </span>
                {currentPlan.price > 0 && (
                  <span className="text-xl text-slate-600 dark:text-slate-400">
                    R$ {currentPlan.price}/mês
                  </span>
                )}
              </div>

              {/* Features list */}
              <ul className="mt-4 space-y-2">
                {currentPlan.features?.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle size={16} className="text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {currentPlan.id !== 'enterprise' && (
              <button
                onClick={() => checkout('enterprise')}
                disabled={checkoutLoading || currentPlan.id === 'professional'}
                className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap md:w-auto"
              >
                <ArrowUpRight size={18} />
                {currentPlan.id === 'professional' ? 'Fazer Upgrade' : 'Upgrade para Empresarial'}
              </button>
            )}
            {currentPlan.id === 'enterprise' && (
              <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg font-medium">
                Plano Ativo
              </span>
            )}
          </div>
        </div>
      )}

      {/* Billing cycle toggle */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Ciclo de Cobrança:
        </span>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded font-medium transition-colors relative ${
              billingCycle === 'annual'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Anual
            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
              20% off
            </span>
          </button>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Planos Disponíveis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = getPrice(plan);
            const isCurrent = currentPlan.id === plan.id;

            return (
              <div
                key={plan.id}
                className={`card card-hover dark:bg-slate-900 dark:border-slate-700 ${
                  isCurrent
                    ? 'ring-2 ring-blue-600 dark:ring-blue-500'
                    : ''
                }`}
              >
                <div className="flex flex-col h-full">
                  {isCurrent && (
                    <div className="mb-3 inline-block w-fit px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                      Plano Atual
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>

                  <div className="mt-2 mb-4">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      R$ {price}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">/mês</span>
                    {billingCycle === 'annual' && plan.annual_price && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                        (R$ {Math.floor(plan.annual_price * 0.8)}/ano)
                      </div>
                    )}
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                      >
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action button */}
                  {!isCurrent ? (
                    <button
                      onClick={() => checkout(plan.id)}
                      disabled={checkoutLoading}
                      className="btn-secondary w-full"
                    >
                      Assinar
                    </button>
                  ) : plan.id === 'enterprise' ? (
                    <button className="btn-secondary w-full cursor-default opacity-60">
                      Plano Ativo
                    </button>
                  ) : (
                    <button
                      onClick={() => checkout('enterprise')}
                      disabled={checkoutLoading}
                      className="btn-primary w-full"
                    >
                      Fazer Upgrade
                    </button>
                  )}

                  {plan.id === 'enterprise' && !isCurrent && (
                    <button className="btn-secondary w-full mt-2">
                      Fale Conosco
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Section */}
      {usage && (
        <div className="card dark:bg-slate-900 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Uso Atual
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conversations */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-blue-600" />
                  <span className="font-medium text-slate-900 dark:text-white">Conversas</span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {usage.conversations_used} / {usage.conversations_limit === -1 ? '∞' : usage.conversations_limit}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{
                    width:
                      usage.conversations_limit === -1
                        ? '100%'
                        : `${(usage.conversations_used / usage.conversations_limit) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Bots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-yellow-600" />
                  <span className="font-medium text-slate-900 dark:text-white">Bots</span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {usage.bots_used} / {usage.bots_limit === -1 ? '∞' : usage.bots_limit}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-600 transition-all"
                  style={{
                    width:
                      usage.bots_limit === -1
                        ? '100%'
                        : `${(usage.bots_used / usage.bots_limit) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Storage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HardDrive size={18} className="text-green-600" />
                  <span className="font-medium text-slate-900 dark:text-white">Armazenamento</span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {formatStorageSize(usage.storage_used)} / {usage.storage_limit === -1 ? '∞' : formatStorageSize(usage.storage_limit)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{
                    width:
                      usage.storage_limit === -1
                        ? '100%'
                        : `${(usage.storage_used / usage.storage_limit) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Tokens */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cpu size={18} className="text-purple-600" />
                  <span className="font-medium text-slate-900 dark:text-white">Tokens IA</span>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {formatTokens(usage.tokens_used)} / {usage.tokens_limit === -1 ? '∞' : formatTokens(usage.tokens_limit)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all"
                  style={{
                    width:
                      usage.tokens_limit === -1
                        ? '100%'
                        : `${(usage.tokens_used / usage.tokens_limit) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Section */}
      <div className="card dark:bg-slate-900 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Método de Pagamento
            </h2>
            {billingData?.payment_method ? (
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {billingData.payment_method.brand.toUpperCase()} terminado em{' '}
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {billingData.payment_method.last_four}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Nenhum método de pagamento cadastrado
              </p>
            )}
          </div>
          <button className="btn-secondary">
            Alterar Método de Pagamento
          </button>
        </div>

        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex gap-3">
          <AlertCircle size={18} className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Aceitamos Cartão de Crédito, PIX e Boleto via Asaas
          </p>
        </div>
      </div>

      {/* Invoices Section */}
      {userInvoices.length > 0 && (
        <div className="card dark:bg-slate-900 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Histórico de Faturas
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Data
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Descrição
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Valor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody>
                {userInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">
                      {new Date(invoice.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                      {invoice.description}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">
                      R$ {invoice.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                          invoice.status === 'Pago'
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : invoice.status === 'Pendente'
                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {invoice.download_url && (
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                          <Download size={16} />
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
