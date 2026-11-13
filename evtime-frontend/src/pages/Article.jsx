import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Clock, Eye, Link2 } from 'lucide-react'
import { getNewsById, getRelated } from '../api/news'
import ArticleCard, { CategoryTag } from '../components/ArticleCard'
import BookmarkButton from '../components/BookmarkButton'
import { ErrorState, SectionHeading, SmartImage, Skeleton } from '../components/ui'
import { useToast } from '../context/ToastContext'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { formatDate, paragraphs, readTime } from '../utils/format'

function ShareButtons({ title }) {
  const toast = useToast()
  const url = window.location.href
  const cls = 'inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast('Link copied to clipboard')
    } catch {
      toast('Could not copy the link', 'error')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Share this article">
      <button onClick={copy} className={cls}><Link2 className="h-4 w-4" /> Copy link</button>
      <a className={cls} target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}>Share on X</a>
      <a className={cls} target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}>LinkedIn</a>
    </div>
  )
}

export default function Article() {
  const { id } = useParams()
  const { data: news, isLoading, isError, error, refetch } = useQuery({ queryKey: ['news', id], queryFn: () => getNewsById(id), retry: false })
  const related = useQuery({ queryKey: ['related', id], queryFn: () => getRelated(id), enabled: !!news })
  useDocumentTitle(news?.title, news?.description)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-6 w-24" /><Skeleton className="h-12 w-full" /><Skeleton className="aspect-[16/9] w-full" />
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-5 w-full" />)}
      </div>
    )
  }
  if (isError) {
    const notFound = error?.response?.status === 404
    return (
      <div className="mx-auto max-w-xl">
        <ErrorState message={notFound ? 'This article could not be found.' : undefined} onRetry={notFound ? undefined : refetch} />
        <p className="mt-4 text-center"><Link className="text-brand-700 underline" to="/">Back to the front page</Link></p>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl">
      <CategoryTag category={news.category} />
      <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-5xl">{news.title}</h1>
      <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">{news.description}</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-neutral-200 py-3 text-sm dark:border-neutral-800">
        <div className="text-neutral-600 dark:text-neutral-400">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{news.author || 'EV Times Staff'}</span>
          <span className="mx-2">·</span>
          <time dateTime={news.createdAt}>{formatDate(news.createdAt, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          <span className="mx-2">·</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {readTime(news.content)} min read</span>
          <span className="mx-2">·</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {news.views ?? 0}</span>
        </div>
        <BookmarkButton id={news.id} />
      </div>

      <SmartImage src={news.imageUrl} alt={news.title} loading="eager" className="my-6 aspect-[16/9] w-full rounded-xl" />

      <div className="space-y-5 text-lg leading-8">
        {paragraphs(news.content || news.description).map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <p className="mb-3 text-sm font-semibold">Share this story</p>
        <ShareButtons title={news.title} />
      </div>

      {(related.data ?? []).length > 0 && (
        <section className="mt-14" aria-label="Related stories">
          <SectionHeading>Related Stories</SectionHeading>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.data.map((n) => <ArticleCard key={n.id} news={n} />)}
          </div>
        </section>
      )}
    </article>
  )
}
