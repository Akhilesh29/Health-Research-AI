import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Search,
  ClipboardList,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data =
        mode === 'signup'
          ? await authApi.signup({
              name: form.name,
              email: form.email,
              password: form.password,
            })
          : await authApi.login({ email: form.email, password: form.password });

      // Prevent cross-account stale cache from previous sessions.
      qc.clear();
      setAuth(data.user, data.token);
      navigate('/app/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 flex overflow-y-auto">
      {/* Left panel — branding */}
      <div className="hidden xl:flex xl:w-1/2 flex-col justify-between bg-brand-600 p-10 2xl:p-12 text-white relative overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
                <rect x="10" y="3" width="4" height="18" rx="1.5" />
                <rect x="3" y="10" width="18" height="4" rx="1.5" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-white">Health Research AI</span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight mb-4 text-white">
            Your personal health companion
          </h1>
          <p className="text-white text-lg leading-relaxed">
            Structured symptom intelligence and triage guidance to help you understand your health, anytime, anywhere.
          </p>

          <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-6 text-center">
            <p className="font-display text-xl leading-relaxed text-white/95">
              "The future of healthtech is not just faster diagnosis, but clearer guidance at the exact moment a patient needs it."
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-white/30" />
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">Health Research AI Principle</p>
              <span className="h-px w-8 bg-white/30" />
            </div>
          </div>
        </div>

        <div className="relative space-y-4">
          {[
            { icon: Search, text: 'Instant symptom intelligence' },
            { icon: ClipboardList, text: 'Full history & tracking' },
            { icon: ShieldCheck, text: 'Private & secure by design' },
            { icon: MapPin, text: 'Nearby doctors & hospitals with contact details' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 border border-white/25">
                <Icon size={14} />
              </span>
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-sm sm:max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8 xl:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
                <rect x="10" y="3" width="4" height="18" rx="1.5" />
                <rect x="3" y="10" width="18" height="4" rx="1.5" />
              </svg>
            </div>
            <span className="font-display font-bold text-gray-900 dark:text-white">Health Research AI</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            {mode === 'login'
              ? 'Sign in to access your health dashboard'
              : 'Start your personalized health journey'}
          </p>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 mb-4 text-sm text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-200">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={mode === 'signup' ? 8 : 1}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-5">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
