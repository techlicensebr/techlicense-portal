'use client';

import React, { useState } from 'react';
import { Plus, Copy, MoreVertical, Eye, EyeOff, Key, Calendar } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  maskedKey: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'inactive';
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production Key',
      key: 'tl_live_abc123def456ghi789jkl012mno',
      maskedKey: 'tl_live_***...jkl012mno',
      createdAt: '2024-01-15',
      lastUsed: '2 minutes ago',
      status: 'active',
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'tl_test_xyz987uvw654tsr321qpo098nml',
      maskedKey: 'tl_test_***...qpo098nml',
      createdAt: '2024-02-20',
      lastUsed: '1 hour ago',
      status: 'active',
    },
    {
      id: '3',
      name: 'Legacy Key',
      key: 'tl_live_old123key456string789end',
      maskedKey: 'tl_live_***...789end',
      createdAt: '2023-12-10',
      lastUsed: '7 days ago',
      status: 'inactive',
    },
  ]);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKey, setVisibleKey] = useState<string | null>(null);

  const handleCreateKey = () => {
    if (newKeyName.trim()) {
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: `tl_live_${Math.random().toString(36).substr(2, 28)}`,
        maskedKey: `tl_live_***...${Math.random().toString(36).substr(2, 8)}`,
        createdAt: new Date().toISOString().split('T')[0],
        lastUsed: 'Never',
        status: 'active',
      };
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      setShowNewKeyModal(false);
    }
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id));
    setOpenMenu(null);
  };

  const handleToggleStatus = (id: string) => {
    setApiKeys(
      apiKeys.map((key) =>
        key.id === id
          ? { ...key, status: key.status === 'active' ? 'inactive' : 'active' }
          : key
      )
    );
    setOpenMenu(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">API Keys</h1>
          <p className="text-slate-600">Manage your API credentials for authentication</p>
        </div>
        <button
          onClick={() => setShowNewKeyModal(true)}
          className="btn-primary flex items-center justify-center gap-2 md:w-auto"
        >
          <Plus size={20} />
          Create API Key
        </button>
      </div>

      {/* Info card */}
      <div className="card bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Security:</strong> Never share your API keys. Store them securely and rotate them periodically. If you suspect a key has been compromised, delete it immediately.
        </p>
      </div>

      {/* API Keys list */}
      <div className="card">
        {apiKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No API keys yet</h3>
            <p className="text-slate-600 text-sm mt-2">Create your first API key to get started</p>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="btn-primary mt-4 inline-flex gap-2"
            >
              <Plus size={18} />
              Create API Key
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">{apiKey.name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        apiKey.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {apiKey.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mt-3">
                    {/* Key display */}
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-slate-100 px-3 py-2 rounded flex-1 font-mono truncate">
                        {visibleKey === apiKey.id ? apiKey.key : apiKey.maskedKey}
                      </code>
                      <button
                        onClick={() => setVisibleKey(visibleKey === apiKey.id ? null : apiKey.id)}
                        className="p-2 rounded hover:bg-slate-200 transition-colors"
                        title={visibleKey === apiKey.id ? 'Hide' : 'Show'}
                      >
                        {visibleKey === apiKey.id ? (
                          <EyeOff size={16} className="text-slate-600" />
                        ) : (
                          <Eye size={16} className="text-slate-600" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
                        className="p-2 rounded hover:bg-slate-200 transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy size={16} className={copiedId === apiKey.id ? 'text-green-600' : 'text-slate-600'} />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col sm:flex-row gap-4 text-xs text-slate-600 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        Created {apiKey.createdAt}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        Last used {apiKey.lastUsed}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <div className="relative ml-2 flex-shrink-0">
                  <button
                    onClick={() => setOpenMenu(openMenu === apiKey.id ? null : apiKey.id)}
                    className="p-2 rounded hover:bg-slate-200 transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {openMenu === apiKey.id && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleToggleStatus(apiKey.id)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
                      >
                        {apiKey.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(apiKey.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentation card */}
      <div className="card bg-slate-50 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3">Using Your API Key</h3>
        <p className="text-sm text-slate-700 mb-3">Include your API key in the Authorization header:</p>
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs font-mono">
          {`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://techlicense-chatbot-api.techlicensebr.workers.dev/v1/bots`}
        </pre>
        <p className="text-xs text-slate-600 mt-3">
          For more information, see the{' '}
          <a href="#" className="text-blue-600 hover:underline">
            API documentation
          </a>
        </p>
      </div>

      {/* Create key modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Create API Key</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Key Name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API"
                className="input-field"
                autoFocus
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                Save your key securely. You won't be able to see it again.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewKeyModal(false);
                  setNewKeyName('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                disabled={!newKeyName.trim()}
                className="btn-primary disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
