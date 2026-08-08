import { formatCurrency } from '../../api'
import { ASSETS } from '../../constants/assets'
import { CD } from './campaignDetailTheme'

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

function StatItem({
  label,
  value,
  mobile,
  bold,
}: {
  label: string
  value: string
  mobile?: boolean
  bold?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 6 : 14, flex: 1, minWidth: 0, height: mobile ? 36 : 48 }}>
      <div
        style={{
          width: mobile ? 28 : 50,
          height: mobile ? 28 : 50,
          background: CD.rupeeBg,
          borderRadius: mobile ? 8 : 11,
          border: `0.37px solid ${CD.rupeeBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <img src={ASSETS.rupee} alt="" width={mobile ? 16 : 26} height={mobile ? 16 : 26} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 1 : 2, minWidth: 0 }}>
        <span style={{ fontWeight: label === 'Raised' ? 700 : 500, fontSize: mobile ? 12 : 14, color: CD.textLabel, textTransform: 'capitalize' }}>
          {label}
        </span>
        <span style={{ fontWeight: bold ? 800 : 700, fontSize: mobile ? 14 : 16, color: CD.textDark, whiteSpace: 'nowrap' }}>
          {value}
        </span>
      </div>
    </div>
  )
}

export default function CampaignProgressCard({ goal, raised, donors, hideGoal, hideRaised, mobile }: Props) {
  const progress = getProgress(raised, goal)
  const chipLeft =
    progress === 0
      ? mobile ? '0px' : '25px'
      : progress >= 100
        ? 'calc(100% - 20px)'
        : progress <= 5
          ? '40px'
          : `${progress}%`

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: mobile ? 12 : 20,
        padding: mobile ? 12 : 24,
        boxShadow: CD.cardShadow,
      }}
    >
      <div style={{ position: 'relative', marginTop: mobile ? 12 : 16 }}>
        <span
          style={{
            position: 'absolute',
            top: mobile ? -4 : -8,
            left: chipLeft,
            transform: 'translateX(-50%)',
            background: CD.progressGreen,
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: mobile ? 12 : 16,
            height: mobile ? 20 : 28,
            borderRadius: 6,
            padding: mobile ? '0 8px' : '0 16px',
            display: 'inline-flex',
            alignItems: 'center',
            zIndex: 2,
            lineHeight: 1,
          }}
        >
          {progress}%
        </span>
        <div
          style={{
            width: '100%',
            height: mobile ? 12 : 16,
            backgroundColor: CD.progressTrack,
            borderRadius: mobile ? 16 : 21,
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: mobile ? 6 : 8,
              backgroundColor: CD.progressGreen,
              marginLeft: mobile ? 3 : 4,
              borderRadius: mobile ? 8 : 10,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: mobile ? 8 : 16,
          marginTop: mobile ? 12 : 40,
        }}
      >
        {!hideGoal && !hideRaised && (
          <>
            <StatItem label="Goal" value={formatCurrency(goal)} mobile={mobile} />
            <div style={{ width: 1, height: mobile ? 36 : 48, background: '#E8E8E8', flexShrink: 0 }} />
            <StatItem label="Raised" value={formatCurrency(raised)} mobile={mobile} bold />
            <div style={{ width: 1, height: mobile ? 36 : 48, background: '#E8E8E8', flexShrink: 0 }} />
          </>
        )}
        {!hideGoal && hideRaised && (
          <>
            <StatItem label="Goal" value={formatCurrency(goal)} mobile={mobile} />
            <div style={{ width: 1, height: mobile ? 36 : 48, background: '#E8E8E8', flexShrink: 0 }} />
          </>
        )}
        {hideGoal && !hideRaised && (
          <>
            <StatItem label="Raised" value={formatCurrency(raised)} mobile={mobile} bold />
            <div style={{ width: 1, height: mobile ? 36 : 48, background: '#E8E8E8', flexShrink: 0 }} />
          </>
        )}
        <StatItem label="Donors" value={donors.toLocaleString('en-IN')} mobile={mobile} />
      </div>
    </div>
  )
}
