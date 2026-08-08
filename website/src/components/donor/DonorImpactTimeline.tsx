import { C } from '../../constants/brand'
import type { TimelineEvent } from '../../lib/donorPortalService'
import { donorCardStyle, donorSectionTitle } from './donorStyles'

interface Props {
  timeline: TimelineEvent[]
}

export default function DonorImpactTimeline({ timeline }: Props) {
  return (
    <section style={donorCardStyle}>
      <h2 style={donorSectionTitle}>Your Journey with Sanveda</h2>

      {!timeline.length ? (
        <p style={{ color: C.textMuted, fontSize: 14 }}>Your giving journey timeline will build as you donate and engage.</p>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 24 }}>
          <div style={{ position: 'absolute', left: 8, top: 4, bottom: 4, width: 2, background: C.border }} />
          {timeline.map((event, i) => (
            <div key={`${event.year}-${i}`} style={{ position: 'relative', marginBottom: 20 }}>
              <div
                style={{
                  position: 'absolute',
                  left: -20,
                  top: 4,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: C.secondary,
                  border: `2px solid ${C.white}`,
                  boxShadow: `0 0 0 2px ${C.secondaryLight}`,
                }}
              />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.secondary, marginBottom: 2 }}>{event.year}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.primary }}>{event.label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
