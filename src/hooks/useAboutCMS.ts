import { useEffect, useMemo, useState } from 'react'
import { fetchCMS } from '../api'
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
  visionPoint2: string
  visionImage1: string
  visionImage2: string
  missionTitle: string
  missionBaseDesc: string
  missionSecondDesc: string
  missionImage: string
  strengthTitle: string
  strengthItems: { title: string; description: string }[]
  awardsSubtitle: string
  awardsLogos: { id: number; image: string; link: string }[]
  newsLogos: { id: number; image: string; link: string; title: string }[]
}

function byId(sections: CMSItem[], id: number) {
  return sections.find((s) => s.id === id)
}

export function parseAboutCMS(sections: CMSItem[]): AboutCMSData {
  const hero = byId(sections, 85)
  const who = byId(sections, 86)
  const vision = byId(sections, 87)
  const mission = byId(sections, 88)
  const strength = byId(sections, 89)
  const awards = byId(sections, 117)
  const news = byId(sections, 67)

  const heroRelated = hero?.relatedCMS ?? []
  const story = heroRelated[0] ?? {}
  const leadership = heroRelated[1] ?? {}
  const heroImages = [story.image, story.image2, story.image3, leadership.image, leadership.image2].filter(
    Boolean,
  ) as string[]

  const whoRel = (who?.relatedCMS ?? [])[0] ?? {}
  const visionRel = (vision?.relatedCMS ?? [])[0] ?? {}
  const missionRel = (mission?.relatedCMS ?? [])[0] ?? {}

  const awardsLogos = (awards?.relatedCMS ?? [])
    .filter((s) => s.status === 1 || s.status === true)
    .map((s, i) => ({
      id: s.id ?? i,
      image: s.image || '',
      link: (s.link || '#').trim() || '#',
    }))
    .filter((s) => s.image)

  const newsLogos = (news?.relatedCMS ?? [])
    .filter((s) => s.status === 1 || s.status === true)
    .map((s, i) => ({
      id: s.id ?? i,
      image: s.image || '',
      link: (s.link || '#').trim() || '#',
      title: s.title || '',
    }))
    .filter((s) => s.image)

  return {
    heroTitle: hero?.title ?? '',
    heroDescription: hero?.sub_title ?? '',
    heroImages,
    whoWeAreTitle: who?.title ?? '',
    whoWeAreBaseDesc: who?.description ?? '',
    whoWeAreSecondDesc: whoRel.description ?? '',
    whoWeAreImage1: whoRel.image ?? '',
    whoWeAreImage2: whoRel.image2 ?? '',
    whoWeAreImage3: whoRel.image3 ?? '',
    visionTitle: vision?.title ?? '',
    visionDesc1: vision?.description ?? '',
    visionDesc2: visionRel.description ?? '',
    visionPoint1: visionRel.title ?? '',
    visionPoint2: visionRel.sub_title ?? '',
    visionImage1: visionRel.image ?? '',
    visionImage2: visionRel.image2 ?? '',
    missionTitle: mission?.title ?? '',
    missionBaseDesc: mission?.description ?? '',
    missionSecondDesc: missionRel.description ?? '',
    missionImage: missionRel.image ?? '',
    strengthTitle: strength?.title ?? '',
    strengthItems: (strength?.relatedCMS ?? []).slice(0, 4).map((r) => ({
      title: r.title ?? '',
      description: r.description ?? '',
    })),
    awardsSubtitle: (awards?.title ?? '').trim(),
    awardsLogos,
    newsLogos,
  }
}

export function useAboutCMS() {
  const [sections, setSections] = useState<CMSItem[]>([])
  const data = useMemo(() => parseAboutCMS(sections), [sections])

  useEffect(() => {
    fetchCMS().then(setSections).catch(() => {})
  }, [])

  return data
}
