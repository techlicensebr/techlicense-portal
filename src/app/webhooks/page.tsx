'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  MoreVertical,
  Edit,
  Webhook,
  Link as LinkIcon,
  Calendar,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface WebhookEvent {
  name: string;
  enabled: boolean;
}

interface WebhookLog {
  id: string;
  event: string;
  status: 'success' | 'failed';
  timestamp: string;
  responseTime: number;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  status: 'active' | 'inactive';
  createdAt: string;
  lastTriggered: string;
  failedAttempts: number;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: '1',
      name: 'Conversation Started',
      url: 'https://example.com/webhooks/conversation-started',
      events: [
        { name: 'conversation.started', enabled: true },
        { name: 'conversation.ended', enabled: true },
      ],
      status: 'active',
      createdAt: '2024-01-15',
      lastTriggered: '2 minutes ago',
      failedAttempts: 0,
    },
    {
      id: '2',
      name: 'Analytics Sync',
      url: 'https://example.com/webhooks/analytics',
      events: [
        { name: 'analytics.updated', enabled: true },
      ],
      status: 'active',
      createdAt: '2024-02-20',
      lastTriggered: '1 hour ago',
      failedAttempts: 2,
    },
  ]);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    url: '',
  });

  const availableEvents = [
    'conversation.started',
    'conversation.ended',
    'conversation.archived',
    'message.received',
    'message.sent',
    'analytics.updated',
    'bot.created',
    'bot.updated',
    'bot.deleted',
    'knowledge.uploaded',
    'knowledge.deleted',
  ];

  const webhookLogs: WebhookLog[] = [
    {
      id: '1',
      event: 'conversation.started',
      status: 'success',
      timestamp: '2 minutes ago',
      responseTime: 145,
    },
    {
      id: '2',
      event: 'message.received',
      status: 'success',
      timestamp: '5 minutes ago',
      responseTime: 238,
    },
    {
      id: '3',
      event: 'analytics.updated',
      status: 'failed',
      timestamp: '1 hour ago',
      responseTime: 5000,
    },
  ];

  const handleCreateWebhook = () => {
    if (formData.name.trim() && formData.url.trim()) {
      const newWebhook: Webhook = {
        id: Date.now().toString(),
        name: formData.name,
        url: formData.url,
        events: availableEvents.map((event) => ({ name: event, enabled: false })),
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastTriggered: 'Never',
        failedAttempts: 0,
      };
      setWebhooks([...webhooks, newWebhook]);
      setFormData({ name: '', url: '' });
      setShowNewModal(false);
    }
  };

  const handleDelete = (id: string) => {
    setWebhooks(webhooks.filter((webhook) => webhook.id !== id));
    setOpenMenu(null);
  };

  const handleToggleStatus = (id: string) => {
    setWebhooks(
      webhooks.map((webhook) =>
        webhook.id === id
          ? { ...webhook, status: webhook.status === 'active' ? 'inactive' : 'active' }
          : webhook
      )
    );
    setOpenMenu(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Webhooks</h1>
          <p className="text-slate-600">Receive real-time notifications for events</p>
        </div>
        <button
          onClick={() => {
            setShowNewModal(true);
            setEditingId(null);
            setFormData({ name: '', url: '' });
          }}
          className="btn-primary flex items-center justify-center gap-2 md:w-auto"
        >
          <Plus size={20} />
          Create Webhook
        </button>
      </div>

      {/* Info card */}
      <div className="card bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> Webhooks allow you to automatically receive notifications when events occur. We'll send a POST request to your URL with event data.
        </p>
      </div>

      {/* Webhooks list */}
      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <div className="card text-center py-12">
            <Webhook size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No webhooks yet</h3>
            <p className="text-slate-600 text-sm mt-2">Create your first webhook to get started</p>
            <button
              onClick={() => {
                setShowNewModal(true);
                setFormData({ name: '', url: '' });
              }}
              className="btn-primary mt-4 inline-flex gap-2"
            >
              <Plus size={18} />
              Create Webhook
            </button>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <div key={webhook.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">{webhook.name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        webhook.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {webhook.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    {webhook.failedAttempts > 0 && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                        {webhook.failedAttempts} failed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                    <LinkIcon size={14} />
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded flex-1 truncate font-mono">
                      {webhook.url}
                    </code>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {webhook.events.filter((e) => e.enabled).map((event) => (
                      <span key={event.name} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {event.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      Created {webhook.createdAt}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      Last triggered {webhook.lastTriggered}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setShowLogsModal(true);
                    }}
                    className="px-3 py-1 text-sm rounded border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Logs
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === webhook.id ? null : webhook.id)}
                      className="p-2 rounded hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenu === webhook.id && (
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => {
                            setEditingId(webhook.id);
                            setFormData({ name: webhook.name, url: webhook.url });
                            setShowNewModal(true);
                            setOpenMenu(null);
                          }}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(webhook.id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
                        >
                          {webhook.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(webhook.id)}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
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

      {/* Create/Edit webhook modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Webhook' : 'Create Webhook'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Webhook Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Conversation Tracker"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Endpoint URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/webhooks"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Events</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2">
                  {availableEvents.map((event) => (
                    <label key={event} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                      <input
                        type="checkbox"
                        defaultChecked={false}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-700">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setEditingId(null);
                  setFormData({ name: '', url: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWebhook}
                disabled={!formData.name.trim() || !formData.url.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {editingId ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook logs modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Webhook Logs</h2>

            <div className="space-y-2">
              {webhookLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <AlertCircle size={16} className="text-red-600" />
                      )}
                      <span className="text-sm font-medium text-slate-900">{log.event}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {log.timestamp} • {log.responseTime}ms
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowLogsModal(false)}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
