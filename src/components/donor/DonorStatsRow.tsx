import { C } from '../../constants/brand'
import type { DonorPortalData } from '../../lib/donorPortalService'

interface Props {
  kpis: DonorPortalData['kpis']
  mobile: boolean
}

const items = (kpis: DonorPortalData['kpis']) => [
  { label: 'Total Donated', value: `₹${kpis.totalDonated.toLocaleString('en-IN')}` },
  { label: 'Donations Made', value: String(kpis.donationsMade) },
  { label: 'Tax Receipts', value: String(kpis.taxReceipts) },
  { label: 'Monthly Giving', value: kpis.activeMonthlyGiving ? 'Active' : '—' },
  { label: 'Campaigns Supported', value: String(kpis.campaignsSupported) },
  {
    label: 'Last Donation',
    value: kpis.lastDonationDate
      ? `₹${kpis.lastDonationAmount.toLocaleString('en-IN')}`
      : '—',
  },
]

export default function DonorStatsRow({ kpis, mobile }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: 12,
      }}
    >
      {items(kpis).map((item) => (
        <div key={item.label} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, background: C.white }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{item.label}</div>
          <div style={{ fontSize: mobile ? 18 : 22, fontWeight: 800, color: C.primary }}>{item.value}</div>
        </div>
      ))}
    </div>
  )
}
