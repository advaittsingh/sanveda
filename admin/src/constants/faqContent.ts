import { BRAND } from './brand'

export type FaqTabKey = 'donors' | 'ngos' | 'medical'

export const FAQ_TABS: { label: string; key: FaqTabKey }[] = [
  { label: 'Donors', key: 'donors' },
  { label: 'NGOs', key: 'ngos' },
  { label: 'Medical Campaign', key: 'medical' },
]

export const FAQ_PAGE = {
  label: 'FAQ',
  bannerTitle: "FAQ's",
  description:
    'Clear answers about donating, partnering, and running campaigns with Sanveda Global Humanitarian Foundation.',
  eyebrow: 'Support',
  title: 'Questions We Hear',
  titleAccent: 'Most Often',
  sidebarDescription:
    'Whether you are donating, partnering as an NGO, or raising funds for medical care — find straightforward guidance on how Sanveda works.',
}

export interface FaqItem {
  id: number
  question: string
  html: string
}

export const SANVEDA_FAQS: Record<FaqTabKey, FaqItem[]> = {
  donors: [
    {
      id: 1,
      question: `What is ${BRAND.shortName} Global Humanitarian Foundation?`,
      html: `<p>${BRAND.name} is a purpose-driven non-profit working across healthcare, therapeutic support, sports development, education, and community upliftment. Through verified campaigns and structured programs, we connect compassionate donors with causes that create lasting humanitarian impact.</p>`,
    },
    {
      id: 2,
      question: `How can I donate to ${BRAND.shortName}?`,
      html: `<p>You can support any active campaign on our platform using UPI, card, or other listed payment methods. Choose a campaign that aligns with your values, select an amount, and complete the secure checkout. You will receive a confirmation once your contribution is processed.</p>`,
    },
    {
      id: 3,
      question: 'How do I claim tax benefits under Section 80G?',
      html: `<p>Eligible donations to ${BRAND.shortName} may qualify for tax deduction under Section 80G of the Income Tax Act. After your donation is confirmed, you can download your 80G certificate from your donor dashboard or request it by emailing <strong>${BRAND.email}</strong> with your transaction details.</p>`,
    },
    {
      id: 4,
      question: 'Why do we collect a tip amount?',
      html: `<p>${BRAND.shortName} does not charge a mandatory platform fee on donations. The optional tip helps us maintain the platform, verify campaigns, support beneficiaries, and expand our humanitarian reach. You may choose any tip percentage — including zero — before completing your donation.</p>`,
    },
    {
      id: 5,
      question: `Why should I trust ${BRAND.shortName}?`,
      html: `<p>We are committed to transparency, verification, and accountable fund use. Campaigns are reviewed before going live, progress is tracked, and donors receive confirmation for every contribution. Our registration, 80G, and CSR documents are available on our <a href="/documents">Documents</a> page.</p>`,
    },
    {
      id: 6,
      question: 'Can I get a refund on my donation?',
      html: `<p>Donations are generally non-refundable once transferred to the beneficiary or campaign cause, as funds are allocated promptly to meet urgent needs. If you believe a transaction was made in error, contact us at <strong>${BRAND.email}</strong> within 48 hours with your payment reference.</p>`,
    },
    {
      id: 7,
      question: `What makes ${BRAND.shortName} a better option for your donations?`,
      html: `<p>${BRAND.shortName} focuses on sustainable humanitarian impact — not just short-term relief. We work across multiple focus areas, verify campaigns rigorously, and operate with governance standards that ensure your support reaches those who need it most.</p>`,
    },
  ],
  ngos: [
    {
      id: 8,
      question: 'When will support reach our organization?',
      html: `<p>Fund or product disbursement timelines depend on campaign goals and verification steps. Once a campaign meets its target and required documentation is complete, our team coordinates transfer or delivery according to the agreed campaign plan.</p>`,
    },
    {
      id: 9,
      question: `How long can my campaign run on ${BRAND.shortName}?`,
      html: `<p>Campaign duration is flexible and tailored to your cause. Most campaigns run between 30 and 90 days, but timelines can be extended for ongoing community programs. Our team will help you set a realistic deadline based on your needs.</p>`,
    },
    {
      id: 10,
      question: `Why do donors choose ${BRAND.shortName} over other platforms?`,
      html: `<p>Donors trust ${BRAND.shortName} because we verify every campaign, communicate impact clearly, and operate with full transparency. Our focus on healthcare, education, sports development, and community welfare attracts supporters who want their giving to create measurable change.</p>`,
    },
    {
      id: 11,
      question: 'What types of campaigns can be raised?',
      html: `<p>Organizations can raise support for essential supplies, community programs, educational initiatives, healthcare interventions, sports development, and other humanitarian needs aligned with ${BRAND.shortName}'s mission. Each proposal is reviewed for authenticity and impact potential.</p>`,
    },
    {
      id: 12,
      question: `How can I start a campaign with ${BRAND.shortName}?`,
      html: `<p>Reach out through our <a href="/contact-us">Contact</a> page or email <strong>${BRAND.email}</strong> with your organization details, proposed cause, and supporting documents. Our team will guide you through verification and campaign setup.</p>`,
    },
    {
      id: 13,
      question: 'How do donors provide support to our organization?',
      html: `<p>Donors contribute through your campaign page on the ${BRAND.shortName} platform. Depending on the campaign type, support may be financial or in the form of essential products. You will be notified as contributions are received.</p>`,
    },
    {
      id: 14,
      question: `Will ${BRAND.shortName} assist us with running the campaign?`,
      html: `<p>Yes. Our team provides guidance on storytelling, documentation, updates, and donor communication throughout your campaign. We are invested in helping partner organizations reach their goals responsibly.</p>`,
    },
  ],
  medical: [
    {
      id: 15,
      question: `How can I start a medical campaign on ${BRAND.shortName}?`,
      html: `<p>Contact our team at <strong>${BRAND.email}</strong> or call <strong>${BRAND.phone}</strong> with the patient's details, treating hospital information, and estimated treatment costs. We will review your case and guide you through the verification and campaign launch process.</p>`,
    },
    {
      id: 16,
      question: 'What medical treatments or expenses can I raise support for?',
      html: `<p>Medical campaigns can cover surgeries, hospital bills, medicines, diagnostic tests, post-operative care, and other treatment-related expenses. Each request is reviewed to ensure it meets our verification standards.</p>`,
    },
    {
      id: 17,
      question: 'How will donors know that my medical case is genuine?',
      html: `<p>Every medical campaign goes through a verification process. Our team reviews hospital records, prescriptions, cost estimates, and identity documents before the campaign is published. Verified details are shared transparently on the campaign page.</p>`,
    },
    {
      id: 18,
      question: 'How will I know when someone supports my medical campaign?',
      html: `<p>You will receive notifications when new contributions are made. Your campaign dashboard shows running totals, donor activity, and milestones so you can track progress and share updates with supporters.</p>`,
    },
    {
      id: 19,
      question: 'What documents do I need to start my medical campaign?',
      html: `<p>Typically we require the patient's identity proof, doctor's prescription or medical report, hospital cost estimate, and contact details of the treating facility. Additional documents may be requested depending on the case.</p>`,
    },
    {
      id: 20,
      question: 'How long can my medical campaign remain active?',
      html: `<p>Medical campaigns usually remain active until the fundraising target is met or the treatment timeline requires closure. Urgent cases may receive priority visibility. Our team works with you to set an appropriate campaign duration.</p>`,
    },
  ],
}
