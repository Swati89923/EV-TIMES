import { useCallback, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getLatest } from '../api/news'
import { feedKey } from './useInfiniteFeed'

const POLL_MS = 60000

/**
 * Polls /news/latest for stories newer than the newest one already in the feed.
 * Polling pauses while the tab is hidden and resumes (with a refetch) on focus.
 * `pending` holds stories that are not in the feed yet; `showPending` merges them
 * into the cached first page so nothing reloads.
 */
export default function useLiveNews({ params, items, enabled = true, category }) {
  const queryClient = useQueryClient()
  const newest = items[0]?.createdAt
  const sinceRef = useRef(newest)
  useEffect(() => {
    sinceRef.current = newest
  }, [newest])

  const live = useQuery({
    queryKey: ['live', params],
    queryFn: () => getLatest(sinceRef.current, 20),
    enabled: enabled && !!newest,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: 'always',
    staleTime: 0,
    gcTime: 0,
  })

  const known = new Set(items.map((n) => n.id))
  const pending = (live.data ?? []).filter(
    (n) => !known.has(n.id) && (!category || n.category?.toLowerCase() === category.toLowerCase()),
  )

  const showPending = useCallback(() => {
    if (!pending.length) return
    queryClient.setQueryData(feedKey(params), (old) => {
      if (!old) return old
      const [first, ...rest] = old.pages
      const merged = { ...first, content: [...pending, ...first.content], totalElements: first.totalElements + pending.length }
      return { ...old, pages: [merged, ...rest] }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pending, params, queryClient])

  return { pending, showPending, lastChecked: live.dataUpdatedAt }
}
