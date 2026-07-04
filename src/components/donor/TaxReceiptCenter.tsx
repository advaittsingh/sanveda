import { C } from '../../constants/brand'
import { currentFinancialYear } from '../../lib/formatIndian'
import { downloadReceipt } from '../../lib/donationService'
import type { TaxReceiptItem } from '../../lib/donorPortalService'
import { donorCardStyle, donorSectionTitle } from './donorStyles'

interface Props {
  receipts: TaxReceiptItem[]
  allReceipts: TaxReceiptItem[]
}

export default function TaxReceiptCenter({ receipts, allReceipts }: Props) {
  const fy = currentFinancialYear()
  const display = receipts.length ? receipts : allReceipts

  return (
    <section style={donorCardStyle}>
      <h2 style={donorSectionTitle}>80G Tax Receipts</h2>
      <p style={{ fontSize: 13, color: C.textMuted, margin: '-8px 0 16px' }}>Financial Year {fy}</p>

      {!display.length ? (
        <p style={{ color: C.textMuted, fontSize: 14 }}>Your 80G receipts will appear here after completed donations.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {display.map((r) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: `1px solid ${C.border}`,
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: C.primary }}>{r.receiptNumber}</div>
                <div style={{ fontSize: 13, color: C.textMuted }}>
                  {r.campaign} · ₹{r.amount.toLocaleString('en-IN')} · FY {r.financialYear}
                </div>
              </div>
              <button
                type="button"
                onClick={() => downloadReceipt(r.donation)}
                style={{ background: C.cream, border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: C.primary }}
              >
                Download PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
