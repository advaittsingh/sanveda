import { BRAND } from './brand'

export const CONTACT_PAGE = {
  breadcrumb: 'Contact Us',
  label: 'Contact Us',
  title: 'Your enquiry is valuable to us',
  subtitle:
    'Reach out to Sanveda Global Humanitarian Foundation for partnerships, volunteer opportunities, donations, or general inquiries. We are here to listen and support.',
  getInTouch: 'Get in touch',
  formTitle: 'Fill the details',
  newsletterTitle: 'Subscribe Our Newsletter',
  newsletterSubtitle: 'Join us in creating sustainable humanitarian impact',
  newsletterPlaceholder: 'Enter your email address',
} as const

export const CONTACT_DETAILS = [
  {
    label: 'Location',
    value: BRAND.address,
    icon: 'location' as const,
  },
  {
    label: 'Helpline Number',
    value: BRAND.phone,
    icon: 'phone' as const,
  },
  {
    label: 'Email',
    value: BRAND.email,
    icon: 'email' as const,
  },
]
