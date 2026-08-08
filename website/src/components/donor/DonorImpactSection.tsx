import { CheckCircle2 } from 'lucide-react'
import { C } from '../../constants/brand'
import type { DonorPortalData } from '../../lib/donorPortalService'
import { donorCardStyle, donorSectionTitle } from './donorStyles'

interface Props {
  impact: DonorPortalData['impact']
}

export default function DonorImpactSection({ impact }: Props) {
  return (
    <section style={donorCardStyle}>
      <h2 style={donorSectionTitle}>Your Impact</h2>

      {!impact.causes.length ? (
        <p style={{ color: C.textMuted, fontSize: 14 }}>Your supported causes and beneficiary impact will appear after your first donation.</p>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
            {impact.causes.map((cause) => (
              <div key={cause.name} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <CheckCircle2 size={18} color={C.secondary} />
                <span style={{ flex: 1, fontWeight: 600, color: C.primary }}>{cause.name}</span>
                <span style={{ color: C.textMuted }}>{cause.beneficiaries} beneficiaries</span>
              </div>
            ))}
          </div>
          <div style={{ background: C.cream, borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Total beneficiaries impacted</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.primary }}>{impact.totalBeneficiaries}</div>
          </div>
        </>
      )}
    </section>
  )
}
