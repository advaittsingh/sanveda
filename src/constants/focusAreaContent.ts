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
    heroStats: [
      { value: 5000, suffix: '+', label: 'Lives Supported' },
      { value: 250, suffix: '+', label: 'Treatments Funded' },
      { value: 50, suffix: '+', label: 'Medical Camps' },
    ],
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
    impactStats: [
      { value: 5000, suffix: '+', label: 'Patients Supported' },
      { value: 2.5, prefix: '₹', suffix: 'Cr+', decimals: 1, label: 'Funds Raised' },
      { value: 250, suffix: '+', label: 'Medical Camps' },
      { value: 40, suffix: '+', label: 'Partner Hospitals' },
    ],
    galleryTitle: 'Healthcare Gallery',
    gallery: SHARED_GALLERY,
    stories: [
      { quote: 'After surgery support from Sanveda, I can finally walk again.', author: 'Priya, 14' },
      { quote: "The therapy sessions changed my son's life.", author: "Arjun's Mother" },
      { quote: 'We received medicines on time when we had nowhere else to turn.', author: 'Ramesh, caregiver' },
    ],
    partners: ['Apollo', 'Fortis', 'AIIMS', 'Local NGO Partners', 'Community Clinics'],
    donationLadder: [
      { amount: '₹500', description: 'Medical supplies for one patient' },
      { amount: '₹2,000', description: 'Doctor consultation support' },
      { amount: '₹10,000', description: 'Therapy sessions for a month' },
      { amount: '₹50,000', description: 'Critical treatment funding' },
    ],
    ctaTitle: 'Help Us Save Lives',
    ctaDescription: 'Your contribution directly supports patients and families in need of urgent medical care.',
    emptyCampaignMessage: 'No active healthcare campaigns currently.',
    emptyCampaignCta: 'Support our general healthcare fund',
  },
  'sports-development-athlete-empowerment': {
    heroTagline: 'Empowering grassroots athletes with training, equipment, and opportunities to compete at the highest level.',
    heroStats: [
      { value: 1200, suffix: '+', label: 'Athletes Supported' },
      { value: 85, suffix: '+', label: 'Training Programs' },
      { value: 30, suffix: '+', label: 'Sports Academies' },
    ],
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
    impactStats: [
      { value: 1200, suffix: '+', label: 'Athletes Supported' },
      { value: 1.2, prefix: '₹', suffix: 'Cr+', decimals: 1, label: 'Funds Raised' },
      { value: 85, suffix: '+', label: 'Programs Funded' },
      { value: 30, suffix: '+', label: 'Partner Academies' },
    ],
    galleryTitle: 'Sports Gallery',
    gallery: SHARED_GALLERY,
    stories: [
      { quote: 'Sanveda helped me reach the national trials I had only dreamed of.', author: 'Kavita, sprinter' },
      { quote: 'My coaching fees were covered when our family could not afford them.', author: 'Rahul, 17' },
    ],
    partners: ['State Sports Associations', 'Grassroots Academies', 'Community Coaches', 'CSR Sports Partners'],
    donationLadder: [
      { amount: '₹500', description: 'Training kit for one athlete' },
      { amount: '₹2,000', description: 'One month of coaching' },
      { amount: '₹10,000', description: 'Competition travel support' },
      { amount: '₹50,000', description: 'Full season athlete sponsorship' },
    ],
    ctaTitle: 'Fuel The Next Champion',
    ctaDescription: 'Invest in athletes who represent hope, discipline, and the spirit of India.',
    emptyCampaignMessage: 'No active sports campaigns currently.',
    emptyCampaignCta: 'Support athlete empowerment',
  },
  'education-skill-development': {
    heroTagline: 'Opening doors through scholarships, schooling, digital access, and skill-building for a brighter future.',
    heroStats: [
      { value: 8000, suffix: '+', label: 'Students Supported' },
      { value: 120, suffix: '+', label: 'Schools Reached' },
      { value: 45, suffix: '+', label: 'Skill Programs' },
    ],
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
    impactStats: [
      { value: 8000, suffix: '+', label: 'Students Supported' },
      { value: 1.8, prefix: '₹', suffix: 'Cr+', decimals: 1, label: 'Funds Raised' },
      { value: 120, suffix: '+', label: 'Institutions Reached' },
      { value: 45, suffix: '+', label: 'Skill Programs' },
    ],
    galleryTitle: 'Education Gallery',
    gallery: SHARED_GALLERY,
    stories: [
      { quote: 'The scholarship allowed me to continue my studies after we lost everything.', author: 'Aisha, NEET aspirant' },
      { quote: 'My daughter is back in school because of Sanveda donors.', author: 'Sunita, parent' },
    ],
    partners: ['Local Schools', 'Coaching Institutes', 'EdTech Partners', 'Community Learning Centres'],
    donationLadder: [
      { amount: '₹500', description: 'Books and supplies for one child' },
      { amount: '₹2,000', description: 'One month of school fees' },
      { amount: '₹10,000', description: 'Digital learning kit' },
      { amount: '₹50,000', description: 'Annual scholarship support' },
    ],
    ctaTitle: 'Invest In A Child\'s Future',
    ctaDescription: 'Every rupee helps a student stay in school and build a life of opportunity.',
    emptyCampaignMessage: 'No active education campaigns currently.',
    emptyCampaignCta: 'Support education programs',
  },
  'community-social-upliftment': {
    heroTagline: 'Restoring dignity through food security, shelter, disaster relief, and community rebuilding.',
    heroStats: [
      { value: 15000, suffix: '+', label: 'Families Helped' },
      { value: 200, suffix: '+', label: 'Relief Drives' },
      { value: 60, suffix: '+', label: 'Communities Served' },
    ],
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
    impactStats: [
      { value: 15000, suffix: '+', label: 'Families Helped' },
      { value: 3.2, prefix: '₹', suffix: 'Cr+', decimals: 1, label: 'Funds Raised' },
      { value: 200, suffix: '+', label: 'Relief Drives' },
      { value: 60, suffix: '+', label: 'Communities Served' },
    ],
    galleryTitle: 'Community Gallery',
    gallery: SHARED_GALLERY,
    stories: [
      { quote: 'After the floods, Sanveda was the first to reach our village with food and supplies.', author: 'Village elder, Assam' },
      { quote: 'The livelihood program helped me support my children again.', author: 'Meena, single mother' },
    ],
    partners: ['Local NGOs', 'Relief Networks', 'Women\'s Cooperatives', 'Faith-Based Partners'],
    donationLadder: [
      { amount: '₹500', description: 'Meals for a family of four' },
      { amount: '₹2,000', description: 'Emergency ration kit' },
      { amount: '₹10,000', description: 'Shelter materials' },
      { amount: '₹50,000', description: 'Community relief drive' },
    ],
    ctaTitle: 'Stand With Communities In Need',
    ctaDescription: 'Your gift brings food, shelter, and hope to families facing crisis.',
    emptyCampaignMessage: 'No active community campaigns currently.',
    emptyCampaignCta: 'Support community relief',
  },
  'ethical-events-brand-partnerships': {
    heroTagline: 'Purpose-driven collaborations and fundraising events built on transparency and measurable impact.',
    heroStats: [
      { value: 75, suffix: '+', label: 'Events Hosted' },
      { value: 40, suffix: '+', label: 'Brand Partners' },
      { value: 12, suffix: '+', label: 'Corporate CSR Programs' },
    ],
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
    impactStats: [
      { value: 75, suffix: '+', label: 'Events Hosted' },
      { value: 2.0, prefix: '₹', suffix: 'Cr+', decimals: 1, label: 'Partner Funds Raised' },
      { value: 40, suffix: '+', label: 'Brand Partners' },
      { value: 12, suffix: '+', label: 'CSR Programs' },
    ],
    galleryTitle: 'Events & Partnerships Gallery',
    gallery: SHARED_GALLERY,
    stories: [
      { quote: 'Our employees were proud to see exactly where their contributions went.', author: 'CSR Head, corporate partner' },
      { quote: 'The fundraising event exceeded our goal and helped 200 families.', author: 'Event organiser' },
    ],
    partners: ['Corporate CSR Teams', 'Event Agencies', 'Brand Partners', 'Institutional Donors'],
    donationLadder: [
      { amount: '₹5,000', description: 'Sponsor event materials' },
      { amount: '₹25,000', description: 'Fund a community drive' },
      { amount: '₹1,00,000', description: 'Co-branded campaign support' },
      { amount: '₹5,00,000', description: 'Annual partnership fund' },
    ],
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
