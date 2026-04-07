import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://techlicense-chatbot-api.techlicensebr.workers.dev';
const V1_BASE_URL = `${API_BASE_URL}/v1`;

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
  status: 'active' | 'inactive' | 'archived' | 'draft';
  avatar_url?: string;
  model?: string;
  ai_model?: string;
  system_prompt?: string;
  temperature: number;
  max_tokens: number;
  guardrails?: {
    allowed_topics?: string[];
    blocked_topics?: string[];
    block_profanity?: boolean;
    max_input_length?: number;
  };
  metadata?: Record<string, unknown>;
  tenant_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationData {
  id: string;
  bot_id: string;
  contact_id?: string;
  user_id?: string;
  channel?: string;
  status: 'active' | 'closed' | 'archived';
  started_at?: string;
  first_message_at?: string;
  last_message_at?: string;
  closed_at?: string;
  message_count: number;
  total_tokens?: number;
  contacts?: { name?: string; email?: string; phone?: string };
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

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      withCredentials: true, // Send HttpOnly cookies automatically
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor — auto-refresh on 401
    this.client.interceptors.response.use(
      response => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying and not an auth endpoint
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/v1/auth/')
        ) {
          originalRequest._retry = true;

          try {
            // Try to refresh the session
            await this.client.post('/v1/auth/refresh');
            // Retry original request with new cookie
            return this.client(originalRequest);
          } catch {
            // Refresh failed — session expired
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
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
      const response = await this.client.post('/v1/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async loginMagicLink(email: string) {
    try {
      const response = await this.client.post('/v1/auth/magic-link', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyOtp(email: string, token: string) {
    try {
      const response = await this.client.post('/v1/auth/verify-otp', { email, token });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exchangeCode(code: string) {
    try {
      const response = await this.client.post('/v1/auth/callback', { code });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.client.get('/v1/auth/me');
      return response.data;
    } catch {
      return null;
    }
  }

  async logout() {
    try {
      await this.client.post('/v1/auth/logout');
    } catch {
      // Ignore errors on logout
    }
  }

  async forgotPassword(email: string) {
    try {
      const response = await this.client.post('/v1/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(accessToken: string, refreshToken: string, password: string) {
    try {
      const response = await this.client.post('/v1/auth/reset-password', {
        access_token: accessToken,
        refresh_token: refreshToken,
        password,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(data: { name: string; email: string; password: string; company_name: string }) {
    try {
      const response = await this.client.post('/v1/auth/register', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ BOTS ENDPOINTS ============
  // API: GET /v1/bots, GET /v1/bots/:id, POST /v1/bots, PATCH /v1/bots/:id, DELETE /v1/bots/:id

  async getBots(params?: PaginationParams) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/bots`, { params });
      const body = response.data;
      return { bots: body.data || [], total: body.meta?.total ?? 0 };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBot(id: string) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/bots/${id}`);
      return (response.data?.data || response.data) as BotData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBot(data: Partial<BotData>) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/bots`, data);
      return (response.data?.data || response.data) as BotData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBot(id: string, data: Partial<BotData>) {
    try {
      const response = await this.client.patch(`${V1_BASE_URL}/bots/${id}`, data);
      return (response.data?.data || response.data) as BotData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteBot(id: string) {
    try {
      const response = await this.client.delete(`${V1_BASE_URL}/bots/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleBotStatus(id: string) {
    try {
      const response = await this.client.patch(`${V1_BASE_URL}/bots/${id}/toggle-status`);
      return (response.data?.data || response.data) as BotData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ CONVERSATIONS ENDPOINTS ============
  // API: GET /v1/conversations, GET /v1/conversations/:id, PATCH /v1/conversations/:id

  async getConversations(params?: PaginationParams & { bot_id?: string; status?: string }) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/conversations`, { params });
      const body = response.data;
      return { conversations: body.data || [], total: body.meta?.total ?? 0 };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConversation(id: string) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/conversations/${id}`);
      return (response.data?.data || response.data) as ConversationData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConversationMessages(id: string, params?: PaginationParams) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/conversations/${id}/messages`, { params });
      const body = response.data;
      return { messages: body.data || [], total: body.meta?.total ?? 0 };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendMessage(conversationId: string, content: string) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/conversations/${conversationId}/messages`, { content });
      return (response.data?.data || response.data) as MessageData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ CHAT PLAYGROUND ============

  async chatPlayground(botId: string, message: string, conversationId?: string | null) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/chat/completions`, {
        bot_id: botId,
        message,
        ...(conversationId ? { conversation_id: conversationId } : {}),
      });
      return response.data?.data || response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ KNOWLEDGE BASE ENDPOINTS ============
  // API: GET /v1/knowledge/:botId, GET /v1/knowledge/:botId/documents, POST /v1/knowledge/:botId/documents, DELETE /v1/knowledge/:botId/documents/:docId

  async getKnowledgeBase(botId: string, params?: PaginationParams) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/knowledge/${botId}`, { params });
      const body = response.data;
      // API returns { data: knowledgeBase } for single KB or { data: [...documents] }
      if (body.data && Array.isArray(body.data)) {
        return { documents: body.data, total: body.meta?.total ?? body.data.length };
      }
      return { documents: body.documents || [], total: body.total ?? 0 };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadDocument(botId: string, file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await this.client.post(`${V1_BASE_URL}/knowledge/${botId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return (response.data?.data || response.data) as KnowledgeDocData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteDocument(botId: string, documentId: string) {
    try {
      const response = await this.client.delete(`${V1_BASE_URL}/knowledge/${botId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchKnowledgeBase(botId: string, query: string) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/knowledge/${botId}/search`, {
        params: { query },
      });
      const body = response.data;
      return { documents: body.data || body.documents || [] };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ ANALYTICS ENDPOINTS ============
  // API: GET /v1/analytics/usage, GET /v1/analytics/conversations

  async getAnalyticsOverview(params?: {
    bot_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    try {
      // Uses /v1/analytics/usage for overview data
      const response = await this.client.get(`${V1_BASE_URL}/analytics/usage`, { params });
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
      const response = await this.client.get(`${V1_BASE_URL}/analytics/conversations-chart`, { params });
      const body = response.data;
      return { data: body.data || [] };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBotsPerformance(params?: PaginationParams) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/analytics/bots-performance`, { params });
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
      // Analytics export — may not be available in all API versions
      const response = await this.client.get(`${V1_BASE_URL}/analytics/export`, {
        params,
        responseType: 'blob',
      });
      return response.data as Blob;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ API KEYS ENDPOINTS ============
  // API: GET /v1/api-keys, POST /v1/api-keys, DELETE /v1/api-keys/:id

  async getApiKeys(params?: PaginationParams) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/api-keys`, { params });
      const body = response.data;
      return { keys: body.data || [], total: body.meta?.total ?? (body.data?.length || 0) };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createApiKey(name: string) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/api-keys`, { name });
      return (response.data?.data || response.data) as ApiKeyData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteApiKey(id: string) {
    try {
      const response = await this.client.delete(`${V1_BASE_URL}/api-keys/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleApiKey(id: string) {
    try {
      const response = await this.client.patch(`${V1_BASE_URL}/api-keys/${id}/toggle`);
      return (response.data?.data || response.data) as ApiKeyData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ WEBHOOKS ENDPOINTS ============
  // API: GET /v1/webhooks, POST /v1/webhooks, PATCH /v1/webhooks/:id, DELETE /v1/webhooks/:id

  async getWebhooks(params?: PaginationParams) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/webhooks`, { params });
      const body = response.data;
      return { webhooks: body.data || [], total: body.meta?.total ?? 0 };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createWebhook(data: Partial<WebhookData>) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/webhooks`, data);
      return (response.data?.data || response.data) as WebhookData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateWebhook(id: string, data: Partial<WebhookData>) {
    try {
      const response = await this.client.patch(`${V1_BASE_URL}/webhooks/${id}`, data);
      return (response.data?.data || response.data) as WebhookData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteWebhook(id: string) {
    try {
      const response = await this.client.delete(`${V1_BASE_URL}/webhooks/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async testWebhook(id: string) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/webhooks/${id}/test`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWebhookLogs(id: string, params?: PaginationParams) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/webhooks/${id}/logs`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ CONTACTS ENDPOINTS ============
  // API: GET /v1/contacts, GET /v1/contacts/:id, PATCH /v1/contacts/:id

  async getContacts(params?: PaginationParams) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/contacts`, { params });
      const body = response.data;
      return { contacts: body.data || [], total: body.meta?.total ?? 0 };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getContact(id: string) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/contacts/${id}`);
      return (response.data?.data || response.data) as ContactData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createContact(data: Partial<ContactData>) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/contacts`, data);
      return (response.data?.data || response.data) as ContactData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateContact(id: string, data: Partial<ContactData>) {
    try {
      const response = await this.client.patch(`${V1_BASE_URL}/contacts/${id}`, data);
      return (response.data?.data || response.data) as ContactData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ CHANNELS ENDPOINTS ============
  // API: GET /v1/channels/:botId, POST /v1/channels/:botId/whatsapp, POST /v1/channels/:botId/telegram, DELETE /v1/channels/:botId/:channelId

  async getChannels(botId: string) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/channels/${botId}`);
      const body = response.data;
      return { channels: body.data || [], total: body.data?.length || 0 };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async connectWhatsApp(botId: string, data: { instance_name: string }) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/channels/${botId}/whatsapp`, data);
      return (response.data?.data || response.data) as ChannelConfigData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async connectTelegram(botId: string, data: { bot_token: string }) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/channels/${botId}/telegram`, data);
      return (response.data?.data || response.data) as ChannelConfigData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async disconnectChannel(botId: string, channelId: string) {
    try {
      const response = await this.client.delete(`${V1_BASE_URL}/channels/${botId}/${channelId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ SETTINGS ENDPOINTS ============
  // API: GET /v1/settings, PATCH /v1/settings, POST /v1/settings/password, POST /v1/settings/2fa/*

  async getSettings() {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/settings`);
      return (response.data?.data || response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSettings(data: Record<string, unknown>) {
    try {
      const response = await this.client.patch(`${V1_BASE_URL}/settings`, data);
      return (response.data?.data || response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/settings/password`, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async enable2FA() {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/settings/2fa/enable`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async confirm2FA(token: string) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/settings/2fa/confirm`, { token });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async disable2FA(token: string) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/settings/2fa/disable`, { token });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async get2FAStatus() {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/settings/2fa/status`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ BILLING ENDPOINTS ============
  // API: GET /v1/billing/subscription, POST /v1/billing/checkout, POST /v1/billing/portal, GET /v1/billing/invoices, GET /v1/billing/usage

  async getSubscription() {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/billing/subscription`);
      return (response.data?.data || response.data) as BillingData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkoutSubscription(planId: string) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/billing/checkout`, { plan_id: planId });
      const body = response.data;
      return (body?.data || body) as { checkout_url: string };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPortalUrl() {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/billing/portal`);
      const body = response.data;
      return (body?.data || body) as { portal_url: string };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getInvoices(params?: PaginationParams) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/billing/invoices`, { params });
      const body = response.data;
      return { invoices: body.data || [], total: body.meta?.total ?? 0 };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUsage(params?: { start_date?: string; end_date?: string }) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/billing/usage`, { params });
      return (response.data?.data || response.data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ MODELS ENDPOINTS ============
  // API: GET /v1/models, GET /v1/models/:id, POST /v1/models/:id/batch-pricing

  async listModels() {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/models`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getModelPricing(modelId: string) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/models/${modelId}/pricing`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ ADMIN ENDPOINTS ============

  async getAdminDashboard() {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/admin/dashboard`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAdminTenants(params?: { page?: number; per_page?: number; search?: string; status?: string }) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/admin/tenants`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAdminTenant(id: string) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/admin/tenants/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAdminTenant(data: { name: string; slug?: string; plan: string; owner_email: string; owner_name: string; owner_password: string }) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/admin/tenants`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAdminTenant(id: string, data: Record<string, unknown>) {
    try {
      const response = await this.client.patch(`${V1_BASE_URL}/admin/tenants/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAdminTenant(id: string) {
    try {
      const response = await this.client.delete(`${V1_BASE_URL}/admin/tenants/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAdminPlans() {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/admin/plans`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAdminUsage(params?: { period?: string }) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/admin/usage`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAdminSubscriptions(params?: { page?: number; per_page?: number }) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/admin/subscriptions`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================================================
  // Team Management
  // =====================================================

  async getTeamMembers() {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/team/members`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTeamInvitations() {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/team/invitations`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async inviteTeamMember(data: { email: string; role: string }) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/team/invite`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTeamMember(userId: string, data: { role?: string; is_active?: boolean }) {
    try {
      const response = await this.client.patch(`${V1_BASE_URL}/team/members/${userId}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeTeamMember(userId: string) {
    try {
      const response = await this.client.delete(`${V1_BASE_URL}/team/members/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async revokeInvitation(invitationId: string) {
    try {
      const response = await this.client.delete(`${V1_BASE_URL}/team/invitations/${invitationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async acceptInvite(token: string) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/team/accept-invite/${token}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================================================
  // Agent Handoff
  // =====================================================

  async getHandoffQueues() {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/handoff/queues`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createHandoffQueue(data: { name: string; description?: string; priority?: number; max_concurrent?: number; auto_assign?: boolean }) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/handoff/queues`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateHandoffQueue(queueId: string, data: Record<string, unknown>) {
    try {
      const response = await this.client.patch(`${V1_BASE_URL}/handoff/queues/${queueId}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteHandoffQueue(queueId: string) {
    try {
      const response = await this.client.delete(`${V1_BASE_URL}/handoff/queues/${queueId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getHandoffRequests(status?: string) {
    try {
      const params = status ? { status } : {};
      const response = await this.client.get(`${V1_BASE_URL}/handoff/requests`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createHandoffRequest(data: { conversation_id: string; bot_id: string; queue_id?: string; trigger?: string; trigger_reason?: string; priority?: number }) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/handoff/requests`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async assignHandoffRequest(requestId: string, userId?: string) {
    try {
      const response = await this.client.patch(`${V1_BASE_URL}/handoff/requests/${requestId}/assign`, userId ? { user_id: userId } : {});
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resolveHandoffRequest(requestId: string, resolutionNotes?: string) {
    try {
      const response = await this.client.patch(`${V1_BASE_URL}/handoff/requests/${requestId}/resolve`, { resolution_notes: resolutionNotes });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getHandoffStats() {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/handoff/stats`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleAvailability(isAvailable: boolean) {
    try {
      const response = await this.client.patch(`${V1_BASE_URL}/handoff/availability`, { is_available: isAvailable });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================================================
  // Audit Logs
  // =====================================================

  async getAuditLogs(params?: { page?: number; per_page?: number; action?: string; resource_type?: string; user_id?: string; from?: string; to?: string }) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/audit`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAuditActions() {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/audit/actions`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async exportAuditLogs(params?: { from?: string; to?: string }) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/audit/export`, {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================================================
  // Data Export
  // =====================================================

  async exportConversations(params?: { from?: string; to?: string; bot_id?: string; status?: string }) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/conversations/export`, {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================================================
  // Webhook Deliveries
  // =====================================================

  async getWebhookDeliveries(webhookId: string, params?: { page?: number; per_page?: number; status?: string }) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/webhooks/${webhookId}/deliveries`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWebhookDeliveryDetail(webhookId: string, deliveryId: string) {
    try {
      const response = await this.client.get(`${V1_BASE_URL}/webhooks/${webhookId}/deliveries/${deliveryId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async retryWebhookDelivery(webhookId: string, deliveryId: string) {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/webhooks/${webhookId}/deliveries/${deliveryId}/retry`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async processWebhookRetries() {
    try {
      const response = await this.client.post(`${V1_BASE_URL}/webhooks/process-retries`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

}

export const apiClient = new APIClient();
