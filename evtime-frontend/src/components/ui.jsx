import { useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, Inbox, X } from 'lucide-react'
import { PLACEHOLDER_IMAGE, timeAgo } from '../utils/format'
import useNow from '../hooks/useNow'

export function SmartImage({ src, alt, className = '', ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const failed = !src || failedSrc === src
  return (
    <img
      src={failed ? PLACEHOLDER_IMAGE : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className={`bg-neutral-200 object-cover dark:bg-neutral-800 ${className}`}
      {...rest}
    />
  )
}

/** Relative time that refreshes itself every minute. */
export function TimeAgo({ iso }) {
  useNow()
  return <time dateTime={iso}>{timeAgo(iso)}</time>
}

/** Pulsing "LIVE" marker. */
export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/10 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400" title="This feed updates automatically">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
      </span>
      Live
    </span>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-neutral-200 dark:bg-neutral-800 ${className}`} aria-hidden="true" />
}

export function CardSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <Skeleton className="aspect-[16/10] w-full" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-2/3" />
    </div>
  )
}

export function ErrorState({ message = 'We could not load this content.', onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-950/30">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title = 'Nothing here yet', message, children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-300 px-6 py-14 text-center dark:border-neutral-700">
      <Inbox className="h-9 w-9 text-neutral-400" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {message && <p className="max-w-md text-sm text-neutral-500">{message}</p>}
      {children}
    </div>
  )
}

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null
  const btn = 'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm transition disabled:opacity-40'
  const start = Math.max(0, Math.min(page - 2, totalPages - 5))
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i)
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1">
      <button className={`${btn} border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800`} disabled={page === 0} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`${btn} ${p === page ? 'border-brand-600 bg-brand-600 text-white' : 'border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'}`}
        >
          {p + 1}
        </button>
      ))}
      <button className={`${btn} border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800`} disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

export function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function SectionHeading({ children, action }) {
  return (
    <div className="mb-5 flex items-end justify-between border-b-2 border-ink pb-2 dark:border-neutral-200">
      <h2 className="text-2xl font-bold">{children}</h2>
      {action}
    </div>
  )
}

export const inputCls =
  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-neutral-700 dark:bg-neutral-900'
