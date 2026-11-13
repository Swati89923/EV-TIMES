import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotionConfig } from 'motion/react'
import { MessageCircle, RotateCw, Send, Sparkles, Trash2, X, Zap } from 'lucide-react'
import ChatMarkdown from './ChatMarkdown'
import useChat, { MAX_LENGTH } from '../hooks/useChat'

const SUGGESTIONS = [
  "What's new in EV batteries?",
  'Explain solid-state batteries',
  'EV incentives in India',
  'Latest charging news',
]

const FOCUSABLE = 'button:not([disabled]), a[href], textarea:not([disabled])'

/** Assistant answer; freshly arrived answers are revealed progressively. */
function AssistantText({ message, reduce, onTick, onDone }) {
  const full = message.content
  const animated = !!message.fresh && !reduce
  const [shown, setShown] = useState(animated ? 0 : full.length)

  useEffect(() => {
    if (!animated) return undefined
    const step = Math.max(2, Math.ceil(full.length / 70))
    const timer = setInterval(() => setShown((n) => Math.min(full.length, n + step)), 22)
    return () => clearInterval(timer)
  }, [animated, full])

  useEffect(() => {
    onTick()
    if (animated && shown >= full.length) onDone(message.id)
  }, [shown, animated, full.length, onTick, onDone, message.id])

  if (!animated) return <ChatMarkdown text={full} />
  return (
    <>
      <span className="sr-only">{full}</span>
      <div aria-hidden="true">
        <ChatMarkdown text={full.slice(0, shown)} />
      </div>
    </>
  )
}

function Sources({ sources, onNavigate }) {
  if (!sources?.length) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Related stories">
      {sources.slice(0, 4).map((s) => (
        <Link
          key={s.id}
          to={`/news/${s.id}`}
          onClick={onNavigate}
          title={s.title}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-brand-600/30 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:bg-brand-50 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <Zap className="h-3 w-3 shrink-0 text-brand-600" aria-hidden="true" />
          <span className="truncate">{s.title}</span>
          {s.sourceName && <span className="shrink-0 text-neutral-400">· {s.sourceName}</span>}
        </Link>
      ))}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-3 dark:bg-neutral-800" role="status" aria-label="The assistant is typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="typing-dot h-2 w-2 rounded-full bg-neutral-500" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, pending, error, send, retry, clear, markSeen, markAllSeen } = useChat()
  const reduce = useReducedMotionConfig()

  const panelRef = useRef(null)
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const launcherRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, pending, error, open, scrollToBottom])

  // keep the cursor in the box when the panel opens and after each answer
  useEffect(() => {
    if (open && !pending) inputRef.current?.focus()
  }, [open, pending])

  // auto-growing textarea
  useLayoutEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [input, open])

  const close = useCallback(() => {
    setOpen(false)
    markAllSeen()
    launcherRef.current?.focus()
  }, [markAllSeen])

  const submit = (text = input) => {
    if (!text.trim() || pending) return
    send(text)
    setInput('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      close()
      return
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const items = panelRef.current.querySelectorAll(FOCUSABLE)
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const onInputKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  // on phones the panel covers the page, so leave it open only on larger screens
  const onSource = () => {
    if (window.innerWidth < 640) setOpen(false)
  }

  const nearLimit = input.length > MAX_LENGTH * 0.9

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="launcher"
            ref={launcherRef}
            onClick={() => setOpen(true)}
            aria-label="Open EV Assistant chat"
            aria-haspopup="dialog"
            className="fixed bottom-20 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-brand-400 shadow-xl ring-2 ring-brand-500/60 hover:bg-neutral-900 dark:bg-brand-500 dark:text-ink dark:ring-brand-400"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/30" aria-hidden="true" />
            <MessageCircle className="relative h-6 w-6" />
            <Sparkles className="absolute -right-0.5 -top-0.5 h-4 w-4 text-brand-400 dark:text-ink" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-label="EV Assistant"
            onKeyDown={onKeyDown}
            className="fixed inset-0 z-[70] flex origin-bottom-right flex-col overflow-hidden border-neutral-200 bg-white shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[560px] sm:max-h-[calc(100vh-3rem)] sm:w-[380px] sm:rounded-2xl sm:border dark:border-neutral-700 dark:bg-neutral-900"
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          >
            <header className="flex items-center gap-3 bg-ink px-4 py-3 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-ink">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-sans text-sm font-bold leading-tight">EV Assistant</h2>
                <p className="flex items-center gap-1.5 text-xs text-neutral-300">
                  <span className="h-2 w-2 rounded-full bg-brand-400" aria-hidden="true" /> Online
                </p>
              </div>
              <button
                onClick={clear}
                disabled={!messages.length}
                aria-label="Clear conversation"
                title="Clear conversation"
                className="rounded-full p-2 hover:bg-white/10 disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button onClick={close} aria-label="Close chat" className="rounded-full p-2 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div ref={listRef} role="log" aria-live="polite" aria-relevant="additions" className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 px-4 py-4 text-sm dark:bg-neutral-950">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-[85%] rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-3 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
                Hi! I&apos;m the EV Times assistant. Ask me about electric vehicles, batteries, charging or the latest stories.
              </motion.div>

              {!messages.length && (
                <div className="flex flex-wrap gap-2 pt-1" aria-label="Suggested questions">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      onClick={() => submit(s)}
                      disabled={pending}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.07 }}
                      whileHover={{ y: -2 }}
                      className="rounded-full border border-brand-600/40 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 dark:bg-neutral-900 dark:text-brand-400 dark:hover:bg-neutral-800"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              )}

              {messages.map((m) =>
                m.role === 'user' ? (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="ml-auto max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2.5 text-white">
                    {m.content}
                  </motion.div>
                ) : (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[92%]">
                    <div className="break-words rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-3 leading-relaxed text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
                      <AssistantText message={m} reduce={reduce} onTick={scrollToBottom} onDone={markSeen} />
                    </div>
                    {!m.fresh && <Sources sources={m.sources} onNavigate={onSource} />}
                    {m.mode === 'basic' && !m.fresh && (
                      <p className="mt-1.5 text-[11px] text-neutral-500">Quick answer from our latest stories.</p>
                    )}
                  </motion.div>
                ),
              )}

              {pending && <TypingDots />}

              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <p>{error.message}</p>
                  <button onClick={retry} disabled={pending} className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                    <RotateCw className="h-3.5 w-3.5" /> Retry
                  </button>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
              className="border-t border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-end gap-2">
                <label htmlFor="chat-input" className="sr-only">Message the EV Assistant</label>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_LENGTH))}
                  onKeyDown={onInputKey}
                  disabled={pending}
                  rows={1}
                  maxLength={MAX_LENGTH}
                  placeholder="Ask about EVs, batteries, charging..."
                  className="max-h-[120px] min-h-[42px] flex-1 resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950"
                />
                <motion.button
                  type="submit"
                  disabled={pending || !input.trim()}
                  aria-label="Send message"
                  whileTap={{ scale: 0.9 }}
                  className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
              <p className={`mt-1.5 text-right text-[11px] ${nearLimit ? 'font-semibold text-red-600' : 'text-neutral-400'}`} aria-live="off">
                {input.length}/{MAX_LENGTH} · Enter to send, Shift+Enter for a new line
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
