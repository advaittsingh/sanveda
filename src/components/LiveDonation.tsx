import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCMS, fetchRecentTransactions, formatTimeAgo, getCMSSection } from '../api'
import { ASSETS } from '../constants/assets'
import { useBreakpoints } from '../hooks/useMediaQuery'
import type { RecentTransaction } from '../api'
import { C } from '../constants/brand'

export default function LiveDonation() {
  const navigate = useNavigate()
  const { mobile, md } = useBreakpoints()
  const [title, setTitle] = useState('Kind Hearts Giving Today')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [transactions, setTransactions] = useState<RecentTransaction[]>([])
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    fetchCMS().then((cms) => {
      const section = getCMSSection(cms, 'Live Donation')
      if (section?.title) setTitle(section.title)
      if (section?.description) setDescription(section.description)
      if (section?.image) setImage(section.image)
    }).catch(() => {})

    fetchRecentTransactions().then(({ data, totalAmount: total }) => {
      setTransactions(data)
      setTotalAmount(total)
    })
  }, [])

  return (
    <div style={{ width: mobile ? '95%' : '94.44%', maxWidth: 1440, margin: '0 auto 40px', borderRadius: mobile ? 20 : 34, backgroundColor: C.primary, overflow: 'hidden', display: 'flex', flexDirection: md ? 'column' : 'row', minHeight: md ? 'auto' : 633 }}>
      {!mobile && image && (
        <div style={{ width: md ? '100%' : '50%', position: 'relative', minHeight: md ? 220 : 633 }}>
          <img
            src={image}
            alt="Live Donation Feed"
            style={{
              width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0,
              borderTopLeftRadius: md ? 20 : 34,
              borderBottomLeftRadius: md ? 0 : 34,
            }}
          />
        </div>
      )}

      <div style={{ width: md ? '100%' : '50%', padding: mobile ? '20px 16px' : '46px 34px', position: 'relative' }}>
        <img src={ASSETS.whiteHeart} alt="" aria-hidden style={{ position: 'absolute', top: 32, right: 215, width: 28, display: mobile ? 'none' : 'block' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: mobile ? 20 : 30, gap: 15 }}>
          <h2 style={{ fontWeight: 800, fontSize: mobile ? 18 : 32, color: '#fff', margin: 0, textTransform: 'capitalize', lineHeight: 1.2, flex: 1 }}>
            {title}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <div style={{ width: 20, height: 20, background: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="live-pulse-dot" style={{ width: 9, height: 9, background: C.accent, borderRadius: '50%' }} />
            </div>
            <span style={{ color: C.gold, fontWeight: 700, fontSize: mobile ? 12 : 16, textTransform: 'uppercase' }}>Live</span>
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: mobile ? 12 : 16, lineHeight: mobile ? '19px' : '26px', marginBottom: mobile ? 20 : 30, textTransform: 'capitalize' }}>
          {description}
        </p>

        <div style={{ padding: mobile ? '12px' : '15px 16px', background: '#FFFFFF0F', borderRadius: 10, marginBottom: mobile ? 30 : 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ color: '#fff', fontSize: mobile ? 12 : 14, marginBottom: 6 }}>Raised in the past hour</div>
              <div style={{ color: C.goldLight, fontWeight: 700, fontSize: mobile ? 16 : 20 }}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
            {!mobile && (
              <button
                type="button"
                onClick={() => navigate('/campaigns')}
                className="btn-primary"
                style={{ border: 'none', borderRadius: 10, padding: '15px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
              >
                Donate Now
              </button>
            )}
          </div>
        </div>

        <div style={{ border: '1px solid #4A4A49', borderRadius: 16, padding: mobile ? '16px 12px' : '20px 16px' }}>
          <div className="hide-scrollbar" style={{ maxHeight: mobile ? 210 : 260, overflowY: 'auto' }}>
            {transactions.map((tx) => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.secondary, fontWeight: 700, fontSize: 14 }}>
                    {(tx.username || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{tx.username}</div>
                    <div style={{ color: '#888', fontSize: 11 }}>{formatTimeAgo(tx.createdAt)}</div>
                  </div>
                </div>
                <div style={{ color: C.goldLight, fontWeight: 700, fontSize: 14 }}>₹{Number(tx.amount).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>

        {mobile && (
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className="btn-primary"
            style={{ width: '100%', marginTop: 20, border: 'none', borderRadius: 10, padding: '12px 20px', fontWeight: 600, cursor: 'pointer' }}
          >
            Donate Now
          </button>
        )}
      </div>
    </div>
  )
}
