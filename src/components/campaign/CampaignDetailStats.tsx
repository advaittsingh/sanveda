import { formatCurrency } from '../../api'
import { ASSETS } from '../../constants/assets'
import { C } from '../../constants/brand'

interface Props {
  goal: number
  raised: number
  donors: number
  hideGoal?: boolean
  hideRaised?: boolean
  mobile?: boolean
}

function getProgress(raised: number, goal: number): number {
  if (!goal || goal <= 0) return 0
  return Math.min(Math.round((raised / goal) * 100), 100)
}

function RupeeIconBox({ mobile }: { mobile?: boolean }) {
  const size = mobile ? 28 : 32
  const img = mobile ? 16 : 20
  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#F5F8ED',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <img src={ASSETS.rupee} alt="" width={img} height={img} />
    </div>
  )
}

function StatCol({
  label,
  value,
  mobile,
  valueBold,
}: {
  label: string
  value: string
  mobile?: boolean
  valueBold?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 8 : 10, flex: 1, minWidth: 0 }}>
      <RupeeIconBox mobile={mobile} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span
          style={{
            fontWeight: label === 'Raised' ? 700 : 500,
            fontSize: mobile ? 12 : 14,
            lineHeight: mobile ? '16px' : '18px',
            color: '#686866',
            textTransform: 'capitalize',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontWeight: valueBold ? 800 : 700,
            fontSize: mobile ? 12 : 14,
            lineHeight: mobile ? '16px' : '18px',
            color: '#1D1D1B',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

function Divider({ mobile }: { mobile?: boolean }) {
  return <div style={{ width: 1, height: mobile ? 32 : 38, background: '#E8E8E8', flexShrink: 0 }} />
}

export default function CampaignDetailStats({ goal, raised, donors, hideGoal, hideRaised, mobile }: Props) {
  const progress = getProgress(raised, goal)
  const progressLeft =
    progress === 0
      ? mobile ? '0px' : '-20px'
      : progress <= 10
        ? mobile ? '-8px' : '-10px'
        : progress >= 90
          ? mobile ? 'calc(100% - 60px)' : 'calc(100% - 72px)'
          : `calc(${progress}% - ${mobile ? '18px' : '22px'})`

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: mobile ? 40 : 48 }}>
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: mobile ? 10 : 12,
            top: mobile ? 3 : 4,
            background: '#E8E8E8',
            opacity: 0.6,
            borderRadius: 20,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: `${progress}%`,
            height: 6,
            left: 3,
            top: mobile ? 6 : 7,
            background: 'linear-gradient(90deg, #9CBA4D 0%, #9AB453 100%)',
            borderRadius: 4,
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: progressLeft,
            transform: 'translateX(50%)',
            background: '#8EA946',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: mobile ? 12 : 14,
            height: mobile ? 20 : 22,
            borderRadius: 4,
            padding: mobile ? '0 6px' : '0 8px',
            display: 'inline-flex',
            alignItems: 'center',
            lineHeight: 1,
          }}
        >
          {progress}%
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: mobile ? 6 : 8,
          padding: mobile ? '0 0 20px' : '0 0 24px',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {!hideGoal && !hideRaised && (
          <>
            <StatCol label="Goal" value={formatCurrency(goal)} mobile={mobile} />
            <Divider mobile={mobile} />
            <StatCol label="Raised" value={formatCurrency(raised)} mobile={mobile} valueBold />
            <Divider mobile={mobile} />
          </>
        )}
        {!hideGoal && hideRaised && (
          <>
            <StatCol label="Goal" value={formatCurrency(goal)} mobile={mobile} />
            <Divider mobile={mobile} />
          </>
        )}
        {hideGoal && !hideRaised && (
          <>
            <StatCol label="Raised" value={formatCurrency(raised)} mobile={mobile} valueBold />
            <Divider mobile={mobile} />
          </>
        )}
        <StatCol label="Donors" value={donors.toLocaleString('en-IN')} mobile={mobile} />
      </div>
    </div>
  )
}
