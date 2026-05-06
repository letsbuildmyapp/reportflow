import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions } from './firebase';
import type { Report, UploadedFile } from '../types';
import { shortId } from './utils';

export const reportsCol = () => collection(db, 'reports');
export const reportDoc = (id: string) => doc(db, 'reports', id);

export async function uploadFiles(userId: string, reportId: string, files: File[]) {
  const out: UploadedFile[] = [];
  for (const f of files) {
    const path = `users/${userId}/reports/${reportId}/${Date.now()}_${f.name}`;
    const sref = ref(storage, path);
    await uploadBytes(sref, f, { contentType: f.type || 'application/octet-stream' });
    let url: string | undefined;
    try {
      url = await getDownloadURL(sref);
    } catch {
      // emulator may not support tokens
    }
    out.push({
      name: f.name,
      size: f.size,
      contentType: f.type || 'application/octet-stream',
      storagePath: path,
      downloadURL: url,
    });
  }
  return out;
}

export async function createReport(opts: {
  ownerId: string;
  title: string;
  files: UploadedFile[];
}) {
  const id = shortId();
  const now = Date.now();
  const report: Report = {
    id,
    ownerId: opts.ownerId,
    title: opts.title,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
    files: opts.files,
  };
  await setDoc(reportDoc(id), {
    ...report,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export function watchUserReports(userId: string, cb: (reports: Report[]) => void) {
  const q = query(reportsCol(), where('ownerId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const out: Report[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      out.push({
        ...data,
        id: d.id,
        createdAt: tsToMs(data.createdAt) ?? data.createdAt ?? 0,
        updatedAt: tsToMs(data.updatedAt) ?? data.updatedAt ?? 0,
      });
    });
    cb(out);
  });
}

export function watchReport(id: string, cb: (r: Report | null) => void) {
  return onSnapshot(reportDoc(id), (snap) => {
    if (!snap.exists()) return cb(null);
    const data = snap.data() as any;
    cb({
      ...data,
      id: snap.id,
      createdAt: tsToMs(data.createdAt) ?? data.createdAt ?? 0,
      updatedAt: tsToMs(data.updatedAt) ?? data.updatedAt ?? 0,
    });
  });
}

export async function getReport(id: string): Promise<Report | null> {
  const snap = await getDoc(reportDoc(id));
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return {
    ...data,
    id: snap.id,
    createdAt: tsToMs(data.createdAt) ?? data.createdAt ?? 0,
    updatedAt: tsToMs(data.updatedAt) ?? data.updatedAt ?? 0,
  };
}

export async function updateReportData(id: string, updates: Partial<Report>) {
  await updateDoc(reportDoc(id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

const processReportFn = httpsCallable<{ reportId: string }, { ok: boolean; fixture?: boolean }>(
  functions,
  'processReport',
);

export async function triggerProcessing(reportId: string) {
  return processReportFn({ reportId });
}

function tsToMs(v: unknown): number | null {
  if (!v) return null;
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === 'object' && v && 'seconds' in (v as any)) {
    const s = (v as any).seconds;
    return typeof s === 'number' ? s * 1000 : null;
  }
  return null;
}
