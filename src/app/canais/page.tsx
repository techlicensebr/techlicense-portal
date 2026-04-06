'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApi, useApiMutation } from '@/hooks/useApi';

interface ChannelStatus {
  whatsapp: {
    status: 'connected' | 'disconnected' | 'qr_code_pending';
    instance_name?: string;
    phone_number?: string;
    messages_sent?: number;
    messages_received?: number;
    qr_code?: string;
  };
  telegram: {
    status: 'connected' | 'disconnected';
    bot_username?: string;
    bot_token?: string;
    messages_sent?: number;
    messages_received?: number;
  };
  web_widget: {
    status: 'active' | 'inactive';
    embed_code?: string;
    custom_color?: string;
    greeting_message?: string;
  };
  api: {
    status: 'active';
    endpoint_url: string;
    api_key?: string;
  };
}

export default function CanaisPage() {
  const [channels] = useState<ChannelStatus | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [whatsappInstanceName, setWhatsappInstanceName] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [showWhatsappForm, setShowWhatsappForm] = useState(false);
  const [showTelegramForm, setShowTelegramForm] = useState(false);

  // Fetch channel status
  const { data: channelData, refetch: refetchChannels } = useApi(
    async () => {
      // In a real app, this would fetch from the API
      // For now, returning mock data structure
      return {
        whatsapp: {
          status: 'qr_code_pending' as const,
          instance_name: 'bot-support',
          qr_code:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        },
        telegram: {
          status: 'disconnected' as const,
          bot_token: '',
        },
        web_widget: {
          status: 'active' as const,
          embed_code:
            '<script src="https://techlicense.com/widget.js" data-bot-id="your-bot-id"></script>',
          custom_color: '#3B82F6',
          greeting_message: 'Olá! Como posso ajudá-lo?',
        },
        api: {
          status: 'active' as const,
          endpoint_url: 'https://api.techlicense.com/v1/bots/your-bot-id/chat',
          api_key: 'sk_live_xxxxx',
        },
      };
    },
    { autoFetch: true }
  );

  const whatsappConnect = useApiMutation(async (data: { instance_name: string }) => {
    // Mock implementation - would call actual API
    return { status: 'qr_code_pending', instance_name: data.instance_name };
  });

  const telegramConnect = useApiMutation(async (data: { bot_token: string }) => {
    // Mock implementation - would call actual API
    return { status: 'connected', bot_username: '@mybot', bot_token: data.bot_token };
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

  const currentChannels = channelData || channels;

  return (
    <div className="space-y-8 animate-fadeIn dark:bg-slate-950">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Canais</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Conecte e gerencie seus canais de comunicação
        </p>
      </div>

      {/* WhatsApp Channel */}
      <div className="card dark:bg-slate-900 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <MessageCircle size={20} className="text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                WhatsApp
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Via Evolution API - Conecte seu WhatsApp Business
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
              currentChannels?.whatsapp.status === 'connected'
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : currentChannels?.whatsapp.status === 'qr_code_pending'
                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {currentChannels?.whatsapp.status === 'connected'
              ? 'Conectado'
              : currentChannels?.whatsapp.status === 'qr_code_pending'
                ? 'Aguardando QR Code'
                : 'Desconectado'}
          </span>
        </div>

        {currentChannels?.whatsapp.status === 'connected' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Instância</p>
                <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                  {currentChannels.whatsapp.instance_name}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Telefone</p>
                <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                  {currentChannels.whatsapp.phone_number || '-'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Mensagens Enviadas
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentChannels.whatsapp.messages_sent || 0}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Mensagens Recebidas
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentChannels.whatsapp.messages_received || 0}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary">Desconectar</button>
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="btn-secondary"
              >
                {showQRCode ? 'Ocultar' : 'Ver'} QR Code
              </button>
            </div>
          </div>
        ) : (
          <div>
            {!showWhatsappForm ? (
              <button
                onClick={() => setShowWhatsappForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                Conectar WhatsApp
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
                  <button
                    onClick={() => {
                      setShowWhatsappForm(false);
                      setWhatsappInstanceName('');
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showQRCode && currentChannels?.whatsapp.qr_code && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Escaneie o QR Code com seu WhatsApp:
            </p>
            <img
              src={currentChannels.whatsapp.qr_code}
              alt="QR Code"
              className="w-64 h-64 mx-auto bg-white p-2 rounded"
            />
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
              QR Code expira em 5 minutos
            </p>
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
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Telegram
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Conecte seu bot do Telegram
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
              currentChannels?.telegram.status === 'connected'
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {currentChannels?.telegram.status === 'connected'
              ? 'Conectado'
              : 'Desconectado'}
          </span>
        </div>

        {currentChannels?.telegram.status === 'connected' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Username</p>
                <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                  {currentChannels.telegram.bot_username}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Token</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                      {showBotToken ? currentChannels.telegram.bot_token : '••••••••••'}
                    </p>
                    <button
                      onClick={() => setShowBotToken(!showBotToken)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                    >
                      {showBotToken ? (
                        <EyeOff size={16} className="text-slate-500" />
                      ) : (
                        <Eye size={16} className="text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Mensagens Enviadas
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentChannels.telegram.messages_sent || 0}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Mensagens Recebidas
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentChannels.telegram.messages_received || 0}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary">Desconectar</button>
            </div>
          </div>
        ) : (
          <div>
            {!showTelegramForm ? (
              <button
                onClick={() => setShowTelegramForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                Conectar Telegram
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Token do Bot (do @BotFather)
                  </label>
                  <input
                    type="password"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    className="input-field"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Você pode obter o token do @BotFather no Telegram
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleTelegramConnect}
                    disabled={telegramConnect.loading || !telegramToken.trim()}
                    className="btn-primary"
                  >
                    {telegramConnect.loading ? 'Conectando...' : 'Conectar'}
                  </button>
                  <button
                    onClick={() => {
                      setShowTelegramForm(false);
                      setTelegramToken('');
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Web Widget Channel */}
      <div className="card dark:bg-slate-900 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Code size={20} className="text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Widget Web
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Embed seu chatbot em qualquer website
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
            Ativo
          </span>
        </div>

        <div className="space-y-4">
          {/* Embed Code */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Código de Embed
            </label>
            <div className="relative">
              <code className="block w-full p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
                {currentChannels?.web_widget.embed_code}
              </code>
              <button
                onClick={() =>
                  handleCopyCode(
                    currentChannels?.web_widget.embed_code || '',
                    'embed_code'
                  )
                }
                className="absolute right-2 top-2 p-2 hover:bg-slate-700 dark:hover:bg-slate-800 rounded transition-colors"
              >
                {copiedCode === 'embed_code' ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} className="text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Customization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Cor Personalizada
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  defaultValue={currentChannels?.web_widget.custom_color || '#3B82F6'}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  defaultValue={currentChannels?.web_widget.custom_color || '#3B82F6'}
                  className="input-field flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Mensagem de Boas-vindas
              </label>
              <input
                type="text"
                defaultValue={
                  currentChannels?.web_widget.greeting_message ||
                  'Olá! Como posso ajudá-lo?'
                }
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Pré-visualização
            </label>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800 h-64 flex items-end justify-end">
              <div className="w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden">
                <div
                  className="p-4 text-white"
                  style={{
                    backgroundColor:
                      currentChannels?.web_widget.custom_color || '#3B82F6',
                  }}
                >
                  <p className="font-semibold">Chat</p>
                </div>
                <div className="p-4 text-sm text-slate-600 dark:text-slate-300">
                  {currentChannels?.web_widget.greeting_message ||
                    'Olá! Como posso ajudá-lo?'}
                </div>
              </div>
            </div>
          </div>

          <button className="btn-primary">Salvar Personalizações</button>
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
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                API Direta
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Integre via API REST
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
            Ativo
          </span>
        </div>

        <div className="space-y-4">
          {/* Endpoint */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              URL do Endpoint
            </label>
            <div className="relative">
              <code className="block w-full p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
                {currentChannels?.api.endpoint_url}
              </code>
              <button
                onClick={() =>
                  handleCopyCode(
                    currentChannels?.api.endpoint_url || '',
                    'endpoint'
                  )
                }
                className="absolute right-2 top-2 p-2 hover:bg-slate-700 dark:hover:bg-slate-800 rounded transition-colors"
              >
                {copiedCode === 'endpoint' ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} className="text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Chave da API
            </label>
            <div className="relative">
              <code className="block w-full p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
                {showBotToken
                  ? currentChannels?.api.api_key
                  : '••••••••••••••••••••'}
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

          {/* Documentation Link */}
          <a
            href="/api/docs"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Ver Documentação Completa
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
            Você pode selecionar qual bot responde em cada canal e ativar
            respostas automáticas nas configurações avançadas.
          </p>
        </div>
      </div>
    </div>
  );
}
