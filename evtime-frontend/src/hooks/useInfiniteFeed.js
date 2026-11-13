import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getNews } from '../api/news'

export const PAGE_SIZE = 12

export const feedKey = (params) => ['feed', params]

/** Paged news list for infinite scrolling. Items are de-duplicated by id. */
export default function useInfiniteFeed(params) {
  const query = useInfiniteQuery({
    queryKey: feedKey(params),
    queryFn: ({ pageParam }) => getNews({ ...params, page: pageParam, size: PAGE_SIZE, sortBy: 'createdAt', direction: 'desc' }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.last || last.content.length === 0 ? undefined : last.number + 1),
    staleTime: 120000,
  })

  const items = useMemo(() => {
    const seen = new Set()
    const out = []
    for (const page of query.data?.pages ?? []) {
      for (const n of page.content) {
        if (!seen.has(n.id)) {
          seen.add(n.id)
          out.push(n)
        }
      }
    }
    return out
  }, [query.data])

  const total = query.data?.pages?.[0]?.totalElements ?? 0
  return { ...query, items, total }
}
