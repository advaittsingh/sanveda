import { BRAND } from './brand'

export const RETURN_POLICY_CMS_ID = 73

export const RETURN_POLICY_PAGE = {
  label: 'Policy',
  breadcrumb: 'Return Policy',
  title: 'Return Policy',
  description: 'Our return and exchange guidelines for donations made through Sanveda.',
}

export const RETURN_POLICY_HTML = `
<p>${BRAND.name} deeply values every contribution that sustains our humanitarian mission. In the unlikely event that you need to cancel a donation or request a refund, we follow a clear and reliable policy so donors have a straightforward experience.</p>
<p>We process donations in line with the details provided in donor forms — both online and offline. If a donation was deducted in error, or you wish to cancel a contribution, ${BRAND.shortName} will respond within <strong>7 working days</strong> from the date we receive your written request.</p>
<p>Please note that the time taken to credit a refund may depend on your bank or payment provider. We will require proof of the deducted amount along with a written refund request within <strong>2 days</strong> of the original donation date.</p>
<p>If an 80G tax exemption certificate has already been issued for the donation, a refund will not be applicable. In all other eligible cases, the refunded amount may be subject to deduction of payment gateway processing charges as per the service provider's terms.</p>
<h3><strong>${BRAND.shortName.toUpperCase()} GLOBAL HUMANITARIAN FOUNDATION</strong></h3>
<p>${BRAND.address}</p>
<p>Email: <strong><a href="mailto:${BRAND.email}">${BRAND.email}</a></strong></p>
<p>Phone: <strong><a href="tel:${BRAND.phone.replace(/\s/g, '')}">${BRAND.phone}</a></strong></p>
<p>To raise a refund request, please contact us with your transaction ID, donation date, and registered email or phone number.</p>
`.trim()
