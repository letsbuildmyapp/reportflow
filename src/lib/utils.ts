import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileIconColor(contentType: string) {
  if (contentType.includes('pdf')) return 'text-red-600 dark:text-red-400';
  if (contentType.includes('image')) return 'text-emerald-600 dark:text-emerald-400';
  if (contentType.includes('word') || contentType.includes('document'))
    return 'text-blue-600 dark:text-blue-400';
  return 'text-ink-500';
}

export function shortId(prefix = 'rpt') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
