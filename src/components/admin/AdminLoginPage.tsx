import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { ShieldCheck, Lock, Mail, ArrowLeft, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, setCurrentView, navigateTo, language, t } = useBooking();
  const [email, setEmail] = useState('admin@griyabarokah.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg(language === 'id' ? 'Silakan masukkan email dan password.' : 'Please enter email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const success = await loginAdmin(email.trim(), password.trim());
      if (!success) {
        setErrorMsg(
          language === 'id'
            ? 'Email atau password salah, atau akun ini bukan Admin.'
            : 'Invalid email, password, or not an admin account.'
        );
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        if (navigateTo) {
          navigateTo('/admin');
        }
      }
    } catch {
      setErrorMsg(language === 'id' ? 'Gagal melakukan verifikasi.' : 'Authentication error.');
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (emailStr: string, passStr: string) => {
    setEmail(emailStr);
    setPassword(passStr);
    setErrorMsg('');
  };

  const handleBackToGuest = () => {
    if (navigateTo) {
      navigateTo('/');
    } else {
      setCurrentView('home');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#ECEEF2] text-[#12151B] flex flex-col justify-between select-none p-5 sm:p-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleBackToGuest}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-neutral-700 text-xs font-semibold shadow-xs border border-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToGuestApp}</span>
        </button>

        <span className="text-[11px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
          RESTRICTED / ADMIN
        </span>
      </div>

      {/* Main Login Card */}
      <div className="my-auto py-6">
        <div className="bg-white rounded-[32px] p-6 sm:p-7 shadow-sm border border-neutral-200/80 max-w-sm mx-auto space-y-6">
          {/* Header Icon & Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-7 h-7 text-amber-700" />
            </div>

            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              {t.adminLoginTitle}
            </h1>
            <p className="text-xs text-neutral-500 leading-relaxed px-2">
              {t.adminLoginDesc}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                Email Admin
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="admin@griyabarokah.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#F6F7F9] border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-neutral-400"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider block">
                Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Masukkan password admin..."
                  className="w-full pl-10 pr-11 py-3 bg-[#F6F7F9] border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-neutral-400"
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-1 px-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{isSubmitting ? 'Memverifikasi...' : t.loginButton}</span>
            </button>
          </form>

          {/* Demo Hint Helper */}
          <div className="pt-3 border-t border-neutral-100 space-y-2">
            <div className="flex items-center gap-1 text-[11px] text-neutral-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold">{t.demoHintAdmin}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@griyabarokah.com', 'admin123')}
                className="flex-1 py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl text-[11px] font-mono font-medium text-neutral-700 text-center transition-colors"
              >
                admin123
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@griyabarokah.com', 'sagara88')}
                className="flex-1 py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl text-[11px] font-mono font-medium text-neutral-700 text-center transition-colors"
              >
                sagara88
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="text-center text-[11px] text-neutral-400 pb-2">
        Sagara Beach Stay • Secure Management Portal
      </footer>
    </div>
  );
};
