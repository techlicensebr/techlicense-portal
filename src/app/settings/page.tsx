'use client';

import React, { useState, useEffect } from 'react';
import { Save, LogOut, AlertCircle, CheckCircle, Mail, Lock, Building } from 'lucide-react';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'organization' | 'billing' | 'security'>('account');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch settings
  const { data: settingsData, loading: settingsLoading, refetch } = useApi(
    () => apiClient.getSettings(),
    { autoFetch: true }
  );

  // Update settings mutation
  const updateMutation = useApiMutation<Record<string, unknown>, Record<string, unknown>>(
    (data) => apiClient.updateSettings(data)
  );

  // Logout mutation
  const logoutMutation = useApiMutation<void, void>(
    () => apiClient.logout()
  );

  // Change password mutation
  const changePasswordMutation = useApiMutation<void, { currentPassword: string; newPassword: string }>(
    ({ currentPassword, newPassword }) =>
      apiClient.changePassword(currentPassword, newPassword)
  );

  // Fetch subscription
  const { data: billingData } = useApi(
    () => apiClient.getSubscription(),
    { autoFetch: true }
  );

  const [accountData, setAccountData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [organizationData, setOrganizationData] = useState({
    name: '',
    website: '',
    industry: '',
    employees: '',
    timezone: 'America/New_York',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (settingsData) {
      setAccountData({
        firstName: settingsData.first_name || '',
        lastName: settingsData.last_name || '',
        email: settingsData.email || '',
        phone: settingsData.phone || '',
      });

      setOrganizationData({
        name: settingsData.organization_name || '',
        website: settingsData.website || '',
        industry: settingsData.industry || '',
        employees: settingsData.employees || '',
        timezone: settingsData.timezone || 'America/New_York',
      });
    }
  }, [settingsData]);

  const tabs = [
    { id: 'account' as const, label: 'Conta', icon: Mail },
    { id: 'organization' as const, label: 'Organização', icon: Building },
    { id: 'billing' as const, label: 'Cobrança', icon: Mail },
    { id: 'security' as const, label: 'Segurança', icon: Lock },
  ];

  const handleSave = async () => {
    setSaveError(null);
    try {
      const updateData: Record<string, unknown> = {};

      if (activeTab === 'account') {
        updateData.first_name = accountData.firstName;
        updateData.last_name = accountData.lastName;
        updateData.email = accountData.email;
        updateData.phone = accountData.phone;
      } else if (activeTab === 'organization') {
        updateData.organization_name = organizationData.name;
        updateData.website = organizationData.website;
        updateData.industry = organizationData.industry;
        updateData.employees = organizationData.employees;
        updateData.timezone = organizationData.timezone;
      }

      await updateMutation.mutate(updateData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      refetch();
    } catch (error: any) {
      setSaveError(error.message || 'Erro ao salvar alterações');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveError('As senhas não correspondem');
      return;
    }

    try {
      await changePasswordMutation.mutate({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSaved(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      setSaveError(error.message || 'Erro ao alterar senha');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutate();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Cabeçalho da página */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Configurações
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gerencie sua conta e preferências
        </p>
      </div>

      {/* Abas */}
      <div className="card dark:bg-slate-800 dark:border-slate-700">
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Aba Conta */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            {settingsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={accountData.firstName}
                      onChange={(e) =>
                        setAccountData({
                          ...accountData,
                          firstName: e.target.value,
                        })
                      }
                      className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                      Sobrenome
                    </label>
                    <input
                      type="text"
                      value={accountData.lastName}
                      onChange={(e) =>
                        setAccountData({
                          ...accountData,
                          lastName: e.target.value,
                        })
                      }
                      className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) =>
                      setAccountData({ ...accountData, email: e.target.value })
                    }
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={accountData.phone}
                    onChange={(e) =>
                      setAccountData({ ...accountData, phone: e.target.value })
                    }
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.loading}
                    className="btn-secondary flex items-center gap-2 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  >
                    <LogOut size={18} />
                    {logoutMutation.loading ? 'Saindo...' : 'Sair'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.loading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {updateMutation.loading
                      ? 'Salvando...'
                      : 'Salvar Alterações'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Aba Organização */}
        {activeTab === 'organization' && (
          <div className="space-y-6">
            {settingsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    value={organizationData.name}
                    onChange={(e) =>
                      setOrganizationData({
                        ...organizationData,
                        name: e.target.value,
                      })
                    }
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                    Site
                  </label>
                  <input
                    type="url"
                    value={organizationData.website}
                    onChange={(e) =>
                      setOrganizationData({
                        ...organizationData,
                        website: e.target.value,
                      })
                    }
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                      Setor
                    </label>
                    <select
                      value={organizationData.industry}
                      onChange={(e) =>
                        setOrganizationData({
                          ...organizationData,
                          industry: e.target.value,
                        })
                      }
                      className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                      <option>Desenvolvimento de Software</option>
                      <option>E-Commerce</option>
                      <option>Saúde</option>
                      <option>Finanças</option>
                      <option>Educação</option>
                      <option>Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                      Número de Funcionários
                    </label>
                    <select
                      value={organizationData.employees}
                      onChange={(e) =>
                        setOrganizationData({
                          ...organizationData,
                          employees: e.target.value,
                        })
                      }
                      className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                    Fuso Horário
                  </label>
                  <select
                    value={organizationData.timezone}
                    onChange={(e) =>
                      setOrganizationData({
                        ...organizationData,
                        timezone: e.target.value,
                      })
                    }
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
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

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.loading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {updateMutation.loading
                      ? 'Salvando...'
                      : 'Salvar Alterações'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Aba Cobrança */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {billingData && (
              <>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-300">
                        Plano Atual
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                        {billingData.plan} • {billingData.status === 'active' ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                      Plano
                    </label>
                    <input
                      type="text"
                      value={billingData.plan}
                      disabled
                      className="input-field bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                      Status
                    </label>
                    <input
                      type="text"
                      value={billingData.status}
                      disabled
                      className="input-field bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                    Próxima Cobrança
                  </label>
                  <input
                    type="text"
                    value={billingData.current_period_end}
                    disabled
                    className="input-field bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Aba Segurança */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-300">
                    Autenticação em Duas Etapas
                  </p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-400 mt-1">
                    Não ativada. Ative 2FA para proteger sua conta.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                Alterar Senha
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    changePasswordMutation.loading
                  }
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {changePasswordMutation.loading
                    ? 'Alterando...'
                    : 'Alterar Senha'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mensagem de sucesso */}
      {saved && (
        <div className="fixed bottom-6 right-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 animate-slideInUp">
          <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-300">
            Alterações salvas com sucesso!
          </p>
        </div>
      )}

      {/* Mensagem de erro */}
      {saveError && (
        <div className="fixed bottom-6 right-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 animate-slideInUp">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-300">{saveError}</p>
        </div>
      )}
    </div>
  );
}
