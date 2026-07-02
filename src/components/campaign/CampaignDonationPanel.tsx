import { ASSETS } from '../../constants/assets'
import { C } from '../../constants/brand'

const AMOUNTS = [500, 1000, 2000, 5000]

interface Props {
  amount: number
  onAmountChange: (amount: number) => void
  mobile?: boolean
}

export default function CampaignDonationPanel({ amount, onAmountChange, mobile }: Props) {
  return (
    <div
      className="campaign-donation-panel"
      style={{
        background: C.white,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.04)',
        padding: mobile ? 20 : 24,
      }}
    >
      <h3
        style={{
          fontWeight: 800,
          fontSize: mobile ? 16 : 18,
          color: C.primary,
          margin: '0 0 16px',
          lineHeight: 1.3,
        }}
      >
        Choose Amount
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          marginBottom: 14,
        }}
      >
        {AMOUNTS.map((a) => {
          const selected = amount === a
          return (
            <button
              key={a}
              type="button"
              onClick={() => onAmountChange(a)}
              style={{
                padding: mobile ? '10px 8px' : '12px 8px',
                borderRadius: 10,
                border: selected ? `2px solid ${C.secondary}` : `1px solid ${C.border}`,
                background: selected ? '#EEF4FC' : C.white,
                fontWeight: 700,
                color: C.primary,
                cursor: 'pointer',
                fontFamily: 'Red Hat Display, sans-serif',
                fontSize: mobile ? 13 : 14,
              }}
            >
              ₹{a.toLocaleString('en-IN')}
            </button>
          )
        })}
      </div>

      <label
        htmlFor="campaign-amount"
        style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.primary, marginBottom: 8 }}
      >
        Enter Amount
      </label>
      <input
        id="campaign-amount"
        type="number"
        min={100}
        value={amount}
        onChange={(e) => onAmountChange(Number(e.target.value) || 0)}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 10,
          border: `1px solid ${C.border}`,
          marginBottom: 16,
          fontSize: 16,
          fontFamily: 'Red Hat Display, sans-serif',
          boxSizing: 'border-box',
          color: C.text,
        }}
      />

      <button
        type="button"
        className="btn-donate"
        style={{
          width: '100%',
          padding: mobile ? '12px 16px' : '14px 20px',
          border: 'none',
          borderRadius: 10,
          fontWeight: 800,
          fontSize: mobile ? 15 : 16,
          cursor: 'pointer',
          fontFamily: 'Red Hat Display, sans-serif',
        }}
      >
        Donate ₹{amount.toLocaleString('en-IN')}
      </button>

      <p style={{ fontSize: 12, color: C.textMuted, textAlign: 'center', margin: '12px 0 0' }}>
        Secure payment · Tax benefits may apply
      </p>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.primary, margin: '0 0 12px' }}>Share Campaign</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Facebook', icon: ASSETS.footerFacebook },
            { label: 'LinkedIn', icon: ASSETS.footerLinkedin },
            { label: 'Twitter', icon: ASSETS.footerTwitter },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              aria-label={`Share on ${item.label}`}
              onClick={() => {
                const url = window.location.href
                if (navigator.share) {
                  navigator.share({ title: document.title, url }).catch(() => {})
                } else {
                  navigator.clipboard?.writeText(url)
                }
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: C.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <img src={item.icon} alt="" width={18} height={18} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
