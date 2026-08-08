import type { ReactNode } from 'react'
import AnimatedSection from '../ui/AnimatedSection'
import SectionLabel from '../ui/SectionLabel'

type Variant = 'plain' | 'cream' | 'dark'

interface ShellProps {
  children: ReactNode
  mobile?: boolean
  variant?: Variant
  id?: string
  className?: string
  delay?: number
}

export function FocusSection({ children, mobile, variant = 'plain', id, className = '', delay = 0 }: ShellProps) {
  const variantClass =
    variant === 'cream' ? 'focus-section-cream' : variant === 'dark' ? 'focus-section-dark' : 'focus-section-plain'

  return (
    <AnimatedSection delay={delay}>
      <section id={id} className={`focus-section ${variantClass} ${className}`.trim()} data-mobile={mobile}>
        <div className="focus-section-inner">{children}</div>
      </section>
    </AnimatedSection>
  )
}

interface HeaderProps {
  label: string
  title: string
  mobile?: boolean
  align?: 'left' | 'center'
  titleMaxWidth?: string
}

export function FocusSectionHeader({ label, title, mobile, align = 'center', titleMaxWidth }: HeaderProps) {
  const centered = align === 'center'

  return (
    <header className={`focus-section-header ${centered ? 'focus-section-header-center' : 'focus-section-header-left'}`}>
      <SectionLabel mobile={mobile ?? centered} center={centered}>
        {label}
      </SectionLabel>
      <h2
        className="focus-section-title"
        style={{
          fontFamily: 'Red Hat Display, sans-serif',
          fontWeight: 800,
          fontSize: mobile ? 22 : 32,
          lineHeight: 1.35,
          letterSpacing: '-0.01em',
          textAlign: centered ? 'center' : 'left',
          textTransform: 'capitalize',
          color: '#041B4D',
          margin: '8px 0 0',
          maxWidth: titleMaxWidth ?? (mobile ? '100%' : centered ? '640px' : '100%'),
          marginLeft: centered ? 'auto' : 0,
          marginRight: centered ? 'auto' : 0,
        }}
      >
        {title}
      </h2>
    </header>
  )
}
