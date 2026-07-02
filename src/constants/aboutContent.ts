export const ABOUT_HERO = {
  label: 'About',
  title: 'Empowering Communities Through Sustainable Humanitarian Impact',
  intro:
    'Sanveda Global Humanitarian Foundation is a purpose-driven, non-profit organization committed to advancing humanitarian impact through structured initiatives across healthcare, therapeutic support, sports development, education, community upliftment, and social responsibility. Sanveda operates at the intersection of humanitarian service, ethical innovation, and community empowerment, creating sustainable impact rather than short-term relief.',
}

export interface AboutFounder {
  name: string
  role: string
  organization: string
  image: string
}

export const ABOUT_FOUNDERS: AboutFounder[] = [
  {
    name: 'Hamdan Pathan',
    role: 'Founder & Visionary',
    organization: 'SGH Foundation',
    image: '/assets/founder-hamdan.png',
  },
  {
    name: 'Nayma Hussain Jivani',
    role: 'Senior Director and Co founder',
    organization: 'SGH Foundation',
    image: '/assets/founder-nayma.png',
  },
]

export const ABOUT_FOUNDERS_INTRO = {
  organization: 'Sanveda Global Humanitarian Foundation',
  tagline: 'Empowering Communities Through Sustainable Humanitarian Impact',
  description: ABOUT_HERO.intro,
}

export const ABOUT_WHO_WE_ARE = {
  title: 'A Purpose-Driven Humanitarian Institution',
  description:
    'Sanveda Global Humanitarian Foundation is dedicated to creating meaningful, measurable, and sustainable change across communities. We work through structured programs in healthcare, education, sports development, therapeutic support, and social welfare—always guided by dignity, transparency, and long-term impact.',
  secondDescription:
    'Our approach goes beyond short-term relief. We build ethical partnerships, empower communities to participate in their own development, and operate with governance standards that ensure every initiative delivers lasting value.',
}

export const ABOUT_VISION_SECTION = {
  title: 'Building A Globally Respected Humanitarian Institution',
  description:
    'To build a globally respected humanitarian institution that empowers individuals, communities, and future generations through ethical support systems, inclusive development, and long-term social impact.',
  secondDescription:
    'We envision a world where humanitarian work strengthens dignity, capability, and opportunity—creating self-sustaining models of care, education, and community upliftment that endure for generations.',
  point1: '50+',
  point1Label: 'Communities Served',
  point2: '10+',
  point2Label: 'Active Programs',
}

export const ABOUT_MISSION_SECTION = {
  title: 'Advancing Humanitarian Impact With Structure And Integrity',
  description:
    'Sanveda exists to heal, empower, and elevate. We believe humanitarian work is not an act of charity, but a responsibility—delivered through structured programs, ethical partnerships, and measurable outcomes.',
  secondDescription:
    'Our mission spans healthcare and therapeutic support, sports development for underrepresented talent, education and mentorship, and community-driven platforms that create sustainable social impact with full transparency and accountability.',
}

export const ABOUT_STRENGTH_SECTION = {
  title: 'What Sets Sanveda Apart',
  items: [
    {
      title: 'Long-Term Impact',
      description: 'We prioritize sustainable humanitarian models over short-term charity, building programs that create lasting change.',
    },
    {
      title: 'Ethical Partnerships',
      description: 'Every collaboration aligns with our values—transparent, accountable, and focused on measurable community outcomes.',
    },
    {
      title: 'Structured Programs',
      description: 'From healthcare to education and sports, our initiatives follow clear frameworks for delivery, oversight, and reporting.',
    },
    {
      title: 'Community Empowerment',
      description: 'We engage communities as active participants, fostering ownership and participation at every stage of our work.',
    },
  ],
}

export const ABOUT_PAGE_IMAGES = {
  hero: ['/assets/hero-banner.jpg', '/assets/OurImpact-e70006e2.png', '/assets/hero-banner.jpg'],
  whoWeAre: ['/assets/OurImpact-e70006e2.png', '/assets/hero-banner.jpg', '/assets/OurImpact-e70006e2.png'],
  vision: ['/assets/hero-banner.jpg', '/assets/OurImpact-e70006e2.png'],
  mission: '/assets/OurImpact-e70006e2.png',
}

export const ABOUT_FOUNDER = {
  name: 'Hamdan Pathan',
  role: 'Founder & Visionary',
}

export const ABOUT_VISION =
  'To build a globally respected humanitarian institution that empowers individuals, communities, and future generations through ethical support systems, inclusive development, and long-term social impact.'

export const ABOUT_PHILOSOPHY =
  'Sanveda believes that true humanitarian work must empower dignity, capability, and opportunity.'

export const ABOUT_FOCUS_POINTS = [
  'Self-sustaining humanitarian models',
  'Strategic collaborations',
  'Long-term program continuity',
  'Community ownership and participation',
]

export const ABOUT_MANIFESTO = [
  'Sanveda exists to heal, empower, and elevate.',
  'We believe humanitarian work is not an act of charity, but a responsibility.',
  'Through integrity, structure, and compassion, we aim to create impact that lasts generations.',
]

export const ABOUT_MISSION = [
  'To provide structured humanitarian support across health, sports, education, and social welfare',
  'To enable access to Cannabis Ayurvedic therapeutics and wellness-based care through ethical and compliant frameworks',
  'To nurture talent in underrepresented and non-mainstream sports',
  'To create community-driven platforms that deliver measurable and sustainable outcomes',
  'To operate with transparency, integrity, and global standards of governance',
]

export const ABOUT_APPROACH = [
  { emphasis: 'Long-term impact', contrast: 'short-term charity' },
  { emphasis: 'Ethical partnerships', contrast: 'transactional associations' },
  { emphasis: 'Structured programs', contrast: 'unorganized aid' },
  { emphasis: 'Measurable outcomes', contrast: 'symbolic gestures' },
]

export const ABOUT_STATS = [
  { value: '0K', label: 'Received Donations From Our Loving People' },
  { value: '0K', label: 'Received Support From Local Community' },
  { value: '0+', label: 'Working Projects' },
  { value: '0+', label: 'Supporting Members' },
]

export const ABOUT_ACTIONS = [
  {
    title: 'Get Inspire And Help',
    description: 'Explore our work creating sustainable impact across communities and lives.',
    cta: 'Read More',
    path: '/campaigns',
  },
  {
    title: 'Send Us Donations',
    description: 'Send us donations to support sustainable change and uplift communities in need.',
    cta: 'Donate Us',
    path: '/campaigns',
  },
  {
    title: 'Become A Volunteer',
    description: 'Become a volunteer and help create lasting impact in communities.',
    cta: 'Register',
    path: '/contact',
  },
]

export interface PartnerValueItem {
  title: string
  description: string
  icon: 'handshake' | 'community' | 'award' | 'chart' | 'growth' | 'compliance' | 'shield' | 'oversight' | 'communication' | 'transparency'
}

export const ABOUT_PARTNERS_INTRO = {
  label: 'Value to Partners',
  title: 'Why Partners Choose Sanveda',
  description:
    "We believe strong partnerships create lasting change. Here's the value our partners and supporters receive when they join hands with us.",
}

export const ABOUT_PARTNER_VALUES: PartnerValueItem[] = [
  {
    title: 'Authentic Humanitarian Branding',
    description: 'Align with a purpose-driven organization creating real impact.',
    icon: 'handshake',
  },
  {
    title: 'Local & Community-Level Reach',
    description: 'Deep, grassroots connections that ensure wider community impact.',
    icon: 'community',
  },
  {
    title: 'Long-term Goodwill & Credibility',
    description: 'Build trust and credibility with communities and stakeholders.',
    icon: 'award',
  },
  {
    title: 'Transparent Impact Reporting',
    description: 'Regular updates, real stories, and clear impact measurement.',
    icon: 'chart',
  },
  {
    title: 'Sustainable Return on Association',
    description: 'Partner with initiatives that deliver measurable, sustainable outcomes.',
    icon: 'growth',
  },
  {
    title: 'Ethical Compliance Across All Initiatives',
    description: 'All programs follow strict ethical standards and compliance.',
    icon: 'compliance',
  },
  {
    title: 'Zero Tolerance for Misuse',
    description: 'We ensure complete integrity with zero tolerance for misuse of funds.',
    icon: 'shield',
  },
  {
    title: 'Independent Oversight & Accountability',
    description: 'Governance model with independent checks and accountability.',
    icon: 'oversight',
  },
  {
    title: 'Responsible Representation & Communication',
    description: 'Transparent communication and responsible partnership representation.',
    icon: 'communication',
  },
  {
    title: 'Full Transparency in Operations & Reporting',
    description: 'Open books, clear processes, and honest reporting at every step.',
    icon: 'transparency',
  },
]

export const ABOUT_PARTNERSHIP_NOTE =
  "All Partnerships Are Aligned With Sanveda's Humanitarian Values And Governance Standards."

export const ABOUT_GOVERNANCE =
  'Sanveda Global Humanitarian Foundation operates under a strict governance framework to ensure fairness, transparency, and long-term impact.'

export const ABOUT_CLOSING =
  'Sanveda Global Humanitarian Foundation is a purpose-driven non-profit organization dedicated to creating meaningful and sustainable humanitarian impact.'

export const ABOUT_TESTIMONIALS = [
  {
    name: 'Rajesh Kumar',
    role: 'Community Volunteer',
    quote:
      'Sanveda Global Humanitarian Foundation is truly making a meaningful difference at the grassroots level. Their structured approach and commitment to long-term impact set them apart from many organizations. It’s inspiring to see real change happening in communities.',
  },
  {
    name: 'Anjali Verma',
    role: 'Education Program Beneficiary',
    quote:
      'Through Sanveda’s educational and mentorship initiatives, I gained confidence and direction in my career. Their support goes beyond basic help—they genuinely focus on empowering individuals for a better future.',
  },
  {
    name: 'Imran Shaikh',
    role: 'Sports Program Beneficiary',
    quote:
      'Sanveda gave me the opportunity and support to pursue my passion in sports. From training resources to guidance, their commitment to nurturing talent in non-mainstream sports is truly commendable.',
  },
]
