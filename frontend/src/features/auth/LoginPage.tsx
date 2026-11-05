import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LanguageSwitcher } from '../../components/layout/LanguageSwitcher';
import { useLanguage } from '../../i18n/LanguageContext';
import { api } from '../../services/api';

import apEmblem from '../../assets/ap_emblem.png';
import kalashIcon from '../../assets/kalash_icon.png';
import headerTempleWatermark from '../../assets/header_temple_watermark.png';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password reset modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(usernameOrEmail, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = async (email: string) => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(email);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetSuccess(null);
    try {
      const res = await api.resetPassword(resetEmail, newPassword);
      setResetSuccess(res.message);
      setTimeout(() => {
        setResetModalOpen(false);
        setResetSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between font-sans text-textPrimary">
      {/* Top Government Emblem Bar */}
      <div className="bg-[#FDFBF7] border-b border-[#EFE6DA] px-6 py-3.5 flex items-center justify-between shadow-subtle relative z-30">
        <div
          className="absolute inset-0 pointer-events-none opacity-20 hidden md:block overflow-hidden"
          style={{
            backgroundImage: `url(${headerTempleWatermark})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
          }}
        />

        <div className="flex items-center gap-4 z-10">
          <div className="flex items-center gap-2.5">
            <img
              src={apEmblem}
              alt="Government of Andhra Pradesh"
              className="h-9 w-auto object-contain shrink-0 drop-shadow-sm"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-stone-900 tracking-tight">
                {t('gov_ap', 'Government of Andhra Pradesh')}
              </span>
            </div>
          </div>

          <div className="h-7 w-px bg-amber-300/60 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            <img src={kalashIcon} alt="Kalash" className="h-8 w-auto object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm md:text-base font-bold text-[#5B1414] font-serif tracking-tight">
                {t('pushkaralu_title', 'Godavari Pushkaralu 2027')}
              </span>
              <span className="text-[10px] text-[#883526] font-medium hidden sm:inline">
                {t('pushkaralu_sub', 'Sri Godavari Maha Pushkaralu | Rajamahendravaram')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 z-10">
          <LanguageSwitcher variant="header" />
          <span className="hidden sm:inline-block text-xs px-3 py-1 bg-amber-100/80 text-[#8C2E0B] border border-amber-300/80 rounded-full font-bold">
            Pushkaralu 2027 Portal
          </span>
        </div>
      </div>

      {/* Main Login Split View */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
        {/* Left Column: Standard Secure Login */}
        <div className="lg:col-span-5 bg-white p-7 md:p-8 rounded-2xl border border-[#EBDCC8] shadow-card">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#EA580C] to-[#F59E0B] p-1.5 flex items-center justify-center text-white shadow-sm">
                <img src={kalashIcon} alt="Emblem" className="w-full h-full object-contain brightness-110" />
              </div>
              <span className="text-xs font-bold text-[#9A3412] uppercase tracking-wider">
                Official Authorization
              </span>
            </div>
            <h1 className="text-2xl font-black font-serif text-[#4A120E] tracking-tight">Sign In to CivicProof</h1>
            <p className="text-xs text-stone-500 mt-1">
              Authorized municipal administrators, field inspectors, and registered contractors.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Username or Official Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. superadmin@civicproof.gov.in"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-[#FAF7F2] border border-[#E2D3BF] rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">Password</label>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="text-xs text-saffron hover:underline font-semibold"
                >
                  Forgot / Reset?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-[#FAF7F2] border border-[#E2D3BF] rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron focus:bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="saffron"
              size="md"
              className="w-full mt-2"
              isLoading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Command Center
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#EFE6DA] text-center">
            <p className="text-[11px] text-stone-500">
              Protected by server-side Argon2id encryption & immutable audit logging.
            </p>
          </div>
        </div>

        {/* Right Column: 1-Click Demo Account Quick Selector */}
        <div className="lg:col-span-7 bg-white p-6 md:p-7 rounded-2xl border border-[#EBDCC8] shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h2 className="text-base font-black font-serif text-[#4A120E]">
                  Evaluator 1-Click Persona Simulator
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Click any government persona below to authenticate instantly with seeded demo credentials.
              </p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
              7 Personas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {DEMO_ACCOUNTS.map((account) => (
              <div
                key={account.email}
                onClick={() => handleQuickRole(account.email)}
                className="p-3.5 rounded-xl border border-[#EFE6DA] bg-[#FAF7F2]/60 hover:bg-amber-50/50 hover:border-amber-400/80 transition-all cursor-pointer group flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-[#7A1618] group-hover:text-[#EA580C] transition-colors">
                      {account.roleName}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">1-click</span>
                  </div>
                  <p className="text-xs font-bold text-stone-900 truncate">{account.name}</p>
                  <p className="text-[11px] text-stone-500 mt-1 leading-snug line-clamp-2">
                    {account.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#EFE6DA] flex items-center justify-between text-[11px]">
                  <span className="text-stone-400 truncate">{account.department}</span>
                  <span className="text-saffron font-bold group-hover:translate-x-1 transition-transform flex items-center">
                    Enter &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 border-t border-[#EFE6DA] bg-[#FDFBF7] text-center text-xs text-stone-500">
        <p className="font-medium text-stone-700">CivicProof Platform — Government of Andhra Pradesh (Godavari Pushkaralu 2027)</p>
        <p className="text-[11px] text-stone-400 mt-0.5">
          Prototype demonstration mode. All verification rules and audit trails are operational.
        </p>
      </footer>

      {/* Password Reset Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Demo Password"
        description="Demo password recovery workflow. Updates password in database with audit event."
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          {resetSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{resetSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Account Email
            </label>
            <input
              type="email"
              required
              placeholder="e.g. superadmin@civicproof.gov.in"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E2D3BF] rounded-xl text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              New Password (min 8 chars)
            </label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E2D3BF] rounded-xl text-stone-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="saffron" size="sm" isLoading={resetLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
