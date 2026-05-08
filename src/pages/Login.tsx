import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';
import { ArrowRight, Loader2, FileText, ShieldCheck, Briefcase } from 'lucide-react';

const DEMO_PASSWORD = 'demo1234';

const DEMO_LOGINS = [
  {
    email: 'demo@reportflow.app',
    password: DEMO_PASSWORD,
    label: 'Demo Adjuster',
    description: 'Senior Claims Adjuster',
    icon: ShieldCheck,
    color: 'from-indigo-500 to-violet-500',
  },
  {
    email: 'avery@reportflow.app',
    password: DEMO_PASSWORD,
    label: 'Avery Patel',
    description: 'Auto Claims Specialist',
    icon: Briefcase,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    email: 'rowan@reportflow.app',
    password: DEMO_PASSWORD,
    label: 'Rowan Kim',
    description: 'Property Claims Lead',
    icon: FileText,
    color: 'from-amber-500 to-orange-500',
  },
];

export function Login() {
  const { signIn, signUp } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const dest = (loc.state as any)?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      nav(dest, { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  async function onDemoLogin(d: (typeof DEMO_LOGINS)[number]) {
    setEmail(d.email);
    setPassword(d.password);
    setDemoLoading(d.email);
    try {
      try {
        await signIn(d.email, d.password);
      } catch {
        await signUp(d.email, d.password);
      }
      toast.success(`Signed in as ${d.label}`);
      nav(dest, { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? 'Sign-in failed');
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="size-7 rounded-md bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center shadow-lg shadow-brand-500/30">
            <FileText className="size-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="tracking-tight">ReportFlow</span>
        </Link>
        <span className="text-xs text-muted">
          Need help?{' '}
          <a
            href="mailto:hello@letsbuildmyapp.com?subject=ReportFlow%20support"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Contact support
          </a>
        </span>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[440px]"
        >
          <div className="glass-strong rounded-3xl p-8 shadow-2xl">
            <div className="space-y-1.5">
              <h1 className="font-display text-2xl font-semibold tracking-tight">Sign in to ReportFlow</h1>
              <p className="text-sm text-muted">
                New here?{' '}
                <button
                  type="button"
                  onClick={() => onDemoLogin(DEMO_LOGINS[0])}
                  className="font-medium text-brand-600 underline-offset-4 hover:underline"
                >
                  Try a demo account
                </button>
              </p>
            </div>

            <div className="my-6 grid gap-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  One-click demo logins
                </span>
                <span className="text-[10px] text-muted">No password needed</span>
              </div>
              {DEMO_LOGINS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => onDemoLogin(d)}
                  disabled={demoLoading !== null || loading}
                  className="group flex items-center gap-3 rounded-2xl border border-ink-200/70 dark:border-ink-700/70 bg-white/60 dark:bg-ink-800/40 hover:bg-white dark:hover:bg-ink-800/70 p-3 text-left transition-all disabled:opacity-50"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${d.color} text-white shadow-sm`}>
                    <d.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{d.label}</div>
                    <div className="truncate text-xs text-muted">{d.description}</div>
                  </div>
                  {demoLoading === d.email ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>
              ))}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-ink-200 dark:border-ink-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-3 text-muted bg-[var(--glass-bg,transparent)]">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full rounded-2xl px-4 py-2.5"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-xs text-muted hover:underline">Forgot?</Link>
                </div>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full rounded-2xl px-4 py-2.5"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                {loading ? <Loader2 className="size-4 animate-spin" /> : 'Sign in'}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 px-6 pb-8 text-center text-xs text-muted sm:px-10">
        <a
          href="https://letsbuildmyapp.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Let&apos;s Build My App
        </a>
      </footer>
    </div>
  );
}
