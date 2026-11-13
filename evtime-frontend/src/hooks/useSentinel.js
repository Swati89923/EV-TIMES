import { useEffect, useRef } from 'react'

/**
 * Calls onVisible whenever the returned ref's element is (or becomes) visible.
 * `deps` should change when more content has been loaded so that the callback
 * fires again if the sentinel is still on screen.
 */
export default function useSentinel(onVisible, enabled = true, deps = [], margin = '900px 0px') {
  const ref = useRef(null)
  const cb = useRef(onVisible)
  useEffect(() => {
    cb.current = onVisible
  })

  useEffect(() => {
    const el = ref.current
    if (!enabled || !el || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) cb.current()
      },
      { rootMargin: margin },
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, margin, ...deps])

  return ref
}
