import { useEffect, useState } from 'react'
import { useSpring, useTransform } from 'framer-motion'

interface Props {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export default function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1.2, className = '' }: Props) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString('en-IN')}${suffix}`)
  const [text, setText] = useState(`${prefix}0${suffix}`)

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    const unsub = display.on('change', (v) => setText(v))
    return () => unsub()
  }, [display])

  return <span className={className}>{text}</span>
}
