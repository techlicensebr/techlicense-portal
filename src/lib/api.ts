import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://techlicense-chatbot-api.techlicensebr.workers.dev';

class APIClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    try {
      const response = await this.client.post('/auth/login', { email, password });
      this.authToken = response.data.token;
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async loginWithGoogle(token: string) {
    try {
      const response = await this.client.post('/auth/google', { token });
      this.authToken = response.data.token;
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendMagicLink(email: string) {
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
      this.authToken = response.data.token;
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
      this.authToken = null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bot endpoints
  async getBots(limit = 20, offset = 0) {
    try {
      const response = await this.client.get('/bots', {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBot(id: string) {
    try {
      const response = await this.client.get(`/bots/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createBot(data: any) {
    try {
      const response = await this.client.post('/bots', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBot(id: string, data: any) {
    try {
      const response = await this.client.put(`/bots/${id}`, data);
      return response.data;
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

  // Conversation endpoints
  async getConversations(botId?: string, limit = 20, offset = 0, status?: string) {
    try {
      const params: any = { limit, offset };
      if (botId) params.bot_id = botId;
      if (status) params.status = status;
      const response = await this.client.get('/conversations', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConversation(id: string) {
    try {
      const response = await this.client.get(`/conversations/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConversationMessages(id: string) {
    try {
      const response = await this.client.get(`/conversations/${id}/messages`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Knowledge base endpoints
  async getKnowledgeBase(botId: string) {
    try {
      const response = await this.client.get(`/bots/${botId}/knowledge`);
      return response.data;
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
      return response.data;
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

  // Analytics endpoints
  async getAnalytics(botId?: string, startDate?: string, endDate?: string) {
    try {
      const params: any = {};
      if (botId) params.bot_id = botId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const response = await this.client.get('/analytics', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // API Keys endpoints
  async getApiKeys() {
    try {
      const response = await this.client.get('/api-keys');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createApiKey(name: string) {
    try {
      const response = await this.client.post('/api-keys', { name });
      return response.data;
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

  // Webhooks endpoints
  async getWebhooks() {
    try {
      const response = await this.client.get('/webhooks');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createWebhook(data: any) {
    try {
      const response = await this.client.post('/webhooks', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateWebhook(id: string, data: any) {
    try {
      const response = await this.client.put(`/webhooks/${id}`, data);
      return response.data;
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

  // Settings endpoints
  async getSettings() {
    try {
      const response = await this.client.get('/settings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSettings(data: any) {
    try {
      const response = await this.client.put('/settings', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        code: error.code,
      };
    }
    return {
      message: 'An unknown error occurred',
      status: 500,
    };
  }
}

export const apiClient = new APIClient();
