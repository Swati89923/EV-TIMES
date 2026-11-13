import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { SmartImage } from './ui'
import { categoryPath, readTime, timeAgo } from '../utils/format'

export function CategoryTag({ category }) {
  if (!category) return null
  return (
    <Link to={categoryPath(category)} className="text-xs font-bold uppercase tracking-wider text-brand-700 hover:underline dark:text-brand-400">
      {category}
    </Link>
  )
}

function Meta({ news }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 text-xs text-neutral-500 dark:text-neutral-400">
      {news.author && <span>{news.author}</span>}
      <span>{timeAgo(news.createdAt)}</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {readTime(news.content || news.description)} min
      </span>
    </p>
  )
}

/** variant: card (default) | hero | compact | row */
export default function ArticleCard({ news, variant = 'card' }) {
  const link = `/news/${news.id}`

  if (variant === 'hero') {
    return (
      <article className="group relative overflow-hidden rounded-xl bg-ink">
        <Link to={link} aria-label={news.title}>
          <SmartImage src={news.imageUrl} alt="" className="aspect-[16/10] w-full opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-90 md:aspect-[16/9]" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        </Link>
        <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 text-white md:p-8">
          <span className="inline-block rounded bg-brand-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-ink">{news.category}</span>
          <h2 className="text-2xl font-extrabold leading-tight md:text-4xl">
            <Link to={link} className="hover:underline">{news.title}</Link>
          </h2>
          <p className="hidden max-w-2xl text-sm text-neutral-200 md:block md:text-base">{news.description}</p>
          <p className="text-xs text-neutral-300">{news.author} · {timeAgo(news.createdAt)}</p>
        </div>
      </article>
    )
  }

  if (variant === 'compact') {
    return (
      <article className="flex gap-3">
        <Link to={link} className="shrink-0" tabIndex={-1} aria-hidden="true">
          <SmartImage src={news.imageUrl} alt="" className="h-20 w-28 rounded" />
        </Link>
        <div className="space-y-1">
          <CategoryTag category={news.category} />
          <h3 className="text-sm font-bold leading-snug"><Link to={link} className="hover:text-brand-700 dark:hover:text-brand-400">{news.title}</Link></h3>
          <p className="text-xs text-neutral-500">{timeAgo(news.createdAt)}</p>
        </div>
      </article>
    )
  }

  if (variant === 'row') {
    return (
      <article className="flex flex-col gap-4 border-b border-neutral-200 py-5 sm:flex-row dark:border-neutral-800">
        <Link to={link} className="shrink-0" tabIndex={-1} aria-hidden="true">
          <SmartImage src={news.imageUrl} alt="" className="aspect-[16/10] w-full rounded-lg sm:w-60" />
        </Link>
        <div className="space-y-2">
          <CategoryTag category={news.category} />
          <h3 className="text-xl font-bold leading-snug"><Link to={link} className="hover:text-brand-700 dark:hover:text-brand-400">{news.title}</Link></h3>
          <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{news.description}</p>
          <Meta news={news} />
        </div>
      </article>
    )
  }

  return (
    <article className="group space-y-2.5">
      <Link to={link} className="block overflow-hidden rounded-lg" tabIndex={-1} aria-hidden="true">
        <SmartImage src={news.imageUrl} alt="" className="aspect-[16/10] w-full transition duration-500 group-hover:scale-105" />
      </Link>
      <CategoryTag category={news.category} />
      <h3 className="text-lg font-bold leading-snug"><Link to={link} className="hover:text-brand-700 dark:hover:text-brand-400">{news.title}</Link></h3>
      <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{news.description}</p>
      <Meta news={news} />
    </article>
  )
}
