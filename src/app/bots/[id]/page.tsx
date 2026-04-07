'use client';

export const runtime = 'edge';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, AlertCircle, Send, Bot, User, Loader2 } from 'lucide-react';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { apiClient, BotData } from '@/lib/api';

type TabType = 'geral' | 'modelo' | 'prompt' | 'protecoes' | 'canais' | 'testar';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  latency_ms?: number;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export default function BotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const botId = params.id as string;
  const isNew = botId === 'new';

  const [activeTab, setActiveTab] = useState<TabType>('geral');
  const [saved, setSaved] = useState(false);
  const [newProtection, setNewProtection] = useState('');
  const [newChannel, setNewChannel] = useState('');

  const { data: bot, loading: botLoading, error: botError } = useApi(
    () => apiClient.getBot(botId),
    { autoFetch: !isNew }
  );

  const [config, setConfig] = useState<Partial<BotData>>(
    isNew
      ? {
          name: '',
          description: '',
          status: 'active',
          ai_model: 'gpt-4o-mini',
          system_prompt: 'Você é um assistente útil e prestativo.',
          temperature: 0.7,
          max_tokens: 1024,
        }
      : {}
  );

  useEffect(() => {
    if (bot) {
      setConfig(bot);
    }
  }, [bot]);

  const { mutate: saveBotMutate, loading: saveLoading } = useApiMutation(
    (data: Partial<BotData>) =>
      isNew ? apiClient.createBot(data) : apiClient.updateBot(botId, data),
    {
      onSuccess: (result: any) => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        if (isNew && result?.id) {
          router.push(`/bots/${result.id}`);
        }
      },
    }
  );

  const handleSave = async () => {
    if (isNew && !config.name?.trim()) {
      alert('Por favor, preencha o nome do bot.');
      return;
    }
    try {
      await saveBotMutate(config);
    } catch (err) {
      console.error('Erro ao salvar bot:', err);
    }
  };

  // Chat playground state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatConversationId, setChatConversationId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  const sendChatMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading || isNew) return;

    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);

    try {
      const token = document.cookie.match(/tl_session=([^;]+)/)?.[1];
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.chatbot.techlicense.com.br'}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          bot_id: botId,
          message: msg,
          ...(chatConversationId ? { conversation_id: chatConversationId } : {}),
        }),
      });

      const data = await res.json();

      if (data.data) {
        if (data.data.conversation_id) {
          setChatConversationId(data.data.conversation_id);
        }
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.data.content || 'Sem resposta',
            model: data.data.model,
            latency_ms: data.data.latency_ms,
            usage: data.data.usage,
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Erro: ${data.error?.message || JSON.stringify(data)}`,
          },
        ]);
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Erro de conexão: ${err.message}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'geral', label: 'Geral' },
    { id: 'modelo', label: 'Modelo de IA' },
    { id: 'prompt', label: 'Prompt do Sistema' },
    { id: 'protecoes', label: 'Proteções' },
    { id: 'canais', label: 'Canais' },
    ...(!isNew ? [{ id: 'testar' as TabType, label: '🧪 Testar' }] : []),
  ];

  if (!isNew && botLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/4 animate-pulse" />
        <div className="card h-96 bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link href="/bots" className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={18} />
          Voltar para Bots
        </Link>
      </div>

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{isNew ? 'Novo Bot' : (config.name || 'Carregando...')}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{config.description}</p>
      </div>

      {/* Error state */}
      {!isNew && botError && (
        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
          <p className="text-sm text-red-700 dark:text-red-300">
            Erro ao carregar bot: {botError.message}
          </p>
        </div>
      )}

      {/* Card */}
      <div className="card dark:bg-slate-800">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {/* General tab */}
          {activeTab === 'geral' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome do Bot</label>
                <input
                  type="text"
                  value={config.name || ''}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Descrição</label>
                <textarea
                  value={config.description || ''}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                <select
                  value={config.status || 'active'}
                  onChange={(e) => setConfig({ ...config, status: e.target.value as 'active' | 'inactive' })}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
          )}

          {/* Model tab */}
          {activeTab === 'modelo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Modelo</label>
                <select
                  value={(config as any).ai_model || 'gpt-4o-mini'}
                  onChange={(e) => setConfig({ ...config, ai_model: e.target.value } as Partial<BotData>)}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <optgroup label="⚡ Groq (Grátis/Ultra-rápido)">
                    <option value="groq-llama-3.3-70b">Llama 3.3 70B (Groq)</option>
                    <option value="groq-llama-3.1-8b">Llama 3.1 8B (Groq)</option>
                    <option value="groq-mixtral-8x7b">Mixtral 8x7B (Groq)</option>
                  </optgroup>
                  <optgroup label="🔷 Google Gemini">
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  </optgroup>
                  <optgroup label="OpenAI">
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </optgroup>
                  <optgroup label="Anthropic">
                    <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                    <option value="claude-haiku">Claude 3.5 Haiku</option>
                  </optgroup>
                  <optgroup label="Meta (via Groq)">
                    <option value="llama-3.1-70b">Llama 3.1 70B</option>
                    <option value="llama-3.1-8b">Llama 3.1 8B</option>
                  </optgroup>
                  <optgroup label="Mistral (via Groq)">
                    <option value="mistral-large">Mistral Large</option>
                    <option value="mistral-7b">Mistral 7B</option>
                  </optgroup>
                  <optgroup label="Google">
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gemini-flash">Gemini Flash</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Temperatura</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature || 0.7}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Valor: {(config.temperature || 0.7).toFixed(1)} (Menor = mais determinístico, Maior = mais criativo)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Max Tokens</label>
                <input
                  type="number"
                  value={config.max_tokens || 2048}
                  onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Máximo de tokens por resposta</p>
              </div>
            </div>
          )}

          {/* Prompt tab */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prompt do Sistema</label>
                <textarea
                  value={(config as any).system_prompt || ''}
                  onChange={(e) => setConfig({ ...config, system_prompt: e.target.value } as Partial<BotData>)}
                  className="input-field font-mono text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  rows={8}
                  placeholder="Digite o prompt do sistema para este bot..."
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Isso define o comportamento e a personalidade do seu bot. ({((config as any).system_prompt || '').length} caracteres)
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Dica:</strong> Use instruções claras e específicas para guiar as respostas do bot. Inclua contexto sobre seu negócio e diretrizes específicas para interações.
                </p>
              </div>
            </div>
          )}

          {/* Protections tab */}
          {activeTab === 'protecoes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Adicionar Proteção</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProtection}
                    onChange={(e) => setNewProtection(e.target.value)}
                    placeholder="Ex: Nenhum aconselhamento médico"
                    className="input-field flex-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                  <button
                    onClick={() => {
                      if (newProtection.trim()) {
                        setNewProtection('');
                      }
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Adicionar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Proteções Ativas</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span className="text-sm text-slate-900 dark:text-white">Nenhuma linguagem inadequada</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span className="text-sm text-slate-900 dark:text-white">Nenhum compartilhamento de dados sensíveis</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span className="text-sm text-slate-900 dark:text-white">Nenhuma discussão fora do tópico</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test/Playground tab */}
          {activeTab === 'testar' && !isNew && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Modelo: <span className="font-semibold text-slate-900 dark:text-white">{(config as any).ai_model || 'N/A'}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setChatMessages([]);
                    setChatConversationId(null);
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Nova conversa
                </button>
              </div>

              {/* Chat messages area */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 h-96 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                    <Bot size={48} className="mb-3 opacity-50" />
                    <p className="text-sm">Envie uma mensagem para testar seu bot</p>
                    <p className="text-xs mt-1">As respostas serão geradas pelo modelo configurado</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.role === 'assistant' && (msg.model || msg.latency_ms) && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex gap-3 text-xs text-slate-400 dark:text-slate-500">
                          {msg.model && <span>Modelo: {msg.model}</span>}
                          {msg.latency_ms && <span>{msg.latency_ms}ms</span>}
                          {msg.usage && <span>{msg.usage.total_tokens} tokens</span>}
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-slate-600 dark:text-slate-400" />
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Gerando resposta...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                  placeholder="Digite uma mensagem para testar o bot..."
                  className="input-field flex-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  disabled={chatLoading}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {chatLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Enviar
                </button>
              </div>
            </div>
          )}

          {/* Channels tab */}
          {activeTab === 'canais' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Adicionar Canal</label>
                <div className="flex gap-2">
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="input-field flex-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="">Selecione um canal...</option>
                    <option value="web">Web</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="telegram">Telegram</option>
                    <option value="slack">Slack</option>
                    <option value="discord">Discord</option>
                    <option value="messenger">Messenger</option>
                  </select>
                  <button
                    onClick={() => {
                      if (newChannel.trim()) {
                        setNewChannel('');
                      }
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Adicionar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Canais Habilitados</label>
                <div className="space-y-2">
                  {['Web', 'WhatsApp', 'Telegram'].map((channel) => (
                    <div
                      key={channel}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{channel}</span>
                      <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors">
                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <Link href="/bots" className="btn-secondary">
            Cancelar
          </Link>
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saveLoading ? 'Salvando...' : isNew ? 'Criar Bot' : 'Salvar Alterações'}
          </button>
        </div>

        {/* Success message */}
        {saved && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full" />
            <p className="text-sm text-green-800 dark:text-green-300">Configuração do bot salva com sucesso!</p>
          </div>
        )}
      </div>
    </div>
  );
}
