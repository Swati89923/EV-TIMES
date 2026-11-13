import { useEffect, useState } from 'react'
import { animate, motion, useReducedMotionConfig } from 'motion/react'

/** Props for a scroll-reveal with a small stagger based on the item's position in its list. */
export const revealProps = (index = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -40px 0px' },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: Math.min(index % 6, 5) * 0.06 },
})

/** Wrapper that fades/slides its children in when they scroll into view. */
export function Reveal({ as = 'div', index = 0, className, children, ...rest }) {
  const Tag = motion[as]
  return (
    <Tag className={className} {...revealProps(index)} {...rest}>
      {children}
    </Tag>
  )
}

/** Headline whose words rise into place one after another. */
export function RevealText({ text, className, as = 'span', delay = 0 }) {
  const Tag = motion[as]
  const words = String(text).split(' ')
  return (
    <Tag className={className} initial="hidden" animate="show" aria-label={text} transition={{ staggerChildren: 0.035, delayChildren: delay }}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: '110%' }, show: { y: 0 } }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/** Number that ticks up to its value. */
export function AnimatedNumber({ value, duration = 0.9 }) {
  const target = Number(value) || 0
  const reduce = useReducedMotionConfig()
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (reduce) return undefined
    const controls = animate(0, target, { duration, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) })
    return () => controls.stop()
  }, [target, duration, reduce])

  return <span className="tabular-nums">{(reduce ? target : shown).toLocaleString('en-IN')}</span>
}
