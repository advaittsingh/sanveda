import type { ReactNode } from 'react'
import { C } from '../../constants/brand'

interface Props {
  children: ReactNode
  bg?: string
}

export default function PageShell({ children, bg = C.white }: Props) {
  return (
    <div style={{ background: bg, padding: '32px 0 48px', minHeight: '50vh' }}>
      <div style={{ width: '94.44%', maxWidth: 1440, margin: '0 auto', padding: '0 16px' }}>
        {children}
      </div>
    </div>
  )
}
