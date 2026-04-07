'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  File,
  Trash2,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
} from 'lucide-react';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { apiClient, KnowledgeDocData } from '@/lib/api';

export default function BaseConhecimentoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // NOTE: This would need a bot_id. For now, using a default/current bot
  const botId = 'default-bot';

  // Fetch documents
  const { data: docsData, loading: docsLoading, refetch } = useApi(
    () => apiClient.getKnowledgeBase(botId),
    { autoFetch: true }
  );

  const documents = docsData?.documents || [];

  // Upload mutation
  const uploadMutation = useApiMutation<KnowledgeDocData, File>(
    (file) => apiClient.uploadDocument(botId, file)
  );

  // Delete mutation
  const deleteMutation = useApiMutation<void, string>(
    (docId) => apiClient.deleteDocument(botId, docId)
  );

  const filteredDocuments = documents.filter((doc: KnowledgeDocData) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTokens = documents.reduce((sum: number, doc: KnowledgeDocData) => sum + (doc.size || 0), 0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(Array.from(files));
    }
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      try {
        await uploadMutation.mutate(file);
        refetch();
      } catch (error) {
        console.error('Erro ao enviar documento:', error);
      }
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await deleteMutation.mutate(docId);
      setShowDeleteConfirm(null);
      setOpenMenu(null);
      refetch();
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle size={16} className="text-green-600 dark:text-green-400" />;
      case 'processing':
        return <Clock size={16} className="text-blue-600 dark:text-blue-400 animate-spin" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing':
        return 'Processando...';
      case 'ready':
        return 'Processado';
      case 'error':
        return 'Erro';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabeçalho da página */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Base de Conhecimento
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Envie e gerencie documentos para seus chatbots
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Total de Documentos
          </p>
          {docsLoading ? (
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {documents.length}
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            Documentos salvos
          </p>
        </div>
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Tamanho Total
          </p>
          {docsLoading ? (
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {(totalTokens / 1024).toFixed(1)} MB
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            Espaço utilizado
          </p>
        </div>
      </div>

      {/* Área de upload */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`card border-2 border-dashed transition-all dark:bg-slate-800 dark:border-slate-600 ${
          dragActive
            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
            : 'border-slate-300 dark:border-slate-600'
        }`}
      >
        <div className="text-center py-12">
          <Upload size={48} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Arraste arquivos aqui ou clique para selecionar
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 mb-4">
            Formatos suportados: PDF, TXT, DOCX, CSV
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
          >
            Enviar Documento
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.docx,.csv"
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(Array.from(e.target.files));
              }
            }}
            className="hidden"
          />
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">
            Máximo 25MB por arquivo
          </p>
        </div>
      </div>

      {/* Seção de documentos */}
      <div className="card dark:bg-slate-800 dark:border-slate-700">
        {/* Busca */}
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
            />
          </div>
        </div>

        {/* Tabela de documentos */}
        {docsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
              />
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            <File size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              Nenhum documento encontrado. Envie seu primeiro documento!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Nome
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Tamanho
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Data de Envio
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc: KnowledgeDocData) => (
                  <tr
                    key={doc.id}
                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <File size={16} className="text-slate-400 dark:text-slate-500" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {doc.type?.toUpperCase() || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {(doc.size / 1024).toFixed(1)} MB
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(doc.status)}`}>
                          {getStatusText(doc.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenu(openMenu === doc.id ? null : doc.id)
                          }
                          className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                        >
                          <MoreVertical size={16} className="dark:text-slate-400" />
                        </button>
                        {openMenu === doc.id && (
                          <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => setShowDeleteConfirm(doc.id)}
                              className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-600 transition-colors"
                            >
                              <Trash2 size={16} />
                              Deletar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cartão informativo */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Como funciona:</strong> Envie documentos e o TechLicense
          automaticamente dividirá e incorporará na sua base de conhecimento. Seus
          chatbots usarão essas informações para respostas mais precisas.
        </p>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Confirmar Exclusão
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Tem certeza que deseja excluir este documento? Esta ação não pode ser
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
