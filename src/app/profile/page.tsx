'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  User,
  Mail,
  Shield,
  Building,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Camera,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';

const roleLabels: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  user: 'Usuário',
  viewer: 'Visualizador',
  agent: 'Atendente',
};

const planLabels: Record<string, string> = {
  trial: 'Trial',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

export default function ProfilePage() {
  const { user: authUser, refreshUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch settings for additional data
  const { data: settingsData, loading } = useApi(
    () => apiClient.getSettings(),
    { autoFetch: true }
  );

  const updateMutation = useApiMutation<Record<string, unknown>, Record<string, unknown>>(
    (data) => apiClient.updateSettings(data)
  );

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (settingsData) {
      setFormData({
        firstName: settingsData.first_name || '',
        lastName: settingsData.last_name || '',
        email: settingsData.email || '',
        phone: settingsData.phone || '',
      });
    }
  }, [settingsData]);

  const handleSave = async () => {
    setSaved(false);
    setSaveError(null);
    try {
      await updateMutation.mutate({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError('Erro ao salvar perfil. Tente novamente.');
      setTimeout(() => setSaveError(null), 5000);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48" />
          <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Notifications */}
      {saved && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg border border-green-200 dark:border-green-800 shadow-lg">
          <CheckCircle size={18} />
          <span className="text-sm font-medium">Perfil atualizado com sucesso!</span>
        </div>
      )}
      {saveError && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800 shadow-lg">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{saveError}</span>
        </div>
      )}

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meu Perfil</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Gerencie suas informações pessoais e visualize detalhes da sua conta
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[#D4A843] to-[#B8860B]" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end gap-4 -mt-12">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-[#D4A843] to-[#B8860B] rounded-full flex items-center justify-center text-black text-2xl font-bold border-4 border-white dark:border-slate-800 shadow-lg">
                {authUser?.avatar_url ? (
                  <img
                    src={authUser.avatar_url}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(authUser?.name || 'U')
                )}
              </div>
              <button
                className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                title="Alterar avatar"
              >
                <Camera size={14} className="text-slate-500 dark:text-slate-300" />
              </button>
            </div>

            <div className="pb-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {authUser?.name || 'Usuário'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {authUser?.email}
              </p>
            </div>
          </div>

          {/* Info Badges */}
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Shield size={12} />
              {roleLabels[authUser?.role || 'user'] || authUser?.role}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <CreditCard size={12} />
              Plano {planLabels[authUser?.plan || 'trial'] || authUser?.plan}
            </span>
            {authUser?.organization_id && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                <Building size={12} />
                Organização vinculada
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <User size={20} className="text-[#D4A843]" />
          Informações Pessoais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nome
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#D4A843]/50 focus:border-[#D4A843] transition-colors"
              placeholder="Seu nome"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Sobrenome
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#D4A843]/50 focus:border-[#D4A843] transition-colors"
              placeholder="Seu sobrenome"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Mail size={14} />
                E-mail
              </span>
            </label>
            <input
              type="email"
              value={formData.email}
              readOnly
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              O e-mail não pode ser alterado diretamente
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#D4A843]/50 focus:border-[#D4A843] transition-colors"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={updateMutation.loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#D4A843] to-[#B8860B] text-black font-medium rounded-lg hover:from-[#C9982E] hover:to-[#A07520] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Save size={16} />
            {updateMutation.loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Account Details Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Shield size={20} className="text-[#D4A843]" />
          Detalhes da Conta
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">ID do Usuário</p>
            <p className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
              {authUser?.id || '—'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">Função</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
              {roleLabels[authUser?.role || 'user'] || authUser?.role}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">Plano Atual</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
              {planLabels[authUser?.plan || 'trial'] || authUser?.plan}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">Organização</p>
            <p className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 truncate">
              {authUser?.organization_id || '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
