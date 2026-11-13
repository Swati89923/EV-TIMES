import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getNews } from '../api/news'
import ArticleCard from '../components/ArticleCard'
import { EmptyState, ErrorState, Pagination, Skeleton } from '../components/ui'
import useDocumentTitle from '../hooks/useDocumentTitle'

function Results({ params }) {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['news', 'list', params, page],
    queryFn: () => getNews({ ...params, page, size: 8, sortBy: 'createdAt', direction: 'desc' }),
    placeholderData: (prev) => prev,
  })

  if (isLoading) return <div className="space-y-6">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}</div>
  if (isError) return <ErrorState onRetry={refetch} />
  if (!data.content.length) return <EmptyState title="No articles found" message="Try a different keyword or browse another section." />

  return (
    <>
      <p className="mb-2 text-sm text-neutral-500">{data.totalElements} article{data.totalElements === 1 ? '' : 's'}</p>
      <div>{data.content.map((n) => <ArticleCard key={n.id} news={n} variant="row" />)}</div>
      <Pagination page={page} totalPages={data.totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
    </>
  )
}

export function CategoryPage() {
  const { name } = useParams()
  useDocumentTitle(name, `Latest ${name} news from EV Times.`)

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">Section</p>
      <h1 className="mb-6 border-b-2 border-ink pb-3 text-4xl font-extrabold dark:border-neutral-200">{name}</h1>
      <Results key={name} params={{ category: name }} />
    </div>
  )
}

export function SearchPage() {
  const [sp] = useSearchParams()
  const q = sp.get('q') ?? ''
  useDocumentTitle(q ? `Search: ${q}` : 'Search')

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 border-b-2 border-ink pb-3 text-3xl font-extrabold dark:border-neutral-200">
        {q ? <>Results for &ldquo;{q}&rdquo;</> : 'Search'}
      </h1>
      {q ? <Results key={q} params={{ q }} /> : <EmptyState title="Type something to search" message="Use the search box in the header." />}
    </div>
  )
}
