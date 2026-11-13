import { Link } from 'react-router-dom'

// bold, italic, inline code and links: [text](https://...) or [text](/path)
const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]\n]+\]\((?:https?:\/\/|\/)[^)\s]+\))/g
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/
const linkCls = 'font-medium text-brand-700 underline underline-offset-2 hover:text-brand-600 dark:text-brand-400'

function inline(text, keyBase) {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyBase}-${i}`
    if (!part) return null
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={key}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={key} className="rounded bg-neutral-200/70 px-1 py-0.5 font-mono text-[0.85em] dark:bg-neutral-700">{part.slice(1, -1)}</code>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={key}>{part.slice(1, -1)}</em>
    const link = LINK.exec(part)
    if (link) {
      const [, label, href] = link
      return href.startsWith('/') ? (
        <Link key={key} to={href} className={linkCls}>{label}</Link>
      ) : (
        <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={linkCls}>{label}</a>
      )
    }
    return part
  })
}

/**
 * Small markdown renderer for chat answers (paragraphs, bullet and numbered
 * lists, bold, italic, code, links). Builds React nodes, never raw HTML.
 */
export default function ChatMarkdown({ text }) {
  const lines = String(text ?? '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let para = []
  let list = null

  const flushPara = () => {
    if (para.length) blocks.push({ type: 'p', text: para.join(' ') })
    para = []
  }
  const flushList = () => {
    if (list) blocks.push(list)
    list = null
  }

  for (const raw of lines) {
    const line = raw.trim()
    const bullet = /^[-*•]\s+(.*)$/.exec(line)
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line)
    const heading = /^#{1,6}\s+(.*)$/.exec(line)
    if (!line) {
      flushPara()
      flushList()
    } else if (bullet || numbered) {
      flushPara()
      const type = bullet ? 'ul' : 'ol'
      if (!list || list.type !== type) {
        flushList()
        list = { type, items: [] }
      }
      list.items.push((bullet || numbered)[1])
    } else if (heading) {
      flushPara()
      flushList()
      blocks.push({ type: 'h', text: heading[1] })
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara()
  flushList()

  return (
    <div className="space-y-2">
      {blocks.map((b, i) => {
        if (b.type === 'ul') {
          return <ul key={i} className="list-disc space-y-1 pl-5">{b.items.map((it, j) => <li key={j}>{inline(it, `${i}-${j}`)}</li>)}</ul>
        }
        if (b.type === 'ol') {
          return <ol key={i} className="list-decimal space-y-1 pl-5">{b.items.map((it, j) => <li key={j}>{inline(it, `${i}-${j}`)}</li>)}</ol>
        }
        if (b.type === 'h') return <p key={i} className="font-semibold">{inline(b.text, `${i}`)}</p>
        return <p key={i}>{inline(b.text, `${i}`)}</p>
      })}
    </div>
  )
}
