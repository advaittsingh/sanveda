import { BRAND } from './brand'
import { slugifyPolicyTitle, type PolicySection } from './refundPolicyContent'

export const TERMS_CMS_ID = 71

export const TERMS_PAGE = {
  label: 'Legal',
  breadcrumb: 'Terms & Conditions',
  title: 'Terms & Conditions',
  description:
    'Please read these terms and conditions carefully before using our services. By accessing our platform, you agree to be bound by these terms.',
}

export const TERMS_SECTIONS: PolicySection[] = [
  {
    id: slugifyPolicyTitle('General Terms and Conditions'),
    title: 'General Terms and Conditions',
    html: `<p>Please read these Terms and Conditions ("Terms") carefully before using <strong>https://sanveda.vercel.app</strong> (the "Website"), operated by <strong>${BRAND.name}</strong> ("we," "us," or "our").</p>
<p>By accessing or using our Website, services, campaigns, donation features, or any related content (collectively, the "Services"), you agree to be bound by these Terms and all applicable laws and regulations. If you do not agree with any part of these Terms, you should not access or use the Website.</p>
<p>These Terms apply to all visitors, donors, users, campaign organizers, partner organizations, and any other individuals who interact with our Services.</p>`,
  },
  {
    id: slugifyPolicyTitle('Purchases/Donations'),
    title: 'Purchases/Donations',
    html: `<p>If you choose to make a donation or payment through our Website, you may be required to provide certain information necessary to process your transaction, verify your identity, and fulfill your donation request.</p>
<p>For details on how we collect, use, and protect your information, please refer to our <strong><a href="/privacy-policy">Privacy Policy</a></strong>.</p>
<p>All donations are voluntary. You represent that you are authorized to use the payment method provided and that the information you submit is accurate and complete.</p>`,
  },
  {
    id: slugifyPolicyTitle('User Content'),
    title: 'User Content',
    html: `<p>Our Website may allow users to post, submit, share, or otherwise make available content including text, images, videos, feedback, testimonials, or other materials ("Content").</p>
<p>By submitting Content, you agree that it must be lawful, respectful, relevant to our humanitarian mission, and not harmful, offensive, misleading, or inappropriate for our audience.</p>
<p>We reserve the right to remove any Content that, in our sole discretion, does not align with the purpose, values, or standards of ${BRAND.shortName}, without prior notice. Users who repeatedly post offensive, abusive, misleading, or irrelevant content may be restricted or permanently banned from using our Services.</p>`,
  },
  {
    id: slugifyPolicyTitle('Links To Third-Party Websites'),
    title: 'Links To Third-Party Websites',
    html: `<p>Our Website may contain links to third-party websites, services, or payment platforms that are not owned or controlled by <strong>${BRAND.name}</strong>.</p>
<p>We do not assume responsibility for the content, policies, practices, or accuracy of information on any third-party website. Your interactions with such websites are solely at your own discretion and risk.</p>
<p>We shall not be held liable, directly or indirectly, for any loss, damage, or issues arising from your use of or reliance on third-party content, products, or services.</p>`,
  },
  {
    id: slugifyPolicyTitle('Changes To Terms'),
    title: 'Changes To Terms',
    html: `<p>We reserve the right to update, modify, or replace these Terms at any time at our sole discretion. Any changes will become effective immediately upon being posted on the Website.</p>
<p>Continued use of the Website after such updates constitutes your acceptance of the revised Terms. We encourage you to review this page periodically for any changes.</p>`,
  },
  {
    id: slugifyPolicyTitle('Donation Allocation'),
    title: 'Donation Allocation',
    html: `<p>By making a donation through ${BRAND.shortName}, you acknowledge and agree that the funds contributed may be allocated across multiple essential areas, including campaign support, beneficiary aid, healthcare and community programs, operational requirements, platform maintenance, verification processes, and promotional activities required to increase campaign reach and humanitarian impact.</p>
<p>We are committed to using donations responsibly and in alignment with the stated purpose of each campaign, subject to applicable legal and operational requirements.</p>
<p>For questions regarding these Terms, contact us at <strong><a href="mailto:${BRAND.email}">${BRAND.email}</a></strong> or <strong><a href="tel:${BRAND.phone.replace(/\s/g, '')}">${BRAND.phone}</a></strong>.</p>`,
  },
]
