import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import type { AuthPageProps } from '../types';

const AuthPage: React.FC<AuthPageProps> = ({ title, onLogin, onSignUp, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (isSignUp && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const result = isSignUp ? onSignUp(email, password) : onLogin(email, password);
      if (!result.success) {
        setError(result.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setIsSignUp(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8">

        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-[#0F292F] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {title || 'Persona.Credit'}
            </h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-1">
              Cross-Border Financial Verification
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-6">

          {/* Mode toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={toggleMode}
              className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${
                isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={toggleMode}
              className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${
                !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:ring-2 focus:ring-[#0F292F]/20 focus:border-[#0F292F] outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                Password {isSignUp && <span className="text-slate-300">(min. 8 characters)</span>}
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:ring-2 focus:ring-[#0F292F]/20 focus:border-[#0F292F] outline-none transition-all placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-[11px] font-bold text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#0F292F] text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#0F292F]/90 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Privacy note */}
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Your data is processed securely. We do not share your information without your explicit consent.
          </p>
        </div>

        {/* Back */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-widest transition-colors"
          >
            ← Back to Homepage
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
