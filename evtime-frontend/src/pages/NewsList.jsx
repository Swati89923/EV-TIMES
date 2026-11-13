import { useParams, useSearchParams } from 'react-router-dom'
import Feed from '../components/Feed'
import { EmptyState, LiveBadge } from '../components/ui'
import useDocumentTitle from '../hooks/useDocumentTitle'

export function CategoryPage() {
  const { name } = useParams()
  useDocumentTitle(name, `Latest ${name} news from EV Times.`)

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">Section</p>
      <div className="mb-6 flex items-end justify-between border-b-2 border-ink pb-3 dark:border-neutral-200">
        <h1 className="text-4xl font-extrabold">{name}</h1>
        <LiveBadge />
      </div>
      <Feed key={name} params={{ category: name }} category={name} />
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
      {q ? (
        <Feed key={q} params={{ q }} live={false} lead={false} showCount />
      ) : (
        <EmptyState title="Type something to search" message="Use the search box in the header." />
      )}
    </div>
  )
}
