'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  Send,
  Copy,
  Check,
  AlertCircle,
  Plus,
  Eye,
  EyeOff,
  Code,
  Palette,
  Save,
  RotateCcw,
  Bot,
  Globe,
  X,
} from 'lucide-react';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { apiClient, BotData } from '@/lib/api';


interface WidgetConfig {
  bot_name: string;
  color: string;
  position: 'bottom-right' | 'bottom-left';
  greeting_message: string;
  avatar_url: string;
  language: string;
  auto_open: boolean;
  auto_open_delay: number;
  show_branding: boolean;
  border_radius: number;
  font_family: string;
  header_text: string;
  placeholder_text: string;
  offline_message: string;
}

const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  bot_name: 'Assistente',
  color: '#4F46E5',
  position: 'bottom-right',
  greeting_message: 'Olá! Como posso ajudá-lo?',
  avatar_url: '',
  language: 'pt-BR',
  auto_open: false,
  auto_open_delay: 5,
  show_branding: true,
  border_radius: 16,
  font_family: 'system-ui',
  header_text: '',
  placeholder_text: 'Digite sua mensagem...',
  offline_message: 'Estamos offline no momento.',
};

export default function CanaisPage() {
  const [showQRCode, setShowQRCode] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [whatsappInstanceName, setWhatsappInstanceName] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [showWhatsappForm, setShowWhatsappForm] = useState(false);
  const [showTelegramForm, setShowTelegramForm] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState<string>('');

  // Widget customization state
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(DEFAULT_WIDGET_CONFIG);
  const [widgetSaving, setWidgetSaving] = useState(false);
  const [widgetSaved, setWidgetSaved] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [showWidgetPreview, setShowWidgetPreview] = useState(true);

  // Fetch bots
  const { data: botsData } = useApi(
    () => apiClient.getBots(),
    { autoFetch: true }
  );

  const bots = (botsData?.bots || []) as BotData[];
  const activeBotId = selectedBotId || bots[0]?.id || '';

  // Fetch channels
  const { data: channelsData, refetch: refetchChannels } = useApi(
    () => activeBotId ? apiClient.getChannels(activeBotId) : Promise.resolve({ channels: [], total: 0 }),
    { autoFetch: !!activeBotId }
  );

  const channelsList = channelsData?.channels || [];

  // Load widget config when bot changes
  useEffect(() => {
    if (!activeBotId) return;
    (async () => {
      try {
        const config = await apiClient.getWidgetConfig(activeBotId);
        if (config) {
          setWidgetConfig(prev => ({ ...prev, ...config }));
        }
      } catch {
        // Use defaults if no config saved yet
        setWidgetConfig({ ...DEFAULT_WIDGET_CONFIG });
      }
    })();
  }, [activeBotId]);

  // Channel data
  const channelData = useMemo(() => {
    const whatsappChannel = channelsList.find((ch: Record<string, unknown>) => ch.type === 'whatsapp');
    const telegramChannel = channelsList.find((ch: Record<string, unknown>) => ch.type === 'telegram');
    const apiBaseUrl = 'https://techlicense-chatbot-api.techlicensebr.workers.dev';

    return {
      whatsapp: {
        status: (whatsappChannel as Record<string, unknown>)?.status === 'connected' ? 'connected' as const
          : whatsappChannel ? 'qr_code_pending' as const
          : 'disconnected' as const,
        instance_name: ((whatsappChannel as Record<string, unknown>)?.config as Record<string, unknown>)?.instance_name || '',
        phone_number: ((whatsappChannel as Record<string, unknown>)?.config as Record<string, unknown>)?.phone_number || '',
        qr_code: ((whatsappChannel as Record<string, unknown>)?.config as Record<string, unknown>)?.qr_code || '',
        channel_id: (whatsappChannel as Record<string, unknown>)?.id || '',
        messages_sent: (whatsappChannel as Record<string, unknown>)?.messages_sent || 0,
        messages_received: (whatsappChannel as Record<string, unknown>)?.messages_received || 0,
      },
      telegram: {
        status: (telegramChannel as Record<string, unknown>)?.status === 'connected' ? 'connected' as const : 'disconnected' as const,
        bot_username: ((telegramChannel as Record<string, unknown>)?.config as Record<string, unknown>)?.bot_username || '',
        bot_token: ((telegramChannel as Record<string, unknown>)?.config as Record<string, unknown>)?.bot_token || '',
        channel_id: (telegramChannel as Record<string, unknown>)?.id || '',
        messages_sent: (telegramChannel as Record<string, unknown>)?.messages_sent || 0,
        messages_received: (telegramChannel as Record<string, unknown>)?.messages_received || 0,
      },
      api: {
        status: 'active' as const,
        endpoint_url: `${apiBaseUrl}/v1/chat/completions`,
        api_key: 'Vá em Chaves de API para gerar uma chave',
      },
    };
  }, [channelsList]);

  // Embed code generation
  const embedCode = useMemo(() => {
    if (!activeBotId) return 'Selecione um bot primeiro';
    const baseUrl = 'https://techlicense-chatbot-api.techlicensebr.workers.dev';
    const attrs = [
      `src="${baseUrl}/widget.js"`,
      `data-token="SUA_API_KEY"`,
      widgetConfig.color !== '#4F46E5' ? `data-color="${widgetConfig.color}"` : '',
      widgetConfig.position !== 'bottom-right' ? `data-position="${widgetConfig.position}"` : '',
      widgetConfig.greeting_message ? `data-welcome="${widgetConfig.greeting_message}"` : '',
      widgetConfig.bot_name ? `data-bot-name="${widgetConfig.bot_name}"` : '',
      widgetConfig.avatar_url ? `data-avatar="${widgetConfig.avatar_url}"` : '',
      widgetConfig.language !== 'pt-BR' ? `data-language="${widgetConfig.language}"` : '',
      'async',
    ].filter(Boolean).join('\n  ');
    return `<script\n  ${attrs}\n></script>`;
  }, [activeBotId, widgetConfig]);

  const whatsappConnect = useApiMutation(async (data: { instance_name: string }) => {
    return apiClient.connectWhatsApp(activeBotId, data);
  });

  const telegramConnect = useApiMutation(async (data: { bot_token: string }) => {
    return apiClient.connectTelegram(activeBotId, data);
  });

  const handleCopyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleWhatsappConnect = async () => {
    if (whatsappInstanceName.trim()) {
      try {
        await whatsappConnect.mutate({ instance_name: whatsappInstanceName });
        setShowWhatsappForm(false);
        setWhatsappInstanceName('');
        refetchChannels();
      } catch (error) {
        console.error('Erro ao conectar WhatsApp:', error);
      }
    }
  };

  const handleTelegramConnect = async () => {
    if (telegramToken.trim()) {
      try {
        await telegramConnect.mutate({ bot_token: telegramToken });
        setShowTelegramForm(false);
        setTelegramToken('');
        refetchChannels();
      } catch (error) {
        console.error('Erro ao conectar Telegram:', error);
      }
    }
  };

  // Save widget config
  const handleSaveWidgetConfig = async () => {
    if (!activeBotId) return;
    setWidgetSaving(true);
    setWidgetError(null);
    try {
      await apiClient.updateWidgetConfig(activeBotId, widgetConfig as unknown as Record<string, unknown>);
      setWidgetSaved(true);
      setTimeout(() => setWidgetSaved(false), 3000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao salvar configurações';
      setWidgetError(errorMsg);
    } finally {
      setWidgetSaving(false);
    }
  };

  // Reset widget config to defaults
  const handleResetWidgetConfig = () => {
    setWidgetConfig({ ...DEFAULT_WIDGET_CONFIG });
  };

  // Update widget config field
  const updateWidget = useCallback((field: keyof WidgetConfig, value: unknown) => {
    setWidgetConfig(prev => ({ ...prev, [field]: value }));
    setWidgetSaved(false);
  }, []);

  const currentChannels = channelData;

  return (
    <div className="space-y-8 animate-fadeIn dark:bg-slate-950">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Canais</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Conecte e gerencie seus canais de comunicação
        </p>
      </div>

      {/* Bot Selector */}
      {bots.length > 0 && (
        <div className="card dark:bg-slate-900 dark:border-slate-700 p-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Selecionar Bot para Canais
          </label>
          <select
            value={activeBotId}
            onChange={(e) => setSelectedBotId(e.target.value)}
            className="input-field max-w-sm"
          >
            {bots.map((bot: BotData) => (
              <option key={bot.id} value={bot.id}>{bot.name}</option>
            ))}
          </select>
        </div>
      )}

      {bots.length === 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p className="font-medium">Nenhum bot criado</p>
            <p>Crie um bot primeiro na aba Bots para poder conectar canais.</p>
          </div>
        </div>
      )}

      {/* WhatsApp Channel */}
      <div className="card dark:bg-slate-900 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <MessageCircle size={20} className="text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">WhatsApp</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Via Evolution API - Conecte seu WhatsApp Business</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
            currentChannels?.whatsapp.status === 'connected'
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : currentChannels?.whatsapp.status === 'qr_code_pending'
                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            {currentChannels?.whatsapp.status === 'connected' ? 'Conectado'
              : currentChannels?.whatsapp.status === 'qr_code_pending' ? 'Aguardando QR Code'
              : 'Desconectado'}
          </span>
        </div>

        {currentChannels?.whatsapp.status === 'connected' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Instância</p>
                <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                  {String(currentChannels.whatsapp.instance_name)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Telefone</p>
                <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                  {String(currentChannels.whatsapp.phone_number) || '-'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary">Desconectar</button>
              <button onClick={() => setShowQRCode(!showQRCode)} className="btn-secondary">
                {showQRCode ? 'Ocultar' : 'Ver'} QR Code
              </button>
            </div>
          </div>
        ) : (
          <div>
            {!showWhatsappForm ? (
              <button onClick={() => setShowWhatsappForm(true)} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Conectar WhatsApp
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nome da Instância
                  </label>
                  <input
                    type="text"
                    value={whatsappInstanceName}
                    onChange={(e) => setWhatsappInstanceName(e.target.value)}
                    placeholder="ex: bot-suporte"
                    className="input-field"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleWhatsappConnect}
                    disabled={whatsappConnect.loading || !whatsappInstanceName.trim()}
                    className="btn-primary"
                  >
                    {whatsappConnect.loading ? 'Conectando...' : 'Criar Instância'}
                  </button>
                  <button onClick={() => { setShowWhatsappForm(false); setWhatsappInstanceName(''); }} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Telegram Channel */}
      <div className="card dark:bg-slate-900 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Send size={20} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Telegram</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Conecte seu bot do Telegram</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
            currentChannels?.telegram.status === 'connected'
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            {currentChannels?.telegram.status === 'connected' ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        {currentChannels?.telegram.status === 'connected' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Bot Username</p>
                <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                  @{String(currentChannels.telegram.bot_username)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {!showTelegramForm ? (
              <button onClick={() => setShowTelegramForm(true)} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Conectar Telegram
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Token do Bot (obtido via @BotFather)
                  </label>
                  <input
                    type="text"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    placeholder="123456789:ABCDefGhIJklmNOPqrstUVwxyz"
                    className="input-field font-mono"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleTelegramConnect}
                    disabled={telegramConnect.loading || !telegramToken.trim()}
                    className="btn-primary"
                  >
                    {telegramConnect.loading ? 'Conectando...' : 'Conectar Bot'}
                  </button>
                  <button onClick={() => { setShowTelegramForm(false); setTelegramToken(''); }} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============ WEB WIDGET — Full Customization ============ */}
      <div className="card dark:bg-slate-900 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Globe size={20} className="text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Web Widget</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Embed seu chatbot em qualquer website</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
            Ativo
          </span>
        </div>

        <div className="space-y-6">
          {/* Success / Error messages */}
          {widgetSaved && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <Check size={16} className="text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">Configurações salvas com sucesso!</span>
            </div>
          )}
          {widgetError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{widgetError}</span>
            </div>
          )}

          {/* Appearance Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Palette size={16} /> Aparência
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Color */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Cor Principal
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={widgetConfig.color}
                    onChange={(e) => updateWidget('color', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-2 border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={widgetConfig.color}
                    onChange={(e) => updateWidget('color', e.target.value)}
                    className="input-field flex-1 font-mono text-sm"
                    maxLength={7}
                  />
                </div>
                {/* Quick color presets */}
                <div className="flex gap-1.5 mt-2">
                  {['#4F46E5', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'].map(c => (
                    <button
                      key={c}
                      onClick={() => updateWidget('color', c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                        widgetConfig.color === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Posição do Widget
                </label>
                <div className="flex gap-2">
                  {(['bottom-right', 'bottom-left'] as const).map(pos => (
                    <button
                      key={pos}
                      onClick={() => updateWidget('position', pos)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border-2 transition-colors ${
                        widgetConfig.position === pos
                          ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {pos === 'bottom-right' ? 'Inferior Direita' : 'Inferior Esquerda'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Arredondamento ({widgetConfig.border_radius}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={widgetConfig.border_radius}
                  onChange={(e) => updateWidget('border_radius', +e.target.value)}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Bot size={16} /> Conteúdo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Nome do Bot
                </label>
                <input
                  type="text"
                  value={widgetConfig.bot_name}
                  onChange={(e) => updateWidget('bot_name', e.target.value)}
                  className="input-field w-full"
                  placeholder="Assistente"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Mensagem de Boas-vindas
                </label>
                <input
                  type="text"
                  value={widgetConfig.greeting_message}
                  onChange={(e) => updateWidget('greeting_message', e.target.value)}
                  className="input-field w-full"
                  placeholder="Olá! Como posso ajudá-lo?"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Texto do Header (opcional)
                </label>
                <input
                  type="text"
                  value={widgetConfig.header_text}
                  onChange={(e) => updateWidget('header_text', e.target.value)}
                  className="input-field w-full"
                  placeholder="Como podemos ajudar?"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Placeholder do Input
                </label>
                <input
                  type="text"
                  value={widgetConfig.placeholder_text}
                  onChange={(e) => updateWidget('placeholder_text', e.target.value)}
                  className="input-field w-full"
                  placeholder="Digite sua mensagem..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  URL do Avatar (opcional)
                </label>
                <input
                  type="url"
                  value={widgetConfig.avatar_url}
                  onChange={(e) => updateWidget('avatar_url', e.target.value)}
                  className="input-field w-full"
                  placeholder="https://exemplo.com/avatar.png"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Idioma
                </label>
                <select
                  value={widgetConfig.language}
                  onChange={(e) => updateWidget('language', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="pt-BR">Português (BR)</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>

          {/* Behavior Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              ⚡ Comportamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={widgetConfig.auto_open}
                  onChange={(e) => updateWidget('auto_open', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Abrir Automaticamente</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Widget abre sozinho após carregamento</p>
                </div>
              </label>

              {widgetConfig.auto_open && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Delay para Abrir ({widgetConfig.auto_open_delay}s)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={widgetConfig.auto_open_delay}
                    onChange={(e) => updateWidget('auto_open_delay', +e.target.value)}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={widgetConfig.show_branding}
                  onChange={(e) => updateWidget('show_branding', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Mostrar Branding</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Exibir &quot;Powered by TechLicense&quot;</p>
                </div>
              </label>
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye size={16} /> Pré-visualização
              </h3>
              <button
                onClick={() => setShowWidgetPreview(!showWidgetPreview)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {showWidgetPreview ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {showWidgetPreview && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 min-h-[400px] flex items-end relative"
                style={{ justifyContent: widgetConfig.position === 'bottom-right' ? 'flex-end' : 'flex-start' }}
              >
                {/* Mock website background */}
                <div className="absolute top-4 left-4 right-4 space-y-2 opacity-30">
                  <div className="h-6 w-32 bg-slate-300 dark:bg-slate-600 rounded" />
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>

                {/* Widget Preview */}
                <div className="w-80 flex flex-col" style={{ borderRadius: `${widgetConfig.border_radius}px` }}>
                  {/* Chat Window */}
                  <div className="bg-white dark:bg-slate-900 shadow-2xl overflow-hidden" style={{ borderRadius: `${widgetConfig.border_radius}px` }}>
                    {/* Header */}
                    <div
                      className="p-4 text-white flex items-center gap-3"
                      style={{ backgroundColor: widgetConfig.color }}
                    >
                      {widgetConfig.avatar_url ? (
                        <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden flex-shrink-0">
                          <div className="w-full h-full bg-white/30 flex items-center justify-center text-xs">
                            <Bot size={16} />
                          </div>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Bot size={16} />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{widgetConfig.bot_name || 'Assistente'}</p>
                        <p className="text-xs opacity-80">Online</p>
                      </div>
                      <button className="p-1 hover:bg-white/10 rounded">
                        <X size={16} />
                      </button>
                    </div>

                    {/* Messages area */}
                    <div className="p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50" style={{ minHeight: '200px' }}>
                      {/* Bot greeting */}
                      <div className="flex gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                          style={{ backgroundColor: widgetConfig.color }}
                        >
                          <Bot size={10} />
                        </div>
                        <div className="bg-white dark:bg-slate-700 px-3 py-2 rounded-2xl rounded-bl-md shadow-sm max-w-[85%]">
                          <p className="text-sm text-slate-800 dark:text-slate-200">
                            {widgetConfig.greeting_message || 'Olá! Como posso ajudá-lo?'}
                          </p>
                        </div>
                      </div>

                      {/* User example message */}
                      <div className="flex justify-end">
                        <div
                          className="px-3 py-2 rounded-2xl rounded-br-md text-white text-sm max-w-[85%]"
                          style={{ backgroundColor: widgetConfig.color }}
                        >
                          Olá, preciso de ajuda!
                        </div>
                      </div>

                      {/* Bot response */}
                      <div className="flex gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                          style={{ backgroundColor: widgetConfig.color }}
                        >
                          <Bot size={10} />
                        </div>
                        <div className="bg-white dark:bg-slate-700 px-3 py-2 rounded-2xl rounded-bl-md shadow-sm max-w-[85%]">
                          <p className="text-sm text-slate-800 dark:text-slate-200">
                            Claro! Estou aqui para ajudar. 😊
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Input area */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={widgetConfig.placeholder_text || 'Digite sua mensagem...'}
                          className="flex-1 text-sm px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0 outline-none"
                          disabled
                        />
                        <button
                          className="p-2 rounded-full text-white"
                          style={{ backgroundColor: widgetConfig.color }}
                        >
                          <Send size={14} />
                        </button>
                      </div>
                      {widgetConfig.show_branding && (
                        <p className="text-center text-[9px] text-slate-400 dark:text-slate-500 mt-2">
                          Powered by TechLicense
                        </p>
                      )}
                    </div>
                  </div>

                  {/* FAB button */}
                  <div className="flex mt-3" style={{ justifyContent: widgetConfig.position === 'bottom-right' ? 'flex-end' : 'flex-start' }}>
                    <div
                      className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: widgetConfig.color }}
                    >
                      <MessageCircle size={24} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Embed Code */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Código de Embed
            </label>
            <div className="relative">
              <pre className="block w-full p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {embedCode}
              </pre>
              <button
                onClick={() => handleCopyCode(embedCode, 'embed_code')}
                className="absolute right-2 top-2 p-2 hover:bg-slate-700 dark:hover:bg-slate-800 rounded transition-colors"
              >
                {copiedCode === 'embed_code' ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <Copy size={16} className="text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSaveWidgetConfig}
              disabled={widgetSaving || !activeBotId}
              className="btn-primary flex items-center gap-2"
            >
              {widgetSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salvar Personalizações
                </>
              )}
            </button>
            <button
              onClick={handleResetWidgetConfig}
              className="btn-secondary flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Restaurar Padrão
            </button>
          </div>
        </div>
      </div>

      {/* API Channel */}
      <div className="card dark:bg-slate-900 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Code size={20} className="text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">API Direta</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Integre via API REST</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
            Ativo
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              URL do Endpoint
            </label>
            <div className="relative">
              <code className="block w-full p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
                {currentChannels?.api.endpoint_url}
              </code>
              <button
                onClick={() => handleCopyCode(currentChannels?.api.endpoint_url || '', 'endpoint')}
                className="absolute right-2 top-2 p-2 hover:bg-slate-700 dark:hover:bg-slate-800 rounded transition-colors"
              >
                {copiedCode === 'endpoint' ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <Copy size={16} className="text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Chave da API
            </label>
            <div className="relative">
              <code className="block w-full p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
                {showBotToken ? currentChannels?.api.api_key : '••••••••••••••••••••'}
              </code>
              <button
                onClick={() => setShowBotToken(!showBotToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-700 dark:hover:bg-slate-800 rounded transition-colors"
              >
                {showBotToken ? (
                  <EyeOff size={16} className="text-slate-400" />
                ) : (
                  <Eye size={16} className="text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <a
            href="/api-keys"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Gerenciar Chaves de API
            <span>→</span>
          </a>
        </div>
      </div>

      {/* Channel Configuration Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex gap-3">
        <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Configuração por Canal</p>
          <p>
            Você pode selecionar qual bot responde em cada canal e personalizar completamente o widget web com cores, posição e mensagens.
          </p>
        </div>
      </div>
    </div>
  );
}
