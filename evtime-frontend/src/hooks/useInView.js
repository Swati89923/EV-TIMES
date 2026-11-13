import { useEffect, useRef, useState } from 'react'

/** True once the element has scrolled near the viewport (stays true afterwards). */
export default function useInView(margin = '300px 0px') {
  const ref = useRef(null)
  const [seen, setSeen] = useState(typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (seen || !el) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { rootMargin: margin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [seen, margin])

  return [ref, seen]
}
