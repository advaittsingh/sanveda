import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  delay?: number
  className?: string
}

/**
 * Entrance animation for sections.
 *
 * Important: never leave a tall block at opacity:0 while it still occupies
 * layout/scroll space (that reads as a blank gap, especially near footers).
 * We reveal early via rootMargin, sync-check on mount, and a short failsafe.
 */
export default function AnimatedSection({ children, delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const revealIfNear = () => {
      const rect = el.getBoundingClientRect()
      // Already in or just below the viewport — show immediately.
      if (rect.top < window.innerHeight + 240) {
        setVisible(true)
        return true
      }
      return false
    }

    if (revealIfNear()) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0, rootMargin: '240px 0px 240px 0px' },
    )

    observer.observe(el)

    // Failsafe: never keep content invisible for a full scroll-through.
    const failsafe = window.setTimeout(() => setVisible(true), 1200)

    return () => {
      observer.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`${visible ? 'animate-section-in' : 'animate-section-pending'} ${className}`.trim()}
      style={visible ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
