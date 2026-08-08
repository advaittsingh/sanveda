import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { C } from '../../constants/brand'
import { useAuth } from '../../context/AuthContext'
import { readSavedCampaigns, toggleSavedCampaign } from '../../lib/donorPortalService'

interface Props {
  slug: string
  title: string
  compact?: boolean
}

export default function SaveCampaignButton({ slug, title, compact }: Props) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [saved, setSaved] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (!user) {
      setSaved(false)
      return
    }
    setSaved(readSavedCampaigns(user.id).some((c) => c.slug === slug))
  }, [user, slug])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(''), 2500)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const handleClick = () => {
    if (loading) return

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)
      return
    }

    const next = toggleSavedCampaign(user.id, slug, title)
    const isSaved = next.some((c) => c.slug === slug)
    setSaved(isSaved)
    setFeedback(isSaved ? 'Saved to your dashboard' : 'Removed from saved')
  }

  const label = saved ? 'Saved' : 'Save'

  if (compact) {
    return (
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <button
          type="button"
          onClick={handleClick}
          aria-label={saved ? 'Remove from saved campaigns' : 'Save campaign'}
          aria-pressed={saved}
          title={saved ? 'Saved to your dashboard' : 'Save for later'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: `1px solid ${saved ? C.secondary : C.border}`,
            background: saved ? `${C.secondary}15` : C.white,
            color: saved ? C.secondary : C.textMuted,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Bookmark size={18} fill={saved ? C.secondary : 'none'} />
        </button>
        {feedback ? (
          <span
            role="status"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 6,
              whiteSpace: 'nowrap',
              fontSize: 11,
              fontWeight: 600,
              color: C.primary,
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: '4px 8px',
              zIndex: 2,
              boxShadow: '0 4px 12px rgba(4, 27, 77, 0.08)',
            }}
          >
            {feedback}
          </span>
        ) : null}
      </span>
    )
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from saved campaigns' : 'Save campaign'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          height: 44,
          padding: '0 18px',
          borderRadius: 10,
          border: `1px solid ${saved ? C.secondary : C.border}`,
          background: saved ? `${C.secondary}12` : C.white,
          color: saved ? C.secondary : C.primary,
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <Bookmark size={18} fill={saved ? C.secondary : 'none'} />
        {label}
      </button>
      {feedback ? (
        <span
          role="status"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 6,
            fontSize: 12,
            fontWeight: 600,
            color: C.secondary,
            whiteSpace: 'nowrap',
          }}
        >
          {feedback}
        </span>
      ) : null}
    </span>
  )
}
