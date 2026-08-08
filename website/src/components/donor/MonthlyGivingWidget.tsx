import { Link } from 'react-router-dom'
import { C } from '../../constants/brand'
import type { DonorMonthlyGiving } from '../../lib/donorPortalService'
import { donorCardStyle, donorBtnPrimary, donorSectionTitle } from './donorStyles'

interface Props {
  monthlyGiving: DonorMonthlyGiving
}

export default function MonthlyGivingWidget({ monthlyGiving }: Props) {
  const active = monthlyGiving.status === 'active'

  return (
    <section style={donorCardStyle}>
      <h2 style={donorSectionTitle}>Monthly Giving</h2>

      {monthlyGiving.status === 'none' ? (
        <div>
          <p style={{ color: C.textMuted, marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>
            Set up a recurring monthly donation and sustain Sanveda&apos;s programmes year-round.
          </p>
          <Link to="/monthly-donation" style={{ ...donorBtnPrimary, display: 'inline-block', textDecoration: 'none' }}>
            Start Monthly Giving
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12, fontSize: 14 }}>
          <Row label="Status" value={monthlyGiving.status.charAt(0).toUpperCase() + monthlyGiving.status.slice(1)} highlight={active} />
          <Row label="Amount" value={`₹${monthlyGiving.amount.toLocaleString('en-IN')}/month`} />
          {monthlyGiving.nextDebit ? (
            <Row
              label="Next Debit"
              value={new Date(monthlyGiving.nextDebit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            />
          ) : null}
          <Link to="/monthly-donation" style={{ ...donorBtnPrimary, display: 'inline-block', textDecoration: 'none', marginTop: 8, textAlign: 'center' }}>
            Manage Subscription
          </Link>
        </div>
      )}
    </section>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
      <span style={{ color: C.textMuted }}>{label}</span>
      <span style={{ fontWeight: 700, color: highlight ? '#15803d' : C.primary }}>{value}</span>
    </div>
  )
}
