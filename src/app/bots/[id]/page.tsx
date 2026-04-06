'use client';

export const runtime = 'edge';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface BotConfig {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  guardrails: string[];
  channels: string[];
}

export default function BotDetailPage() {
  const params = useParams();
  const botId = params.id as string;

  const [activeTab, setActiveTab] = useState<'general' | 'model' | 'prompt' | 'guardrails' | 'channels'>('general');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState<BotConfig>({
    id: botId,
    name: 'Support Agent',
    description: 'Customer support chatbot for technical issues',
    status: 'active',
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'You are a helpful customer support agent. Be polite, professional, and always try to resolve the customer\'s issue.',
    guardrails: ['No inappropriate language', 'No sensitive data sharing', 'No off-topic discussions'],
    channels: ['web', 'whatsapp', 'telegram'],
  });

  const [newGuardrail, setNewGuardrail] = useState('');
  const [newChannel, setNewChannel] = useState('');

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuardrail = () => {
    if (newGuardrail.trim()) {
      setConfig({
        ...config,
        guardrails: [...config.guardrails, newGuardrail],
      });
      setNewGuardrail('');
    }
  };

  const handleRemoveGuardrail = (index: number) => {
    setConfig({
      ...config,
      guardrails: config.guardrails.filter((_, i) => i !== index),
    });
  };

  const handleAddChannel = () => {
    if (newChannel.trim() && !config.channels.includes(newChannel)) {
      setConfig({
        ...config,
        channels: [...config.channels, newChannel],
      });
      setNewChannel('');
    }
  };

  const handleRemoveChannel = (channel: string) => {
    setConfig({
      ...config,
      channels: config.channels.filter((c) => c !== channel),
    });
  };

  const tabs = [
    { id: 'general' as const, label: 'General' },
    { id: 'model' as const, label: 'AI Model' },
    { id: 'prompt' as const, label: 'System Prompt' },
    { id: 'guardrails' as const, label: 'Guardrails' },
    { id: 'channels' as const, label: 'Channels' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link href="/bots" className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{config.name}</h1>
        <p className="text-slate-600 mt-2">{config.description}</p>
      </div>

      {/* Card */}
      <div className="card">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {/* General tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bot Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={config.status}
                  onChange={(e) => setConfig({ ...config, status: e.target.value as 'active' | 'inactive' })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* Model tab */}
          {activeTab === 'model' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
                <select
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="input-field"
                >
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Temperature</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Current: {config.temperature} (Lower = more deterministic, Higher = more creative)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Max Tokens</label>
                <input
                  type="number"
                  value={config.maxTokens}
                  onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                  className="input-field"
                />
                <p className="text-xs text-slate-500 mt-2">Maximum tokens per response</p>
              </div>
            </div>
          )}

          {/* Prompt tab */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">System Prompt</label>
                <textarea
                  value={config.systemPrompt}
                  onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                  className="input-field font-mono text-sm"
                  rows={8}
                  placeholder="Enter the system prompt for this bot..."
                />
                <p className="text-xs text-slate-500 mt-2">This defines the behavior and personality of your bot.</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Use clear, specific instructions to guide the bot's responses. Include context about your business and specific guidelines for interactions.
                </p>
              </div>
            </div>
          )}

          {/* Guardrails tab */}
          {activeTab === 'guardrails' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Add Guardrail</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGuardrail}
                    onChange={(e) => setNewGuardrail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddGuardrail()}
                    placeholder="E.g., No medical advice"
                    className="input-field flex-1"
                  />
                  <button onClick={handleAddGuardrail} className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Active Guardrails</label>
                <div className="space-y-2">
                  {config.guardrails.length === 0 ? (
                    <p className="text-slate-500 text-sm">No guardrails added yet</p>
                  ) : (
                    config.guardrails.map((guardrail, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <span className="text-sm">{guardrail}</span>
                        <button
                          onClick={() => handleRemoveGuardrail(index)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Channels tab */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Add Channel</label>
                <div className="flex gap-2">
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="">Select a channel...</option>
                    <option value="web">Web</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="telegram">Telegram</option>
                    <option value="slack">Slack</option>
                    <option value="discord">Discord</option>
                    <option value="messenger">Messenger</option>
                  </select>
                  <button onClick={handleAddChannel} className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Enabled Channels</label>
                <div className="space-y-2">
                  {config.channels.length === 0 ? (
                    <p className="text-slate-500 text-sm">No channels enabled</p>
                  ) : (
                    config.channels.map((channel) => (
                      <div
                        key={channel}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <span className="text-sm font-medium capitalize">{channel}</span>
                        <button
                          onClick={() => handleRemoveChannel(channel)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-3">
          <Link href="/bots" className="btn-secondary">
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Success message */}
        {saved && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full" />
            <p className="text-sm text-green-800">Bot configuration saved successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
}
