'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  File,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Brain,
  ChevronDown,
  Loader,
  FileText,
  HardDrive,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

// =====================================================
// Types
// =====================================================

interface Bot {
  id: string;
  name: string;
  status: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  status: string;
  chunk_count?: number;
  created_at: string;
}

// =====================================================
// Helpers
// =====================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'ready':
    case 'processed':
      return { icon: <CheckCircle size={14} className="text-green-400" />, label: 'Processado', color: 'bg-green-400/10 text-green-400 border-green-400/30' };
    case 'processing':
      return { icon: <Clock size={14} className="text-blue-400 animate-spin" />, label: 'Processando...', color: 'bg-blue-400/10 text-blue-400 border-blue-400/30' };
    case 'error':
    case 'failed':
      return { icon: <AlertCircle size={14} className="text-red-400" />, label: 'Erro', color: 'bg-red-400/10 text-red-400 border-red-400/30' };
    default:
      return { icon: <Clock size={14} className="text-gray-400" />, label: status, color: 'bg-gray-400/10 text-gray-400 border-gray-400/30' };
  }
}

// =====================================================
// Main Page
// =====================================================

export default function KnowledgeBasePage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load bots
  useEffect(() => {
    const loadBots = async () => {
      try {
        const res = await apiClient.getBots();
        const botList = res.bots || [];
        setBots(botList);
        if (botList.length > 0 && !selectedBot) {
          setSelectedBot(botList[0].id);
        }
      } catch (err) {
        console.error('Error loading bots:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBots();
  }, [selectedBot]);

  // Load documents for selected bot
  const loadDocuments = useCallback(async () => {
    if (!selectedBot) return;
    try {
      const res = await apiClient.getKnowledgeBase(selectedBot);
      setDocuments(res.documents || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      setDocuments([]);
    }
  }, [selectedBot]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);

  // Upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleFiles = async (files: File[]) => {
    if (!selectedBot) return;
    setUploading(true);
    for (const file of files) {
      try {
        await apiClient.uploadDocument(selectedBot, file);
      } catch (error) {
        console.error('Erro ao enviar:', error);
      }
    }
    setUploading(false);
    loadDocuments();
  };

  const handleDelete = async (docId: string) => {
    if (!selectedBot) return;
    setDeleteLoading(true);
    try {
      await apiClient.deleteDocument(selectedBot, docId);
      setDeleteConfirm(null);
      loadDocuments();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={32} className="animate-spin text-[#D4A843]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain size={28} className="text-[#D4A843]" />
            Base de Conhecimento
          </h1>
          <p className="text-[#808080] mt-1">Envie e gerencie documentos para seus chatbots</p>
        </div>
      </div>

      {/* Bot Selector */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4">
        <label className="block text-sm font-medium text-[#A0A0A0] mb-2">Selecione o Bot</label>
        <div className="relative">
          <select
            value={selectedBot}
            onChange={(e) => setSelectedBot(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border-2 border-[#2a2a2a] rounded-lg text-white appearance-none focus:outline-none focus:border-[#D4A843]"
          >
            {bots.map(bot => (
              <option key={bot.id} value={bot.id}>{bot.name}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#606060] pointer-events-none" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
              <FileText size={20} className="text-[#D4A843]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{documents.length}</p>
              <p className="text-xs text-[#808080]">Documentos</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
              <HardDrive size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatFileSize(totalSize)}</p>
              <p className="text-xs text-[#808080]">Tamanho total</p>
            </div>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-400/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{documents.filter(d => d.status === 'ready' || d.status === 'processed').length}</p>
              <p className="text-xs text-[#808080]">Processados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {selectedBot && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`bg-[#111111] border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragActive ? 'border-[#D4A843] bg-[#D4A843]/5' : 'border-[#2a2a2a] hover:border-[#404040]'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader size={48} className="mx-auto text-[#D4A843] mb-4 animate-spin" />
          ) : (
            <Upload size={48} className="mx-auto text-[#606060] mb-4" />
          )}
          <h3 className="text-lg font-semibold text-white">
            {uploading ? 'Enviando...' : 'Arraste arquivos aqui ou clique para selecionar'}
          </h3>
          <p className="text-sm text-[#606060] mt-2">Formatos suportados: PDF, TXT, DOCX, CSV (máx. 25MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.docx,.csv"
            onChange={(e) => { if (e.target.files) handleFiles(Array.from(e.target.files)); }}
            className="hidden"
          />
        </div>
      )}

      {/* Documents List */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl">
        {/* Search */}
        <div className="p-4 border-b border-[#2a2a2a]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606060]" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#505050] focus:outline-none focus:border-[#D4A843]"
            />
          </div>
        </div>

        {/* Table */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <File size={40} className="mx-auto text-[#404040] mb-3" />
            <p className="text-[#606060]">
              {documents.length === 0 ? 'Nenhum documento. Envie seu primeiro arquivo!' : 'Nenhum resultado para a busca.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#808080] uppercase tracking-wider">Nome</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#808080] uppercase tracking-wider">Tipo</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#808080] uppercase tracking-wider">Tamanho</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#808080] uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#808080] uppercase tracking-wider">Data</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#808080] uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map(doc => {
                  const statusCfg = getStatusConfig(doc.status);
                  return (
                    <tr key={doc.id} className="border-b border-[#1a1a1a] hover:bg-[#0a0a0a] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <File size={16} className="text-[#606060] shrink-0" />
                          <span className="text-sm font-medium text-white truncate max-w-[200px]">{doc.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#808080]">{(doc.type || '').toUpperCase()}</td>
                      <td className="py-3 px-4 text-sm text-[#808080]">{formatFileSize(doc.size)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${statusCfg.color}`}>
                          {statusCfg.icon} {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-[#808080]">
                        {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setDeleteConfirm(doc.id)}
                          className="p-2 text-[#606060] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Excluir documento"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-[#D4A843]/5 border border-[#D4A843]/20 rounded-xl p-4">
        <p className="text-sm text-[#D4A843]">
          <strong>Como funciona:</strong> Envie documentos e o TechLicense automaticamente dividirá e incorporará na base de conhecimento.
          Seus chatbots usarão essas informações via RAG para respostas mais precisas.
        </p>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold text-white mb-2">Confirmar Exclusão</h2>
            <p className="text-[#808080] mb-6">Tem certeza que deseja excluir este documento? Os chunks associados também serão removidos.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333] transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                {deleteLoading && <Loader size={14} className="animate-spin" />}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
