import { BRAND } from './brand'
import { slugifyPolicyTitle, type PolicySection } from './refundPolicyContent'

export const PRIVACY_CMS_ID = 70

export const PRIVACY_PAGE = {
  label: 'Legal',
  breadcrumb: 'Privacy Policy',
  title: 'Privacy Policy',
  description: 'How we protect your information when you use Sanveda.',
}

export const PRIVACY_INTRO_HTML = `
<p>At <strong>${BRAND.name}</strong>, we value your trust and are committed to protecting your privacy. This Privacy Policy explains how we collect, use, safeguard, and maintain your Personal Information when you interact with our website, services, campaigns, and related platforms.</p>
<p>It also outlines your rights and choices regarding your data, including how you can review or update your information. This Policy applies solely to our Website and Services and does not cover the privacy practices of third-party websites or services linked from our platform.</p>
`.trim()

export const PRIVACY_SECTIONS: PolicySection[] = [
  {
    id: slugifyPolicyTitle('Automated Collection of Information'),
    title: 'Automated Collection of Information',
    html: `<p>When you visit our Website, certain technical information is automatically collected by our servers and analytics systems through your browser or device. This helps us maintain the security, performance, and overall functionality of the Website.</p>
<p>The information we may automatically collect includes:</p>
<ul>
  <li>IP address of your device</li>
  <li>Browser type and version</li>
  <li>Device and operating system type</li>
  <li>Language and regional preferences</li>
  <li>Pages visited, time spent, and referral URLs</li>
  <li>Date and time of access</li>
</ul>
<p>This data is generally collected in aggregate form and is not used to personally identify you unless required for security or legal purposes.</p>`,
  },
  {
    id: slugifyPolicyTitle('Collections of Personal information'),
    title: 'Collections of Personal Information',
    html: `<p>You can visit and browse our Website without revealing your identity or providing personal details. However, to access certain features, make donations, or support campaigns, you may be required to share specific Personal Information with us.</p>
<p>The types of information we may collect include:</p>
<ul>
  <li>Personal details (such as your name and country of residence)</li>
  <li>Contact information (such as your email address and phone number)</li>
  <li>Payment and billing details processed through secure payment gateways</li>
  <li>Donation history and campaign preferences</li>
  <li>Communications you send to us</li>
</ul>`,
  },
  {
    id: slugifyPolicyTitle('Use and Processing of Information'),
    title: 'Use and Processing of Information',
    html: `<p>We collect and process Personal Information to:</p>
<ul>
  <li>Create and manage user accounts</li>
  <li>Process donations and fulfill campaign contributions</li>
  <li>Deliver services and humanitarian program updates</li>
  <li>Improve our services and Website</li>
  <li>Send administrative and transaction notifications</li>
  <li>Send marketing or promotional communications (with your consent)</li>
  <li>Respond to inquiries and support requests</li>
  <li>Enhance user experience and platform security</li>
  <li>Comply with legal and regulatory obligations</li>
</ul>`,
  },
  {
    id: slugifyPolicyTitle('Billing and Payments'),
    title: 'Billing and Payments',
    html: `<p>To ensure secure and reliable transactions, all payments and donations on our Website are handled by authorized third-party payment gateways. Any information shared during the payment process is subject to the privacy practices of the respective payment provider.</p>
<p>We encourage users and donors to review the payment provider's privacy policies before proceeding with a transaction. ${BRAND.shortName} does not store full payment card details on our servers.</p>`,
  },
  {
    id: slugifyPolicyTitle('Managing Information'),
    title: 'Managing Information',
    html: `<p>You may request to delete certain Personal Information. However, copies may be retained as necessary for legal, compliance, tax, or partner obligations.</p>
<p>To delete Personal Information or close an account, please contact us at <strong><a href="mailto:${BRAND.email}">${BRAND.email}</a></strong>.</p>`,
  },
  {
    id: slugifyPolicyTitle('Disclosure of Information'),
    title: 'Disclosure of Information',
    html: `<p>We may share Personal Information with:</p>
<ul>
  <li>Trusted third parties, affiliates, and subsidiaries to provide requested services</li>
  <li>Third-party service providers strictly for designated functions (not personal use)</li>
  <li>Legal authorities, if required by law or to protect rights, safety, or prevent fraud</li>
  <li>Business partners in case of merger, acquisition, or business transfer</li>
</ul>
<p>We do not sell your Personal Information to third parties.</p>`,
  },
  {
    id: slugifyPolicyTitle('Retention of Information'),
    title: 'Retention of Information',
    html: `<p>We retain Personal Information as long as necessary to comply with laws, resolve disputes, enforce agreements, and maintain donation records for transparency and accountability.</p>
<p>After the retention period, Personal Information will be deleted or anonymized. Aggregated, non-identifiable data may still be used for analytical purposes.</p>`,
  },
  {
    id: slugifyPolicyTitle('User Rights'),
    title: 'User Rights',
    html: `<p>You may exercise the following rights regarding your Personal Information:</p>
<ul>
  <li>Withdraw consent</li>
  <li>Object to processing</li>
  <li>Access your data</li>
  <li>Verify accuracy</li>
  <li>Correct or update information</li>
  <li>Restrict processing</li>
  <li>Receive information in a machine-readable format (data portability)</li>
</ul>
<p>Requests can be made by contacting us (see Section 18). We may require identity verification before processing your request.</p>`,
  },
  {
    id: slugifyPolicyTitle('Privacy of Children'),
    title: 'Privacy of Children',
    html: `<p>Protecting the privacy of children is extremely important to us. Our Website and Services are not intended for individuals under the age of 18, and we do not knowingly collect, use, or store Personal Information from children.</p>
<p>We encourage parents and legal guardians to actively supervise their children's online activities and help ensure that no Personal Information is shared through our Website without appropriate consent. If you believe a child has provided us with Personal Information, please contact us immediately.</p>`,
  },
  {
    id: slugifyPolicyTitle('Cookies'),
    title: 'Cookies',
    html: `<p>Our Website uses cookies to enhance your experience. Cookies may be used for:</p>
<ul>
  <li>Personalization and session management</li>
  <li>Analytics and statistics</li>
  <li>Remembering your preferences</li>
</ul>
<p>You may choose to accept or decline cookies through your browser settings. Declining cookies may limit certain features of the Website.</p>`,
  },
  {
    id: slugifyPolicyTitle('Do Not Track Signals'),
    title: 'Do Not Track Signals',
    html: `<p>Our Website currently does not interpret or respond to Do Not Track (DNT) browser signals.</p>`,
  },
  {
    id: slugifyPolicyTitle('Email Marketing'),
    title: 'Email Marketing',
    html: `<p>Users may voluntarily subscribe to newsletters and campaign updates from ${BRAND.shortName}. Email addresses are kept confidential and used only for communications you have opted into.</p>
<p>We comply with applicable email marketing regulations. You can unsubscribe from marketing emails at any time using the link provided in each message or by contacting us directly.</p>`,
  },
  {
    id: slugifyPolicyTitle('Links to Other Websites'),
    title: 'Links to Other Websites',
    html: `<p>Our Website may contain links to non-affiliated websites, including payment processors and partner organizations. We are not responsible for their privacy practices or content.</p>
<p>Please review the privacy policies of any third-party websites you visit separately.</p>`,
  },
  {
    id: slugifyPolicyTitle('Information Security'),
    title: 'Information Security',
    html: `<p>We take reasonable precautions to protect Personal Information by:</p>
<ul>
  <li>Hosting on secure servers</li>
  <li>Implementing administrative, technical, and physical safeguards</li>
  <li>Limiting access to Personal Information to authorized personnel</li>
</ul>
<p>However, no method of data transmission or storage over the internet is 100% secure. We cannot guarantee absolute security.</p>`,
  },
  {
    id: slugifyPolicyTitle('Data Breach'),
    title: 'Data Breach',
    html: `<p>If a security breach occurs that compromises Personal Information, we will investigate immediately and take appropriate remedial action.</p>
<p>Affected users will be notified if there is a risk of harm or as required by applicable law.</p>`,
  },
  {
    id: slugifyPolicyTitle('Changes and Amendments'),
    title: 'Changes and Amendments',
    html: `<p>We may update this Privacy Policy at any time. Material changes will be communicated through the Website or by other appropriate means.</p>
<p>Continued use of the Website after updates constitutes your acceptance of the revised Policy.</p>`,
  },
  {
    id: slugifyPolicyTitle('Acceptance of Policy'),
    title: 'Acceptance of Policy',
    html: `<p>By using the Website or Services, you acknowledge that you have read and agree to this Privacy Policy. If you do not agree, please discontinue use of our Website and Services.</p>`,
  },
  {
    id: slugifyPolicyTitle('Contacting Us'),
    title: 'Contacting Us',
    html: `<p>For questions about this Policy or your Personal Information rights, contact us at:</p>
<p><strong>${BRAND.name}</strong><br>${BRAND.address}<br>Email: <strong><a href="mailto:${BRAND.email}">${BRAND.email}</a></strong><br>Phone: <strong><a href="tel:${BRAND.phone.replace(/\s/g, '')}">${BRAND.phone}</a></strong></p>`,
  },
]
