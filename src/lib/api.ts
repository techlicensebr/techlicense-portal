import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://techlicense-chatbot-api.techlicensebr.workers.dev';
const TOKEN_KEY = 'tl_token';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface BotData {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  avatar_url?: string;
  model: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationData {
  id: string;
  bot_id: string;
  user_id: string;
  status: 'active' | 'closed' | 'archived';
  started_at: string;
  ended_at?: string;
  message_count: number;
}

export interface MessageData {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface KnowledgeDocData {
  id: string;
  bot_id: string;
  name: string;
  type: 'pdf' | 'txt' | 'docx' | 'webpage' | 'url';
  size: number;
  status: 'processing' | 'ready' | 'error';
  created_at: string;
}

export interface AnalyticsData {
  total_conversations: number;
  total_messages: number;
  active_users: number;
  avg_response_time: number;
  satisfaction_score: number;
}

export interface ApiKeyData {
  id: string;
  name: string;
  key: string;
  last_used?: string;
  created_at: string;
}

export interface WebhookData {
  id: string;
  event_type: string;
  url: string;
  active: boolean;
  created_at: string;
}

export interface ContactData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  created_at: string;
}

export interface ChannelConfigData {
  id: string;
  type: 'whatsapp' | 'telegram' | 'instagram' | 'messenger';
  account_id: string;
  status: 'active' | 'inactive' | 'error';
  connected_at: string;
}

export interface BillingData {
  plan: string;
  status: 'active' | 'canceled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  next_billing_date?: string;
  amount: number;
  currency: string;
}

class APIClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptador de requisição
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptador de resposta para auto-refresh
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Falha ao atualizar - fazer logout
            this.clearToken();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  }

  private async refreshAccessToken(): Promise<string> {
    // Evitar múltiplas requisições simultâneas de refresh
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const token = this.getToken();
        if (!token) throw new Error('Token não disponível');

        const response = await this.client.post(
          '/auth/refresh',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const newToken = response.data.token;
        this.setToken(newToken);
        return newToken;
      } catch (error) {
        this.clearToken();
        throw error;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message || 'Erro desconhecido',
        status: error.response?.status,
        code: error.code,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }

    return {
      message: 'Erro desconhecido',
    };
  }

  // ============ AUTH ENDPOINTS ============

  async login(email: string, password: string) {
    try {
      const response = await this.client.post('/auth/login', { email, password });
      const { token } = response.data;
      if (token) {
        this.setToken(token);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async loginMagicLink(email: string) {
    try {
      const response = await this.client.post('/auth/magic-link', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyMagicLink(token: string) {
    try {
      const response = await this.client.post('/auth/verify-magic-link', { token });
      const { token: newToken } = response.data;
      if (newToken) {
        this.setToken(newToken);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async loginGoogle(googleToken: string) {
    try {
      const response = await this.client.post('/auth/google', { token: googleToken });
      const { token } = response.data;
      if (token) {
        this.setToken(token);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.client.get('/auth/me');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
      this.clearToken();
    } catch (error) {
      this.clearToken();
      throw this.handleError(error);
    }
  }

  // ============ BOTS ENDPOINTS ============

  async getBots(params?: PaginationParams) {
    try {
      const response = await this.client.get('/bots', { params });
      return response.data as { bots: BotData[]; total: number };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBot(id: string) {
    try {
      const response = await this.client.get(`/bots/${id}`);
      return response.data as BotData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBot(data: Partial<BotData>) {
    try {
      const response = await this.client.post('/bots', data);
      return response.data as BotData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBot(id: string, data: Partial<BotData>) {
    try {
      const response = await this.client.put(`/bots/${id}`, data);
      return response.data as BotData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBot(id: string) {
    try {
      const response = await this.client.delete(`/bots/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleBotStatus(id: string) {
    try {
      const response = await this.client.patch(`/bots/${id}/toggle-status`);
      return response.data as BotData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ CONVERSATIONS ENDPOINTS ============

  async getConversations(params?: PaginationParams & { bot_id?: string; status?: string }) {
    try {
      const response = await this.client.get('/conversations', { params });
      return response.data as { conversations: ConversationData[]; total: number };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConversation(id: string) {
    try {
      const response = await this.client.get(`/conversations/${id}`);
      return response.data as ConversationData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConversationMessages(id: string, params?: PaginationParams) {
    try {
      const response = await this.client.get(`/conversations/${id}/messages`, { params });
      return response.data as { messages: MessageData[]; total: number };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendMessage(conversationId: string, content: string) {
    try {
      const response = await this.client.post(`/conversations/${conversationId}/messages`, { content });
      return response.data as MessageData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ KNOWLEDGE BASE ENDPOINTS ============

  async getKnowledgeBase(botId: string, params?: PaginationParams) {
    try {
      const response = await this.client.get(`/bots/${botId}/knowledge`, { params });
      return response.data as { documents: KnowledgeDocData[]; total: number };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadDocument(botId: string, file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await this.client.post(`/bots/${botId}/knowledge/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as KnowledgeDocData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteDocument(botId: string, documentId: string) {
    try {
      const response = await this.client.delete(`/bots/${botId}/knowledge/${documentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchKnowledgeBase(botId: string, query: string) {
    try {
      const response = await this.client.get(`/bots/${botId}/knowledge/search`, {
        params: { query },
      });
      return response.data as { documents: KnowledgeDocData[] };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ ANALYTICS ENDPOINTS ============

  async getAnalyticsOverview(params?: {
    bot_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    try {
      const response = await this.client.get('/analytics/overview', { params });
      return response.data as AnalyticsData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConversationsChart(params?: {
    bot_id?: string;
    start_date?: string;
    end_date?: string;
    interval?: 'day' | 'week' | 'month';
  }) {
    try {
      const response = await this.client.get('/analytics/conversations-chart', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBotsPerformance(params?: PaginationParams) {
    try {
      const response = await this.client.get('/analytics/bots-performance', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportAnalytics(params?: {
    format?: 'csv' | 'json';
    bot_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    try {
      const response = await this.client.get('/analytics/export', {
        params,
        responseType: 'blob',
      });
      return response.data as Blob;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ API KEYS ENDPOINTS ============

  async getApiKeys(params?: PaginationParams) {
    try {
      const response = await this.client.get('/api-keys', { params });
      return response.data as { keys: ApiKeyData[]; total: number };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createApiKey(name: string) {
    try {
      const response = await this.client.post('/api-keys', { name });
      return response.data as ApiKeyData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteApiKey(id: string) {
    try {
      const response = await this.client.delete(`/api-keys/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleApiKey(id: string) {
    try {
      const response = await this.client.patch(`/api-keys/${id}/toggle`);
      return response.data as ApiKeyData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ WEBHOOKS ENDPOINTS ============

  async getWebhooks(params?: PaginationParams) {
    try {
      const response = await this.client.get('/webhooks', { params });
      return response.data as { webhooks: WebhookData[]; total: number };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createWebhook(data: Partial<WebhookData>) {
    try {
      const response = await this.client.post('/webhooks', data);
      return response.data as WebhookData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateWebhook(id: string, data: Partial<WebhookData>) {
    try {
      const response = await this.client.put(`/webhooks/${id}`, data);
      return response.data as WebhookData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteWebhook(id: string) {
    try {
      const response = await this.client.delete(`/webhooks/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async testWebhook(id: string) {
    try {
      const response = await this.client.post(`/webhooks/${id}/test`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWebhookLogs(id: string, params?: PaginationParams) {
    try {
      const response = await this.client.get(`/webhooks/${id}/logs`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ CONTACTS ENDPOINTS ============

  async getContacts(params?: PaginationParams) {
    try {
      const response = await this.client.get('/contacts', { params });
      return response.data as { contacts: ContactData[]; total: number };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getContact(id: string) {
    try {
      const response = await this.client.get(`/contacts/${id}`);
      return response.data as ContactData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createContact(data: Partial<ContactData>) {
    try {
      const response = await this.client.post('/contacts', data);
      return response.data as ContactData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateContact(id: string, data: Partial<ContactData>) {
    try {
      const response = await this.client.put(`/contacts/${id}`, data);
      return response.data as ContactData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ CHANNELS ENDPOINTS ============

  async setupWhatsApp(data: { phone_number: string; access_token: string }) {
    try {
      const response = await this.client.post('/channels/whatsapp/setup', data);
      return response.data as ChannelConfigData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWhatsAppQR(botId: string) {
    try {
      const response = await this.client.get(`/channels/whatsapp/${botId}/qr`);
      return response.data as { qr_code: string };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendWhatsAppMessage(botId: string, phoneNumber: string, message: string) {
    try {
      const response = await this.client.post(`/channels/whatsapp/${botId}/send`, {
        phone_number: phoneNumber,
        message,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async setupTelegram(data: { bot_token: string }) {
    try {
      const response = await this.client.post('/channels/telegram/setup', data);
      return response.data as ChannelConfigData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTelegramWebhookUrl(botId: string) {
    try {
      const response = await this.client.get(`/channels/telegram/${botId}/webhook`);
      return response.data as { webhook_url: string };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ SETTINGS ENDPOINTS ============

  async getSettings() {
    try {
      const response = await this.client.get('/settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSettings(data: Record<string, unknown>) {
    try {
      const response = await this.client.put('/settings', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await this.client.post('/settings/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggle2FA(enabled: boolean) {
    try {
      const response = await this.client.post('/settings/toggle-2fa', { enabled });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ BILLING ENDPOINTS ============

  async getSubscription() {
    try {
      const response = await this.client.get('/billing/subscription');
      return response.data as BillingData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkoutSubscription(planId: string) {
    try {
      const response = await this.client.post('/billing/checkout', { plan_id: planId });
      return response.data as { checkout_url: string };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPortalUrl() {
    try {
      const response = await this.client.get('/billing/portal');
      return response.data as { portal_url: string };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getInvoices(params?: PaginationParams) {
    try {
      const response = await this.client.get('/billing/invoices', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUsage(params?: { start_date?: string; end_date?: string }) {
    try {
      const response = await this.client.get('/billing/usage', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ MODELS ENDPOINTS ============

  async listModels() {
    try {
      const response = await this.client.get('/models');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getModelPricing(modelId: string) {
    try {
      const response = await this.client.get(`/models/${modelId}/pricing`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const apiClient = new APIClient();
