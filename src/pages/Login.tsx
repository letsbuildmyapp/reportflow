import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, FileText, LogIn, ChevronRight } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { email: 'demo@reportflow.app',  name: 'Demo Adjuster',   title: 'Senior Claims Adjuster' },
  { email: 'avery@reportflow.app', name: 'Avery Patel',     title: 'Auto Claims Specialist' },
  { email: 'rowan@reportflow.app', name: 'Rowan Kim',       title: 'Property Claims Lead' },
];

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const dest = (loc.state as any)?.from || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'signin') await signIn(data.email, data.password);
      else await signUp(data.email, data.password);
      toast.success(mode === 'signin' ? 'Welcome back!' : 'Account created');
      nav(dest, { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? 'Authentication failed');
    }
  };

  const [quickBusy, setQuickBusy] = useState<string | null>(null);

  const quickSignIn = async (email: string) => {
    setQuickBusy(email);
    try {
      try {
        await signIn(email, 'demo1234');
      } catch {
        await signUp(email, 'demo1234');
      }
      toast.success('Welcome back!');
      nav(dest, { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? 'Sign-in failed');
    } finally {
      setQuickBusy(null);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-8 sm:pt-16">
      <div className="text-center mb-8">
        <div className="size-14 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center mb-4 shadow-lg shadow-brand-500/30">
          <FileText className="size-7 text-white" strokeWidth={2.25} />
        </div>
        <h1 className="font-display text-3xl font-bold">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="text-muted mt-1">to ReportFlow</p>
      </div>

      <div className="glass-strong rounded-3xl p-6 sm:p-8">
        <button
          onClick={async () => {
            try {
              await signInWithGoogle();
              nav(dest, { replace: true });
            } catch (e: any) {
              toast.error(e?.message ?? 'Google sign-in failed');
            }
          }}
          className="btn-secondary w-full !py-3 mb-5"
        >
          <LogIn className="size-4" />
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
          <span className="eyebrow">or email</span>
          <div className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className="glass-input w-full rounded-2xl px-4 py-2.5"
              placeholder="you@company.com"
            />
            {errors.email && <p className="text-footnote text-red-700 dark:text-red-300 mt-1.5 font-medium">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Password</label>
            <input
              {...register('password')}
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="glass-input w-full rounded-2xl px-4 py-2.5"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-footnote text-red-700 dark:text-red-300 mt-1.5 font-medium">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full !py-3">
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-5 text-sm">
          <button
            onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
            className="text-brand-600 hover:underline"
          >
            {mode === 'signin' ? 'Need an account?' : 'Have an account?'}
          </button>
        </div>
      </div>

      {/* Demo accounts */}
      <div className="glass-strong rounded-3xl p-6 sm:p-8 mt-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
          <span className="eyebrow">demo accounts</span>
          <div className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
        </div>
        <p className="text-sm text-muted mb-4">One-click sign-in. Each adjuster sees the same seeded reports.</p>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((u) => (
            <button
              key={u.email}
              type="button"
              onClick={() => quickSignIn(u.email)}
              disabled={quickBusy !== null}
              className="w-full flex items-center gap-3 rounded-2xl border border-ink-200/70 dark:border-ink-700/70 bg-white/60 dark:bg-ink-800/40 hover:bg-white dark:hover:bg-ink-800/70 transition-colors px-4 py-3 text-left disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="size-9 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-brand-500/30 grid place-items-center text-sm font-semibold text-brand-700 dark:text-brand-300 shrink-0">
                {u.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{u.name}</div>
                <div className="text-xs text-muted truncate">{u.title} · {u.email}</div>
              </div>
              {quickBusy === u.email ? (
                <Loader2 className="size-4 animate-spin text-muted shrink-0" />
              ) : (
                <ChevronRight className="size-4 text-muted shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-footnote text-muted mt-6">
        <Link to="/" className="hover:underline">← Back to home</Link>
      </p>
    </div>
  );
}
