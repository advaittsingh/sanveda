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

  useEffect(() => {
    if (!user) {
      setSaved(false)
      return
    }
    setSaved(readSavedCampaigns(user.id).some((c) => c.slug === slug))
  }, [user, slug])

  const handleClick = () => {
    if (loading) return

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)
      return
    }

    const next = toggleSavedCampaign(user.id, slug, title)
    setSaved(next.some((c) => c.slug === slug))
  }

  const label = saved ? 'Saved' : 'Save'

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={saved ? 'Remove from saved campaigns' : 'Save campaign'}
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
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
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
  )
}
