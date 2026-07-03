import { ASSETS } from './assets'

export const INTERNSHIP_PAGE = {
  breadcrumb: 'Internships',
  title: 'Internship Programme',
  subtitle: 'Gain real-world experience while creating social impact.',
  eyebrow: 'Launch Your Impact Career',
}

export const INTERNSHIP_HERO_HIGHLIGHTS = [
  { text: 'Remote & On-site Opportunities', icon: 'location' },
  { text: 'Open for Students & Graduates', icon: 'graduate' },
  { text: 'Certificate on Completion', icon: 'certificate' },
  { text: 'Mentorship & Live Projects', icon: 'mentorship' },
] as const

export const INTERNSHIP_HERO_IMAGES = [
  ASSETS.startCampaign,
  ASSETS.ourImpact,
  ASSETS.heroBanner,
] as const

export const INTERNSHIP_STATS = [
  { value: '500+', label: 'Interns Trained' },
  { value: '15+', label: 'Domains' },
  { value: 'Available', label: 'Placement Assistance' },
  { value: '1000+', label: 'Certificates Issued' },
  { value: '50+', label: 'Mentors' },
] as const

export const INTERNSHIP_ABOUT = {
  title: 'About Our Internship Programme',
  description:
    'Sanveda offers structured internships for students and young professionals passionate about social impact. Interns work alongside our teams in healthcare, education, sports, operations, and community development — gaining hands-on experience in real humanitarian programmes while building skills that matter.',
}

export const INTERNSHIP_DOMAINS = [
  {
    id: 'healthcare-programs',
    title: 'Healthcare Programs',
    duration: '2–6 Months',
    mode: 'Remote / Hybrid',
    icon: 'healthcare',
  },
  {
    id: 'education-outreach',
    title: 'Education & Outreach',
    duration: '1–3 Months',
    mode: 'Remote',
    icon: 'education',
  },
  {
    id: 'social-media-marketing',
    title: 'Social Media Marketing',
    duration: '2–4 Months',
    mode: 'Remote',
    icon: 'marketing',
  },
  {
    id: 'operations-management',
    title: 'Operations & Management',
    duration: '3–6 Months',
    mode: 'Hybrid',
    icon: 'operations',
  },
  {
    id: 'fundraising-partnerships',
    title: 'Fundraising & Partnerships',
    duration: '2–6 Months',
    mode: 'Remote',
    icon: 'fundraising',
  },
  {
    id: 'technology-development',
    title: 'Technology & Development',
    duration: '3–6 Months',
    mode: 'Remote',
    icon: 'technology',
  },
] as const

export const INTERNSHIP_BENEFITS = [
  { text: 'Certificate of Completion', icon: 'certificate' },
  { text: 'Letter of Recommendation', icon: 'recommendation' },
  { text: 'Real NGO Experience', icon: 'experience' },
  { text: 'Mentorship Sessions', icon: 'mentorship' },
  { text: 'Networking Opportunities', icon: 'networking' },
  { text: 'Project Portfolio Building', icon: 'portfolio' },
  { text: 'Flexible Working Hours', icon: 'flexible' },
  { text: 'Social Impact Experience', icon: 'impact' },
] as const

export const INTERNSHIP_ELIGIBILITY = [
  'Undergraduate Students',
  'Postgraduate Students',
  'Recent Graduates',
  'Working Professionals',
  'Volunteers seeking experience',
] as const

export const INTERNSHIP_DURATIONS = [
  { program: 'Summer Internship', duration: '1–2 Months' },
  { program: 'Regular Internship', duration: '3–6 Months' },
  { program: 'Research Internship', duration: '6–12 Months' },
  { program: 'Volunteer Internship', duration: 'Flexible' },
] as const

export const INTERNSHIP_PROCESS_STEPS = [
  'Application',
  'Screening',
  'Interview',
  'Selection',
  'Onboarding',
  'Internship Begins',
] as const

export const INTERNSHIP_TESTIMONIALS = [
  {
    id: 1,
    quote:
      'My internship at Sanveda helped me develop leadership and project management skills. The mentorship I received was invaluable.',
    name: 'Priya Sharma',
    role: 'Education Intern',
  },
  {
    id: 2,
    quote:
      'Working with Sanveda gave me exposure to real-world humanitarian operations. I now have a portfolio of projects I am proud to share.',
    name: 'Arjun Singh',
    role: 'Operations Intern',
  },
  {
    id: 3,
    quote:
      'The flexible remote setup allowed me to balance my studies while contributing to meaningful social media campaigns for healthcare drives.',
    name: 'Neha Patel',
    role: 'Social Media Intern',
  },
] as const

export const INTERNSHIP_FAQS = [
  {
    id: 1,
    question: 'Is the internship paid?',
    html: '<p>Sanveda internships are primarily learning-focused and unpaid. However, outstanding performers may receive stipends or performance-based incentives depending on the department and project requirements.</p>',
  },
  {
    id: 2,
    question: 'Is the internship remote?',
    html: '<p>Many of our internship roles are fully remote. Some departments — such as healthcare programmes and operations — offer hybrid or on-site opportunities depending on project needs and your location.</p>',
  },
  {
    id: 3,
    question: 'Will I receive a certificate?',
    html: '<p>Yes. All interns who successfully complete their internship receive a verified Certificate of Completion from Sanveda Global Humanitarian Foundation. High performers may also receive a Letter of Recommendation.</p>',
  },
  {
    id: 4,
    question: 'What is the selection process?',
    html: '<p>After you submit your application, our team reviews your profile, conducts a screening call, and schedules an interview. Selected candidates go through onboarding before their internship officially begins. The entire process typically takes 1–2 weeks.</p>',
  },
  {
    id: 5,
    question: 'Can international students apply?',
    html: '<p>Yes. We welcome applications from students and graduates worldwide. Remote internships are especially suited for international applicants. Please ensure you can commit to the required hours in a compatible time zone.</p>',
  },
  {
    id: 6,
    question: 'Can I extend my internship?',
    html: '<p>Yes. Interns who perform well and wish to continue may request an extension subject to project availability and mentor approval. Extensions are evaluated on a case-by-case basis at the end of your initial term.</p>',
  },
] as const
