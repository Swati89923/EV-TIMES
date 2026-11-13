import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Flame, Rss } from 'lucide-react'
import { getCategories, getFeatured, getNews, getTrending } from '../api/news'
import ArticleCard from '../components/ArticleCard'
import Feed from '../components/Feed'
import Newsletter from '../components/Newsletter'
import { ErrorState, LiveBadge, SectionHeading, Skeleton } from '../components/ui'
import { SOURCES } from '../utils/sources'
import { categoryPath } from '../utils/format'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useInView from '../hooks/useInView'

/** A short list of stories for one topic. Only fetched once it nears the viewport. */
function CategoryStrip({ category }) {
  const [ref, seen] = useInView()
  const { data, isLoading } = useQuery({
    queryKey: ['news', 'section', category],
    queryFn: () => getNews({ page: 0, size: 4, category, sortBy: 'createdAt', direction: 'desc' }),
    enabled: seen,
    staleTime: 120000,
  })
  const items = data?.content ?? []
  if (seen && !isLoading && !items.length) return null
  const [lead, ...rest] = items

  return (
    <section ref={ref} aria-label={category} className="min-h-40">
      <div className="mb-4 flex items-end justify-between border-b-2 border-ink pb-2 dark:border-neutral-200">
        <h2 className="text-xl font-bold">{category}</h2>
        <Link to={categoryPath(category)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400">
          See all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {!seen || isLoading ? (
        <div className="space-y-3"><Skeleton className="aspect-[16/10] w-full" />{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>
      ) : (
        <div className="space-y-3">
          {lead && <ArticleCard news={lead} />}
          {rest.map((n) => <ArticleCard key={n.id} news={n} variant="text" />)}
        </div>
      )}
    </section>
  )
}

function Sidebar({ trending, categories }) {
  return (
    <aside aria-label="Most read and topics" className="space-y-8 lg:sticky lg:top-44 lg:self-start">
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

      <div className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="mb-2 flex items-center gap-2 text-xl font-bold"><Rss className="h-5 w-5 text-brand-600" /> Our sources</h2>
        <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">We bring together headlines from leading EV publications and link every story back to its original source.</p>
        <ul className="flex flex-wrap gap-2 text-xs font-semibold">
          {SOURCES.map((s) => <li key={s} className="rounded bg-neutral-100 px-2 py-1 dark:bg-neutral-800">{s}</li>)}
        </ul>
      </div>
    </aside>
  )
}

export default function Home() {
  useDocumentTitle(null, 'Breaking electric vehicle news, analysis and reviews from EV Times.')

  const featured = useQuery({ queryKey: ['featured'], queryFn: getFeatured, refetchInterval: 120000 })
  const trending = useQuery({ queryKey: ['trending'], queryFn: getTrending })
  const categories = useQuery({ queryKey: ['categories'], queryFn: getCategories })

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

      {(categories.data ?? []).length > 0 && (
        <section aria-label="Sections">
          <SectionHeading>Inside EV Times</SectionHeading>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {categories.data.map((c) => <CategoryStrip key={c} category={c} />)}
          </div>
        </section>
      )}

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-label="Latest news">
          <SectionHeading action={<LiveBadge />}>Latest News</SectionHeading>
          <Feed params={{}} emptyTitle="No articles published yet" emptyMessage="Check back soon for the latest electric vehicle news." />
        </section>
        <Sidebar trending={trending} categories={categories} />
      </div>

      <Newsletter />
    </div>
  )
}
