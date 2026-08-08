import { Link } from 'react-router-dom'
import { C } from '../../constants/brand'
import { downloadReceipt, type Donation } from '../../lib/donationService'
import { paymentStatusLabel } from '../../lib/donorPortalService'
import { donorCardStyle, donorSectionTitle } from './donorStyles'

interface Props {
  donations: Donation[]
  mobile: boolean
}

export default function DonorHistoryTable({ donations, mobile }: Props) {
  const completed = donations.filter((d) => d.status === 'completed')

  return (
    <section style={donorCardStyle}>
      <h2 style={donorSectionTitle}>Recent Donations</h2>

      {!completed.length ? (
        <div style={{ textAlign: 'center', padding: 32, border: `1px dashed ${C.border}`, borderRadius: 12 }}>
          <p style={{ color: C.textMuted, marginBottom: 16 }}>You haven&apos;t made any donations yet.</p>
          <Link to="/campaigns" className="btn-primary" style={{ padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
            Explore Campaigns
          </Link>
        </div>
      ) : mobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {completed.map((d) => (
            <DonationCard key={d.id} donation={d} />
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}`, textAlign: 'left' }}>
                <th style={{ padding: '10px 8px', color: C.textMuted, fontWeight: 600 }}>Date</th>
                <th style={{ padding: '10px 8px', color: C.textMuted, fontWeight: 600 }}>Campaign</th>
                <th style={{ padding: '10px 8px', color: C.textMuted, fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '10px 8px', color: C.textMuted, fontWeight: 600 }}>Payment</th>
                <th style={{ padding: '10px 8px', color: C.textMuted, fontWeight: 600 }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {completed.map((d) => (
                <tr key={d.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '12px 8px' }}>{new Date(d.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '12px 8px', fontWeight: 600, color: C.primary }}>{d.campaignTitle}</td>
                  <td style={{ padding: '12px 8px', fontWeight: 700, color: C.secondary }}>₹{d.amount.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 8px' }}>{paymentStatusLabel(d.status)}</td>
                  <td style={{ padding: '12px 8px' }}>
                    {d.receiptNumber ? (
                      <button type="button" onClick={() => downloadReceipt(d)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                        Download
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function DonationCard({ donation: d }: { donation: Donation }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontWeight: 700, color: C.primary }}>{d.campaignTitle}</div>
      <div style={{ fontSize: 13, color: C.textMuted, margin: '6px 0 10px' }}>
        {new Date(d.createdAt).toLocaleDateString('en-IN')} · {paymentStatusLabel(d.status)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, color: C.secondary }}>₹{d.amount.toLocaleString('en-IN')}</span>
        {d.receiptNumber ? (
          <button type="button" onClick={() => downloadReceipt(d)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            Receipt
          </button>
        ) : null}
      </div>
    </div>
  )
}
