import { motion } from 'framer-motion';
import { Sparkles, FileSearch, Brain, FileCheck2 } from 'lucide-react';

const steps = [
  { icon: FileSearch, label: 'Reading documents' },
  { icon: Brain, label: 'Extracting structured fields' },
  { icon: Sparkles, label: 'Drafting summary' },
  { icon: FileCheck2, label: 'Finalizing report' },
];

export function ProcessingState({ fixture }: { fixture?: boolean }) {
  return (
    <div className="glass-strong rounded-3xl p-8 sm:p-12 text-center">
      <div className="relative size-24 mx-auto mb-6">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-400 via-accent-400 to-brand-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ filter: 'blur(14px)', opacity: 0.7 }}
        />
        <div className="absolute inset-2 rounded-full glass-strong grid place-items-center">
          <Sparkles className="size-9 text-brand-600 animate-pulse" />
        </div>
      </div>
      <h3 className="font-display text-2xl font-bold mb-2">Reading your claim...</h3>
      <p className="text-muted max-w-md mx-auto mb-8 leading-relaxed">
        ReportFlow is extracting claimant info, damage line items, and drafting a narrative summary.
        {fixture && <span className="block mt-2 text-xs font-semibold tracking-[0.05em] uppercase text-amber-700 dark:text-amber-300">Demo mode — using fixture data.</span>}
      </p>
      <div className="grid sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4 }}
            className="glass rounded-2xl p-4"
          >
            <s.icon className="size-5 text-brand-500 mx-auto mb-2" />
            <div className="text-xs font-semibold text-ink-800 dark:text-ink-100">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
