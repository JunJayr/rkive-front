'use client';

import type { ReactNode } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiInbox,
  FiRefreshCw,
} from 'react-icons/fi';

import Spinner from '@/components/common/Spinner';

type Tone = 'info' | 'success' | 'warning' | 'error';

const toneStyles: Record<Tone, { wrap: string; icon: ReactNode }> = {
  info: {
    wrap: 'border-brandNavy/20 bg-brandNavy-50 text-brandNavy',
    icon: <FiAlertCircle size={18} aria-hidden="true" />,
  },
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: <FiCheckCircle size={18} aria-hidden="true" />,
  },
  warning: {
    wrap: 'border-brandGold/50 bg-brandGold/10 text-amber-900',
    icon: <FiAlertCircle size={18} aria-hidden="true" />,
  },
  error: {
    wrap: 'border-rose-200 bg-rose-50 text-rose-800',
    icon: <FiAlertCircle size={18} aria-hidden="true" />,
  },
};

export function ActionSpinner({ label = 'Working' }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2 text-xs font-semibold text-brandNavy">
      <Spinner sm label={label} />
      {label}
    </span>
  );
}

export function RouteSkeleton({
  cards = 4,
  label = 'Loading page',
}: {
  cards?: number;
  label?: string;
}) {
  return (
    <div role="status" aria-label={label} className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <div className="rk-skeleton h-4 w-40" />
      <div className="rk-skeleton mt-4 h-10 w-2/3 max-w-xl" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="rk-card space-y-4 p-6">
            <div className="rk-skeleton h-11 w-11 rounded-xl" />
            <div className="rk-skeleton h-8 w-24" />
            <div className="rk-skeleton h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="rk-card mt-8 space-y-4 p-6">
        <div className="rk-skeleton h-5 w-48" />
        <div className="rk-skeleton h-12 w-full" />
        <div className="rk-skeleton h-12 w-full" />
        <div className="rk-skeleton h-12 w-3/4" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function Notice({
  tone = 'info',
  title,
  message,
  onRetry,
  retryLabel = 'Retry',
}: {
  tone?: Tone;
  title: string;
  message?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const style = toneStyles[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-start sm:justify-between ${style.wrap}`}
    >
      <div className="flex gap-3">
        <span className="mt-0.5 shrink-0">{style.icon}</span>
        <div>
          <p className="text-sm font-bold">{title}</p>
          {message ? <div className="mt-1 text-xs leading-5 opacity-90">{message}</div> : null}
        </div>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-current/20 bg-white/50 px-3 py-2 text-xs font-bold transition hover:bg-white/80"
        >
          <FiRefreshCw size={14} aria-hidden="true" />
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-brandSurface px-6 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brandNavy shadow-sm">
        <FiInbox size={20} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-bold text-ink">{title}</p>
        {description ? <p className="mt-1 text-xs text-mutedSlate">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  const value = (status || '').toLowerCase();
  const styles: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-800',
    active: 'bg-emerald-100 text-emerald-800',
    success: 'bg-emerald-100 text-emerald-800',
    valid: 'bg-emerald-100 text-emerald-800',
    submitted: 'bg-blue-100 text-blue-800',
    pending: 'bg-blue-100 text-blue-800',
    proposed: 'bg-blue-100 text-blue-800',
    draft: 'bg-slate-100 text-slate-600',
    inactive: 'bg-slate-100 text-slate-600',
    rejected: 'bg-rose-100 text-rose-800',
    failed: 'bg-rose-100 text-rose-800',
    invalid: 'bg-rose-100 text-rose-800',
    revision_required: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
  };
  return (
    <span className={`rk-badge ${styles[value] || styles.draft}`}>
      {(value || 'unknown').replace(/_/g, ' ')}
    </span>
  );
}
