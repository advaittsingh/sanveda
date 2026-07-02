import { useEffect, useMemo, useState } from 'react'
import { ASSETS } from '../../constants/assets'
import { TH } from './campaignDetailTheme'

export type CampaignSectionId = 'project' | 'updates' | 'comments'

interface Section {
  id: CampaignSectionId
  label: string
  icon: string
}

interface Props {
  hasProject: boolean
  hasUpdates: boolean
  horizontal?: boolean
  mobile?: boolean
  tablet?: boolean
  onNavigate?: (id: CampaignSectionId) => void
}

export default function CampaignSectionNav({
  hasProject,
  hasUpdates,
  horizontal,
  mobile,
  tablet,
  onNavigate,
}: Props) {
  const sections = useMemo(
    () =>
      ([
        { id: 'project' as const, label: 'Project', icon: '/assets/subtitle-MIcon-e3d9f166.svg', show: hasProject },
        { id: 'updates' as const, label: 'Updates', icon: ASSETS.notification, show: hasUpdates },
        { id: 'comments' as const, label: 'Comments', icon: ASSETS.people, show: true },
      ] satisfies (Section & { show: boolean })[]).filter((s) => s.show),
    [hasProject, hasUpdates],
  )

  const [active, setActive] = useState<CampaignSectionId>(sections[0]?.id ?? 'project')

  useEffect(() => {
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          const id = visible[0].target.id as CampaignSectionId
          setActive(id)
        }
      },
      { rootMargin: '-20% 0px -50% 0px', threshold: [0, 0.1, 0.5, 1] },
    )

    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  const navigate = (id: CampaignSectionId) => {
    setActive(id)
    onNavigate?.(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      className={horizontal ? 'campaign-section-nav-horizontal' : 'campaign-section-nav-vertical'}
      aria-label="Campaign sections"
      style={
        horizontal
          ? undefined
          : {
              background: '#FFFFFF',
              borderRadius: 12,
              border: `1px solid ${TH.border}`,
              padding: mobile ? '16px 20px' : tablet ? '20px 24px' : '24px 30px',
              width: '100%',
            }
      }
    >
      {sections.map((section) => {
        const selected = active === section.id
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => navigate(section.id)}
            className={horizontal ? 'campaign-section-nav-item-h' : 'campaign-section-nav-item-v'}
            data-selected={selected}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: horizontal || mobile ? 8 : 12,
              padding: horizontal
                ? '12px 16px'
                : mobile
                  ? '12px 0 12px 20px'
                  : tablet
                    ? '14px 0 14px 28px'
                    : '17px 0 17px 34px',
              marginBottom: horizontal ? 0 : mobile ? 12 : 20,
              cursor: 'pointer',
              position: 'relative',
              border: 'none',
              background: horizontal && selected ? TH.textDark : 'transparent',
              color: horizontal && selected ? '#FFFFFF' : TH.textDark,
              borderRadius: horizontal ? 6 : 0,
              fontFamily: 'Red Hat Display, sans-serif',
              fontWeight: 600,
              fontSize: horizontal ? 14 : mobile ? 14 : 16,
              flex: horizontal ? 1 : undefined,
              justifyContent: horizontal ? 'center' : 'flex-start',
              minWidth: horizontal ? 100 : undefined,
              maxWidth: horizontal ? 150 : undefined,
              whiteSpace: 'nowrap',
            }}
          >
            {!horizontal && selected && (
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: 4,
                  height: '100%',
                  backgroundColor: TH.navAccent,
                  borderRadius: '0 2px 2px 0',
                }}
              />
            )}
            <img
              src={section.icon}
              alt=""
              width={horizontal ? 18 : mobile ? 20 : 26}
              height={horizontal ? 18 : mobile ? 20 : 26}
              style={{ filter: horizontal && selected ? 'brightness(0) invert(1)' : 'none', flexShrink: 0 }}
            />
            {section.label}
          </button>
        )
      })}
    </nav>
  )
}
