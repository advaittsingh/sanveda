import { ASSETS } from './assets'

export const MEMBERSHIP_PAGE = {
  breadcrumb: 'Membership',
  title: 'Become a Sanveda Member',
  subtitle:
    'Join a community committed to humanitarian impact across healthcare, education, sports, and community upliftment.',
  eyebrow: 'Join Our Community',
}

export const MEMBERSHIP_HERO_IMAGES = [
  ASSETS.ourImpact,
  // aboutPeople is a 24px icon — use a real photo so the collage slot is not blank white
  ASSETS.startCampaign,
  ASSETS.heroBanner,
] as const

export const MEMBERSHIP_TIERS = [
  {
    id: 'standard' as const,
    name: 'Standard Member',
    price: 'Free',
    priceNote: 'No annual fee',
    recommended: false,
    benefits: [
      { text: 'Newsletter updates', icon: 'mail' },
      { text: 'Event invitations', icon: 'calendar' },
      { text: 'Volunteer priority', icon: 'users' },
      { text: 'Access to community forums', icon: 'message' },
    ],
  },
  {
    id: 'patron' as const,
    name: 'Patron Member',
    price: '₹5,000',
    priceNote: 'per year',
    recommended: true,
    benefits: [
      { text: 'All Standard benefits', icon: 'check' },
      { text: 'Annual impact report', icon: 'file' },
      { text: 'Recognition on website', icon: 'globe' },
      { text: 'Priority event access', icon: 'star' },
    ],
  },
  {
    id: 'founding' as const,
    name: 'Founding Member',
    price: '₹25,000',
    priceNote: 'per year',
    recommended: false,
    benefits: [
      { text: 'All Patron benefits', icon: 'check' },
      { text: 'Founding certificate', icon: 'award' },
      { text: 'Advisory roundtables', icon: 'users' },
      { text: 'Exclusive networking events', icon: 'handshake' },
    ],
  },
] as const

export const MEMBERSHIP_WHY_ITEMS = [
  {
    title: 'Measurable Social Impact',
    description: 'Support verified campaigns and programs that create lasting change in underserved communities.',
    icon: 'impact',
  },
  {
    title: 'Connect With Changemakers',
    description: 'Join a network of professionals, donors, and volunteers united by humanitarian purpose.',
    icon: 'people',
  },
  {
    title: 'Exclusive Events',
    description: 'Get early access to Sanveda galas, fundraisers, and community gatherings.',
    icon: 'calendar',
  },
  {
    title: 'Annual Impact Reports',
    description: 'Receive transparent updates on how your membership contributions drive real outcomes.',
    icon: 'report',
  },
  {
    title: 'Governance Participation',
    description: 'Contribute to advisory initiatives and help shape Sanveda\'s humanitarian priorities.',
    icon: 'shield',
  },
] as const

export const MEMBERSHIP_PROCESS_STEPS = [
  'Apply',
  'Application Review',
  'Verification',
  'Approval',
  'Membership Activated',
] as const

export const MEMBERSHIP_FAQS = [
  {
    id: 1,
    question: 'Who can apply for Sanveda membership?',
    html: '<p>Anyone aged 18 or above who shares Sanveda\'s humanitarian values can apply. We welcome individuals, professionals, and philanthropists from India and abroad who wish to support our mission across healthcare, education, sports, and community upliftment.</p>',
  },
  {
    id: 2,
    question: 'How long does the approval process take?',
    html: '<p>Most applications are reviewed within 5–7 business days. You will receive an email update at each stage — application review, verification, and final approval. You can also track your status anytime using your application ID.</p>',
  },
  {
    id: 3,
    question: 'Can I upgrade my membership tier later?',
    html: '<p>Yes. You can upgrade from Standard to Patron or Founding membership at any time by submitting an upgrade request through your member dashboard or by contacting our team. Upgrades take effect upon payment confirmation.</p>',
  },
  {
    id: 4,
    question: 'Is the membership fee refundable?',
    html: '<p>Membership fees for Patron and Founding tiers are non-refundable once membership is activated. If your application is not approved, any fee paid will be refunded in full within 7–10 business days.</p>',
  },
  {
    id: 5,
    question: 'Will I receive a membership certificate?',
    html: '<p>Yes. All approved members receive a digital membership confirmation. Patron and Founding members also receive a formal certificate. Founding Members receive a special founding member certificate suitable for display.</p>',
  },
] as const
