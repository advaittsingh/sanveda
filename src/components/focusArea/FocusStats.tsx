import { useEffect, useRef, useState } from 'react'
import type { FocusArea } from '../../constants/focusAreas'
import { getFocusAreaContent, type FocusStat } from '../../constants/focusAreaContent'
import { useCountUp } from '../../hooks/useCountUp'
import { FocusSection, FocusSectionHeader } from './FocusSection'

function AnimatedStat({
  stat,
  enabled,
  delay,
  mobile,
}: {
  stat: FocusStat
  enabled: boolean
  delay: number
  mobile?: boolean
}) {
  const count = useCountUp(stat.value, { enabled, delay, duration: 2000 })
  const display = stat.decimals != null ? count.toFixed(stat.decimals) : count.toLocaleString('en-IN')

  return (
    <div className="focus-stat-card">
      <p className="focus-stat-value" style={{ fontSize: mobile ? 28 : 36 }}>
        {stat.prefix}
        {display}
        {stat.suffix}
      </p>
      <p className="focus-stat-label">{stat.label}</p>
    </div>
  )
}

interface Props {
  area: FocusArea
  mobile?: boolean
}

export default function FocusStats({ area, mobile }: Props) {
  const content = getFocusAreaContent(area)
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <FocusSection mobile={mobile} variant="dark" delay={160} className="focus-stats-section">
      <div ref={ref}>
        <FocusSectionHeader label="Measurable Change" title="Our Impact" mobile={mobile} />
        <div className="focus-stats-grid">
          {content.impactStats.map((stat, index) => (
            <AnimatedStat key={stat.label} stat={stat} enabled={visible} delay={index * 100} mobile={mobile} />
          ))}
        </div>
      </div>
    </FocusSection>
  )
}
