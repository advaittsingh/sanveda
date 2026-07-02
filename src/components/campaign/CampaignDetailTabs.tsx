import { useState } from 'react'
import HtmlContent from '../ui/HtmlContent'
import { C } from '../../constants/brand'

type TabId = 'story' | 'updates' | 'comments'

interface Tab {
  id: TabId
  label: string
  show: boolean
}

interface Props {
  storyHtml: string
  updates?: unknown[]
  mobile?: boolean
}

export default function CampaignDetailTabs({ storyHtml, updates = [], mobile }: Props) {
  const tabs = ([
    { id: 'story' as const, label: 'Story', show: Boolean(storyHtml) },
    { id: 'updates' as const, label: 'Updates', show: updates.length > 0 },
    { id: 'comments' as const, label: 'Comments', show: true },
  ] satisfies Tab[]).filter((t) => t.show)

  const [active, setActive] = useState<TabId>(tabs[0]?.id ?? 'story')

  return (
    <div>
      <div className="campaign-detail-tabs" role="tablist" aria-label="Campaign sections">
        {tabs.map((tab) => {
          const selected = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.id)}
              style={{
                flexShrink: 0,
                border: 'none',
                background: selected ? C.secondary : C.white,
                color: selected ? C.white : C.primary,
                fontWeight: 600,
                fontSize: mobile ? 13 : 14,
                padding: mobile ? '10px 16px' : '12px 20px',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: 'Red Hat Display, sans-serif',
                boxShadow: selected ? 'none' : '0px 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        style={{
          background: C.white,
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          padding: mobile ? 20 : 28,
          marginTop: 16,
        }}
      >
        {active === 'story' && storyHtml && (
          <>
            <h2 style={{ fontWeight: 800, fontSize: mobile ? 20 : 22, color: C.primary, margin: '0 0 16px' }}>Story</h2>
            <HtmlContent html={storyHtml} />
          </>
        )}

        {active === 'updates' && (
          <p style={{ color: C.textMuted, margin: 0, fontSize: 15 }}>No updates have been posted yet.</p>
        )}

        {active === 'comments' && (
          <div style={{ textAlign: 'center', padding: mobile ? '24px 12px' : '32px 16px' }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: C.primary, margin: '0 0 8px' }}>Be the first to show support</p>
            <p style={{ color: C.textMuted, margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Share words of encouragement and help spread the word about this campaign.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
