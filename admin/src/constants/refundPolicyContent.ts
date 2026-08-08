import { BRAND } from './brand'

export const REFUND_POLICY_CMS_ID = 72

export const REFUND_POLICY_PAGE = {
  label: 'Policy',
  breadcrumb: 'Refund & Cancellation',
  title: 'Refund & Cancellation Policy',
  description: 'Understanding our refund process for donations, sponsorships, and transactions on Sanveda.',
}

export interface PolicySection {
  id: string
  title: string
  html: string
}

export function slugifyPolicyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export const REFUND_POLICY_SECTIONS: PolicySection[] = [
  {
    id: slugifyPolicyTitle('Refunds'),
    title: 'Refunds',
    html: `<p>At <strong>${BRAND.name}</strong>, we are committed to maintaining transparency, fairness, and trust in every transaction made through our website and fundraising platform.</p>`,
  },
  {
    id: slugifyPolicyTitle('Refunds for Products and Fundraising Merchandise'),
    title: 'Refunds for Products and Fundraising Merchandise',
    html: `<p>We make every effort to accurately represent the <strong>size, quality, delivery method, description, images, and pricing</strong> of any products or fundraising merchandise offered through ${BRAND.shortName} in support of humanitarian causes.</p>
<p>If you experience any issue related to a product received — including concerns about quality, incorrect delivery, or discrepancies in the description — please contact us. All refund and replacement requests will be carefully reviewed on a <strong>case-by-case basis</strong>.</p>`,
  },
  {
    id: slugifyPolicyTitle('Refunds for Donations and Sponsorships'),
    title: 'Refunds for Donations and Sponsorships',
    html: `<p>We strive to ensure that all donations, sponsorships, and recurring contributions are collected securely and accurately through our authorized third-party payment gateways.</p>
<p>If you face any issue related to:</p>
<ul>
  <li>incorrect donation amount</li>
  <li>duplicate transaction</li>
  <li>technical payment error</li>
  <li>failed acknowledgment or confirmation</li>
  <li>recurring sponsorship concerns</li>
  <li>accidental donation</li>
  <li>change of mind before fund allocation</li>
</ul>
<p>Please reach out through our <strong><a href="/contact-us">Contact Page</a></strong> or email <strong><a href="mailto:${BRAND.email}">${BRAND.email}</a></strong> with your transaction details.</p>
<p>We take all donor concerns seriously. Refund requests for donations or sponsorships will be evaluated <strong>fairly on a case-by-case basis</strong>, depending on the nature of the request and the stage of fund allocation. If an 80G certificate has already been issued, refunds may not be applicable.</p>
<p><strong>${BRAND.shortName.toUpperCase()} GLOBAL HUMANITARIAN FOUNDATION</strong><br>${BRAND.address}<br>Phone: <a href="tel:${BRAND.phone.replace(/\s/g, '')}">${BRAND.phone}</a></p>`,
  },
]
