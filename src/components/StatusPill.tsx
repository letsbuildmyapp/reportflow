import type { ReportStatus } from '../types';
import { CheckCircle2, Clock, Loader2, AlertTriangle } from 'lucide-react';

export function StatusPill({ status }: { status: ReportStatus }) {
  switch (status) {
    case 'queued':
      return <span className="pill-gray"><Clock className="size-3" />Queued</span>;
    case 'processing':
      return <span className="pill-blue"><Loader2 className="size-3 animate-spin" />Processing</span>;
    case 'ready':
      return <span className="pill-green"><CheckCircle2 className="size-3" />Ready</span>;
    case 'error':
      return <span className="pill-red"><AlertTriangle className="size-3" />Error</span>;
  }
}
