import { useState } from 'react'
import { ASSETS } from '../../constants/assets'
import { TH } from './campaignDetailTheme'

interface Props {
  mobile?: boolean
}

export default function CampaignCommentsSection({ mobile }: Props) {
  const [message, setMessage] = useState('')

  return (
    <section id="comments" style={{ marginTop: 30, marginBottom: 30 }}>
      <div
        style={{
          border: `1px solid ${TH.border}`,
          borderRadius: 12,
          padding: mobile ? '20px 16px' : 30,
          background: '#FFFFFF',
        }}
      >
        <h2
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            fontSize: mobile ? 14 : 24,
            fontWeight: 700,
            margin: `0 0 ${mobile ? 16 : 22}px`,
            color: TH.textDark,
            borderBottom: mobile ? `1px solid ${TH.borderLight}` : 'none',
            paddingBottom: mobile ? 16 : 0,
          }}
        >
          <img src={ASSETS.people} alt="" width={mobile ? 18 : 24} height={mobile ? 18 : 24} />
          Comments
        </h2>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a comment..."
          rows={mobile ? 3 : 4}
          style={{
            width: '100%',
            borderRadius: 10,
            border: `1px solid ${TH.border}`,
            padding: '14px 16px',
            fontFamily: 'Red Hat Display, sans-serif',
            fontSize: 14,
            resize: 'vertical',
            boxSizing: 'border-box',
            marginBottom: 12,
          }}
        />
        <button type="button" className="th-donate-btn" style={{ width: mobile ? '100%' : 160, height: 44 }}>
          Post Comment
        </button>

        <p style={{ textAlign: 'center', color: TH.textMuted, fontSize: 14, margin: '24px 0 0' }}>
          Be the first to show support for this campaign.
        </p>
      </div>
    </section>
  )
}
