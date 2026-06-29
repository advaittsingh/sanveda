import { useEffect, useRef, useState } from 'react'
import type { MonthlyDonation } from '../../types'
import { ASSETS } from '../../constants/assets'
import { C } from '../../constants/brand'
import SecondaryButton from '../ui/SecondaryButton'

const AMOUNTS = [3000, 6000, 10000, 12000, 14000]

interface Props {
  programs: MonthlyDonation[]
  isMediumScreen?: boolean
  isSmallScreen?: boolean
  initialCauseId?: string
}

export default function MonthlyDonationWidget({
  programs,
  isMediumScreen = false,
  isSmallScreen = false,
  initialCauseId,
}: Props) {
  const mobile = useMedia(600)
  const [amount, setAmount] = useState(3000)
  const [amountText, setAmountText] = useState('3,000')
  const [causeId, setCauseId] = useState(initialCauseId ?? '')
  const selectRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    if (initialCauseId) setCauseId(initialCauseId)
  }, [initialCauseId])

  const s = mobile
    ? styles.mobile
    : isMediumScreen
      ? styles.medium
      : isSmallScreen
        ? styles.small
        : styles.desktop

  const pickAmount = (value: number) => {
    setAmount(value)
    setAmountText(value.toLocaleString('en-IN'))
  }

  const onAmountInput = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, '')
    if (digits) {
      const n = parseInt(digits, 10)
      setAmountText(n.toLocaleString('en-IN'))
      setAmount(n)
    } else {
      setAmountText('')
      setAmount(0)
    }
  }

  const onDonate = () => {
    if (!causeId) {
      alert('Please select a cause')
      return
    }
    if (amount < 100) {
      alert('Minimum donation amount is ₹100')
      return
    }
    const cause = programs.find((p) => String(p.id) === causeId)
    const params = new URLSearchParams({
      id: causeId,
      title: cause?.title ?? '',
      amount: String(amount),
    })
    window.location.href = `/donate-monthly?${params.toString()}`
  }

  const width = isSmallScreen ? '100%' : isMediumScreen ? '480px' : '586px'

  return (
    <div
      style={{
        width,
        borderRadius: mobile ? 11 : 20,
        padding: `${s.padY}px ${s.padX}px`,
        border: '1px solid #E8E8E8',
        background: C.white,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: s.titleMb }}>
        <img src={ASSETS.starIcon} alt="" style={{ width: s.starSize, height: s.starSize, objectFit: 'contain' }} />
        <p style={{ fontWeight: 800, fontSize: s.titleSize, lineHeight: s.titleLh, letterSpacing: '-0.02em', color: '#1D1D1B', margin: 0 }}>
          Save A Life Every Month
        </p>
      </div>

      <p style={{ fontWeight: 600, fontSize: s.labelSize, lineHeight: '100%', color: '#141414', margin: '0 0 8px' }}>
        Select Cause
      </p>

      <div style={{ position: 'relative', marginBottom: s.dropdownMb }}>
        <select
          ref={selectRef}
          value={causeId}
          onChange={(e) => setCauseId(e.target.value)}
          style={{
            width: '100%',
            height: s.dropdownH,
            borderRadius: s.dropdownRadius,
            padding: `0 ${s.dropdownPadX}px`,
            paddingRight: 36,
            border: `${s.borderW}px solid #DDE2E5`,
            fontWeight: 500,
            fontSize: 14,
            color: causeId ? '#1D1D1B' : '#979796',
            appearance: 'none',
            background: C.white,
            boxSizing: 'border-box',
          }}
        >
          <option value="">Select Cause</option>
          {programs.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.title}
            </option>
          ))}
        </select>
        <img
          src={ASSETS.dropdownArrow}
          alt=""
          style={{
            position: 'absolute',
            right: mobile ? 10 : 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: mobile ? 12 : 22,
            height: mobile ? 12 : 22,
            pointerEvents: 'none',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: s.btnGap,
          marginBottom: s.btnGapMb,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {AMOUNTS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => pickAmount(value)}
            style={{
              width: s.amtBtnW,
              minWidth: s.amtBtnW,
              height: s.amtBtnH,
              borderRadius: s.amtBtnRadius,
              border: `${s.borderW}px solid #DDE2E5`,
              background: amount === value ? '#1D1D1B' : 'transparent',
              color: amount === value ? C.white : '#1D1D1B',
              fontFamily: 'Red Hat Display, sans-serif',
              fontWeight: 800,
              fontSize: s.amtBtnFont,
              lineHeight: s.amtBtnLh,
              cursor: 'pointer',
            }}
          >
            ₹{value.toLocaleString('en-IN')}
          </button>
        ))}
      </div>

      <div
        style={{
          height: s.customH,
          borderRadius: s.dropdownRadius,
          padding: `0 ${s.dropdownPadX}px`,
          border: `${s.borderW}px solid rgba(212,164,55,0.55)`,
          background: C.cream,
          marginBottom: s.customMb,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: s.customFont, color: '#4A4A49' }}>₹</span>
        <div style={{ width: 1, height: 20, background: 'rgba(212,164,55,0.55)' }} />
        <input
          value={amountText}
          onChange={(e) => onAmountInput(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: s.customFont,
            color: '#4A4A49',
            textAlign: 'center',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <SecondaryButton fullWidth onClick={onDonate}>
        Donate Monthly
      </SecondaryButton>
    </div>
  )
}

function useMedia(maxWidth: number) {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= maxWidth : false,
  )
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= maxWidth)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [maxWidth])
  return mobile
}

const styles = {
  mobile: {
    padX: 10, padY: 16, titleMb: 16, starSize: 14, titleSize: 14, titleLh: '11.19px',
    labelSize: 12, dropdownH: 38.44, dropdownRadius: 4.99, dropdownPadX: 9.97, dropdownMb: 11,
    borderW: 0.62, btnGap: 3, btnGapMb: 11, amtBtnW: 57.9, amtBtnH: 30.44, amtBtnRadius: 4.99,
    amtBtnFont: 10, amtBtnLh: '13.46px', customH: 38.44, customFont: 14, customMb: 11,
    donateRadius: 6.23, donatePadY: 14, donatePadX: 0, donateFont: 12,
  },
  small: {
    padX: 16, padY: 24, titleMb: 24, starSize: 20, titleSize: 20, titleLh: '18px',
    labelSize: 14, dropdownH: 48, dropdownRadius: 7, dropdownPadX: 14, dropdownMb: 16,
    borderW: 1, btnGap: 8, btnGapMb: 16, amtBtnW: 90, amtBtnH: 42, amtBtnRadius: 7,
    amtBtnFont: 12, amtBtnLh: '20px', customH: 48, customFont: 16, customMb: 20,
    donateRadius: 9, donatePadY: 18, donatePadX: 28, donateFont: 14,
  },
  medium: {
    padX: 12, padY: 30, titleMb: 30, starSize: 24, titleSize: 24, titleLh: '20px',
    labelSize: 16, dropdownH: 55.68, dropdownRadius: 8.91, dropdownPadX: 17.82, dropdownMb: 20,
    borderW: 1.11, btnGap: 6.14, btnGapMb: 20, amtBtnW: 85, amtBtnH: 49, amtBtnRadius: 8.91,
    amtBtnFont: 14, amtBtnLh: '24.05px', customH: 53.67, customFont: 17.82, customMb: 24,
    donateRadius: 11.14, donatePadY: 21.16, donatePadX: 33.41, donateFont: 16,
  },
  desktop: {
    padX: 17, padY: 30, titleMb: 30, starSize: 24, titleSize: 24, titleLh: '20px',
    labelSize: 16, dropdownH: 55.68, dropdownRadius: 8.91, dropdownPadX: 17.82, dropdownMb: 20,
    borderW: 1.11, btnGap: 9.14, btnGapMb: 20, amtBtnW: 102.45, amtBtnH: 49, amtBtnRadius: 8.91,
    amtBtnFont: 14, amtBtnLh: '24.05px', customH: 53.67, customFont: 17.82, customMb: 24,
    donateRadius: 11.14, donatePadY: 21.16, donatePadX: 33.41, donateFont: 16,
  },
}
