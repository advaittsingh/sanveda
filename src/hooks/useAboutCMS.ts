import { useEffect, useMemo, useState } from 'react'
import { fetchCMS } from '../api'
import {
  ABOUT_MISSION_SECTION,
  ABOUT_PAGE_IMAGES,
  ABOUT_STRENGTH_SECTION,
  ABOUT_VISION_SECTION,
  ABOUT_WHO_WE_ARE,
} from '../constants/aboutContent'
import type { CMSItem } from '../types'

export interface AboutCMSData {
  heroTitle: string
  heroDescription: string
  heroImages: string[]
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

const SANVEDA_SECTIONS: Omit<AboutCMSData, 'heroTitle' | 'heroDescription' | 'heroImages'> = {
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

function byId(sections: CMSItem[], id: number) {
  return sections.find((s) => s.id === id)
}

function parseHeroFromCMS(sections: CMSItem[]) {
  const hero = byId(sections, 85)
  const heroRelated = hero?.relatedCMS ?? []
  const story = heroRelated[0] ?? {}
  const leadership = heroRelated[1] ?? {}
  const heroImages = [story.image, story.image2, story.image3, leadership.image, leadership.image2].filter(
    Boolean,
  ) as string[]

  return {
    heroTitle: hero?.title ?? '',
    heroDescription: hero?.sub_title ?? '',
    heroImages,
  }
}

export function useAboutCMS(): AboutCMSData {
  const [sections, setSections] = useState<CMSItem[]>([])

  useEffect(() => {
    fetchCMS().then(setSections).catch(() => {})
  }, [])

  return useMemo(() => {
    const hero = parseHeroFromCMS(sections)
    return { ...SANVEDA_SECTIONS, ...hero }
  }, [sections])
}
