import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { AppRoute } from '../../types';
import { GizmoLogo } from '../common/GizmoLogo';

interface AdminLoginProps {
  onLoginSuccess: (redirectTo?: AppRoute) => void;
  onNavigate: (route: AppRoute) => void;
  intendedRoute?: AppRoute;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onNavigate,
  intendedRoute,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email/username and password.');
      return;
    }

    setIsLoading(true);

    // Simulate secure verification
    setTimeout(() => {
      setIsLoading(false);
      // Accept any valid looking admin credentials or demo credentials
      if (email.includes('@') || email.toLowerCase() === 'admin') {
        // Save auth session
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('gizmo_admin_auth', 'true');
          if (rememberMe) {
            localStorage.setItem('gizmo_admin_auth_persistent', 'true');
          }
        }
        onLoginSuccess(intendedRoute);
      } else {
        setError('Invalid admin credentials. Please try again.');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 selection:bg-[#FF5738] selection:text-white">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Card Container */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-zinc-800 space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <GizmoLogo size="xl" className="mx-auto shadow-md" />
            <div>
              <h1 className="text-xl font-black text-zinc-950 tracking-tight">Admin Login</h1>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Sign in to access Gizmo Admin Portal.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-semibold animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="admin@gizmoportalinvoice.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-medium text-zinc-900 outline-none focus:border-[#FF5738] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset instructions sent to registered admin email.')}
                  className="text-[11px] font-bold text-[#FF5738] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-medium text-zinc-900 outline-none focus:border-[#FF5738] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black accent-black cursor-pointer"
                />
                <span className="text-xs font-medium text-zinc-700">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-black hover:bg-zinc-900 text-white text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="pt-4 border-t border-zinc-100 text-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition"
            >
              ← Return to Public Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
