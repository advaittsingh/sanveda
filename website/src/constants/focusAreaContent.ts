import { ASSETS } from './assets'
import type { FocusArea } from './focusAreas'

export interface FocusStat {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  label: string
}

export interface FocusProgram {
  icon: string
  title: string
  description: string
}

export interface FocusGalleryImage {
  src: string
  alt: string
  caption?: string
}

export interface FocusStory {
  quote: string
  author: string
}

export interface DonationTier {
  amount: string
  description: string
}

export interface FocusAreaDetailContent {
  heroTagline: string
  heroStats: FocusStat[]
  overviewTitle: string
  overviewBody: string
  overviewBullets: string[]
  overviewImage: string
  programs: FocusProgram[]
  impactStats: FocusStat[]
  galleryTitle: string
  gallery: FocusGalleryImage[]
  stories: FocusStory[]
  partners: string[]
  donationLadder: DonationTier[]
  ctaTitle: string
  ctaDescription: string
  emptyCampaignMessage: string
  emptyCampaignCta: string
}

const HERO_FALLBACK = ASSETS.heroBanner || '/assets/hero-banner.png'

const SHARED_GALLERY: FocusGalleryImage[] = [
  { src: HERO_FALLBACK, alt: 'Community outreach program', caption: 'Field outreach' },
  { src: ASSETS.founderHamdan, alt: 'Sanveda founder with beneficiaries', caption: 'Leadership on ground' },
  { src: ASSETS.founderNayma, alt: 'Sanveda team member with community', caption: 'Community engagement' },
  { src: ASSETS.ourImpact, alt: 'Impact program in action', caption: 'Program impact' },
  { src: ASSETS.startCampaign, alt: 'Volunteers supporting families', caption: 'Volunteer support' },
  { src: ASSETS.fallBackBanner, alt: 'Beneficiary support session', caption: 'Direct assistance' },
]

export const FOCUS_AREA_CONTENT: Record<string, FocusAreaDetailContent> = {
  'healthcare-therapeutic-support': {
    heroTagline: 'Delivering life-saving treatment, rehabilitation support and therapeutic care to underserved communities.',
    heroStats: [],
    overviewTitle: 'Why Healthcare Matters',
    overviewBody:
      'Millions lack access to affordable healthcare. Sanveda bridges the gap by funding verified medical campaigns, hospital support, and therapeutic interventions for patients who cannot afford essential care.',
    overviewBullets: [
      'Critical care and emergency treatment',
      'Therapy and rehabilitation support',
      'Medical camps in underserved areas',
      'Mental health and counselling',
      'Medicine and equipment assistance',
    ],
    overviewImage: '/assets/focus-areas/healthcare.jpg',
    programs: [
      { icon: '🏥', title: 'Medical Treatment', description: 'Funding surgeries, hospital stays, and specialist consultations for critical patients.' },
      { icon: '🩺', title: 'Therapy Support', description: 'Physiotherapy, occupational therapy, and long-term recovery programs.' },
      { icon: '♿', title: 'Rehabilitation', description: 'Mobility aids, post-treatment care, and family counselling.' },
      { icon: '🧠', title: 'Mental Health', description: 'Counselling and emotional support for patients and caregivers.' },
    ],
    impactStats: [],
    galleryTitle: 'Healthcare Gallery',
    gallery: SHARED_GALLERY,
    stories: [],
    partners: [],
    donationLadder: [],
    ctaTitle: 'Help Us Save Lives',
    ctaDescription: 'Your contribution directly supports patients and families in need of urgent medical care.',
    emptyCampaignMessage: 'No active healthcare campaigns currently.',
    emptyCampaignCta: 'Support our general healthcare fund',
  },
  'sports-development-athlete-empowerment': {
    heroTagline: 'Empowering grassroots athletes with training, equipment, and opportunities to compete at the highest level.',
    heroStats: [],
    overviewTitle: 'Why Sports Development Matters',
    overviewBody:
      'Talent should never be limited by financial barriers. Sanveda funds coaching, equipment, travel, and competition fees so athletes from underserved backgrounds can pursue their dreams with dignity.',
    overviewBullets: [
      'Training and coaching scholarships',
      'Sports equipment and gear',
      'Competition and travel support',
      'Grassroots academy partnerships',
      'Nutrition and fitness programs',
    ],
    overviewImage: '/assets/focus-areas/sports.jpg',
    programs: [
      { icon: '🏃', title: 'Athlete Training', description: 'Professional coaching and structured training plans for emerging talent.' },
      { icon: '🏆', title: 'Competition Support', description: 'Entry fees, travel, and kit support for national-level events.' },
      { icon: '⚽', title: 'Equipment & Gear', description: 'Quality sports equipment for individuals and community academies.' },
      { icon: '🤝', title: 'Academy Partnerships', description: 'Collaborations with coaches and institutions building future champions.' },
    ],
    impactStats: [],
    galleryTitle: 'Sports Gallery',
    gallery: SHARED_GALLERY,
    stories: [],
    partners: [],
    donationLadder: [],
    ctaTitle: 'Fuel The Next Champion',
    ctaDescription: 'Invest in athletes who represent hope, discipline, and the spirit of India.',
    emptyCampaignMessage: 'No active sports campaigns currently.',
    emptyCampaignCta: 'Support athlete empowerment',
  },
  'education-skill-development': {
    heroTagline: 'Opening doors through scholarships, schooling, digital access, and skill-building for a brighter future.',
    heroStats: [],
    overviewTitle: 'Why Education Matters',
    overviewBody:
      'Education is the foundation of lasting change. Sanveda funds school fees, learning materials, digital tools, and vocational training so young people can build independent, dignified futures.',
    overviewBullets: [
      'School and college fee support',
      'Scholarships for meritorious students',
      'Digital learning access',
      'Vocational and skill training',
      'Exam and coaching assistance',
    ],
    overviewImage: '/assets/focus-areas/education.jpg',
    programs: [
      { icon: '📚', title: 'Schooling Support', description: 'Fees, uniforms, books, and transport for students in need.' },
      { icon: '🎓', title: 'Scholarships', description: 'Merit and need-based scholarships for higher education.' },
      { icon: '💻', title: 'Digital Learning', description: 'Devices, connectivity, and e-learning resources.' },
      { icon: '🛠️', title: 'Skill Development', description: 'Vocational training and employability programs.' },
    ],
    impactStats: [],
    galleryTitle: 'Education Gallery',
    gallery: SHARED_GALLERY,
    stories: [],
    partners: [],
    donationLadder: [],
    ctaTitle: 'Invest In A Child\'s Future',
    ctaDescription: 'Every rupee helps a student stay in school and build a life of opportunity.',
    emptyCampaignMessage: 'No active education campaigns currently.',
    emptyCampaignCta: 'Support education programs',
  },
  'community-social-upliftment': {
    heroTagline: 'Restoring dignity through food security, shelter, disaster relief, and community rebuilding.',
    heroStats: [],
    overviewTitle: 'Why Community Upliftment Matters',
    overviewBody:
      'From hunger relief and women\'s empowerment to disaster response, Sanveda addresses hardship at the neighbourhood level — restoring safety, stability, and hope where it is needed most.',
    overviewBullets: [
      'Food and nutrition security',
      'Shelter and emergency relief',
      'Disaster response operations',
      'Women and child protection',
      'Livelihood and dignity programs',
    ],
    overviewImage: '/assets/focus-areas/community.jpg',
    programs: [
      { icon: '🍲', title: 'Hunger Relief', description: 'Community kitchens, ration kits, and nutrition for vulnerable families.' },
      { icon: '🏠', title: 'Shelter Support', description: 'Emergency housing and rebuilding after disasters.' },
      { icon: '🌊', title: 'Disaster Response', description: 'Rapid relief for flood, fire, and crisis-affected communities.' },
      { icon: '👩', title: 'Women Empowerment', description: 'Skills, safety, and livelihood programs for women.' },
    ],
    impactStats: [],
    galleryTitle: 'Community Gallery',
    gallery: SHARED_GALLERY,
    stories: [],
    partners: [],
    donationLadder: [],
    ctaTitle: 'Stand With Communities In Need',
    ctaDescription: 'Your gift brings food, shelter, and hope to families facing crisis.',
    emptyCampaignMessage: 'No active community campaigns currently.',
    emptyCampaignCta: 'Support community relief',
  },
  'ethical-events-brand-partnerships': {
    heroTagline: 'Purpose-driven collaborations and fundraising events built on transparency and measurable impact.',
    heroStats: [],
    overviewTitle: 'Why Ethical Partnerships Matter',
    overviewBody:
      'Sanveda works with brands, institutions, and event organisers to create fundraising experiences where every rupee is accountable. Partnerships amplify reach while keeping beneficiary welfare at the centre.',
    overviewBullets: [
      'Corporate CSR collaborations',
      'Ethical fundraising events',
      'Brand cause-marketing campaigns',
      'Transparent impact reporting',
      'Employee giving programs',
    ],
    overviewImage: '/assets/focus-areas/events.jpg',
    programs: [
      { icon: '🤝', title: 'Brand Partnerships', description: 'Co-branded campaigns with verified impact tracking.' },
      { icon: '🎪', title: 'Fundraising Events', description: 'Marathons, galas, and community drives with full transparency.' },
      { icon: '🏢', title: 'Corporate CSR', description: 'Structured giving programs aligned with UN SDG goals.' },
      { icon: '📊', title: 'Impact Reporting', description: 'Detailed reporting so partners see real outcomes.' },
    ],
    impactStats: [],
    galleryTitle: 'Events & Partnerships Gallery',
    gallery: SHARED_GALLERY,
    stories: [],
    partners: [],
    donationLadder: [],
    ctaTitle: 'Partner With Purpose',
    ctaDescription: 'Create ethical fundraising experiences that deliver real, measurable social impact.',
    emptyCampaignMessage: 'No active partnership campaigns currently.',
    emptyCampaignCta: 'Explore partnership opportunities',
  },
}

export function getFocusAreaContent(area: FocusArea): FocusAreaDetailContent {
  return FOCUS_AREA_CONTENT[area.slug] ?? FOCUS_AREA_CONTENT['healthcare-therapeutic-support']
}

export function resolveFocusImage(path: string, fallback: string = HERO_FALLBACK): string {
  return path || fallback
}
