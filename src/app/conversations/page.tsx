'use client';

import React, { useState } from 'react';
import { Search, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  botName: string;
  lastMessage: string;
  timestamp: string;
  status: 'active' | 'completed';
  messageCount: number;
  channel: string;
}

export default function ConversationsPage() {
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      userId: 'user-001',
      userName: 'John Doe',
      botName: 'Support Agent',
      lastMessage: 'How do I reset my password?',
      timestamp: '2 minutes ago',
      status: 'active',
      messageCount: 8,
      channel: 'web',
    },
    {
      id: '2',
      userId: 'user-002',
      userName: 'Jane Smith',
      botName: 'Sales Assistant',
      lastMessage: 'What are the pricing options?',
      timestamp: '5 minutes ago',
      status: 'completed',
      messageCount: 12,
      channel: 'whatsapp',
    },
    {
      id: '3',
      userId: 'user-003',
      userName: 'Bob Johnson',
      botName: 'Support Agent',
      lastMessage: 'I need help with billing',
      timestamp: '12 minutes ago',
      status: 'active',
      messageCount: 5,
      channel: 'web',
    },
    {
      id: '4',
      userId: 'user-004',
      userName: 'Alice Brown',
      botName: 'FAQ Bot',
      lastMessage: 'When will the new feature be available?',
      timestamp: '28 minutes ago',
      status: 'completed',
      messageCount: 4,
      channel: 'telegram',
    },
    {
      id: '5',
      userId: 'user-005',
      userName: 'Charlie Wilson',
      botName: 'Sales Assistant',
      lastMessage: 'Can you schedule a demo?',
      timestamp: '1 hour ago',
      status: 'completed',
      messageCount: 15,
      channel: 'web',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMessages, setShowMessages] = useState(false);

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.botName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowMessages(true);
    // Simulate loading messages
    setMessages([
      {
        id: '1',
        role: 'user',
        content: 'Hello, I need help with my account',
        timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString(),
      },
      {
        id: '2',
        role: 'assistant',
        content: 'Hello! I\'m here to help. What seems to be the issue with your account?',
        timestamp: new Date(Date.now() - 4 * 60000).toLocaleTimeString(),
      },
      {
        id: '3',
        role: 'user',
        content: conversation.lastMessage,
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: '4',
        role: 'assistant',
        content: 'I can help you with that! To reset your password, please follow these steps: 1. Click on "Forgot Password" on the login page, 2. Enter your email address, 3. Check your email for the reset link, 4. Create a new password.',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Conversations</h1>
        <p className="text-slate-600">View and manage customer conversations</p>
      </div>

      {/* Layout: 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
        {/* Left: Conversations list */}
        <div className="lg:col-span-1 card flex flex-col">
          {/* Search and filters */}
          <div className="space-y-3 mb-4 pb-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 text-sm">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedConversation?.id === conversation.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{conversation.userName}</p>
                      <p className="text-xs text-slate-500">{conversation.botName}</p>
                      <p className="text-sm text-slate-700 mt-1 line-clamp-2">{conversation.lastMessage}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                        conversation.status === 'active'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {conversation.status === 'active' ? 'Active' : 'Done'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{conversation.timestamp}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Message thread */}
        {showMessages && selectedConversation ? (
          <div className="lg:col-span-2 card flex flex-col">
            {/* Header */}
            <div className="pb-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selectedConversation.userName}</h2>
                  <p className="text-sm text-slate-600">
                    {selectedConversation.botName} • {selectedConversation.messageCount} messages
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedConversation.status === 'active'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {selectedConversation.status === 'active' ? 'Active' : 'Completed'}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.role === 'assistant'
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'assistant'
                          ? 'text-slate-600'
                          : 'text-blue-100'
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="input-field flex-1"
                  disabled
                />
                <button className="btn-primary" disabled>
                  Send
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">This conversation is read-only for management purposes.</p>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 card flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
