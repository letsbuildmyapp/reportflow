import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { watchUserReports } from '../lib/reports';
import type { Report } from '../types';
import { StatusPill } from '../components/StatusPill';
import { motion } from 'framer-motion';
import { FileText, Plus, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[] | null>(null);

  useEffect(() => {
    if (!user) return;
    return watchUserReports(user.uid, setReports);
  }, [user]);

  return (
    <div className="space-y-8">
      <div data-tour="reports-history" className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Your reports</h1>
          <p className="text-muted mt-1">All claim reports you've generated.</p>
        </div>
        <Link to="/new" className="btn-primary"><Plus className="size-4" />New report</Link>
      </div>

      {reports === null ? (
        <SkeletonGrid />
      ) : reports.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/report/${r.id}`} className="group block glass rounded-3xl p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="size-10 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 grid place-items-center">
                    <FileText className="size-5 text-brand-600" />
                  </div>
                  <StatusPill status={r.status} />
                </div>
                <h3 className="font-semibold text-base line-clamp-2 mb-1">{r.title}</h3>
                <p className="text-footnote text-muted nums">
                  {r.files.length} file{r.files.length === 1 ? '' : 's'} ·{' '}
                  {r.createdAt ? formatDistanceToNow(r.createdAt, { addSuffix: true }) : 'just now'}
                </p>
                {r.data && (
                  <div className="mt-4 pt-3 border-t border-ink-200/60 dark:border-ink-700/60 flex items-center justify-between">
                    <span className="text-footnote text-muted">Total damages</span>
                    <span className="font-semibold text-sm nums">${r.data.estimatedTotalUSD.toLocaleString()}</span>
                  </div>
                )}
                <div className="mt-3 inline-flex items-center text-footnote font-semibold text-brand-700 dark:text-brand-300 group-hover:gap-2 gap-1 transition-all">
                  Open <ArrowRight className="size-3.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="glass-strong rounded-3xl p-10 sm:p-16 text-center">
      <div className="size-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center mb-4">
        <FileText className="size-8 text-white" />
      </div>
      <h3 className="font-display text-xl font-bold mb-2">No reports yet</h3>
      <p className="text-muted mb-6 max-w-prose mx-auto leading-relaxed">
        Upload your first claim documents and ReportFlow will draft a structured report you can review.
      </p>
      <Link to="/new" className="btn-primary"><Plus className="size-4" />Create your first report</Link>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass rounded-3xl p-5 animate-pulse">
          <div className="size-10 rounded-2xl bg-ink-200 dark:bg-ink-800 mb-3" />
          <div className="h-4 bg-ink-200 dark:bg-ink-800 rounded mb-2 w-3/4" />
          <div className="h-3 bg-ink-200 dark:bg-ink-800 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
