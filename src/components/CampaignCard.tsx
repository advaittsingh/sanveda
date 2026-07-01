import { useNavigate } from 'react-router-dom'
import { formatCurrency, getCampaignSlug } from '../api'
import { ASSETS } from '../constants/assets'
import { C } from '../constants/brand'
import SecondaryButton from './ui/SecondaryButton'
import type { Campaign } from '../types'

interface Props {
  campaign: Campaign
  mobile?: boolean
}

function getProgress(raised: number, goal: number): number {
  if (!goal || goal <= 0) return 0
  return Math.min(Math.round((raised / goal) * 100), 100)
}

function parseCategory(category: unknown): string[] {
  if (!category) return []
  if (Array.isArray(category)) return category.map(String)
  if (typeof category === 'string') {
    try {
      const parsed = JSON.parse(category)
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {
      return category.includes(',') ? category.split(',').map((s) => s.trim()) : [category]
    }
  }
  return []
}

export { parseCategory }

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
    <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 8 : 10, flex: 1, minWidth: 0, height: mobile ? 32 : 38 }}>
      <RupeeIconBox mobile={mobile} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'Red Hat Display, sans-serif',
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
            fontFamily: 'Red Hat Display, sans-serif',
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

export default function CampaignCard({ campaign, mobile }: Props) {
  const navigate = useNavigate()
  const progress = getProgress(campaign.raised, campaign.goal)
  const image = campaign.thumbnail_image || campaign.banner_image || ASSETS.fallBackCard
  const slug = getCampaignSlug(campaign)
  const donors = campaign.total_donors ?? 0
  const hideGoal = Number(campaign.hide_goal) === 1
  const hideRaised = Number(campaign.hide_raised) === 1
  const taxLabel = campaign.exemption_tag || 'Tax Benefit'

  const goToCampaign = () => navigate(`/campaign/${slug}`)
  const onDonate = (e: React.MouseEvent) => {
    e.stopPropagation()
    goToCampaign()
  }

  const progressLeft =
    progress === 0
      ? mobile ? '0px' : '-20px'
      : progress <= 10
        ? mobile ? '-8px' : '-10px'
        : progress >= 90
          ? mobile ? 'calc(100% - 60px)' : 'calc(100% - 72px)'
          : `calc(${progress}% - ${mobile ? '18px' : '22px'})`

  return (
    <div
      onClick={goToCampaign}
      onKeyDown={(e) => e.key === 'Enter' && goToCampaign()}
      role="button"
      tabIndex={0}
      className="card-interactive"
      style={{
        width: mobile ? '100%' : '417px',
        minWidth: mobile ? 290 : undefined,
        maxWidth: '100%',
        background: '#FFFFFF',
        boxShadow: '0px 10px 26px rgba(0, 0, 0, 0.04)',
        borderRadius: mobile ? 12 : 16,
        overflow: 'visible',
        fontFamily: "'Red Hat Display', sans-serif",
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: mobile ? 12 : 16, paddingBottom: mobile ? 16 : 20 }}>
        {/* Image */}
        <div
          style={{
            width: '100%',
            height: mobile ? 156 : 217,
            position: 'relative',
            borderRadius: mobile ? 12 : 16,
            overflow: 'hidden',
            marginBottom: mobile ? 14 : 18,
          }}
        >
          <img src={image} alt={campaign.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          {campaign.exemption_tag && (
            <span
              style={{
                position: 'absolute',
                right: mobile ? 8 : 10,
                top: mobile ? 8 : 10.5,
                background: C.secondary,
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: mobile ? 10 : 12,
                height: mobile ? 28 : 32,
                borderRadius: 4,
                padding: mobile ? '0 12px' : '0 16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {taxLabel}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            fontWeight: 700,
            fontSize: mobile ? 14 : 18,
            lineHeight: mobile ? '18px' : '26px',
            color: '#1D1D1B',
            margin: `0 0 ${mobile ? 8 : 10}px`,
            minHeight: mobile ? 36 : 52,
            maxHeight: mobile ? 36 : 52,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textTransform: 'capitalize',
          }}
        >
          {campaign.title}
        </h3>

        {/* Progress */}
        <div style={{ position: 'relative', marginBottom: mobile ? 40 : 50 }}>
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

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: mobile ? 6 : 8,
            marginTop: mobile ? 8 : 10,
            marginBottom: mobile ? 16 : 20,
          }}
        >
          {!hideGoal && !hideRaised && (
            <>
              <StatCol label="Goal" value={formatCurrency(campaign.goal)} mobile={mobile} />
              <Divider mobile={mobile} />
              <StatCol label="Raised" value={formatCurrency(campaign.raised)} mobile={mobile} valueBold />
              <Divider mobile={mobile} />
            </>
          )}
          {!hideGoal && hideRaised && (
            <>
              <StatCol label="Goal" value={formatCurrency(campaign.goal)} mobile={mobile} />
              <Divider mobile={mobile} />
            </>
          )}
          {hideGoal && !hideRaised && (
            <>
              <StatCol label="Raised" value={formatCurrency(campaign.raised)} mobile={mobile} valueBold />
              <Divider mobile={mobile} />
            </>
          )}
          <StatCol label="Donors" value={donors.toLocaleString('en-IN')} mobile={mobile} />
        </div>

        <div style={{ height: 1, background: '#E8E8E8', marginBottom: mobile ? 16 : 20 }} />

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
            height: mobile ? 32 : 44,
          }}
        >
          <SecondaryButton
            onClick={onDonate}
            style={{
              borderRadius: 10,
              padding: mobile ? '8px 16px' : '15px 24px',
              width: mobile ? 115 : 160,
              height: mobile ? 36 : 44,
              fontSize: mobile ? 11 : 14,
              lineHeight: mobile ? '11px' : '14px',
              textTransform: 'none',
            }}
          >
            Donate Now
          </SecondaryButton>
        </div>
      </div>
    </div>
  )
}
