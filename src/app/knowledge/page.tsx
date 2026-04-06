'use client';

import React, { useState } from 'react';
import { Upload, File, Trash2, Download, MoreVertical, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  chunks: number;
  tokens: number;
}

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Product Documentation.pdf',
      size: 2.5,
      uploadedAt: '2024-04-01',
      status: 'ready',
      chunks: 145,
      tokens: 45230,
    },
    {
      id: '2',
      name: 'FAQ.docx',
      size: 0.8,
      uploadedAt: '2024-04-02',
      status: 'ready',
      chunks: 32,
      tokens: 8450,
    },
    {
      id: '3',
      name: 'Pricing Guide.pdf',
      size: 1.2,
      uploadedAt: '2024-04-03',
      status: 'processing',
      chunks: 0,
      tokens: 0,
    },
    {
      id: '4',
      name: 'Terms of Service.txt',
      size: 0.5,
      uploadedAt: '2024-04-04',
      status: 'ready',
      chunks: 12,
      tokens: 3200,
    },
  ]);

  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTokens = documents.reduce((sum, doc) => sum + doc.tokens, 0);
  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunks, 0);

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
      // Simulate file upload
      Array.from(files).forEach((file) => {
        const newDoc: Document = {
          id: Date.now().toString(),
          name: file.name,
          size: file.size / (1024 * 1024),
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'processing',
          chunks: 0,
          tokens: 0,
        };
        setDocuments([...documents, newDoc]);
      });
    }
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    setOpenMenu(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'processing':
        return <Clock size={16} className="text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Knowledge Base</h1>
        <p className="text-slate-600">Upload and manage documents for your chatbots</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-slate-600 text-sm font-medium">Total Chunks</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalChunks}</p>
          <p className="text-xs text-slate-500 mt-2">From {documents.length} documents</p>
        </div>
        <div className="card">
          <p className="text-slate-600 text-sm font-medium">Tokens Used</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalTokens.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">For embeddings and processing</p>
        </div>
      </div>

      {/* Upload area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`card border-2 border-dashed transition-all ${
          dragActive ? 'border-blue-600 bg-blue-50' : 'border-slate-300'
        }`}
      >
        <div className="text-center py-12">
          <Upload size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Drag files to upload</h3>
          <p className="text-slate-600 text-sm mt-2 mb-4">or click the button below</p>
          <button className="btn-primary">
            Select Files
          </button>
          <p className="text-xs text-slate-500 mt-4">
            Supported formats: PDF, DOCX, TXT, MD, CSV (Max 25MB each)
          </p>
        </div>
      </div>

      {/* Documents section */}
      <div className="card">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Documents table */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            <File size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Size</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Chunks</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Tokens</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Uploaded</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <File size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-900 truncate">{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(doc.status)}`}>
                          {doc.status === 'processing' ? 'Processing...' : doc.status === 'ready' ? 'Ready' : 'Error'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{doc.size.toFixed(2)} MB</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{doc.chunks}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{doc.tokens.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{doc.uploadedAt}</td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === doc.id ? null : doc.id)}
                          className="p-2 rounded hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === doc.id && (
                          <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                            <button className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 transition-colors">
                              <Download size={16} />
                              Download
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                              Delete
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

      {/* Info card */}
      <div className="card bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> Upload documents and TechLicense will automatically chunk and embed them into your knowledge base. Your chatbots will use this information to provide accurate responses.
        </p>
      </div>
    </div>
  );
}
