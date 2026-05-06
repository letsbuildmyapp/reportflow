import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { createReport, triggerProcessing, uploadFiles } from '../lib/reports';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Upload, FileText, Image as ImageIcon, FileType, X, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { formatBytes, fileIconColor } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.docx,.txt';

export function NewReport() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    setFiles((prev) => {
      const merged = [...prev];
      for (const f of arr) {
        if (!merged.find((x) => x.name === f.name && x.size === f.size)) merged.push(f);
      }
      return merged;
    });
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const submit = async () => {
    if (!user) return;
    if (files.length === 0) {
      toast.error('Add at least one file');
      return;
    }
    setBusy(true);
    try {
      const titleVal = title.trim() || `Claim Report — ${new Date().toLocaleDateString()}`;
      const tempId = `tmp_${Date.now()}`;
      toast.info('Uploading files...');
      const uploaded = await uploadFiles(user.uid, tempId, files);
      const id = await createReport({ ownerId: user.uid, title: titleVal, files: uploaded });
      toast.success('Report created — processing now');
      // Fire-and-forget the function call; the detail page subscribes for status.
      triggerProcessing(id).catch((e) => {
        console.warn('processReport call failed', e);
      });
      nav(`/report/${id}`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to create report');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink-900 dark:hover:text-ink-100 transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">New claim report</h1>
        <p className="text-muted mt-1">Upload claim documents — PDFs, photos of damage, scanned forms, or DOCX.</p>
      </div>

      <div className="glass-strong rounded-3xl p-6 space-y-5">
        <div>
          <label className="text-sm font-medium block mb-1.5">Report title (optional)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Auto Collision — Policy 4471"
            className="glass-input w-full rounded-2xl px-4 py-2.5"
          />
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition-all
            ${drag
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
              : 'border-ink-300 dark:border-ink-700 hover:border-brand-400 hover:bg-white/40 dark:hover:bg-ink-800/40'}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <div className="size-14 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center mb-3 shadow-lg shadow-brand-500/30">
            <Upload className="size-7 text-white" />
          </div>
          <p className="font-medium">Drop files here, or click to browse</p>
          <p className="text-footnote text-muted mt-1.5">PDF · PNG · JPG · WEBP · DOCX · TXT — up to 25 MB each</p>
        </div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
              <div className="text-sm font-semibold text-ink-700 dark:text-ink-200">
                {files.length} file{files.length === 1 ? '' : 's'} ready
              </div>
              {files.map((f) => {
                const Icon = f.type.includes('image') ? ImageIcon : f.type.includes('pdf') ? FileText : FileType;
                return (
                  <div key={`${f.name}-${f.size}`} className="glass rounded-2xl p-3 flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white/70 dark:bg-ink-800 grid place-items-center">
                      <Icon className={`size-5 ${fileIconColor(f.type)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{f.name}</div>
                      <div className="text-footnote text-muted nums">{formatBytes(f.size)}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFiles((p) => p.filter((x) => x !== f)); }}
                      className="p-2 hover:bg-white/60 dark:hover:bg-ink-800 rounded-lg"
                      aria-label="Remove file"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={submit} disabled={busy || files.length === 0} className="btn-primary w-full !py-3">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {busy ? 'Creating...' : 'Generate report'}
        </button>
      </div>
    </div>
  );
}
