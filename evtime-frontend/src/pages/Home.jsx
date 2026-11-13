import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Flame } from 'lucide-react'
import { getCategories, getFeatured, getNews, getTrending } from '../api/news'
import ArticleCard from '../components/ArticleCard'
import Newsletter from '../components/Newsletter'
import { CardSkeleton, EmptyState, ErrorState, Pagination, SectionHeading, Skeleton } from '../components/ui'
import { categoryPath } from '../utils/format'
import useDocumentTitle from '../hooks/useDocumentTitle'

function CategorySection({ category }) {
  const { data } = useQuery({
    queryKey: ['news', 'section', category],
    queryFn: () => getNews({ page: 0, size: 4, category, sortBy: 'createdAt', direction: 'desc' }),
  })
  const items = data?.content ?? []
  if (!items.length) return null
  return (
    <section aria-label={category}>
      <SectionHeading
        action={
          <Link to={categoryPath(category)} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        {category}
      </SectionHeading>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((n) => <ArticleCard key={n.id} news={n} />)}
      </div>
    </section>
  )
}

export default function Home() {
  useDocumentTitle(null, 'Breaking electric vehicle news, analysis and reviews from EV Times.')
  const [page, setPage] = useState(0)

  const featured = useQuery({ queryKey: ['featured'], queryFn: getFeatured })
  const trending = useQuery({ queryKey: ['trending'], queryFn: getTrending })
  const categories = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const latest = useQuery({
    queryKey: ['news', 'latest', page],
    queryFn: () => getNews({ page, size: 9, sortBy: 'createdAt', direction: 'desc' }),
    placeholderData: (prev) => prev,
  })

  const [hero, ...side] = featured.data ?? []
  const sideStories = side.slice(0, 3)

  return (
    <div className="space-y-14">
      <section aria-label="Top stories">
        {featured.isLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="aspect-[16/10] lg:col-span-2" />
            <div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>
          </div>
        ) : featured.isError ? (
          <ErrorState message="Top stories are unavailable right now." onRetry={featured.refetch} />
        ) : hero ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2"><ArticleCard news={hero} variant="hero" /></div>
            <div className="flex flex-col gap-5 lg:divide-y lg:divide-neutral-200 dark:lg:divide-neutral-800">
              {sideStories.map((n) => (
                <div key={n.id} className="lg:pt-5 lg:first:pt-0"><ArticleCard news={n} variant="compact" /></div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-label="Latest news">
          <SectionHeading>Latest News</SectionHeading>
          {latest.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2">{Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}</div>
          ) : latest.isError ? (
            <ErrorState onRetry={latest.refetch} />
          ) : latest.data.content.length === 0 ? (
            <EmptyState title="No articles published yet" message="Check back soon for the latest electric vehicle news." />
          ) : (
            <>
              <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
                {latest.data.content.map((n) => <ArticleCard key={n.id} news={n} />)}
              </div>
              <Pagination page={page} totalPages={latest.data.totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 400, behavior: 'smooth' }) }} />
            </>
          )}
        </section>

        <aside aria-label="Most read" className="space-y-8">
          <div className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Flame className="h-5 w-5 text-orange-500" /> Most Read</h2>
            {trending.isLoading ? (
              <div className="space-y-4">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : trending.isError ? (
              <p className="text-sm text-neutral-500">Unavailable right now.</p>
            ) : (
              <ol className="space-y-4">
                {(trending.data ?? []).map((n, i) => (
                  <li key={n.id} className="flex gap-3">
                    <span className="font-headline text-3xl font-extrabold leading-none text-brand-500/70">{i + 1}</span>
                    <Link to={`/news/${n.id}`} className="text-sm font-semibold leading-snug hover:text-brand-700 dark:hover:text-brand-400">{n.title}</Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="rounded-xl bg-brand-50 p-5 dark:bg-neutral-900">
            <h2 className="mb-3 text-xl font-bold">Browse topics</h2>
            <div className="flex flex-wrap gap-2">
              {(categories.data ?? []).map((c) => (
                <Link key={c} to={categoryPath(c)} className="rounded-full border border-brand-600/30 bg-white px-3 py-1 text-sm font-medium hover:bg-brand-600 hover:text-white dark:bg-neutral-800">{c}</Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {(categories.data ?? []).map((c) => <CategorySection key={c} category={c} />)}

      <Newsletter />
    </div>
  )
}
