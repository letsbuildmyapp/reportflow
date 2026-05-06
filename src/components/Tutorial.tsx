import { useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sparkles,
  Upload,
  Cpu,
  ClipboardEdit,
  Download,
  History,
  ArrowRight,
  ArrowLeft,
  X,
  PartyPopper,
} from 'lucide-react';
import { useAuth } from '../lib/auth';

const TUTORIAL_KEY_PREFIX = 'reportflow:tutorial_seen:';
const MOBILE_BREAKPOINT = 768;

type Step = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: React.ReactNode;
  /** data-tour attribute on the target element. Omit for centered (welcome / final). */
  target?: string;
  /** Preferred placement of the tooltip relative to the target. */
  placement?: 'right' | 'left' | 'top' | 'bottom';
};

const ADJUSTER_STEPS: Step[] = [
  {
    icon: Sparkles,
    title: 'Welcome to ReportFlow',
    body: 'Turn a stack of claim documents into a polished, structured report — in under a minute. Here is the lay of the land.',
  },
  {
    icon: Upload,
    title: 'Start with the documents',
    body: (
      <>
        Tap <span className="font-semibold">New Report</span> to drop in PDFs, photos of damage, scanned forms, or DOCX. Multiple files at once is the norm.
      </>
    ),
    target: 'new-report-nav',
    placement: 'bottom',
  },
  {
    icon: Cpu,
    title: 'AI does the first pass',
    body: 'Our AI reads every file and drafts the report — claimant info, incident facts, line-item damages, and a narrative summary — usually in well under a minute, even on long claim packets.',
  },
  {
    icon: ClipboardEdit,
    title: 'Review and refine',
    body: 'Every extracted field is editable — claimant details, incident facts, line-item damages, risk flags, next steps. You stay in control; the AI just gets you to the 90% mark.',
  },
  {
    icon: Download,
    title: 'Export a clean PDF',
    body: 'When the report looks right, one tap renders a branded PDF and stores it alongside the case. Email it, attach it, archive it.',
  },
  {
    icon: History,
    title: 'Everything stays here',
    body: 'Your dashboard keeps every report — searchable, re-openable, re-runnable. Status pills tell you what is queued, processing, ready, or errored.',
    target: 'reports-history',
    placement: 'bottom',
  },
  {
    icon: PartyPopper,
    title: "You're set.",
    body: (
      <>
        Open <span className="font-semibold">New Report</span> to try it on a real claim packet. Built by{' '}
        <a href="https://letsbuildmyapp.com" className="underline decoration-brand-400 underline-offset-2 hover:text-brand-600">
          letsbuildmyapp.com
        </a>.
      </>
    ),
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export function Tutorial() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.innerWidth < MOBILE_BREAKPOINT,
  );

  // Single-role app — claim adjuster
  const role = user ? 'adjuster' : null;
  const STEPS = useMemo<Step[]>(() => ADJUSTER_STEPS, []);

  // Reset to first step if the role changes mid-tour
  useEffect(() => { setStep(0); }, [STEPS]);

  // First-run check — per role, per device
  useEffect(() => {
    if (!role) { setOpen(false); return; }
    const seen = localStorage.getItem(TUTORIAL_KEY_PREFIX + role);
    setOpen(!seen);
    setStep(0);
  }, [role]);

  // Track viewport size
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  const close = useCallback(() => {
    if (role) localStorage.setItem(TUTORIAL_KEY_PREFIX + role, '1');
    setOpen(false);
  }, [role]);

  const next = useCallback(() => {
    setStep((s) => {
      if (s < STEPS.length - 1) return s + 1;
      close();
      return s;
    });
  }, [close, STEPS.length]);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  // Keyboard
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close, next, back]);

  const currentStep = STEPS[step];
  const targetSel = currentStep?.target;

  useLayoutEffect(() => {
    if (!open || isMobile || !targetSel) {
      setRect(null);
      return;
    }
    const compute = () => {
      const el = document.querySelector(`[data-tour="${targetSel}"]`) as HTMLElement | null;
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    compute();
    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, isMobile, targetSel, step]);

  if (!open || !currentStep) return null;

  const hasTarget = !!rect && !!targetSel;
  if (isMobile || !hasTarget) {
    return (
      <CenteredModal
        steps={STEPS}
        step={step}
        onClose={close}
        onNext={next}
        onBack={back}
        onJump={setStep}
        dim={!isMobile && !targetSel}
      />
    );
  }

  // ---------- DESKTOP: spotlight ----------
  const Icon = currentStep.icon;
  const isLast = step === STEPS.length - 1;

  const PAD = 16;
  const TOOLTIP_W = 380;
  const TOOLTIP_H_EST = 320;
  let top = 0;
  let left = 0;
  if (rect) {
    const placement = currentStep.placement ?? 'right';
    if (placement === 'right') {
      left = rect.left + rect.width + PAD;
      top = rect.top;
      if (left + TOOLTIP_W > window.innerWidth - PAD) {
        left = rect.left;
        top = rect.top + rect.height + PAD;
      }
    } else if (placement === 'left') {
      left = rect.left - TOOLTIP_W - PAD;
      top = rect.top;
    } else if (placement === 'bottom') {
      left = rect.left;
      top = rect.top + rect.height + PAD;
    } else if (placement === 'top') {
      left = rect.left;
      top = rect.top - TOOLTIP_H_EST - PAD;
    }
    left = Math.min(Math.max(PAD, left), window.innerWidth - TOOLTIP_W - PAD);
    top = Math.min(Math.max(PAD, top), window.innerHeight - TOOLTIP_H_EST - PAD);
  }
  const tipStyle: React.CSSProperties = { top, left, width: TOOLTIP_W };

  return (
    <AnimatePresence>
      {/* Spotlight backdrop with cutout */}
      <motion.div
        key="spot-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        onClick={close}
      >
        {hasTarget && rect ? (
          <motion.div
            initial={false}
            animate={{
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16,
            }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className="absolute rounded-3xl pointer-events-none"
            style={{
              boxShadow:
                '0 0 0 9999px rgba(20, 18, 50, 0.62), 0 0 0 2px oklch(70% 0.20 270), 0 0 32px 4px oklch(70% 0.20 270 / 0.55)',
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        )}
      </motion.div>

      {/* Glassy tooltip card */}
      <motion.div
        key={`tip-${step}`}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        className="fixed z-[101] rounded-3xl overflow-hidden bg-white/85 dark:bg-ink-900/80 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_24px_60px_rgba(20,20,60,0.25)]"
        style={tipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pastel gradient header strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-accent-500 to-brand-400" />

        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <span className="text-xs uppercase tracking-[0.12em] font-semibold text-ink-700 dark:text-ink-200">
            Tour · <span className="nums">{step + 1}</span> of <span className="nums">{STEPS.length}</span>
          </span>
          <button
            onClick={close}
            className="text-ink-700 hover:text-ink-900 dark:text-ink-200 dark:hover:text-white p-1.5 rounded-xl hover:bg-white/70 dark:hover:bg-ink-800/60 transition"
            aria-label="Close tour"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-white/60 dark:border-white/10 grid place-items-center mb-4 shadow-inner">
            <Icon size={20} className="text-brand-600 dark:text-brand-300" />
          </div>
          <h2
            id="tutorial-title"
            className="font-display text-title2 font-bold tracking-tight text-ink-900 dark:text-ink-50"
          >
            {currentStep.title}
          </h2>
          <div className="text-subheadline leading-relaxed text-ink-700 dark:text-ink-200 mt-2">
            {currentStep.body}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-white/50 dark:border-white/10 bg-white/40 dark:bg-ink-900/40">
          <div className="flex items-center gap-1.5 pl-1">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={
                  i === step
                    ? 'h-1.5 w-6 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all'
                    : 'h-1.5 w-1.5 rounded-full bg-ink-300/70 dark:bg-ink-600/70 hover:bg-ink-400 transition-all'
                }
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <button
                onClick={back}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-2xl text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-white/70 dark:hover:bg-ink-800/60 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <button
                onClick={close}
                className="inline-flex items-center h-9 px-3 rounded-2xl text-sm font-medium text-ink-700 dark:text-ink-200 hover:text-ink-900 dark:hover:text-white transition"
              >
                Skip
              </button>
            )}
            <button
              onClick={next}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-2xl text-sm font-semibold text-white bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:from-brand-600 hover:to-brand-800 active:scale-[0.98] transition"
            >
              {isLast ? 'Done' : 'Next'} {!isLast ? <ArrowRight size={14} /> : null}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ---------- Centered modal (mobile + no-target desktop steps) ----------
function CenteredModal({
  steps, step, onClose, onNext, onBack, onJump, dim = true,
}: {
  steps: Step[];
  step: number;
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
  onJump: (i: number) => void;
  dim?: boolean;
}) {
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[100] grid place-items-center px-4 py-8 backdrop-blur-md ${
          dim ? 'bg-ink-950/55' : 'bg-ink-950/55'
        }`}
        onClick={onClose}
      >
        <motion.div
          key={`step-${step}`}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="w-full max-w-md rounded-3xl overflow-hidden bg-white/85 dark:bg-ink-900/85 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_32px_80px_rgba(20,20,60,0.35)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Pastel gradient header strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-accent-500 to-brand-400" />

          <div className="flex items-center justify-between px-6 pt-5">
            <span className="text-xs uppercase tracking-[0.12em] font-semibold text-ink-700 dark:text-ink-200">
              Tour · <span className="nums">{step + 1}</span> of <span className="nums">{steps.length}</span>
            </span>
            <button
              onClick={onClose}
              className="text-ink-700 hover:text-ink-900 dark:text-ink-200 dark:hover:text-white p-1.5 rounded-xl hover:bg-white/70 dark:hover:bg-ink-800/60 transition"
              aria-label="Close tour"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-6 pb-6 pt-3">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-brand-500/25 to-accent-500/25 border border-white/60 dark:border-white/10 grid place-items-center mb-5 shadow-inner">
              <Icon size={26} className="text-brand-600 dark:text-brand-300" />
            </div>
            <h2 className="font-display text-title1 font-bold tracking-tight text-ink-900 dark:text-ink-50">
              {current.title}
            </h2>
            <div className="text-base leading-relaxed text-ink-700 dark:text-ink-200 mt-3">
              {current.body}
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-t border-white/50 dark:border-white/10 bg-white/40 dark:bg-ink-900/40">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onJump(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={
                    i === step
                      ? 'h-1.5 w-6 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all'
                      : 'h-1.5 w-1.5 rounded-full bg-ink-300/70 dark:bg-ink-600/70 hover:bg-ink-400 transition-all'
                  }
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {step > 0 ? (
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-2xl text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-white/70 dark:hover:bg-ink-800/60 transition"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="inline-flex items-center h-10 px-3.5 rounded-2xl text-sm font-medium text-ink-700 dark:text-ink-200 hover:text-ink-900 dark:hover:text-white transition"
                >
                  Skip
                </button>
              )}
              <button
                onClick={onNext}
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:from-brand-600 hover:to-brand-800 active:scale-[0.98] transition"
              >
                {isLast ? 'Done' : 'Next'} {!isLast ? <ArrowRight size={14} /> : null}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
