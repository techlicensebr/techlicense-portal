/**
 * Tipos compartilhados da aplicação
 */

export type UserRole = 'admin' | 'user' | 'viewer';
export type UserPlan = 'free' | 'starter' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  organization_id: string;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
}

export type BotStatus = 'active' | 'inactive' | 'archived';
export type DocumentStatus = 'processing' | 'ready' | 'error';
export type ConversationStatus = 'active' | 'closed' | 'archived';
export type ChannelType = 'whatsapp' | 'telegram' | 'instagram' | 'messenger' | 'facebook';
export type ChannelStatus = 'active' | 'inactive' | 'error';

export interface Bot {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  status: BotStatus;
  avatar_url?: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  language: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Conversation {
  id: string;
  bot_id: string;
  user_id: string;
  status: ConversationStatus;
  started_at: string;
  ended_at?: string;
  message_count: number;
  duration_seconds: number;
  user_name?: string;
  user_email?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_used?: number;
  created_at: string;
}

export interface KnowledgeDocument {
  id: string;
  bot_id: string;
  name: string;
  type: 'pdf' | 'txt' | 'docx' | 'webpage' | 'url';
  size: number;
  status: DocumentStatus;
  error_message?: string;
  chunks_count: number;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  total_conversations: number;
  total_messages: number;
  active_users: number;
  avg_response_time: number;
  satisfaction_score: number;
  messages_today: number;
  conversations_today: number;
  revenue_mrr: number;
}

export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  key: string; // Apenas retornado na criação
  key_preview: string;
  last_used?: string;
  active: boolean;
  created_at: string;
  created_by: string;
}

export interface Webhook {
  id: string;
  organization_id: string;
  event_type: string;
  url: string;
  active: boolean;
  secret?: string;
  headers?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  bot_id: string;
  type: ChannelType;
  status: ChannelStatus;
  account_id: string;
  phone_number?: string;
  username?: string;
  webhook_url?: string;
  connected_at: string;
  connected_by: string;
  last_activity?: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan: UserPlan;
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  next_billing_date?: string;
  amount: number;
  currency: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageData {
  messages_used: number;
  messages_limit: number;
  conversations_used: number;
  conversations_limit: number;
  storage_used: number;
  storage_limit: number;
  api_calls_used: number;
  api_calls_limit: number;
  period_start: string;
  period_end: string;
  percentage_used: number;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  provider: string;
  max_tokens: number;
  cost_per_1k_tokens: number;
  cost_currency: string;
  active: boolean;
}

export interface Invoice {
  id: string;
  organization_id: string;
  number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
  amount: number;
  currency: string;
  issued_at: string;
  due_date: string;
  paid_at?: string;
  pdf_url?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}
