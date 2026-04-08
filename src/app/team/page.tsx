'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Eye,
  Headphones,
  Crown,
  Loader,
  X,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  Trash2,
  ChevronDown,
} from 'lucide-react';

// =====================================================
// Types
// =====================================================

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'agent' | 'viewer';
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
  invited_by_user: { full_name: string | null; email: string } | null;
}

// =====================================================
// Role helpers
// =====================================================

const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  owner: { label: 'Owner', icon: <Crown size={14} />, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' },
  admin: { label: 'Admin', icon: <Shield size={14} />, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  agent: { label: 'Agente', icon: <Headphones size={14} />, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  viewer: { label: 'Visualizador', icon: <Eye size={14} />, color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/30' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  accepted: { label: 'Aceito', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  expired: { label: 'Expirado', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  revoked: { label: 'Revogado', color: 'text-gray-400 bg-gray-400/10 border-gray-400/30' },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
  return email[0].toUpperCase();
}

// =====================================================
// Invite Modal
// =====================================================

function InviteModal({
  isOpen,
  onClose,
  onInvited,
  currentUserRole
}: {
  isOpen: boolean;
  onClose: () => void;
  onInvited: () => void;
  currentUserRole: string;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('agent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ invite_url?: string; token?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const availableRoles = currentUserRole === 'owner'
    ? [
        { value: 'admin', label: 'Admin — Gerenciar time e configurações' },
        { value: 'agent', label: 'Agente — Atender conversas e usar bots' },
        { value: 'viewer', label: 'Visualizador — Somente leitura' },
      ]
    : [
        { value: 'agent', label: 'Agente — Atender conversas e usar bots' },
        { value: 'viewer', label: 'Visualizador — Somente leitura' },
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiClient.inviteTeamMember({ email: email.trim(), role });
      setSuccess(result.data);
      onInvited();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar convite.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setEmail('');
    setRole('agent');
    setError('');
    setSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
              <UserPlus size={20} className="text-[#D4A843]" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Convidar Membro</h2>
          </div>
          <button onClick={handleClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {success ? (
          /* Success state */
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-green-400">
              <Check size={20} />
              <p className="font-medium">Convite enviado com sucesso!</p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Compartilhe o link abaixo com <span className="text-slate-900 dark:text-white font-medium">{email}</span>:
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex items-center gap-2">
              <code className="text-xs text-[#D4A843] flex-1 break-all">{success.invite_url}</code>
              <button
                onClick={() => handleCopy(success.invite_url || '')}
                className="shrink-0 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-slate-500 dark:text-slate-400" />}
              </button>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors mt-2"
            >
              Fechar
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                <AlertTriangle size={16} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="membro@empresa.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#D4A843]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Papel</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white appearance-none focus:outline-none focus:border-[#D4A843]"
                >
                  {availableRoles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-[#D4A843] to-[#B8860B] hover:from-[#E8C860] hover:to-[#C9982E] disabled:from-[#333] disabled:to-[#222] text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {loading ? <Loader size={18} className="animate-spin" /> : <UserPlus size={18} />}
              Enviar Convite
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Main Team Page
// =====================================================

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<'members' | 'invitations'>('members');

  const currentUserRole = user?.role || 'viewer';
  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

  const loadData = useCallback(async () => {
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        apiClient.getTeamMembers(),
        canManage ? apiClient.getTeamInvitations() : Promise.resolve({ data: [] }),
      ]);
      setMembers(membersRes.data || []);
      setInvitations(invitationsRes.data || []);
    } catch (err) {
      console.error('Error loading team data:', err);
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChangeRole = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      await apiClient.updateTeamMember(userId, { role: newRole });
      await loadData();
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover ${name || 'este membro'} do time?`)) return;
    setActionLoading(userId);
    try {
      await apiClient.removeTeamMember(userId);
      await loadData();
    } catch (err) {
      console.error('Error removing member:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    if (!confirm('Tem certeza que deseja revogar este convite?')) return;
    setActionLoading(invitationId);
    try {
      await apiClient.revokeInvitation(invitationId);
      await loadData();
    } catch (err) {
      console.error('Error revoking invitation:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={32} className="animate-spin text-[#D4A843]" />
      </div>
    );
  }

  const pendingInvitations = invitations.filter(i => i.status === 'pending');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Users size={28} className="text-[#D4A843]" />
            Gerenciamento de Time
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {members.length} membro{members.length !== 1 ? 's' : ''} no time
            {pendingInvitations.length > 0 && ` · ${pendingInvitations.length} convite${pendingInvitations.length !== 1 ? 's' : ''} pendente${pendingInvitations.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4A843] to-[#B8860B] hover:from-[#E8C860] hover:to-[#C9982E] text-black font-semibold rounded-xl transition-all shadow-lg shadow-[#D4A843]/20"
          >
            <UserPlus size={18} />
            Convidar
          </button>
        )}
      </div>

      {/* Tabs */}
      {canManage && (
        <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
          <button
            onClick={() => setTab('members')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === 'members'
                ? 'bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Membros ({members.length})
          </button>
          <button
            onClick={() => setTab('invitations')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === 'invitations'
                ? 'bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Convites ({invitations.length})
          </button>
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="space-y-3">
          {members.map(member => {
            const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.agent;
            const isCurrentUser = user?.id === member.id;
            const canEditMember = canManage && !isCurrentUser && member.role !== 'owner';

            return (
              <div
                key={member.id}
                className={`bg-white dark:bg-slate-800 border rounded-xl p-4 flex items-center gap-4 transition-colors ${
                  member.is_active ? 'border-slate-200 dark:border-slate-700' : 'border-red-900/30 opacity-60'
                }`}
              >
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${
                  member.role === 'owner' ? 'bg-amber-400/10 text-amber-400' :
                  member.role === 'admin' ? 'bg-blue-400/10 text-blue-400' :
                  'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    getInitials(member.full_name, member.email)
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-slate-900 dark:text-white font-medium truncate">
                      {member.full_name || member.email.split('@')[0]}
                    </p>
                    {isCurrentUser && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">Você</span>
                    )}
                    {!member.is_active && (
                      <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/30">Inativo</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{member.email}</p>
                  {member.last_login_at && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> Último login: {formatDate(member.last_login_at)}
                    </p>
                  )}
                </div>

                {/* Role badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${roleConfig.bg} ${roleConfig.color}`}>
                  {roleConfig.icon}
                  {roleConfig.label}
                </div>

                {/* Actions */}
                {canEditMember && (
                  <div className="flex items-center gap-2">
                    {/* Role selector */}
                    <div className="relative">
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member.id, e.target.value)}
                        disabled={actionLoading === member.id}
                        className="appearance-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white pr-8 focus:outline-none focus:border-[#D4A843] disabled:opacity-50"
                      >
                        {currentUserRole === 'owner' && <option value="admin">Admin</option>}
                        <option value="agent">Agente</option>
                        <option value="viewer">Visualizador</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveMember(member.id, member.full_name || member.email)}
                      disabled={actionLoading === member.id}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Remover membro"
                    >
                      {actionLoading === member.id ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {members.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Users size={48} className="mx-auto mb-3 opacity-30" />
              <p>Nenhum membro encontrado.</p>
            </div>
          )}
        </div>
      )}

      {/* Invitations Tab */}
      {tab === 'invitations' && canManage && (
        <div className="space-y-3">
          {invitations.map(invite => {
            const statusConfig = STATUS_CONFIG[invite.status] || STATUS_CONFIG.pending;
            const roleConfig = ROLE_CONFIG[invite.role] || ROLE_CONFIG.agent;
            const isExpired = new Date(invite.expires_at) < new Date() && invite.status === 'pending';

            return (
              <div
                key={invite.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Mail size={20} className="text-slate-500 dark:text-slate-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 dark:text-white font-medium truncate">{invite.email}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Convidado em {formatDate(invite.created_at)}
                    {invite.invited_by_user && (
                      <> por <span className="text-slate-600 dark:text-slate-300">{invite.invited_by_user.full_name || invite.invited_by_user.email}</span></>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Expira em {formatDate(invite.expires_at)}
                  </p>
                </div>

                {/* Role */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm ${roleConfig.bg} ${roleConfig.color}`}>
                  {roleConfig.icon}
                  {roleConfig.label}
                </div>

                {/* Status */}
                <span className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${statusConfig.color} ${isExpired ? 'text-red-400 bg-red-400/10 border-red-400/30' : ''}`}>
                  {isExpired ? 'Expirado' : statusConfig.label}
                </span>

                {/* Revoke */}
                {invite.status === 'pending' && !isExpired && (
                  <button
                    onClick={() => handleRevokeInvite(invite.id)}
                    disabled={actionLoading === invite.id}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Revogar convite"
                  >
                    {actionLoading === invite.id ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                )}
              </div>
            );
          })}

          {invitations.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Mail size={48} className="mx-auto mb-3 opacity-30" />
              <p>Nenhum convite encontrado.</p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="mt-3 text-[#D4A843] hover:text-[#E8C860] text-sm font-medium transition-colors"
              >
                Enviar primeiro convite
              </button>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvited={loadData}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
