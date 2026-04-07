'use client';

import React, { useState } from 'react';
import {
  Plus,
  Copy,
  MoreVertical,
  Eye,
  EyeOff,
  Key,
  Calendar,
} from 'lucide-react';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { apiClient, ApiKeyData } from '@/lib/api';

export default function ChavedaAPIPage() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKey, setVisibleKey] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch API keys
  const { data: keysData, loading: keysLoading, refetch } = useApi(
    () => apiClient.getApiKeys(),
    { autoFetch: true }
  );

  const apiKeys = keysData?.keys || [];

  // Create key mutation
  const createMutation = useApiMutation<ApiKeyData, string>(
    (name) => apiClient.createApiKey(name)
  );

  // Delete key mutation
  const deleteMutation = useApiMutation<void, string>(
    (keyId) => apiClient.deleteApiKey(keyId)
  );

  // Toggle key status mutation
  const toggleMutation = useApiMutation<ApiKeyData, string>(
    (keyId) => apiClient.toggleApiKey(keyId)
  );

  const handleCreateKey = async () => {
    if (newKeyName.trim()) {
      try {
        await createMutation.mutate(newKeyName);
        setNewKeyName('');
        setShowNewKeyModal(false);
        refetch();
      } catch (error) {
        console.error('Erro ao criar chave:', error);
      }
    }
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (keyId: string) => {
    try {
      await deleteMutation.mutate(keyId);
      setShowDeleteConfirm(null);
      setOpenMenu(null);
      refetch();
    } catch (error) {
      console.error('Erro ao deletar chave:', error);
    }
  };

  const handleToggleStatus = async (keyId: string) => {
    try {
      await toggleMutation.mutate(keyId);
      setOpenMenu(null);
      refetch();
    } catch (error) {
      console.error('Erro ao alternar status:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Cabeçalho da página */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Chaves de API
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gerencie suas credenciais de API para autenticação
          </p>
        </div>
        <button
          onClick={() => setShowNewKeyModal(true)}
          className="btn-primary flex items-center justify-center gap-2 md:w-auto"
        >
          <Plus size={20} />
          Nova Chave
        </button>
      </div>

      {/* Cartão informativo */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Segurança:</strong> Nunca compartilhe suas chaves de API.
          Guarde-as em um lugar seguro e rotacione periodicamente. Se suspeitar que
          uma chave foi comprometida, delete-a imediatamente.
        </p>
      </div>

      {/* Lista de chaves */}
      <div className="card dark:bg-slate-800 dark:border-slate-700">
        {keysLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
              />
            ))}
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Nenhuma chave de API ainda
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              Crie sua primeira chave de API para começar
            </p>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="btn-primary mt-4 inline-flex gap-2"
            >
              <Plus size={18} />
              Nova Chave
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((apiKey: ApiKeyData) => (
              <div
                key={apiKey.id}
                className="flex items-start justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {apiKey.name}
                    </h3>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      Ativa
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mt-3">
                    {/* Exibição da chave */}
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded flex-1 font-mono truncate dark:text-slate-300">
                        {visibleKey === apiKey.id ? apiKey.key : `${apiKey.key.substring(0, 15)}...`}
                      </code>
                      <button
                        onClick={() =>
                          setVisibleKey(
                            visibleKey === apiKey.id ? null : apiKey.id
                          )
                        }
                        className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        title={visibleKey === apiKey.id ? 'Ocultar' : 'Mostrar'}
                      >
                        {visibleKey === apiKey.id ? (
                          <EyeOff size={16} className="text-slate-600 dark:text-slate-400" />
                        ) : (
                          <Eye size={16} className="text-slate-600 dark:text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
                        className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        title="Copiar para clipboard"
                      >
                        <Copy
                          size={16}
                          className={
                            copiedId === apiKey.id
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-slate-600 dark:text-slate-400'
                          }
                        />
                      </button>
                    </div>

                    {/* Metadados */}
                    <div className="flex flex-col sm:flex-row gap-4 text-xs text-slate-600 dark:text-slate-400 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        Criada {new Date(apiKey.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        Último uso{' '}
                        {apiKey.last_used ? new Date(apiKey.last_used).toLocaleDateString('pt-BR') : 'Nunca'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <div className="relative ml-2 flex-shrink-0">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === apiKey.id ? null : apiKey.id)
                    }
                    className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <MoreVertical size={16} className="dark:text-slate-400" />
                  </button>

                  {openMenu === apiKey.id && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleToggleStatus(apiKey.id)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors dark:text-slate-300"
                      >
                        Desativar
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(apiKey.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-600 transition-colors"
                      >
                        Deletar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cartão de documentação */}
      <div className="card bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
          Usando Sua Chave de API
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-400 mb-3">
          Inclua sua chave de API no header de Autorização:
        </p>
        <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs font-mono">
          {`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://techlicense-chatbot-api.techlicensebr.workers.dev/v1/bots`}
        </pre>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
          Para mais informações, veja a{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
            documentação da API
          </a>
        </p>
      </div>

      {/* Modal de criação de chave */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Criar Nova Chave de API
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                Nome da Chave
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Ex: API de Produção"
                className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
                autoFocus
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                Guarde sua chave em um lugar seguro. Ela não será exibida novamente.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewKeyModal(false);
                  setNewKeyName('');
                }}
                className="btn-secondary dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateKey}
                disabled={!newKeyName.trim() || createMutation.loading}
                className="btn-primary disabled:opacity-50"
              >
                {createMutation.loading ? 'Criando...' : 'Criar'}
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
              Tem certeza que deseja excluir esta chave? Esta ação não pode ser
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
