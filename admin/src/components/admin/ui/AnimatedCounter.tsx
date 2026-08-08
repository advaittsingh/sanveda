import { useEffect, useState } from 'react'
import { useSpring, useTransform } from 'framer-motion'

interface Props {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

function formatCount(value: number, prefix: string, suffix: string) {
  return `${prefix}${Math.round(value).toLocaleString('en-IN')}${suffix}`
}

export default function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1.2, className = '' }: Props) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (v) => formatCount(v, prefix, suffix))
  const [text, setText] = useState(() => formatCount(0, prefix, suffix))

  useEffect(() => {
    spring.set(value)
    // Ensure KPI cards reflect post-create refetches even if the spring settles without a change event.
    const id = window.setTimeout(() => setText(formatCount(value, prefix, suffix)), duration * 1000 + 50)
    return () => window.clearTimeout(id)
  }, [spring, value, prefix, suffix, duration])

  useEffect(() => {
    const unsub = display.on('change', (v) => setText(v))
    return () => unsub()
  }, [display])

  return <span className={className}>{text}</span>
}
