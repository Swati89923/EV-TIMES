import { useMemo } from 'react'
import { ArrowUp, CheckCircle2, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import ArticleCard from './ArticleCard'
import { EmptyState, ErrorState, Skeleton } from './ui'
import useInfiniteFeed from '../hooks/useInfiniteFeed'
import useLiveNews from '../hooks/useLiveNews'
import useSentinel from '../hooks/useSentinel'

function FeedSkeleton({ count = 5 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-4 border-b border-neutral-200 py-5 dark:border-neutral-800">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="aspect-[4/3] w-28 sm:w-44" />
        </div>
      ))}
    </div>
  )
}

/**
 * Infinite news feed: a lead story followed by dense rows. Loads the next page
 * before the reader reaches the end, and can show a "new stories" pill.
 */
export default function Feed({ params, live = true, category, lead = true, showCount = false, emptyTitle, emptyMessage }) {
  const feed = useInfiniteFeed(params)
  const { items, hasNextPage, isFetchingNextPage, fetchNextPage, isError, isFetchNextPageError } = feed

  const { pending, showPending } = useLiveNews({ params, items, enabled: live, category })

  const canLoad = hasNextPage && !isFetchingNextPage && !isFetchNextPageError
  const sentinel = useSentinel(() => canLoad && fetchNextPage(), !!hasNextPage, [items.length, canLoad])

  const [first, rest] = useMemo(() => (lead ? [items[0], items.slice(1)] : [null, items]), [items, lead])

  if (feed.isLoading) return <FeedSkeleton />
  if (isError && !items.length) return <ErrorState onRetry={feed.refetch} />
  if (!items.length) {
    return <EmptyState title={emptyTitle || 'No articles found'} message={emptyMessage || 'Try a different keyword or browse another section.'} />
  }

  return (
    <div>
      <AnimatePresence>
        {pending.length > 0 && (
          <motion.div
            key="pill"
            className="sticky top-36 z-30 -mt-1 mb-3 flex justify-center"
            initial={{ opacity: 0, y: -24, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          >
            <button
              onClick={showPending}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg ring-1 ring-black/10 hover:bg-brand-700"
              aria-live="polite"
            >
              <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="inline-flex">
                <ArrowUp className="h-4 w-4" />
              </motion.span>
              {pending.length} new {pending.length === 1 ? 'story' : 'stories'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showCount && <p className="mb-2 text-sm text-neutral-500">{feed.total} article{feed.total === 1 ? '' : 's'}</p>}

      {first && <ArticleCard news={first} variant="lead" />}
      <div>
        {rest.map((n, i) => <ArticleCard key={n.id} news={n} variant="feed" index={i} />)}
      </div>

      {hasNextPage && <div ref={sentinel} aria-hidden="true" className="h-px" />}

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-neutral-500" role="status">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading more stories...
        </div>
      )}
      {isFetchNextPageError && (
        <div className="py-6">
          <ErrorState message="We could not load more stories." onRetry={() => fetchNextPage()} />
        </div>
      )}
      {!hasNextPage && !isFetchingNextPage && (
        <p className="flex items-center justify-center gap-2 py-8 text-sm font-medium text-neutral-500">
          <CheckCircle2 className="h-4 w-4 text-brand-600" /> You&apos;re all caught up
        </p>
      )}
    </div>
  )
}
