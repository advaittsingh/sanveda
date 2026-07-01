import { useEffect, useState } from 'react'

interface Options {
  duration?: number
  enabled?: boolean
  delay?: number
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export function parseStatValue(value: string): { number: number; suffix: string } {
  const match = value.trim().match(/^(\d+)(\s*.*)$/)
  if (!match) return { number: 0, suffix: value }
  return { number: parseInt(match[1], 10), suffix: match[2] }
}

export function useCountUp(target: number, { duration = 1800, enabled = false, delay = 0 }: Options = {}) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setValue(0)
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }

    let frame = 0
    let startTimeout: ReturnType<typeof setTimeout>

    const run = () => {
      const startTime = performance.now()

      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1)
        setValue(Math.round(easeOutCubic(progress) * target))
        if (progress < 1) frame = requestAnimationFrame(tick)
      }

      frame = requestAnimationFrame(tick)
    }

    startTimeout = setTimeout(run, delay)
    return () => {
      clearTimeout(startTimeout)
      cancelAnimationFrame(frame)
    }
  }, [target, duration, enabled, delay])

  return value
}
