import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Clock, ExternalLink } from 'lucide-react'
import { SmartImage, TimeAgo } from './ui'
import { byline, categoryPath, readTime } from '../utils/format'
import { RevealText, revealProps } from './motionKit'

export function CategoryTag({ category }) {
  if (!category) return null
  return (
    <Link to={categoryPath(category)} className="text-xs font-bold uppercase tracking-wider text-brand-700 hover:underline dark:text-brand-400">
      {category}
    </Link>
  )
}

/** Source name for imported stories (small badge), author for our own. */
export function SourceBadge({ news, light = false }) {
  const name = byline(news)
  if (!name) return null
  if (!news.external) return <span>{name}</span>
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
        light ? 'bg-white/15 text-white' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
      }`}
      title={`Source: ${name}`}
    >
      <ExternalLink className="h-3 w-3" aria-hidden="true" />
      {name}
    </span>
  )
}

function Meta({ news, showRead = true }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
      <SourceBadge news={news} />
      <TimeAgo iso={news.createdAt} />
      {showRead && (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {readTime(news.content || news.description)} min
        </span>
      )}
    </p>
  )
}

const titleLink = 'hl-underline hover:text-brand-700 dark:hover:text-brand-400'
const lift = { y: -4, transition: { duration: 0.2 } }

/** variant: card (default) | hero | lead | compact | feed | row | text */
export default function ArticleCard({ news, variant = 'card', index = 0 }) {
  const link = `/news/${news.id}`

  if (variant === 'hero') {
    return (
      <motion.article className="group relative overflow-hidden rounded-xl bg-ink" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <Link to={link} aria-label={news.title}>
          <SmartImage src={news.imageUrl} alt="" className="kenburns aspect-[16/10] w-full opacity-80 transition-opacity duration-500 group-hover:opacity-90 md:aspect-[16/9]" loading="eager" fetchpriority="high" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        </Link>
        <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 text-white md:p-8">
          <span className="inline-block rounded bg-brand-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-ink">{news.category}</span>
          <h2 className="text-2xl font-extrabold leading-tight md:text-4xl">
            <Link to={link} className="hover:text-brand-400"><RevealText text={news.title} delay={0.15} /></Link>
          </h2>
          <p className="hidden max-w-2xl text-sm text-neutral-200 md:block md:text-base">{news.description}</p>
          <p className="flex flex-wrap items-center gap-2 text-xs text-neutral-300">
            <SourceBadge news={news} light /> <TimeAgo iso={news.createdAt} />
          </p>
        </div>
      </motion.article>
    )
  }

  if (variant === 'lead') {
    return (
      <motion.article {...revealProps(index)} whileHover={lift} className="group grid gap-5 border-b border-neutral-200 pb-7 md:grid-cols-5 dark:border-neutral-800">
        <Link to={link} className="block overflow-hidden rounded-xl md:col-span-3" tabIndex={-1} aria-hidden="true">
          <SmartImage src={news.imageUrl} alt="" className="aspect-[16/10] w-full transition duration-500 group-hover:scale-105" />
        </Link>
        <div className="space-y-3 md:col-span-2">
          <CategoryTag category={news.category} />
          <h3 className="text-2xl font-extrabold leading-tight md:text-3xl"><Link to={link} className={titleLink}>{news.title}</Link></h3>
          <p className="line-clamp-4 text-sm text-neutral-600 dark:text-neutral-400">{news.description}</p>
          <Meta news={news} />
        </div>
      </motion.article>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.article {...revealProps(index)} className="flex gap-3">
        <Link to={link} className="shrink-0" tabIndex={-1} aria-hidden="true">
          <SmartImage src={news.imageUrl} alt="" className="h-20 w-28 rounded" />
        </Link>
        <div className="space-y-1">
          <CategoryTag category={news.category} />
          <h3 className="text-sm font-bold leading-snug"><Link to={link} className={titleLink}>{news.title}</Link></h3>
          <p className="text-xs text-neutral-500"><TimeAgo iso={news.createdAt} /></p>
        </div>
      </motion.article>
    )
  }

  if (variant === 'text') {
    return (
      <motion.article {...revealProps(index)} className="space-y-1 border-t border-neutral-200 pt-3 dark:border-neutral-800">
        <h3 className="text-sm font-bold leading-snug"><Link to={link} className={titleLink}>{news.title}</Link></h3>
        <p className="text-xs text-neutral-500"><TimeAgo iso={news.createdAt} /></p>
      </motion.article>
    )
  }

  // dense news-feed row: text on the left, thumbnail on the right
  if (variant === 'feed' || variant === 'row') {
    return (
      <motion.article {...revealProps(index)} className="group flex items-start gap-4 border-b border-neutral-200 py-5 dark:border-neutral-800">
        <div className="min-w-0 flex-1 space-y-1.5">
          <CategoryTag category={news.category} />
          <h3 className="text-lg font-bold leading-snug md:text-xl"><Link to={link} className={titleLink}>{news.title}</Link></h3>
          <p className="hidden line-clamp-2 text-sm text-neutral-600 sm:block dark:text-neutral-400">{news.description}</p>
          <Meta news={news} />
        </div>
        <Link to={link} className="shrink-0 overflow-hidden rounded-lg" tabIndex={-1} aria-hidden="true">
          <SmartImage src={news.imageUrl} alt="" className="aspect-[4/3] w-28 transition duration-500 group-hover:scale-105 sm:w-44" />
        </Link>
      </motion.article>
    )
  }

  return (
    <motion.article {...revealProps(index)} whileHover={lift} className="group space-y-2.5">
      <Link to={link} className="block overflow-hidden rounded-lg" tabIndex={-1} aria-hidden="true">
        <SmartImage src={news.imageUrl} alt="" className="aspect-[16/10] w-full transition duration-500 group-hover:scale-105" />
      </Link>
      <CategoryTag category={news.category} />
      <h3 className="text-lg font-bold leading-snug"><Link to={link} className={titleLink}>{news.title}</Link></h3>
      <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{news.description}</p>
      <Meta news={news} />
    </motion.article>
  )
}
