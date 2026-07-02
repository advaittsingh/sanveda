import { useEffect, useRef, useState } from 'react'
import { DonateNowButton } from './CampaignDetailHero'

const DEFAULT_AMOUNTS = [2000, 4000, 6000, 8000, 10000]

interface Props {
  amount: number
  onAmountChange: (amount: number) => void
  onDonate: () => void
  mobile?: boolean
}

export default function CampaignFixedDonationBar({ amount, onAmountChange, onDonate, mobile }: Props) {
  const chipRef = useRef<HTMLDivElement>(null)
  const [visibleAmounts, setVisibleAmounts] = useState(DEFAULT_AMOUNTS.slice(0, mobile ? 5 : 6))

  useEffect(() => {
    const update = () => {
      if (mobile) {
        setVisibleAmounts(DEFAULT_AMOUNTS.slice(0, 5))
        return
      }
      const container = chipRef.current
      if (!container) return
      const width = container.offsetWidth
      const chipWidth = 92
      const count = Math.max(3, Math.min(DEFAULT_AMOUNTS.length, Math.floor(width / chipWidth)))
      setVisibleAmounts(DEFAULT_AMOUNTS.slice(0, count))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [mobile])

  return (
    <div className="campaign-fixed-donation-bar" data-donation-box="true">
      <div className="campaign-fixed-donation-inner">
        <div ref={chipRef} className="campaign-amount-chips hide-scrollbar">
          {visibleAmounts.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onAmountChange(a)}
              className="campaign-amount-chip"
              data-selected={amount === a}
            >
              ₹{a.toLocaleString('en-IN')}
            </button>
          ))}
        </div>
        <DonateNowButton onClick={onDonate} mobile={mobile} amount={amount} />
      </div>
    </div>
  )
}
