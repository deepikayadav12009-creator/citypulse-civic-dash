import type { Severity } from '@/lib/types';

export function severityLabel(s: Severity): string {
  return { low: 'Low', moderate: 'Moderate', high: 'High', critical: 'Critical' }[s];
}

export function severityColor(s: Severity): string {
  return {
    low: 'bg-slate-100 text-slate-600 ring-slate-200',
    moderate: 'bg-amber-50 text-amber-700 ring-amber-200',
    high: 'bg-orange-50 text-orange-700 ring-orange-200',
    critical: 'bg-rose-50 text-rose-700 ring-rose-200',
  }[s];
}

export function severityDot(s: Severity): string {
  return {
    low: 'bg-slate-400',
    moderate: 'bg-amber-500',
    high: 'bg-orange-500',
    critical: 'bg-rose-500',
  }[s];
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export function typeLabel(type: string): string {
  return {
    traffic: 'Traffic',
    weather: 'Weather / Air',
    water: 'Water',
    complaint: 'Complaint',
    noise: 'Noise',
    transit: 'Transit',
    community: 'Community',
  }[type] ?? type;
}

export function typeColor(type: string): string {
  return {
    traffic: 'text-rose-600',
    weather: 'text-sky-600',
    water: 'text-blue-600',
    complaint: 'text-purple-600',
    noise: 'text-amber-600',
    transit: 'text-teal-600',
    community: 'text-violet-600',
  }[type] ?? 'text-slate-600';
}
