'use client';

import React, { useState } from 'react';
import { Save, LogOut, AlertCircle, CheckCircle, Mail, Lock, Building } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'organization' | 'billing' | 'security'>('account');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const [accountData, setAccountData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
  });

  const [organizationData, setOrganizationData] = useState({
    name: 'Tech Startup Inc.',
    website: 'https://example.com',
    industry: 'Software Development',
    employees: '10-50',
    timezone: 'America/New_York',
  });

  const [billingData, setBillingData] = useState({
    plan: 'Professional',
    billingCycle: 'monthly',
    nextBillingDate: '2024-05-06',
    autoRenew: true,
  });

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: Mail },
    { id: 'organization' as const, label: 'Organization', icon: Building },
    { id: 'billing' as const, label: 'Billing', icon: Mail },
    { id: 'security' as const, label: 'Security', icon: Lock },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // In production, call logout API
    window.location.href = '/login';
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={accountData.firstName}
                  onChange={(e) => setAccountData({ ...accountData, firstName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={accountData.lastName}
                  onChange={(e) => setAccountData({ ...accountData, lastName: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                value={accountData.email}
                onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={accountData.phone}
                onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
              <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Organization Tab */}
        {activeTab === 'organization' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Organization Name</label>
              <input
                type="text"
                value={organizationData.name}
                onChange={(e) => setOrganizationData({ ...organizationData, name: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
              <input
                type="url"
                value={organizationData.website}
                onChange={(e) => setOrganizationData({ ...organizationData, website: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
                <select
                  value={organizationData.industry}
                  onChange={(e) => setOrganizationData({ ...organizationData, industry: e.target.value })}
                  className="input-field"
                >
                  <option>Software Development</option>
                  <option>E-Commerce</option>
                  <option>Healthcare</option>
                  <option>Finance</option>
                  <option>Education</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Number of Employees</label>
                <select
                  value={organizationData.employees}
                  onChange={(e) => setOrganizationData({ ...organizationData, employees: e.target.value })}
                  className="input-field"
                >
                  <option>1-10</option>
                  <option>10-50</option>
                  <option>50-100</option>
                  <option>100-500</option>
                  <option>500+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
              <select
                value={organizationData.timezone}
                onChange={(e) => setOrganizationData({ ...organizationData, timezone: e.target.value })}
                className="input-field"
              >
                <option>America/New_York</option>
                <option>America/Chicago</option>
                <option>America/Denver</option>
                <option>America/Los_Angeles</option>
                <option>Europe/London</option>
                <option>Europe/Paris</option>
                <option>Asia/Tokyo</option>
              </select>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Current Plan</p>
                  <p className="text-sm text-blue-800 mt-1">Professional Plan • Monthly billing</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Plan</label>
                <select value={billingData.plan} disabled className="input-field bg-slate-50 cursor-not-allowed">
                  <option>{billingData.plan}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Billing Cycle</label>
                <select
                  value={billingData.billingCycle}
                  onChange={(e) => setBillingData({ ...billingData, billingCycle: e.target.value })}
                  className="input-field"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual (Save 20%)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Next Billing Date</label>
              <input
                type="text"
                value={billingData.nextBillingDate}
                disabled
                className="input-field bg-slate-50 cursor-not-allowed"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoRenew"
                checked={billingData.autoRenew}
                onChange={(e) => setBillingData({ ...billingData, autoRenew: e.target.checked })}
              />
              <label htmlFor="autoRenew" className="text-sm text-slate-700">
                Automatically renew at the end of billing period
              </label>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-3">
              <button className="w-full btn-secondary">Download Invoice</button>
              <button className="w-full btn-secondary">Change Payment Method</button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Two-Factor Authentication</p>
                  <p className="text-sm text-yellow-800 mt-1">Not enabled. Enable 2FA to secure your account.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Change Password</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Active Sessions</h3>
              <div className="space-y-2">
                <div className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Chrome on Windows</p>
                    <p className="text-xs text-slate-600">Current session • Last active now</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Safari on iPhone</p>
                    <p className="text-xs text-slate-600">Last active 2 hours ago</p>
                  </div>
                  <button className="text-xs text-red-600 hover:underline">Sign out</button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-3">
              <button className="w-full btn-secondary">Enable Two-Factor Authentication</button>
              <button className="w-full btn-secondary">Sign Out All Other Sessions</button>
            </div>
          </div>
        )}
      </div>

      {/* Success message */}
      {saved && (
        <div className="fixed bottom-6 right-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-slideInUp">
          <CheckCircle size={20} className="text-green-600" />
          <p className="text-sm text-green-800">Settings saved successfully!</p>
        </div>
      )}
    </div>
  );
}
