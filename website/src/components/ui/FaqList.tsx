import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { C } from '../../constants/brand'
import HtmlContent from './HtmlContent'
import type { CMSItem } from '../../types'

export default function FaqList({ items }: { items: CMSItem[] }) {
  const [openId, setOpenId] = useState<number | null>(items[0]?.id ?? null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item) => {
        const open = openId === item.id
        return (
          <div
            key={item.id}
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              overflow: 'hidden',
              background: open ? C.cream : C.white,
            }}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                padding: '16px 20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Red Hat Display',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15, color: C.primary }}>{item.title}</span>
              <ChevronDown size={20} color={C.secondary} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>
            {open && (
              <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${C.border}` }}>
                <HtmlContent html={item.description ?? item.sub_title ?? ''} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
