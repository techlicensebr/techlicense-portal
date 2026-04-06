'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type LoginMode = 'password' | 'magic-link';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginMode, setLoginMode] = useState<LoginMode>('password');
  const [magicLinkSent, setMagicLinkSent] = useState<boolean>(false);

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMagicLinkForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(email)) {
      newErrors.email = 'E-mail inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});

    if (!validatePasswordForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(email, password);

      if (rememberMe) {
        localStorage.setItem('techlicense_email', email);
      } else {
        localStorage.removeItem('techlicense_email');
      }

      router.push('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Falha ao fazer login. Tente novamente.';
      const authError = errorMessage.toLowerCase();

      if (authError.includes('credenciais') || authError.includes('invalid') || authError.includes('password')) {
        setErrors({ general: 'E-mail ou senha incorretos' });
      } else if (authError.includes('não encontrado') || authError.includes('not found')) {
        setErrors({ general: 'Conta não encontrada. Crie uma conta gratuita' });
      } else if (authError.includes('rede') || authError.includes('network')) {
        setErrors({ general: 'Erro de conexão. Verifique sua internet' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});

    if (!validateMagicLinkForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar link mágico');
      }

      setMagicLinkSent(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar o link. Tente novamente.';
      if (errorMessage.toLowerCase().includes('não encontrado')) {
        setErrors({ general: 'Conta não encontrada. Crie uma conta gratuita' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    setErrors({});
    setLoading(true);

    try {
      window.location.href = '/api/auth/google';
    } catch (err: unknown) {
      setErrors({ general: 'Erro ao fazer login com Google' });
      setLoading(false);
    }
  };

  const handleSwitchMode = (): void => {
    const newMode: LoginMode = loginMode === 'password' ? 'magic-link' : 'password';
    setLoginMode(newMode);
    setErrors({});
    setPassword('');
  };

  const resetMagicLink = (): void => {
    setMagicLinkSent(false);
    setEmail('');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4A843] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C0C0C0] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Main card */}
        <div className="bg-[#111111] rounded-2xl shadow-2xl shadow-black/50 p-8 backdrop-blur-xl border border-[#1a1a1a]">
          {magicLinkSent ? (
            // Magic link sent state
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Link enviado!</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
                  Verifique seu e-mail <strong className="text-slate-900 dark:text-white">{email}</strong> para o link de acesso seguro
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-green-800 dark:text-green-300 text-sm">
                  O link expira em 24 horas
                </p>
              </div>

              <button
                onClick={resetMagicLink}
                className="w-full px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold transition-colors"
              >
                Voltar para login
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <img src="/logo.png" alt="TechLicense" className="h-14 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-[#C0C0C0]">Entrar na sua conta</h1>
                <p className="text-[#707070] mt-2">Plataforma de Chatbot IA</p>
              </div>

              {/* Error message */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-800 dark:text-red-300 text-sm font-medium">{errors.general}</p>
                </div>
              )}

              {/* Login form */}
              <form
                onSubmit={loginMode === 'password' ? handlePasswordLogin : handleMagicLink}
                className="space-y-5"
              >
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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors({ ...errors, email: '' });
                        }
                      }}
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

                {/* Password input - only for password mode */}
                {loginMode === 'password' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="text-sm font-semibold text-[#A0A0A0]">
                        Senha
                      </label>
                      <a
                        href="/recuperar-senha"
                        className="text-xs text-[#D4A843] hover:text-[#E8C860] font-medium transition-colors"
                      >
                        Esqueceu a senha?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#606060]" size={18} />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) {
                            setErrors({ ...errors, password: '' });
                          }
                        }}
                        placeholder="••••••••"
                        className={`w-full pl-12 pr-12 py-3 rounded-lg border-2 transition-colors ${
                          errors.password
                            ? 'border-red-700 bg-red-900/10 focus:outline-none focus:border-red-500'
                            : 'border-[#2a2a2a] bg-[#0a0a0a] focus:outline-none focus:border-[#D4A843] focus:ring-2 focus:ring-[#D4A843]/20'
                        } text-white placeholder-[#505050]`}
                        required
                        autoComplete="current-password"
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
                )}

                {/* Remember me checkbox - only for password mode */}
                {loginMode === 'password' && (
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#2a2a2a] text-[#D4A843] focus:ring-[#D4A843] bg-[#0a0a0a] cursor-pointer"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-[#A0A0A0] cursor-pointer">
                      Lembrar de mim
                    </label>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#D4A843] to-[#B8860B] hover:from-[#E8C860] hover:to-[#C9982E] disabled:from-[#444] disabled:to-[#333] text-black font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:text-gray-500 mt-6 shadow-lg shadow-[#D4A843]/20"
                >
                  {loading && <Loader size={18} className="animate-spin" />}
                  {loginMode === 'password' ? 'Entrar' : 'Enviar link mágico'}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 border-t border-[#2a2a2a]" />
                <span className="text-xs text-[#606060] font-medium">OU</span>
                <div className="flex-1 border-t border-[#2a2a2a]" />
              </div>

              {/* Google button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-[#2a2a2a] rounded-lg hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-3 font-semibold text-[#C0C0C0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar com Google
              </button>

              {/* Toggle authentication method */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleSwitchMode}
                  className="text-[#D4A843] hover:text-[#E8C860] text-sm font-semibold transition-colors"
                >
                  {loginMode === 'password' ? 'Entrar com link mágico' : 'Entrar com senha'}
                </button>
              </div>

              {/* Sign up link */}
              <div className="mt-8 text-center border-t border-[#2a2a2a] pt-6">
                <p className="text-[#707070] text-sm">
                  Não tem conta?{' '}
                  <a href="/registrar" className="text-[#D4A843] hover:text-[#E8C860] font-semibold transition-colors">
                    Criar conta gratuita
                  </a>
                </p>
              </div>

              {/* Security footer */}
              <div className="mt-6 text-center text-xs text-[#505050]">
                <p>Protegido por TechLicense Security</p>
              </div>
            </>
          )}
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
