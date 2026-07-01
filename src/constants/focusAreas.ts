export interface FocusArea {
  slug: string
  title: string
  tabLabel: string
  summary: string
  description: string
  image: string
  icon: string
  accent: string
  categoryKeys: string[]
  keywords: string[]
}

import type { Campaign } from '../types'

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

export function campaignMatchesFocusArea(campaign: Campaign, area: FocusArea): boolean {
  const cats = parseCategory(campaign.category).map((c) => c.toLowerCase())
  if (area.categoryKeys.some((k) => cats.some((c) => c.includes(k.toLowerCase()) || k.toLowerCase().includes(c)))) {
    return true
  }
  const text = `${campaign.title} ${campaign.description ?? ''}`.toLowerCase()
  return area.keywords.some((k) => text.includes(k.toLowerCase()))
}

export const FOCUS_AREAS: FocusArea[] = [
  {
    slug: 'healthcare-therapeutic-support',
    title: 'Healthcare & Therapeutic Support',
    tabLabel: 'Healthcare',
    summary: 'Medical aid, treatment support, and therapeutic care for those in critical need.',
    description:
      'Sanveda channels compassionate giving toward life-saving treatments, hospital support, rehabilitation, and therapeutic interventions. We partner with verified campaigns that deliver transparent medical assistance to patients and families who cannot afford essential care.',
    image: '/assets/focus-areas/healthcare.jpg',
    icon: '/assets/medical-fcb29601.svg',
    accent: '#0E4FA8',
    categoryKeys: ['medical', 'disability', 'elderly', 'urgent'],
    keywords: ['health', 'medical', 'hospital', 'treatment', 'therapy', 'patient', 'surgery', 'cancer'],
  },
  {
    slug: 'sports-development-athlete-empowerment',
    title: 'Sports Development & Athlete Empowerment',
    tabLabel: 'Sports',
    summary: 'Training, equipment, and opportunities for athletes to reach their full potential.',
    description:
      'We believe sport transforms lives. This focus area supports grassroots athletes, training programs, sports infrastructure, and empowerment initiatives that help talented individuals overcome financial barriers and compete at higher levels.',
    image: '/assets/focus-areas/sports.jpg',
    icon: '/assets/rocket-MIcon-ee6a8bd2.svg',
    accent: '#0E4FA8',
    categoryKeys: ['diy', 'urgent'],
    keywords: ['sport', 'athlete', 'training', 'stadium', 'coach', 'olympic', 'cricket', 'football'],
  },
  {
    slug: 'education-skill-development',
    title: 'Education & Skill Development',
    tabLabel: 'Education',
    summary: 'Scholarships, schooling, and vocational training for a brighter future.',
    description:
      'Education is the foundation of lasting change. Sanveda funds school fees, learning materials, digital access, and skill-building programs so children and young adults can build independent, dignified futures.',
    image: '/assets/focus-areas/education.jpg',
    icon: '/assets/education-ce7b51eb.svg',
    accent: '#041B4D',
    categoryKeys: ['education', 'children'],
    keywords: ['education', 'school', 'college', 'scholarship', 'skill', 'learning', 'student', 'study'],
  },
  {
    slug: 'community-social-upliftment',
    title: 'Community & Social Upliftment',
    tabLabel: 'Community',
    summary: 'Food security, shelter, disaster relief, and dignity for vulnerable communities.',
    description:
      'From hunger relief and women\'s empowerment to disaster response and community rebuilding, this pillar addresses systemic hardship at the neighbourhood level — restoring safety, stability, and hope where it is needed most.',
    image: '/assets/focus-areas/community.jpg',
    icon: '/assets/hunger-d881089a.svg',
    accent: '#0E4FA8',
    categoryKeys: ['hunger', 'women', 'children', 'disaster-relief', 'faith', 'animals'],
    keywords: ['community', 'food', 'hunger', 'shelter', 'relief', 'women', 'village', 'flood'],
  },
  {
    slug: 'ethical-events-brand-partnerships',
    title: 'Ethical Events & Brand Partnerships',
    tabLabel: 'Events & Brands',
    summary: 'Purpose-driven collaborations and fundraising events with transparent impact.',
    description:
      'Sanveda works with brands, institutions, and event organisers to create ethical fundraising experiences. Every partnership is built on accountability — ensuring donations reach verified causes and deliver measurable social outcomes.',
    image: '/assets/focus-areas/events.jpg',
    icon: '/assets/shop-f218d23a.svg',
    accent: '#0E4FA8',
    categoryKeys: ['diy', 'faith'],
    keywords: ['event', 'brand', 'partnership', 'corporate', 'fundraiser', 'campaign drive'],
  },
]

export function getFocusAreaBySlug(slug: string): FocusArea | undefined {
  return FOCUS_AREAS.find((a) => a.slug === slug)
}
