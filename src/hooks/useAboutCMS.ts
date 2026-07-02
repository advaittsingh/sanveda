import {
  ABOUT_HERO,
  ABOUT_MISSION_SECTION,
  ABOUT_PAGE_IMAGES,
  ABOUT_STRENGTH_SECTION,
  ABOUT_VISION_SECTION,
  ABOUT_WHO_WE_ARE,
} from '../constants/aboutContent'

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

const SANVEDA_ABOUT_DATA: AboutCMSData = {
  heroTitle: ABOUT_HERO.title,
  heroDescription: ABOUT_HERO.intro,
  heroImages: [
    ABOUT_PAGE_IMAGES.hero[0],
    ABOUT_PAGE_IMAGES.hero[1],
    ABOUT_PAGE_IMAGES.hero[2],
    ABOUT_PAGE_IMAGES.hero[0],
    ABOUT_PAGE_IMAGES.hero[1],
  ],
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

export function useAboutCMS(): AboutCMSData {
  return SANVEDA_ABOUT_DATA
}
