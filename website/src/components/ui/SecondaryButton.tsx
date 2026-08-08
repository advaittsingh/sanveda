import type { ButtonHTMLAttributes, CSSProperties } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean
}

const baseStyle: CSSProperties = {
  borderRadius: 8,
  padding: '14px 24px',
  fontWeight: 600,
  fontSize: 14,
  lineHeight: '14px',
  textTransform: 'capitalize',
  fontFamily: 'Red Hat Display, sans-serif',
  border: 'none',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

export default function SecondaryButton({ fullWidth, style, className, children, ...props }: Props) {
  return (
    <button
      type="button"
      className={['btn-secondary', className].filter(Boolean).join(' ')}
      style={{ ...baseStyle, ...(fullWidth ? { width: '100%' } : {}), ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
