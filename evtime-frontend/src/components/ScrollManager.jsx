import { useEffect, useLayoutEffect, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

const positions = new Map()

/**
 * Scroll restoration for the declarative router: new pages start at the top,
 * back/forward returns to where the reader was (the feed is served from the
 * query cache, so the content is tall enough straight away).
 */
export function ScrollManager() {
  const location = useLocation()
  const type = useNavigationType()

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
  }, [])

  useEffect(() => {
    let raf = 0
    const save = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => positions.set(location.key, window.scrollY))
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      window.removeEventListener('scroll', save)
      cancelAnimationFrame(raf)
    }
  }, [location.key])

  useLayoutEffect(() => {
    const target = type === 'POP' ? positions.get(location.key) ?? 0 : 0
    if (location.hash) return
    const html = document.documentElement
    const previous = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, target)
    // content may still be rendering: try once more on the next frame
    const raf = requestAnimationFrame(() => {
      if (Math.abs(window.scrollY - target) > 4) window.scrollTo(0, target)
      html.style.scrollBehavior = previous
    })
    return () => cancelAnimationFrame(raf)
  }, [location.key, location.hash, type])

  return null
}

export function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          key="top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 rounded-full bg-brand-600 p-3 text-white shadow-lg hover:bg-brand-700"
          initial={{ opacity: 0, y: 16, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.8 }}
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
