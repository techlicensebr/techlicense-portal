'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { User, Building2, Mail, Lock, Eye, EyeOff, Loader, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

interface FormErrors {
  name?: string;
  company_name?: string;
  email?: string;
  password?: string;
  password_confirm?: string;
  plan?: string;
  general?: string;
}

interface FormData {
  name: string;
  company_name: string;
  email: string;
  password: string;
  password_confirm: string;
  plan: string;
}

const PLANS = [
  { slug: 'free', label: 'Gratuito', price: 'Grátis' },
  { slug: 'starter', label: 'Starter', price: 'R$97/mês' },
  { slug: 'pro', label: 'Profissional', price: 'R$297/mês' },
  { slug: 'enterprise', label: 'Business', price: 'R$697/mês' },
];

export default function RegisterPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader className="animate-spin text-[#D4A843]" size={32} /></div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm(): React.ReactElement {
  const router = useRouter();
  const { user: authUser } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    company_name: '',
    email: '',
    password: '',
    password_confirm: '',
    plan: 'free',
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome completo é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Nome da empresa é obrigatório';
    } else if (formData.company_name.trim().length < 2) {
      newErrors.company_name = 'Nome da empresa deve ter no mínimo 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!formData.password_confirm) {
      newErrors.password_confirm = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'As senhas não coincidem';
    }

    if (!formData.plan) {
      newErrors.plan = 'Selecione um plano';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        company_name: formData.company_name,
        plan_slug: formData.plan,
      });

      if (response.token && response.user) {
        // Redirect to dashboard on successful registration
        router.push('/');
      } else {
        setErrors({ general: 'Erro ao criar conta. Tente novamente.' });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.';
      const authError = errorMessage.toLowerCase();

      if (authError.includes('já existe') || authError.includes('already exists')) {
        setErrors({ general: 'Este e-mail já está registrado' });
      } else if (authError.includes('inválido') || authError.includes('invalid')) {
        setErrors({ general: 'Dados inválidos. Verifique os campos.' });
      } else if (authError.includes('rede') || authError.includes('network')) {
        setErrors({ general: 'Erro de conexão. Verifique sua internet' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  if (authUser) {
    router.push('/');
    return <div className="min-h-screen bg-[#0a0a0a]" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4A843] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C0C0C0] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Main card */}
        <div className="bg-[#111111] rounded-2xl shadow-2xl shadow-black/50 p-8 backdrop-blur-xl border border-[#1a1a1a]">
          {/* Header */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="TechLicense" className="h-24 w-auto mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-[#C0C0C0]">Criar sua conta</h1>
            <p className="text-[#707070] mt-2">Plataforma de Chatbot IA</p>
          </div>

          {/* Error message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-800 dark:text-red-300 text-sm font-medium">{errors.general}</p>
            </div>
          )}

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#A0A0A0] mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#606060]" size={18} />
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 transition-colors ${
                    errors.name
                      ? 'border-red-700 bg-red-900/10 focus:outline-none focus:border-red-500'
                      : 'border-[#2a2a2a] bg-[#0a0a0a] focus:outline-none focus:border-[#D4A843] focus:ring-2 focus:ring-[#D4A843]/20'
                  } text-white placeholder-[#505050]`}
                  required
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.name}</p>}
            </div>

            {/* Company name input */}
            <div>
              <label htmlFor="company_name" className="block text-sm font-semibold text-[#A0A0A0] mb-2">
                Nome da empresa
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#606060]" size={18} />
                <input
                  id="company_name"
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Sua empresa"
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 transition-colors ${
                    errors.company_name
                      ? 'border-red-700 bg-red-900/10 focus:outline-none focus:border-red-500'
                      : 'border-[#2a2a2a] bg-[#0a0a0a] focus:outline-none focus:border-[#D4A843] focus:ring-2 focus:ring-[#D4A843]/20'
                  } text-white placeholder-[#505050]`}
                  required
                  autoComplete="organization"
                />
              </div>
              {errors.company_name && <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.company_name}</p>}
            </div>

            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#A0A0A0] mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#606060]" size={18} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu.email@exemplo.com"
                  className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 transition-colors ${
                    errors.email
                      ? 'border-red-700 bg-red-900/10 focus:outline-none focus:border-red-500'
                      : 'border-[#2a2a2a] bg-[#0a0a0a] focus:outline-none focus:border-[#D4A843] focus:ring-2 focus:ring-[#D4A843]/20'
                  } text-white placeholder-[#505050]`}
                  required
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.email}</p>}
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#A0A0A0] mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#606060]" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 rounded-lg border-2 transition-colors ${
                    errors.password
                      ? 'border-red-700 bg-red-900/10 focus:outline-none focus:border-red-500'
                      : 'border-[#2a2a2a] bg-[#0a0a0a] focus:outline-none focus:border-[#D4A843] focus:ring-2 focus:ring-[#D4A843]/20'
                  } text-white placeholder-[#505050]`}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#606060] hover:text-[#A0A0A0] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.password}</p>}
            </div>

            {/* Confirm password input */}
            <div>
              <label htmlFor="password_confirm" className="block text-sm font-semibold text-[#A0A0A0] mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#606060]" size={18} />
                <input
                  id="password_confirm"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 rounded-lg border-2 transition-colors ${
                    errors.password_confirm
                      ? 'border-red-700 bg-red-900/10 focus:outline-none focus:border-red-500'
                      : 'border-[#2a2a2a] bg-[#0a0a0a] focus:outline-none focus:border-[#D4A843] focus:ring-2 focus:ring-[#D4A843]/20'
                  } text-white placeholder-[#505050]`}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#606060] hover:text-[#A0A0A0] transition-colors"
                  tabIndex={-1}
                >
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password_confirm && <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.password_confirm}</p>}
            </div>

            {/* Plan selector */}
            <div>
              <label htmlFor="plan" className="block text-sm font-semibold text-[#A0A0A0] mb-2">
                Plano
              </label>
              <div className="relative">
                <select
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                  className={`w-full pl-4 pr-12 py-3 rounded-lg border-2 transition-colors appearance-none ${
                    errors.plan
                      ? 'border-red-700 bg-red-900/10 focus:outline-none focus:border-red-500'
                      : 'border-[#2a2a2a] bg-[#0a0a0a] focus:outline-none focus:border-[#D4A843] focus:ring-2 focus:ring-[#D4A843]/20'
                  } text-white placeholder-[#505050]`}
                >
                  {PLANS.map(plan => (
                    <option key={plan.slug} value={plan.slug} className="bg-[#1a1a1a] text-white">
                      {plan.label} - {plan.price}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#606060] pointer-events-none" size={18} />
              </div>
              {errors.plan && <p className="text-red-600 dark:text-red-400 text-xs mt-2">{errors.plan}</p>}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4A843] to-[#B8860B] hover:from-[#E8C860] hover:to-[#C9982E] disabled:from-[#444] disabled:to-[#333] text-black font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:text-gray-500 mt-6 shadow-lg shadow-[#D4A843]/20"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              Criar conta
            </button>
          </form>

          {/* Login link */}
          <div className="mt-8 text-center border-t border-[#2a2a2a] pt-6">
            <p className="text-[#707070] text-sm">
              Já tem conta?{' '}
              <a href="/login" className="text-[#D4A843] hover:text-[#E8C860] font-semibold transition-colors">
                Entrar
              </a>
            </p>
          </div>

          {/* Security footer */}
          <div className="mt-4 text-center text-xs text-[#505050]">
            <p>Protegido por TechLicense Security</p>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-sm text-[#404040]">
          Plataforma segura e criptografada
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
