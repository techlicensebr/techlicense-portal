'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  MessageSquare,
  Users,
  Clock,
  Zap,
  Download,
} from 'lucide-react';

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  satisfactionScore: number;
  tokensUsed: number;
  activeUsers: number;
}

interface ChartPoint {
  date: string;
  conversations: number;
  messages: number;
  satisfaction: number;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  const analytics: AnalyticsData = {
    totalConversations: 8956,
    totalMessages: 42389,
    avgResponseTime: 1.2,
    satisfactionScore: 4.7,
    tokensUsed: 1234567,
    activeUsers: 2341,
  };

  const chartData: ChartPoint[] = [
    { date: 'Mar 1', conversations: 120, messages: 450, satisfaction: 4.5 },
    { date: 'Mar 5', conversations: 156, messages: 620, satisfaction: 4.6 },
    { date: 'Mar 10', conversations: 189, messages: 780, satisfaction: 4.7 },
    { date: 'Mar 15', conversations: 234, messages: 950, satisfaction: 4.8 },
    { date: 'Mar 20', conversations: 278, messages: 1120, satisfaction: 4.7 },
    { date: 'Mar 25', conversations: 312, messages: 1280, satisfaction: 4.9 },
    { date: 'Apr 1', conversations: 356, messages: 1450, satisfaction: 4.8 },
  ];

  const botStats = [
    {
      name: 'Support Agent',
      conversations: 4234,
      messages: 18923,
      satisfaction: 4.8,
      avgTime: 1.1,
    },
    {
      name: 'Sales Assistant',
      conversations: 2156,
      messages: 12345,
      satisfaction: 4.6,
      avgTime: 1.5,
    },
    {
      name: 'FAQ Bot',
      conversations: 1234,
      messages: 7821,
      satisfaction: 4.5,
      avgTime: 0.8,
    },
    {
      name: 'HR Assistant',
      conversations: 1332,
      messages: 3300,
      satisfaction: 4.9,
      avgTime: 1.0,
    },
  ];

  const maxConversations = Math.max(...chartData.map((d) => d.conversations));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600">Monitor your chatbots performance and usage</p>
        </div>
        <button className="btn-secondary flex items-center justify-center gap-2 md:w-auto">
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Date range selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Last {range === '7d' ? '7' : range === '30d' ? '30' : '90'} days
          </button>
        ))}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Conversations</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{analytics.totalConversations.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-2">+12% from last period</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Messages</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{analytics.totalMessages.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-2">+18% from last period</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Avg Response Time</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{analytics.avgResponseTime}s</p>
              <p className="text-xs text-green-600 mt-2">-0.2s from last period</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">CSAT Score</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{analytics.satisfactionScore}/5</p>
              <p className="text-xs text-green-600 mt-2">+0.1 from last period</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Tokens Used</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{(analytics.tokensUsed / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-green-600 mt-2">+25% from last period</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Zap size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{analytics.activeUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-2">+34% from last period</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-lg">
              <Users size={24} className="text-cyan-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations over time */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Conversations Over Time</h2>
          <div className="h-64 flex items-end gap-2">
            {chartData.map((data, index) => {
              const height = (data.conversations / maxConversations) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <div
                    className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-colors cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${data.conversations} conversations`}
                  />
                  <span className="text-xs text-slate-600">{data.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Satisfaction trend */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Satisfaction Score Trend</h2>
          <div className="h-64 flex items-end gap-2">
            {chartData.map((data, index) => {
              const height = (data.satisfaction / 5) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-green-600 rounded-t hover:bg-green-700 transition-colors cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${data.satisfaction}/5`}
                  />
                  <span className="text-xs text-slate-600">{data.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bot Performance Table */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Bot Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Bot Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Conversations</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Messages</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Satisfaction</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Avg Response</th>
              </tr>
            </thead>
            <tbody>
              {botStats.map((bot, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">{bot.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{bot.conversations.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{bot.messages.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600"
                          style={{ width: `${(bot.satisfaction / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{bot.satisfaction}/5</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{bot.avgTime}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
