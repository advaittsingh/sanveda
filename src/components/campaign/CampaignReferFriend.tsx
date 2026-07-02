import { useState } from 'react'
import { ASSETS } from '../../constants/assets'

interface Props {
  mobile?: boolean
  title: string
}

export default function CampaignReferFriend({ mobile, title }: Props) {
  const [open, setOpen] = useState(false)

  const share = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url)
      setOpen(true)
      setTimeout(() => setOpen(false), 2000)
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#956DC4',
        borderRadius: 16,
        padding: mobile ? '24px 20px' : 40,
        textAlign: 'left',
        border: '1px solid #E2E8F0',
        width: '100%',
        margin: '0 auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: mobile ? 30 : 15,
      }}
    >
      <div style={{ maxWidth: mobile ? '100%' : '60%', position: 'relative', zIndex: 2 }}>
        <h2
          style={{
            display: 'flex',
            gap: 10,
            fontSize: mobile ? 20 : 24,
            fontWeight: 700,
            margin: `0 0 ${mobile ? 16 : 20}px`,
            color: '#fff',
            justifyContent: mobile ? 'center' : 'flex-start',
          }}
        >
          {!mobile && <img src={ASSETS.starIcon} alt="" style={{ filter: 'brightness(0) invert(1)' }} width={24} height={24} />}
          Refer a friend
        </h2>
        <p
          style={{
            color: '#fff',
            fontSize: mobile ? 12 : 14,
            lineHeight: 1.6,
            marginBottom: 20,
            fontWeight: 500,
            textAlign: mobile ? 'center' : 'left',
          }}
        >
          Be the Reason for Someone&apos;s Smile
          {mobile && <br />}
          {' '}Share Sanveda with your friends. Every new supporter you bring helps change a life!
        </p>
        <button
          type="button"
          onClick={share}
          className="th-donate-btn"
          style={{
            width: 'fit-content',
            margin: mobile ? '0 auto' : undefined,
            display: 'flex',
            backgroundColor: '#FFFFFF',
            color: '#956DC4',
            boxShadow: '0px 4px 0px #141414',
          }}
        >
          {open ? 'Link copied!' : 'Share now'}
        </button>
      </div>
    </div>
  )
}
