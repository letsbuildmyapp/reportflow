import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Sparkles, ShieldCheck, Zap, Edit3, Download } from 'lucide-react';
import { useAuth } from '../lib/auth';

export function Landing() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <div className="space-y-24">
      <section className="pt-12 sm:pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 text-sm"
        >
          <Sparkles className="size-3.5 text-brand-600" />
          <span className="text-ink-700 dark:text-ink-200">Built for insurance claims teams</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="font-display text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05]"
        >
          Turn claim documents into
          <span className="block bg-gradient-to-r from-brand-500 via-accent-500 to-brand-700 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            structured reports in minutes.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-lg sm:text-xl text-ink-700 dark:text-ink-200 max-w-[65ch] mx-auto leading-relaxed"
        >
          Upload PDFs, photos, and adjuster notes. ReportFlow's AI extracts every field,
          drafts the narrative, and exports a polished PDF — ready for review.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8 flex items-center justify-center gap-3 flex-wrap"
        >
          <Link to={user ? '/dashboard' : '/login'} className="btn-primary !text-base !px-6 !py-3">
            {user ? 'Go to dashboard' : 'Try it free'} <ArrowRight className="size-4" />
          </Link>
          <a href="#how" className="btn-secondary !text-base !px-6 !py-3">See how it works</a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-16 mx-auto max-w-5xl"
        >
          <div className="glass-strong rounded-3xl p-2 sm:p-3 shadow-2xl shadow-brand-500/10">
            <div className="rounded-2xl bg-gradient-to-br from-ink-50 to-brand-50 dark:from-ink-900 dark:to-ink-800 aspect-[16/9] grid place-items-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(at_30%_30%,oklch(70%_0.18_270/0.4),transparent_60%),radial-gradient(at_70%_60%,oklch(70%_0.18_200/0.4),transparent_60%)]" />
              <div className="relative grid sm:grid-cols-3 gap-3 p-6 sm:p-10 w-full">
                <FloatingCard delay={0} icon={<FileText className="size-5 text-brand-600" />} title="claim_4471.pdf" subtitle="3.2 MB · uploaded" />
                <FloatingCard delay={0.4} icon={<Sparkles className="size-5 text-accent-500" />} title="Extracting..." subtitle="AI · drafting summary" highlight />
                <FloatingCard delay={0.8} icon={<Download className="size-5 text-emerald-600" />} title="report_4471.pdf" subtitle="Ready · 2 pages" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="how" className="grid sm:grid-cols-3 gap-5">
        {[
          { icon: FileText, title: 'Upload anything', body: 'PDFs, scanned forms, photos of damage, DOCX statements. Drop them in.' },
          { icon: Zap, title: 'AI extracts the data', body: 'Claimant info, damage line items, totals, and narrative summary — auto-populated.' },
          { icon: Edit3, title: 'Review & export', body: 'Edit any field inline, then export a clean branded PDF in one click.' },
        ].map((f) => (
          <div key={f.title} className="glass rounded-3xl p-6">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center mb-4 shadow-md shadow-brand-500/20">
              <f.icon className="size-6 text-white" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">{f.title}</h3>
            <p className="text-ink-700 dark:text-ink-200 text-base leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="glass-strong rounded-3xl p-8 sm:p-14 text-center">
        <ShieldCheck className="size-10 text-brand-600 mx-auto mb-4" />
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">Human in the loop, always</h2>
        <p className="text-ink-700 dark:text-ink-200 max-w-[65ch] mx-auto mb-6 leading-relaxed">
          Every AI-drafted field is editable. Adjusters review, correct, and approve before any
          report leaves the building. ReportFlow accelerates the busywork — you stay in control.
        </p>
        <Link to={user ? '/new' : '/login'} className="btn-primary !text-base !px-6 !py-3">
          Generate your first report <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}

function FloatingCard({
  icon, title, subtitle, highlight, delay,
}: { icon: React.ReactNode; title: string; subtitle: string; highlight?: boolean; delay: number }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, delay }}
      className={`glass-strong rounded-2xl p-4 ${highlight ? 'ring-2 ring-brand-400/60 dark:ring-brand-500/60' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-white/80 dark:bg-ink-800 grid place-items-center shadow-sm">{icon}</div>
        <div className="text-left">
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-footnote text-muted nums">{subtitle}</div>
        </div>
      </div>
    </motion.div>
  );
}
