import { useEffect, useMemo, useState } from 'react'
import { fetchCMS } from '../api'
import {
  ABOUT_HERO,
  ABOUT_MISSION_SECTION,
  ABOUT_PAGE_IMAGES,
  ABOUT_STRENGTH_SECTION,
  ABOUT_VISION_SECTION,
  ABOUT_WHO_WE_ARE,
} from '../constants/aboutContent'
import { withTimeout } from '../lib/withTimeout'
import type { CMSItem } from '../types'

export interface AboutCMSData {
  heroTitle: string
  heroDescription: string
  heroImages: string[]
  heroLoading: boolean
  whoWeAreTitle: string
  whoWeAreBaseDesc: string
  whoWeAreSecondDesc: string
  whoWeAreImage1: string
  whoWeAreImage2: string
  whoWeAreImage3: string
  visionTitle: string
  visionDesc1: string
  visionDesc2: string
  visionPoint1: string
  visionPoint1Label: string
  visionPoint2: string
  visionPoint2Label: string
  visionImage1: string
  visionImage2: string
  missionTitle: string
  missionBaseDesc: string
  missionSecondDesc: string
  missionImage: string
  strengthTitle: string
  strengthItems: { title: string; description: string }[]
}

const FALLBACK_HERO_IMAGES = (() => {
  const base = ABOUT_PAGE_IMAGES.hero.filter(Boolean)
  // Banner expects up to 5 slots; cycle fallbacks so we never show empty skeletons.
  const filled: string[] = []
  for (let i = 0; i < 5; i += 1) {
    filled.push(base[i % Math.max(base.length, 1)] || '/assets/hero-banner.jpg')
  }
  return filled
})()

const SANVEDA_SECTIONS: Omit<AboutCMSData, 'heroTitle' | 'heroDescription' | 'heroImages' | 'heroLoading'> = {
  whoWeAreTitle: ABOUT_WHO_WE_ARE.title,
  whoWeAreBaseDesc: ABOUT_WHO_WE_ARE.description,
  whoWeAreSecondDesc: ABOUT_WHO_WE_ARE.secondDescription,
  whoWeAreImage1: ABOUT_PAGE_IMAGES.whoWeAre[0],
  whoWeAreImage2: ABOUT_PAGE_IMAGES.whoWeAre[1],
  whoWeAreImage3: ABOUT_PAGE_IMAGES.whoWeAre[2],
  visionTitle: ABOUT_VISION_SECTION.title,
  visionDesc1: ABOUT_VISION_SECTION.description,
  visionDesc2: ABOUT_VISION_SECTION.secondDescription,
  visionPoint1: ABOUT_VISION_SECTION.point1,
  visionPoint1Label: ABOUT_VISION_SECTION.point1Label,
  visionPoint2: ABOUT_VISION_SECTION.point2,
  visionPoint2Label: ABOUT_VISION_SECTION.point2Label,
  visionImage1: ABOUT_PAGE_IMAGES.vision[0],
  visionImage2: ABOUT_PAGE_IMAGES.vision[1],
  missionTitle: ABOUT_MISSION_SECTION.title,
  missionBaseDesc: ABOUT_MISSION_SECTION.description,
  missionSecondDesc: ABOUT_MISSION_SECTION.secondDescription,
  missionImage: ABOUT_PAGE_IMAGES.mission,
  strengthTitle: ABOUT_STRENGTH_SECTION.title,
  strengthItems: ABOUT_STRENGTH_SECTION.items,
}

function findAboutHero(sections: CMSItem[]): CMSItem | undefined {
  return (
    sections.find((s) => (s.section ?? '').toLowerCase() === 'about hero') ||
    sections.find((s) => (s.page ?? '').toLowerCase() === 'about' && /hero/i.test(s.section ?? '')) ||
    sections.find((s) => (s.page ?? '').toLowerCase() === 'about')
  )
}

function parseHeroFromCMS(sections: CMSItem[], settled: boolean) {
  const hero = findAboutHero(sections)
  const heroRelated = hero?.relatedCMS ?? []
  const story = heroRelated[0] ?? {}
  const leadership = heroRelated[1] ?? {}
  const fromRelated = [story.image, story.image2, story.image3, leadership.image, leadership.image2].filter(
    Boolean,
  ) as string[]
  const fromHero = [hero?.image, hero?.image2, hero?.image3].filter(Boolean) as string[]
  const cmsImages = fromRelated.length ? fromRelated : fromHero

  return {
    heroTitle: hero?.title || ABOUT_HERO.title,
    heroDescription: hero?.sub_title || hero?.description || ABOUT_HERO.intro,
    // Only fall back after the fetch settles — never leave empty placeholders forever.
    heroImages: !settled ? [] : cmsImages.length ? cmsImages : FALLBACK_HERO_IMAGES,
  }
}

export function useAboutCMS(): AboutCMSData {
  const [sections, setSections] = useState<CMSItem[]>([])
  const [heroLoading, setHeroLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setHeroLoading(true)

    withTimeout(fetchCMS(), 8_000, 'About CMS')
      .then((cms) => {
        if (cancelled) return
        setSections(cms)
      })
      .catch(() => {
        if (cancelled) return
        setSections([])
      })
      .finally(() => {
        if (!cancelled) setHeroLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(() => {
    const hero = parseHeroFromCMS(sections, !heroLoading)
    return { ...SANVEDA_SECTIONS, ...hero, heroLoading }
  }, [sections, heroLoading])
}
