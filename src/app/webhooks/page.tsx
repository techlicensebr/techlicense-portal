'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  MoreVertical,
  Webhook,
  Link as LinkIcon,
  Calendar,
  CheckCircle,
  AlertCircle,
  Play,
} from 'lucide-react';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { apiClient, WebhookData } from '@/lib/api';

const WEBHOOK_EVENTS = [
  'message_received',
  'message_sent',
  'conversation_started',
  'conversation_ended',
  'bot_created',
  'bot_updated',
];

export default function WebhooksPage() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
  });

  // Fetch webhooks
  const { data: webhooksData, loading: webhooksLoading, refetch } = useApi(
    () => apiClient.getWebhooks(),
    { autoFetch: true }
  );

  const webhooks = webhooksData?.webhooks || [];

  // Create webhook mutation
  const createMutation = useApiMutation<WebhookData, Partial<WebhookData>>(
    (data) => apiClient.createWebhook(data)
  );

  // Update webhook mutation
  const updateMutation = useApiMutation<WebhookData, { id: string; data: Partial<WebhookData> }>(
    ({ id, data }) => apiClient.updateWebhook(id, data)
  );

  // Delete webhook mutation
  const deleteMutation = useApiMutation<void, string>(
    (id) => apiClient.deleteWebhook(id)
  );

  // Test webhook mutation
  const testMutation = useApiMutation<void, string>(
    (id) => apiClient.testWebhook(id)
  );

  // Get webhook logs
  const { data: logsData, loading: logsLoading } = useApi(
    () =>
      showLogsModal ? apiClient.getWebhookLogs(showLogsModal) : Promise.resolve(null),
    { autoFetch: !!showLogsModal }
  );

  const webhookLogs = logsData?.logs || [];

  const handleCreateWebhook = async () => {
    if (formData.name.trim() && formData.url.trim()) {
      try {
        const webhookData: Partial<WebhookData> = {
          url: formData.url,
          event_type: formData.events.join(','),
          active: true,
        };

        if (editingId) {
          await updateMutation.mutate({
            id: editingId,
            data: webhookData,
          });
        } else {
          await createMutation.mutate(webhookData);
        }

        setFormData({ name: '', url: '', events: [] });
        setShowNewModal(false);
        setEditingId(null);
        refetch();
      } catch (error) {
        console.error('Erro ao salvar webhook:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutate(id);
      setShowDeleteConfirm(null);
      setOpenMenu(null);
      refetch();
    } catch (error) {
      console.error('Erro ao deletar webhook:', error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const webhook = webhooks.find((w) => w.id === id);
    if (webhook) {
      try {
        await updateMutation.mutate({
          id,
          data: { active: !webhook.active },
        });
        setOpenMenu(null);
        refetch();
      } catch (error) {
        console.error('Erro ao alternar status:', error);
      }
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      await testMutation.mutate(id);
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      {/* Cabeçalho da página */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Webhooks
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Receba notificações em tempo real para eventos
          </p>
        </div>
        <button
          onClick={() => {
            setShowNewModal(true);
            setEditingId(null);
            setFormData({ name: '', url: '', events: [] });
          }}
          className="btn-primary flex items-center justify-center gap-2 md:w-auto"
        >
          <Plus size={20} />
          Novo Webhook
        </button>
      </div>

      {/* Cartão informativo */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Como funciona:</strong> Webhooks permitem receber notificações
          automáticas quando eventos ocorrem. Enviaremos uma requisição POST para sua
          URL com os dados do evento.
        </p>
      </div>

      {/* Lista de webhooks */}
      <div className="space-y-4">
        {webhooksLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse card"
              />
            ))}
          </div>
        ) : webhooks.length === 0 ? (
          <div className="card dark:bg-slate-800 dark:border-slate-700 text-center py-12">
            <Webhook size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Nenhum webhook ainda
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Crie seu primeiro webhook para começar
            </p>
            <button
              onClick={() => {
                setShowNewModal(true);
                setFormData({ name: '', url: '', events: [] });
              }}
              className="btn-primary mt-4 inline-flex gap-2"
            >
              <Plus size={18} />
              Novo Webhook
            </button>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <div key={webhook.id} className="card dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {webhook.event_type}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        webhook.active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {webhook.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <LinkIcon size={14} />
                    <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded flex-1 truncate font-mono dark:text-slate-300">
                      {webhook.url}
                    </code>
                  </div>

                  <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      Criada{' '}
                      {new Date(webhook.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleTestWebhook(webhook.id)}
                    disabled={testMutation.loading}
                    className="px-3 py-1 text-sm rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 dark:text-slate-400"
                    title="Testar webhook"
                  >
                    <Play size={14} className="inline mr-1" />
                    Testar
                  </button>

                  <button
                    onClick={() => setShowLogsModal(webhook.id)}
                    className="px-3 py-1 text-sm rounded border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors dark:text-slate-400"
                  >
                    Logs
                  </button>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === webhook.id ? null : webhook.id)
                      }
                      className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <MoreVertical size={16} className="dark:text-slate-400" />
                    </button>

                    {openMenu === webhook.id && (
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => handleToggleStatus(webhook.id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors dark:text-slate-300"
                        >
                          {webhook.active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(webhook.id)}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-600 transition-colors"
                        >
                          <Trash2 size={16} />
                          Deletar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de criar/editar webhook */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingId ? 'Editar Webhook' : 'Criar Novo Webhook'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                  URL do Webhook
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  placeholder="https://example.com/webhooks"
                  className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                  Eventos
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700">
                  {WEBHOOK_EVENTS.map((event) => (
                    <label
                      key={event}
                      className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              events: [...formData.events, event],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              events: formData.events.filter((ev) => ev !== event),
                            });
                          }
                        }}
                        className="rounded dark:bg-slate-600"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {event === 'message_received' && 'Mensagem recebida'}
                        {event === 'message_sent' && 'Mensagem enviada'}
                        {event === 'conversation_started' && 'Conversa iniciada'}
                        {event === 'conversation_ended' && 'Conversa encerrada'}
                        {event === 'bot_created' && 'Bot criado'}
                        {event === 'bot_updated' && 'Bot atualizado'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setEditingId(null);
                  setFormData({ name: '', url: '', events: [] });
                }}
                className="btn-secondary dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateWebhook}
                disabled={
                  !formData.url.trim() ||
                  formData.events.length === 0 ||
                  createMutation.loading ||
                  updateMutation.loading
                }
                className="btn-primary disabled:opacity-50"
              >
                {createMutation.loading || updateMutation.loading
                  ? 'Salvando...'
                  : editingId
                    ? 'Salvar'
                    : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de logs do webhook */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Logs de Entrega
            </h2>

            {logsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : webhookLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Nenhum log disponível
              </div>
            ) : (
              <div className="space-y-2">
                {webhookLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {log.status === 'success' ? (
                          <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                        ) : (
                          <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                        )}
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {log.event}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            log.status === 'success'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {log.status === 'success' ? 'Sucesso' : 'Falha'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {new Date(log.timestamp).toLocaleString('pt-BR')} • {log.responseTime}ms
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowLogsModal(null)}
                className="btn-secondary w-full dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Confirmar Exclusão
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Tem certeza que deseja excluir este webhook? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleteMutation.loading}
                className="btn-primary disabled:opacity-50"
              >
                {deleteMutation.loading ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
