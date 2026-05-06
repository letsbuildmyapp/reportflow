import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, FileText, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { motion } from 'framer-motion';

function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() =>
    document.documentElement.classList.contains('dark'),
  );
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('rf-theme', dark ? 'dark' : 'light');
    } catch {}
  }, [dark]);
  return (
    <button
      onClick={() => setDark((v) => !v)}
      className="btn-ghost !px-3"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function Layout() {
  const { user, signOutUser } = useAuth();
  const nav = useNavigate();
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/40 dark:bg-ink-950/40 border-b border-white/30 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to={user ? '/dashboard' : '/'} data-tour="brand" className="flex items-center gap-2 group">
            <div className="size-9 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition">
              <FileText className="size-5 text-white" strokeWidth={2.25} />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">ReportFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <button onClick={async () => { await signOutUser(); nav('/'); }} className="btn-ghost !px-3" aria-label="Sign out">
                <LogOut className="size-4" />
                <span className="hidden sm:inline text-sm">{user.email?.split('@')[0]}</span>
              </button>
            ) : (
              <Link to="/login" className="btn-primary !py-2 !px-4 text-sm">Sign in</Link>
            )}
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
      >
        <Outlet />
      </motion.main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-center text-sm text-muted">
        Built by <a href="https://letsbuildmyapp.com" className="underline hover:text-brand-600">letsbuildmyapp.com</a> · ReportFlow demo
      </footer>
    </div>
  );
}
