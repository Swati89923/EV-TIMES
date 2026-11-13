import { useCallback, useEffect, useRef, useState } from 'react'
import { sendChat } from '../api/chat'
import { errorMessage } from '../api/client'

const KEY = 'evtimes-chat'
const KEEP = 20 // messages remembered for the session
const SEND = 10 // messages sent to the API
export const MAX_LENGTH = 1000

let counter = 0
const uid = () => `${Date.now().toString(36)}-${(counter += 1)}`

function load() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(KEY))
    return Array.isArray(raw) ? raw.slice(-KEEP) : []
  } catch {
    return []
  }
}

/** Conversation state for the chat widget (kept in sessionStorage). */
export default function useChat() {
  const [messages, setMessages] = useState(load)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  const busy = useRef(false)

  useEffect(() => {
    try {
      const stored = messages.slice(-KEEP).map((m) => ({ id: m.id, role: m.role, content: m.content, sources: m.sources, mode: m.mode }))
      sessionStorage.setItem(KEY, JSON.stringify(stored))
    } catch {
      /* storage unavailable */
    }
  }, [messages])

  const request = useCallback(async (history) => {
    busy.current = true
    setPending(true)
    setError(null)
    try {
      const payload = history.slice(-SEND).map(({ role, content }) => ({ role, content }))
      const res = await sendChat(payload)
      setMessages((m) =>
        [...m, { id: uid(), role: 'assistant', content: String(res.reply ?? ''), sources: res.sources ?? [], mode: res.mode, fresh: true }].slice(-KEEP),
      )
    } catch (e) {
      const status = e?.response?.status
      setError({
        status,
        message:
          status === 429
            ? "You're sending messages too quickly. Please wait a minute and try again."
            : errorMessage(e, 'The assistant could not answer right now. Please try again.'),
      })
    } finally {
      busy.current = false
      setPending(false)
    }
  }, [])

  const send = useCallback(
    (text) => {
      const content = text.trim().slice(0, MAX_LENGTH)
      if (!content || busy.current) return
      const next = [...messages, { id: uid(), role: 'user', content }].slice(-KEEP)
      setMessages(next)
      request(next)
    },
    [messages, request],
  )

  const retry = useCallback(() => {
    if (busy.current || !messages.length) return
    request(messages)
  }, [messages, request])

  const clear = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  /** Stops replaying the typing effect for answers that were already shown. */
  const markSeen = useCallback((id) => {
    setMessages((m) => (m.some((x) => x.id === id && x.fresh) ? m.map((x) => (x.id === id ? { ...x, fresh: false } : x)) : m))
  }, [])

  const markAllSeen = useCallback(() => {
    setMessages((m) => (m.some((x) => x.fresh) ? m.map((x) => ({ ...x, fresh: false })) : m))
  }, [])

  return { messages, pending, error, send, retry, clear, markSeen, markAllSeen }
}
