import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { BRAND } from '../../constants/brand'

interface Props {
  slug: string
  title: string
  mobile?: boolean
  equalWidth?: boolean
}

export default function ShareCampaignButton({ slug, title, mobile, equalWidth }: Props) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/campaign/${slug}`

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()

    const text = `Support "${title}" on ${BRAND.shortName} — ${BRAND.tagline}`

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl })
        return
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${shareUrl}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', shareUrl)
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="btn-secondary"
      aria-label="Share campaign"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 10,
        padding: mobile ? '8px 12px' : '15px 16px',
        width: equalWidth ? 'auto' : mobile ? 96 : 120,
        flex: equalWidth ? '1 1 0' : undefined,
        minWidth: equalWidth ? 0 : undefined,
        height: mobile ? 36 : 44,
        fontSize: mobile ? 11 : 14,
        lineHeight: mobile ? '11px' : '14px',
        textTransform: 'none',
        fontFamily: 'Red Hat Display, sans-serif',
        fontWeight: 600,
        flexShrink: equalWidth ? undefined : 0,
      }}
    >
      <Share2 size={mobile ? 14 : 16} />
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
