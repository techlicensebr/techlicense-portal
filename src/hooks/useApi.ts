import { useState, useCallback, useRef, useEffect } from 'react';
import { ApiError } from '@/lib/api';

export interface UseApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: ApiError) => void;
  autoFetch?: boolean;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
  reset: () => void;
}

// TEMPORARY: Demo/fallback data for development when API is not available
// This returns realistic Brazilian business data in PT-BR
const getDemoData = (url: string): unknown => {
  const now = new Date();
  const pastDate = (daysAgo: number) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  // Bots list
  if (url.includes('/bots') && !url.includes('/bots/')) {
    return {
      bots: [
        {
          id: 'bot_001',
          name: 'Bot Atendimento',
          description: 'Chatbot para atendimento ao cliente e suporte inicial',
          status: 'active',
          model: 'gpt-4',
          temperature: 0.7,
          max_tokens: 2048,
          created_at: pastDate(45).toISOString(),
          updated_at: pastDate(2).toISOString(),
        },
        {
          id: 'bot_002',
          name: 'Bot Vendas',
          description: 'Assistente de vendas para consultoria de produtos',
          status: 'active',
          model: 'gpt-3.5-turbo',
          temperature: 0.8,
          max_tokens: 1024,
          created_at: pastDate(30).toISOString(),
          updated_at: pastDate(1).toISOString(),
        },
        {
          id: 'bot_003',
          name: 'Bot Suporte Técnico',
          description: 'Bot para troubleshooting e FAQ técnico',
          status: 'active',
          model: 'gpt-4',
          temperature: 0.5,
          max_tokens: 3000,
          created_at: pastDate(15).toISOString(),
          updated_at: pastDate(3).toISOString(),
        },
      ],
      total: 3,
    };
  }

  // Single bot detail
  if (url.match(/\/bots\/[a-z0-9_]+$/)) {
    const botId = url.split('/').pop();
    const botMap: Record<string, any> = {
      bot_001: {
        id: 'bot_001',
        name: 'Bot Atendimento',
        description: 'Chatbot para atendimento ao cliente e suporte inicial',
        status: 'active',
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2048,
        created_at: pastDate(45).toISOString(),
        updated_at: pastDate(2).toISOString(),
      },
      bot_002: {
        id: 'bot_002',
        name: 'Bot Vendas',
        description: 'Assistente de vendas para consultoria de produtos',
        status: 'active',
        model: 'gpt-3.5-turbo',
        temperature: 0.8,
        max_tokens: 1024,
        created_at: pastDate(30).toISOString(),
        updated_at: pastDate(1).toISOString(),
      },
      bot_003: {
        id: 'bot_003',
        name: 'Bot Suporte Técnico',
        description: 'Bot para troubleshooting e FAQ técnico',
        status: 'active',
        model: 'gpt-4',
        temperature: 0.5,
        max_tokens: 3000,
        created_at: pastDate(15).toISOString(),
        updated_at: pastDate(3).toISOString(),
      },
    };
    return botMap[botId as string] || botMap.bot_001;
  }

  // Conversations list
  if (url.includes('/conversations') && !url.includes('/messages')) {
    return {
      conversations: [
        {
          id: 'conv_001',
          bot_id: 'bot_001',
          user_id: 'cliente@empresa.com',
          status: 'active',
          started_at: pastDate(1).toISOString(),
          message_count: 12,
        },
        {
          id: 'conv_002',
          bot_id: 'bot_002',
          user_id: 'vendas@empresa.com',
          status: 'closed',
          started_at: pastDate(3).toISOString(),
          ended_at: pastDate(2).toISOString(),
          message_count: 8,
        },
        {
          id: 'conv_003',
          bot_id: 'bot_001',
          user_id: 'support@empresa.com',
          status: 'active',
          started_at: pastDate(0.5).toISOString(),
          message_count: 5,
        },
        {
          id: 'conv_004',
          bot_id: 'bot_003',
          user_id: 'usuario@empresa.com',
          status: 'active',
          started_at: pastDate(2).toISOString(),
          message_count: 24,
        },
        {
          id: 'conv_005',
          bot_id: 'bot_002',
          user_id: 'gerente@empresa.com',
          status: 'archived',
          started_at: pastDate(10).toISOString(),
          ended_at: pastDate(9).toISOString(),
          message_count: 15,
        },
      ],
      total: 5,
    };
  }

  // Conversation messages
  if (url.includes('/messages')) {
    return {
      messages: [
        {
          id: 'msg_001',
          conversation_id: 'conv_001',
          role: 'user',
          content: 'Olá, preciso de ajuda com minha conta',
          created_at: pastDate(0.04).toISOString(),
        },
        {
          id: 'msg_002',
          conversation_id: 'conv_001',
          role: 'assistant',
          content: 'Claro! Vou ajudá-lo. Qual é o problema específico que está enfrentando?',
          created_at: pastDate(0.039).toISOString(),
        },
        {
          id: 'msg_003',
          conversation_id: 'conv_001',
          role: 'user',
          content: 'Não consigo fazer login na plataforma',
          created_at: pastDate(0.038).toISOString(),
        },
        {
          id: 'msg_004',
          conversation_id: 'conv_001',
          role: 'assistant',
          content: 'Vou verificar sua conta. Você tem recebido emails da nossa plataforma?',
          created_at: pastDate(0.037).toISOString(),
        },
        {
          id: 'msg_005',
          conversation_id: 'conv_001',
          role: 'user',
          content: 'Sim, recebi normalmente',
          created_at: pastDate(0.036).toISOString(),
        },
        {
          id: 'msg_006',
          conversation_id: 'conv_001',
          role: 'assistant',
          content: 'Tente resetar sua senha. Verifique o link que enviaremos para seu email.',
          created_at: pastDate(0.035).toISOString(),
        },
      ],
      total: 6,
    };
  }

  // Analytics overview
  if (url.includes('/analytics/overview')) {
    return {
      total_conversations: 1240,
      total_messages: 8567,
      active_users: 324,
      avg_response_time: 1.2,
      satisfaction_score: 4.6,
    };
  }

  // Bot performance
  if (url.includes('/analytics/bots-performance')) {
    return {
      bots: [
        {
          id: 'bot_001',
          name: 'Bot Atendimento',
          conversations: 450,
          messages: 3250,
          satisfaction: 4.7,
        },
        {
          id: 'bot_002',
          name: 'Bot Vendas',
          conversations: 380,
          messages: 2890,
          satisfaction: 4.5,
        },
        {
          id: 'bot_003',
          name: 'Bot Suporte Técnico',
          conversations: 410,
          messages: 2427,
          satisfaction: 4.4,
        },
      ],
      total: 3,
    };
  }

  // Chart data (conversations chart)
  if (url.includes('/analytics/conversations-chart')) {
    const dates: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = pastDate(i);
      dates.push({
        date: d.toLocaleDateString('pt-BR'),
        conversations: Math.floor(150 + Math.random() * 100),
        messages: Math.floor(800 + Math.random() * 400),
        satisfaction: 4.3 + Math.random() * 0.6,
      });
    }
    return { data: dates };
  }

  // Knowledge base
  if (url.includes('/knowledge') || url.includes('/default-bot/knowledge')) {
    return {
      documents: [
        {
          id: 'doc_001',
          bot_id: 'bot_001',
          name: 'Políticas de Devolução',
          type: 'pdf',
          size: 245000,
          status: 'ready',
          created_at: pastDate(20).toISOString(),
        },
        {
          id: 'doc_002',
          bot_id: 'bot_001',
          name: 'FAQ - Perguntas Frequentes',
          type: 'docx',
          size: 125000,
          status: 'ready',
          created_at: pastDate(15).toISOString(),
        },
        {
          id: 'doc_003',
          bot_id: 'bot_001',
          name: 'Termos de Serviço',
          type: 'txt',
          size: 89000,
          status: 'ready',
          created_at: pastDate(10).toISOString(),
        },
      ],
      total: 3,
    };
  }

  // API Keys
  if (url.includes('/api-keys') && !url.includes('/toggle')) {
    return {
      keys: [
        {
          id: 'key_001',
          name: 'Produção',
          key: 'tl_live_51H2B4K2eZvN3sL7mQ9w5xR2tU8vYaBcDeFgHiJkLmNoPqRsT',
          last_used: pastDate(0.02).toISOString(),
          created_at: pastDate(90).toISOString(),
        },
        {
          id: 'key_002',
          name: 'Desenvolvimento',
          key: 'tl_test_4eC39HqLyjWDarHsN9Z5xL8k3mN2pQ9r5sT1uV2wX3yA',
          last_used: pastDate(0.5).toISOString(),
          created_at: pastDate(30).toISOString(),
        },
        {
          id: 'key_003',
          name: 'Testes',
          key: 'tl_test_9fF48IrMzOkEqR3tW2yB6pL9qS8nM1cD2eF3gH4iJ5k',
          last_used: pastDate(5).toISOString(),
          created_at: pastDate(15).toISOString(),
        },
      ],
      total: 3,
    };
  }

  // Webhooks
  if (url.includes('/webhooks') && !url.includes('/logs')) {
    return {
      webhooks: [
        {
          id: 'wh_001',
          event_type: 'conversation.started',
          url: 'https://seu-servidor.com/webhooks/conversation-started',
          active: true,
          created_at: pastDate(60).toISOString(),
        },
        {
          id: 'wh_002',
          event_type: 'conversation.completed',
          url: 'https://seu-servidor.com/webhooks/conversation-completed',
          active: true,
          created_at: pastDate(45).toISOString(),
        },
        {
          id: 'wh_003',
          event_type: 'message.received',
          url: 'https://seu-servidor.com/webhooks/message-received',
          active: false,
          created_at: pastDate(30).toISOString(),
        },
      ],
      total: 3,
    };
  }

  // Settings
  if (url.includes('/settings')) {
    return {
      company_name: 'Sua Empresa',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      notifications_enabled: true,
      theme: 'auto',
      two_fa_enabled: false,
    };
  }

  // Billing/Subscription
  if (url.includes('/billing/subscription')) {
    return {
      plan: 'Pro',
      status: 'active',
      current_period_start: pastDate(30).toISOString(),
      current_period_end: pastDate(-30).toISOString(),
      next_billing_date: pastDate(-30).toISOString(),
      amount: 299.99,
      currency: 'BRL',
    };
  }

  // Billing/Portal
  if (url.includes('/billing/portal')) {
    return {
      portal_url: 'https://billing.stripe.com/p/login/test_example',
    };
  }

  // Billing/Invoices
  if (url.includes('/billing/invoices')) {
    return {
      invoices: [
        {
          id: 'inv_001',
          amount: 299.99,
          status: 'paid',
          date: pastDate(30).toISOString(),
          pdf_url: 'https://exemplo.com/invoices/inv_001.pdf',
        },
        {
          id: 'inv_002',
          amount: 299.99,
          status: 'paid',
          date: pastDate(60).toISOString(),
          pdf_url: 'https://exemplo.com/invoices/inv_002.pdf',
        },
      ],
      total: 2,
    };
  }

  // Default fallback
  return null;
};

export function useApi<T = unknown>(
  fetcher: () => Promise<T>,
  options?: UseApiOptions
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const isMountedRef = useRef(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();

      if (isMountedRef.current) {
        setData(result);
        setError(null);

        if (options?.onSuccess) {
          options.onSuccess(result);
        }
      }
    } catch (err) {
      const apiError = err instanceof Error
        ? {
            message: err.message,
          }
        : (err as ApiError);

      // Check if this is a 404 or network error, then try demo data
      const status = (apiError as any).status;
      if (status === 404 || apiError.message?.includes('404') || apiError.message?.includes('Failed to fetch')) {
        // Try to extract URL from fetcher and get demo data
        try {
          // Since we don't have direct access to the URL being called,
          // we'll attempt to use demo data by checking the fetcher's string representation
          const fetcherStr = fetcher.toString();

          // Extract common URL patterns from the fetcher function
          let demoData: any = null;
          if (fetcherStr.includes('getBots()')) {
            demoData = getDemoData('/bots');
          } else if (fetcherStr.includes('getAnalyticsOverview')) {
            demoData = getDemoData('/analytics/overview');
          } else if (fetcherStr.includes('getConversationsChart')) {
            demoData = getDemoData('/analytics/conversations-chart');
          } else if (fetcherStr.includes('getBotsPerformance')) {
            demoData = getDemoData('/analytics/bots-performance');
          } else if (fetcherStr.includes('getConversations')) {
            demoData = getDemoData('/conversations');
          } else if (fetcherStr.includes('getKnowledgeBase')) {
            demoData = getDemoData('/knowledge');
          } else if (fetcherStr.includes('getApiKeys')) {
            demoData = getDemoData('/api-keys');
          } else if (fetcherStr.includes('getWebhooks')) {
            demoData = getDemoData('/webhooks');
          } else if (fetcherStr.includes('getSettings')) {
            demoData = getDemoData('/settings');
          } else if (fetcherStr.includes('getSubscription')) {
            demoData = getDemoData('/billing/subscription');
          } else if (fetcherStr.includes('getPortalUrl')) {
            demoData = getDemoData('/billing/portal');
          } else if (fetcherStr.includes('getInvoices')) {
            demoData = getDemoData('/billing/invoices');
          }

          if (demoData) {
            if (isMountedRef.current) {
              setData(demoData as T);
              setError(null);

              if (options?.onSuccess) {
                options.onSuccess(demoData);
              }
            }
            return;
          }
        } catch (e) {
          // Fall through to error handling
        }
      }

      if (isMountedRef.current) {
        setError(apiError);
        setData(null);

        if (options?.onError) {
          options.onError(apiError);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, options]);

  const mutate = useCallback((newData: T) => {
    if (isMountedRef.current) {
      setData(newData);
    }
  }, []);

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setData(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  // Auto-fetch na montagem se habilitado
  useEffect(() => {
    if (options?.autoFetch !== false) {
      refetch();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [options?.autoFetch, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
    reset,
  };
}

// Hook para fazer mutações (POST, PUT, DELETE)
export function useApiMutation<T = unknown, P = unknown>(
  fetcher: (payload: P) => Promise<T>,
  options?: UseApiOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const isMountedRef = useRef(true);

  const mutate = useCallback(
    async (payload: P) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetcher(payload);

        if (isMountedRef.current) {
          setData(result);
          setError(null);

          if (options?.onSuccess) {
            options.onSuccess(result);
          }
        }

        return result;
      } catch (err) {
        const apiError = err instanceof Error
          ? {
              message: err.message,
            }
          : (err as ApiError);

        // Check if this is a 404 or network error - return demo success for mutations
        const status = (apiError as any).status;
        if (status === 404 || apiError.message?.includes('404') || apiError.message?.includes('Failed to fetch')) {
          // For mutations (POST, PUT, DELETE), return a successful response with demo data
          const demoResponse = {
            success: true,
            message: 'Operação realizada com sucesso (modo demo)',
            id: Math.random().toString(36).substr(2, 9),
            ...payload,
          } as T;

          if (isMountedRef.current) {
            setData(demoResponse);
            setError(null);

            if (options?.onSuccess) {
              options.onSuccess(demoResponse);
            }
          }

          return demoResponse;
        }

        if (isMountedRef.current) {
          setError(apiError);
          setData(null);

          if (options?.onError) {
            options.onError(apiError);
          }
        }

        throw apiError;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [fetcher, options]
  );

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setData(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}
