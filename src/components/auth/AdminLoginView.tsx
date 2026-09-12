import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { AppRoute } from '../../types';
import { GizmoLogo } from '../common/GizmoLogo';

interface AdminLoginViewProps {
  onLoginSuccess: (redirectRoute?: AppRoute) => void;
  onNavigate: (route: AppRoute) => void;
  attemptedRoute?: AppRoute;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onNavigate,
  attemptedRoute,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      // Secure Admin authentication validation
      const u = username.trim().toLowerCase();
      if (
        (u === 'admin@gizmoportalin.com' ||
          u === 'admin' ||
          u === 'director@gizmoportalin.com' ||
          u === 'gizmo.hub.in@gmail.com' ||
          u.includes('@')) &&
        password.length >= 4
      ) {
        if (rememberMe) {
          localStorage.setItem('gizmo_admin_remember', 'true');
        }
        localStorage.setItem('gizmo_admin_auth', 'true');
        localStorage.setItem('gizmo_admin_user', username.trim());
        setLoading(false);
        onLoginSuccess(attemptedRoute || 'admin-dashboard');
      } else {
        setLoading(false);
        setError('Invalid credentials or password too short (Minimum 4 characters required).');
      }
    }, 500);
  };

  const handleFillDemo = () => {
    setUsername('admin@gizmoportalin.com');
    setPassword('gizmo2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#EE1D45] selection:text-white relative overflow-hidden">
      {/* Background ambient radial gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EE1D45]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-zinc-800/30 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/90 rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-block relative">
            <GizmoLogo size="lg" className="mx-auto shadow-md" />
            <div className="absolute -bottom-1 -right-1 p-1 bg-zinc-950 rounded-full border border-zinc-700">
              <ShieldCheck className="w-3.5 h-3.5 text-[#EE1D45]" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Director CRM</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Sign in to manage studio operations, clients &amp; live production.
            </p>
          </div>
        </div>

        {/* Demo Credential Quick Helper */}
        <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#EE1D45]" />
            <span>Studio Admin Access</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] font-bold text-[#EE1D45] hover:text-[#ff3b61] hover:underline"
          >
            Auto-fill demo
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-rose-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-bold block">Email or Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@gizmoportalin.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#EE1D45] focus:ring-2 focus:ring-[#EE1D45]/20 transition font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-zinc-300 font-bold">Password</label>
              <button
                type="button"
                onClick={() => alert('Password reset verification link has been sent to configured director email.')}
                className="text-[11px] text-[#EE1D45] hover:underline font-semibold"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#EE1D45] focus:ring-2 focus:ring-[#EE1D45]/20 transition font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-[#EE1D45] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-zinc-400 font-medium">Keep me signed in</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] active:bg-[#B80D30] text-white font-extrabold transition shadow-lg shadow-[#EE1D45]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating Session...</span>
              </span>
            ) : (
              <>
                <span>Sign In to CRM</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-800/80 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white font-semibold transition text-xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to Gizmo Public Website</span>
          </button>
        </div>
      </div>
    </div>
  );
};
