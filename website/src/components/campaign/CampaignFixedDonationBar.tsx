import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'

const DEFAULT_AMOUNTS = [2000, 4000, 6000, 8000, 10000]

const UPI_APPS = [
  { name: 'PhonePe', src: '/assets/phonepay-icon.svg' },
  { name: 'Gpay', src: '/assets/gpay-icon.svg' },
  { name: 'Bhim UPI', src: '/assets/upi-pay-icon.svg' },
  { name: 'More', src: '/assets/more-pay-icon.svg' },
] as const

const CURRENCIES = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'AED', symbol: 'د.إ' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'GBP', symbol: '£' },
] as const

interface Props {
  amount: number
  onAmountChange: (amount: number) => void
  onDonate: () => void
}

export default function CampaignFixedDonationBar({ amount, onAmountChange, onDonate }: Props) {
  const chipRef = useRef<HTMLDivElement>(null)
  const donateRef = useRef<HTMLDivElement>(null)
  const [visibleAmounts, setVisibleAmounts] = useState(DEFAULT_AMOUNTS.slice(0, 6))
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>(CURRENCIES[0])
  const [currencyOpen, setCurrencyOpen] = useState(false)

  const mobile = useMediaQuery('(max-width: 600px)')
  const tabletMid = useMediaQuery('(min-width: 600px) and (max-width: 899px)')
  const smallScreen = useMediaQuery('(max-width: 899px)')
  const hideUpi = useMediaQuery('(max-width: 1023px)')
  const wide = useMediaQuery('(min-width: 1200px)')
  const compact = useMediaQuery('(max-width: 1099px)')

  useEffect(() => {
    const update = () => {
      if (mobile) {
        setVisibleAmounts(DEFAULT_AMOUNTS.slice(0, 5))
        return
      }

      const chipContainer = chipRef.current
      if (!chipContainer) {
        setVisibleAmounts(DEFAULT_AMOUNTS.slice(0, 6))
        return
      }

      const parent = chipContainer.parentElement
      const donateWidth = donateRef.current?.offsetWidth ?? 0
      const available = Math.max(0, (parent?.offsetWidth ?? 0) - donateWidth - (wide ? 20 : 10))
      const buttons = chipContainer.querySelectorAll('button')
      let chipWidth = compact ? 85 : 100
      let gap = wide ? 20 : 10

      if (buttons.length > 0) {
        let total = 0
        buttons.forEach((btn, index) => {
          total += btn.getBoundingClientRect().width
          if (index > 0) total += gap
        })
        chipWidth = total / buttons.length
        if (buttons.length > 1) {
          const first = buttons[0].getBoundingClientRect()
          const second = buttons[1].getBoundingClientRect()
          gap = second.left - first.right
        }
      }

      const count = Math.max(1, Math.min(DEFAULT_AMOUNTS.length, Math.floor(available / (chipWidth + gap))))
      setVisibleAmounts((current) => {
        const next = DEFAULT_AMOUNTS.slice(0, count)
        return current.length === next.length && current.every((v, i) => v === next[i]) ? current : next
      })
    }

    update()
    const timer = window.setTimeout(update, 300)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      window.clearTimeout(timer)
    }
  }, [mobile, wide, compact])

  const formatAmount = (value: number) => value.toLocaleString('en-IN')

  const handleInputChange = (raw: string) => {
    const parsed = Number(raw.replace(/,/g, '')) || 0
    onAmountChange(Math.max(0, parsed))
  }

  return (
    <div className="campaign-fixed-donation-bar" data-donation-box="true">
      <div
        className="campaign-fixed-donation-panel"
        data-mobile={mobile}
        data-tablet={tabletMid}
        data-small={smallScreen}
      >
        {!hideUpi && (
          <>
            <div className="campaign-donate-upi">
              <div className="campaign-donate-upi-label">
                <span className="campaign-donate-upi-title">Donate Via</span>
                <span className="campaign-donate-upi-sub">UPI</span>
              </div>
              <div className="campaign-donate-upi-apps">
                {UPI_APPS.map((app) => (
                  <button
                    key={app.name}
                    type="button"
                    className="campaign-donate-upi-app"
                    onClick={onDonate}
                    aria-label={`Donate with ${app.name}`}
                  >
                    <img src={app.src} alt="" width={40} height={40} />
                    <span>{app.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="campaign-donate-divider" aria-hidden />
          </>
        )}

        <div className="campaign-donate-main">
          <div ref={chipRef} className="campaign-donate-chips hide-scrollbar">
            {visibleAmounts.map((value) => (
              <button
                key={value}
                type="button"
                className="campaign-donate-chip"
                data-selected={amount === value}
                onClick={() => onAmountChange(value)}
              >
                {currency.symbol}
                {formatAmount(value)}
              </button>
            ))}
          </div>

          <div ref={donateRef} className="campaign-donate-actions">
            <div className="campaign-donate-input-wrap">
              <div className="campaign-donate-currency">
                <button
                  type="button"
                  className="campaign-donate-currency-btn"
                  onClick={() => setCurrencyOpen((open) => !open)}
                  aria-expanded={currencyOpen}
                  aria-haspopup="listbox"
                >
                  <span>{currency.symbol}</span>
                  <span>{currency.code}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                {currencyOpen && (
                  <ul className="campaign-donate-currency-menu" role="listbox">
                    {CURRENCIES.map((item) => (
                      <li key={item.code}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={currency.code === item.code}
                          onClick={() => {
                            setCurrency(item)
                            setCurrencyOpen(false)
                          }}
                        >
                          {item.symbol} {item.code}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <span className="campaign-donate-input-sep">|</span>
              <input
                type="text"
                inputMode="numeric"
                className="campaign-donate-input"
                value={formatAmount(amount)}
                onChange={(e) => handleInputChange(e.target.value)}
                aria-label="Donation amount"
              />
            </div>
            <button type="button" className="campaign-donate-submit" onClick={onDonate}>
              {mobile ? 'Donate Us' : 'Donate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
