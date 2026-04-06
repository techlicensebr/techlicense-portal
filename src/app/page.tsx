'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  TrendingUp,
  Zap,
  Smile,
  Plus,
  Upload,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

interface KPICard {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  color: string;
}

interface RecentConversation {
  id: string;
  botName: string;
  userMessage: string;
  timestamp: string;
  status: 'active' | 'completed';
}

export default function Dashboard() {
  const [kpis] = useState<KPICard[]>([
    {
      title: 'Active Conversations',
      value: 1247,
      change: '+12% from yesterday',
      icon: <MessageSquare size={24} />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Messages Today',
      value: 3891,
      change: '+8% from yesterday',
      icon: <TrendingUp size={24} />,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'AI Tokens Used',
      value: '2.3M',
      change: '+15% from yesterday',
      icon: <Zap size={24} />,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'CSAT Score',
      value: '4.8/5',
      change: '+0.2 from yesterday',
      icon: <Smile size={24} />,
      color: 'bg-purple-100 text-purple-600',
    },
  ]);

  const [recentConversations] = useState<RecentConversation[]>([
    {
      id: '1',
      botName: 'Support Agent',
      userMessage: 'How do I reset my password?',
      timestamp: '2 minutes ago',
      status: 'active',
    },
    {
      id: '2',
      botName: 'Sales Assistant',
      userMessage: 'What are the pricing options?',
      timestamp: '5 minutes ago',
      status: 'completed',
    },
    {
      id: '3',
      botName: 'Support Agent',
      userMessage: 'I need help with billing',
      timestamp: '12 minutes ago',
      status: 'active',
    },
    {
      id: '4',
      botName: 'FAQ Bot',
      userMessage: 'When will the new feature be available?',
      timestamp: '28 minutes ago',
      status: 'completed',
    },
    {
      id: '5',
      botName: 'Sales Assistant',
      userMessage: 'Can you schedule a demo?',
      timestamp: '1 hour ago',
      status: 'completed',
    },
  ]);

  const [chartData] = useState<{ time: string; messages: number }[]>([
    { time: '12:00 AM', messages: 45 },
    { time: '4:00 AM', messages: 32 },
    { time: '8:00 AM', messages: 156 },
    { time: '12:00 PM', messages: 389 },
    { time: '4:00 PM', messages: 521 },
    { time: '8:00 PM', messages: 478 },
    { time: '11:59 PM', messages: 234 },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here's your performance overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">{kpi.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{kpi.value}</p>
                <p className="text-xs text-green-600 mt-2">{kpi.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${kpi.color}`}>{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold mb-4">Messages Over Time</h2>
          <div className="h-64 flex items-end gap-2">
            {chartData.map((data, index) => {
              const maxMessages = Math.max(...chartData.map(d => d.messages));
              const height = (data.messages / maxMessages) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2 group"
                  title={`${data.messages} messages at ${data.time}`}
                >
                  <div
                    className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-colors cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-slate-600 text-center">{data.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/bots"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Create Bot</p>
              </div>
              <ArrowRight size={16} className="text-slate-400" />
            </Link>

            <Link
              href="/knowledge"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <Upload size={18} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Upload KB</p>
              </div>
              <ArrowRight size={16} className="text-slate-400" />
            </Link>

            <Link
              href="/analytics"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 size={18} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">View Analytics</p>
              </div>
              <ArrowRight size={16} className="text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent conversations */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Conversations</h2>
          <Link href="/conversations" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Bot Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">User Message</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentConversations.map((conv) => (
                <tr key={conv.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium">{conv.botName}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{conv.userMessage}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        conv.status === 'active'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {conv.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">{conv.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
