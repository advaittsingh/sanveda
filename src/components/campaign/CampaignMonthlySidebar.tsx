import { useNavigate } from 'react-router-dom'
import { TH } from './campaignDetailTheme'

interface Props {
  mobile?: boolean
  tablet?: boolean
}

export default function CampaignMonthlySidebar({ mobile }: Props) {
  const navigate = useNavigate()

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: mobile ? 0 : 12,
        border: mobile ? 'none' : `1px solid ${TH.border}`,
        padding: mobile ? '20px 0' : '24px 30px 7px',
        width: '100%',
        marginTop: 20,
      }}
    >
      <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: mobile ? 14 : 16, color: TH.textDark }}>
        Support every month:
      </p>
      <div style={{ width: '100%', height: 1, background: '#E0E0E0', margin: mobile ? '12px 0' : '14px 0' }} />
      <h3 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: mobile ? 16 : 18, color: TH.textDark }}>
        Donate Monthly
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: mobile ? 13 : 14, lineHeight: 1.6, color: TH.textMuted }}>
        Join monthly donors and help Sanveda create sustained impact across healthcare, education, and community programs.
      </p>
      <button
        type="button"
        onClick={() => navigate('/monthly-donation')}
        className="th-donate-btn"
        style={{ width: '100%', height: mobile ? 40 : 44 }}
      >
        Donate Monthly
      </button>
    </div>
  )
}
