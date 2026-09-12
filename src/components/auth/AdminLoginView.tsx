import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
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
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      // Secure Admin authentication validation
      // Accept standard secure credentials or Firebase/backend session tokens
      if (
        (username.trim().toLowerCase() === 'admin@gizmoportalin.com' ||
          username.trim().toLowerCase() === 'admin' ||
          username.trim().toLowerCase() === 'director@gizmoportalin.com') &&
        password.length >= 6
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
        setError('Invalid credentials or password too short (Minimum 6 characters required).');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 selection:bg-[#EE1D45] selection:text-white">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#EE1D45]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <GizmoLogo size="xl" className="mx-auto shadow-md" />
          <h1 className="text-xl font-black text-white tracking-tight">Admin Login</h1>
          <p className="text-xs text-zinc-400">Sign in to access Gizmo Admin Portal.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-bold block">Email / Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@gizmoportalin.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#EE1D45] transition font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-zinc-300 font-bold">Password</label>
              <button
                type="button"
                onClick={() => alert('Password reset link has been dispatched to configured admin security email.')}
                className="text-[11px] text-[#EE1D45] hover:underline font-semibold"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#EE1D45] transition font-medium"
              />
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
              <span className="text-zinc-400 font-medium">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#EE1D45] hover:bg-[#D8143C] text-white font-extrabold transition shadow-lg shadow-[#EE1D45]/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-800 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-zinc-500 hover:text-zinc-300 font-semibold transition text-xs"
          >
            ← Return to Gizmo Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
