import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { watchReport, updateReportData, triggerProcessing } from '../lib/reports';
import type { Report, ExtractedReport, DamageItem, ClaimType } from '../types';
import { StatusPill } from '../components/StatusPill';
import { ProcessingState } from '../components/ProcessingState';
import { generatePDFBlob } from '../lib/pdf';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { toast } from 'sonner';
import { ArrowLeft, Download, Plus, Trash2, RefreshCcw, Loader2, FileText, AlertTriangle, Save, Sparkles } from 'lucide-react';
import { formatUSD } from '../lib/utils';
import { motion } from 'framer-motion';

const CLAIM_TYPES: ClaimType[] = ['auto_collision', 'property_damage', 'water_damage', 'theft_burglary', 'fire', 'other'];

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [report, setReport] = useState<Report | null | undefined>(undefined);
  const [draft, setDraft] = useState<ExtractedReport | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    return watchReport(id, (r) => {
      setReport(r);
      if (r?.data && !dirty) setDraft(r.data);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (report === undefined) {
    return <div className="grid place-items-center py-32 text-muted"><Loader2 className="size-8 animate-spin" /></div>;
  }
  if (report === null) {
    return (
      <div className="text-center py-24">
        <h2 className="font-display text-2xl font-bold mb-2">Report not found</h2>
        <Link to="/dashboard" className="btn-secondary">Back to dashboard</Link>
      </div>
    );
  }

  const isProcessing = report.status === 'queued' || report.status === 'processing';
  const isReady = report.status === 'ready' && draft;

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      // recompute total
      const total = draft.damages.reduce((s, d) => s + (Number(d.estimatedCost) || 0), 0);
      const next: ExtractedReport = { ...draft, estimatedTotalUSD: total };
      await updateReportData(report.id, { data: next });
      setDirty(false);
      toast.success('Saved');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const exportPDF = async () => {
    if (!draft) return;
    setExporting(true);
    try {
      const blob = await generatePDFBlob(report, draft);
      const path = `users/${report.ownerId}/reports/${report.id}/report_${report.id}.pdf`;
      const sref = ref(storage, path);
      await uploadBytes(sref, blob, { contentType: 'application/pdf' });
      let url: string | undefined;
      try { url = await getDownloadURL(sref); } catch { /* emulator */ }
      await updateReportData(report.id, { pdfPath: path, pdfURL: url });
      // local download too
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${report.title.replace(/[^a-z0-9]+/gi, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success('PDF exported');
    } catch (e: any) {
      toast.error(e?.message ?? 'PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  const reprocess = async () => {
    try {
      await updateReportData(report.id, { status: 'processing', error: '' });
      await triggerProcessing(report.id);
      toast.success('Re-processing...');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed');
    }
  };

  const update = <K extends keyof ExtractedReport>(k: K, v: ExtractedReport[K]) => {
    setDraft((d) => (d ? { ...d, [k]: v } : d));
    setDirty(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => nav('/dashboard')} className="btn-ghost"><ArrowLeft className="size-4" />Dashboard</button>
        <div className="flex items-center gap-2">
          {report.fixtureMode && <span className="pill-amber">Demo data</span>}
          <StatusPill status={report.status} />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 sm:p-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">{report.title}</h1>
        <p className="text-sm text-muted mt-1">
          {report.files.length} source file{report.files.length === 1 ? '' : 's'} · created {new Date(report.createdAt).toLocaleString()}
        </p>

        {report.files.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {report.files.map((f) => (
              <a key={f.storagePath}
                 href={f.downloadURL ?? '#'}
                 target="_blank"
                 rel="noreferrer"
                 className="glass rounded-xl px-3 py-2 text-footnote font-medium flex items-center gap-2 hover:bg-white/80 dark:hover:bg-ink-800 min-h-[36px]">
                <FileText className="size-3.5" />{f.name}
              </a>
            ))}
          </div>
        )}
      </motion.div>

      {report.status === 'error' && (
        <div className="glass-strong rounded-3xl p-6 border-l-4 border-red-500">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-700 dark:text-red-300">Processing failed</h3>
              <p className="text-sm text-muted mt-1">{report.error || 'Unknown error.'}</p>
              <button onClick={reprocess} className="btn-secondary mt-4"><RefreshCcw className="size-4" />Retry</button>
            </div>
          </div>
        </div>
      )}

      {isProcessing && <ProcessingState fixture={report.fixtureMode} />}

      {isReady && draft && (
        <div className="space-y-6">
          {/* Summary */}
          <Card title="Summary" subtitle="AI-drafted narrative — edit freely">
            <textarea
              value={draft.summary}
              onChange={(e) => update('summary', e.target.value)}
              rows={4}
              className="glass-input w-full rounded-2xl p-4 text-sm leading-relaxed"
            />
          </Card>

          {/* Claimant */}
          <Card title="Claimant">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name" value={draft.claimant.name} onChange={(v) => update('claimant', { ...draft.claimant, name: v })} />
              <Field label="Policy #" value={draft.claimant.policyNumber} onChange={(v) => update('claimant', { ...draft.claimant, policyNumber: v })} />
              <Field label="Claim #" value={draft.claimant.claimNumber} onChange={(v) => update('claimant', { ...draft.claimant, claimNumber: v })} />
              <Field label="Email" value={draft.claimant.email ?? ''} onChange={(v) => update('claimant', { ...draft.claimant, email: v })} />
              <Field label="Phone" value={draft.claimant.phone ?? ''} onChange={(v) => update('claimant', { ...draft.claimant, phone: v })} />
            </div>
          </Card>

          {/* Incident */}
          <Card title="Incident">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Date" type="date" value={draft.incident.date.slice(0, 10)} onChange={(v) => update('incident', { ...draft.incident, date: v })} />
              <Field label="Location" value={draft.incident.location} onChange={(v) => update('incident', { ...draft.incident, location: v })} />
              <div>
                <label className="eyebrow mb-1 block">Type</label>
                <select
                  value={draft.incident.claimType}
                  onChange={(e) => update('incident', { ...draft.incident, claimType: e.target.value as ClaimType })}
                  className="glass-input w-full rounded-2xl px-4 py-2.5"
                >
                  {CLAIM_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="eyebrow mb-1 block">Description</label>
              <textarea
                value={draft.incident.description}
                onChange={(e) => update('incident', { ...draft.incident, description: e.target.value })}
                rows={3}
                className="glass-input w-full rounded-2xl p-4 text-sm"
              />
            </div>
          </Card>

          {/* Damages */}
          <Card
            title="Damages"
            actions={
              <button
                onClick={() => update('damages', [...draft.damages, { description: '', category: 'Other', estimatedCost: 0 }])}
                className="btn-ghost !py-1.5 !px-3 text-sm"
              >
                <Plus className="size-3.5" />Add line
              </button>
            }
          >
            <div className="space-y-3">
              {draft.damages.map((d, i) => (
                <div key={i} className="glass rounded-2xl p-4 grid sm:grid-cols-12 gap-3 items-start">
                  <input
                    value={d.description}
                    placeholder="Description"
                    onChange={(e) => updateDamage(draft, i, 'description', e.target.value, update)}
                    className="glass-input rounded-xl px-3 py-2 sm:col-span-5"
                  />
                  <input
                    value={d.category}
                    placeholder="Category"
                    onChange={(e) => updateDamage(draft, i, 'category', e.target.value, update)}
                    className="glass-input rounded-xl px-3 py-2 sm:col-span-3"
                  />
                  <input
                    type="number"
                    value={d.estimatedCost}
                    onChange={(e) => updateDamage(draft, i, 'estimatedCost', Number(e.target.value), update)}
                    className="glass-input rounded-xl px-3 py-2 sm:col-span-3 text-right nums"
                  />
                  <button
                    onClick={() => update('damages', draft.damages.filter((_, j) => j !== i))}
                    className="btn-ghost !p-2 sm:col-span-1 !rounded-xl"
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-4">
                <div className="text-footnote text-muted">Estimated total</div>
                <div className="text-2xl font-display font-bold mt-1 nums tracking-tight">
                  {formatUSD(draft.damages.reduce((s, d) => s + (Number(d.estimatedCost) || 0), 0))}
                </div>
              </div>
              <div className="glass rounded-2xl p-4">
                <label className="text-footnote text-muted block mb-1">Recommended payout</label>
                <input
                  type="number"
                  value={draft.recommendedPayoutUSD}
                  onChange={(e) => update('recommendedPayoutUSD', Number(e.target.value))}
                  className="glass-input rounded-xl px-3 py-2 w-full text-2xl font-display font-bold nums tracking-tight"
                />
              </div>
            </div>
          </Card>

          {/* Risk Flags */}
          <Card title="Risk flags">
            {draft.riskFlags.length === 0 ? (
              <p className="text-sm text-muted">No flags raised.</p>
            ) : (
              <div className="space-y-2">
                {draft.riskFlags.map((f, i) => (
                  <div key={i} className={`glass rounded-2xl p-4 border-l-4 ${
                    f.severity === 'high' ? 'border-red-500' : f.severity === 'medium' ? 'border-amber-500' : 'border-emerald-500'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={f.severity === 'high' ? 'pill-red' : f.severity === 'medium' ? 'pill-amber' : 'pill-green'}>
                        {f.severity}
                      </span>
                      <span className="font-medium text-sm">{f.label}</span>
                    </div>
                    <p className="text-sm text-muted">{f.rationale}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Next Steps */}
          <Card title="Next steps">
            <ul className="space-y-2">
              {draft.nextSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-brand-500 mt-1">•</span>
                  <input
                    value={s}
                    onChange={(e) => update('nextSteps', draft.nextSteps.map((x, j) => (j === i ? e.target.value : x)))}
                    className="glass-input rounded-xl px-3 py-2 flex-1"
                  />
                  <button onClick={() => update('nextSteps', draft.nextSteps.filter((_, j) => j !== i))} className="btn-ghost !p-2 !rounded-xl"><Trash2 className="size-4" /></button>
                </li>
              ))}
              <li>
                <button onClick={() => update('nextSteps', [...draft.nextSteps, ''])} className="btn-ghost !py-1.5 !px-3 text-sm"><Plus className="size-3.5" />Add step</button>
              </li>
            </ul>
          </Card>

          {/* Action bar */}
          <div className="sticky bottom-4 glass-strong rounded-3xl p-3 flex items-center justify-between gap-3">
            <div className="text-sm text-muted pl-2">
              {dirty ? <span className="font-medium text-amber-700 dark:text-amber-300">Unsaved changes</span> : 'Up to date'}
            </div>
            <div className="flex gap-2">
              <button onClick={reprocess} className="btn-ghost"><Sparkles className="size-4" />Re-run AI</button>
              <button onClick={save} disabled={!dirty || saving} className="btn-secondary">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Save
              </button>
              <button onClick={exportPDF} disabled={exporting} className="btn-primary">
                {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function updateDamage(
  draft: ExtractedReport,
  index: number,
  key: keyof DamageItem,
  value: string | number,
  update: <K extends keyof ExtractedReport>(k: K, v: ExtractedReport[K]) => void,
) {
  const next = draft.damages.map((d, i) => (i === index ? { ...d, [key]: value } : d));
  update('damages', next);
}

function Card({
  title, subtitle, actions, children,
}: { title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass-strong rounded-3xl p-5 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold">{title}</h3>
          {subtitle && <p className="text-footnote text-muted mt-0.5">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="eyebrow mb-1 block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} className="glass-input w-full rounded-2xl px-4 py-2.5" />
    </div>
  );
}
