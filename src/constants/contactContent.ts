import { BRAND } from './brand'

export const CONTACT_PAGE = {
  breadcrumb: 'Contact Us',
  label: 'Contact Us',
  title: 'Your enquiry is valuable to us',
  subtitle:
    'Reach out to Sanveda Global Humanitarian Foundation for partnerships, volunteer opportunities, donations, or general inquiries. We are here to listen and support.',
  getInTouch: 'Get in touch',
  formTitle: 'Fill the details',
} as const

export const CONTACT_MAP_QUERY = encodeURIComponent(BRAND.address)

// Sheet Nagar, Mira Road — used for a precise map pin
export const CONTACT_MAP_COORDS = {
  lat: 19.2862,
  lng: 72.8694,
}

export function getContactMapEmbedUrl() {
  const label = encodeURIComponent(BRAND.name)
  return `https://maps.google.com/maps?q=${CONTACT_MAP_COORDS.lat},${CONTACT_MAP_COORDS.lng}+(${label})&z=16&hl=en&output=embed`
}

export const CONTACT_LOCATION = {
  label: 'Location',
  value: BRAND.address,
  icon: 'location' as const,
}

export const CONTACT_PHONE = {
  label: 'Helpline Number',
  value: BRAND.phone,
  icon: 'phone' as const,
}

export const CONTACT_EMAIL = {
  label: 'Email',
  value: BRAND.email,
  icon: 'email' as const,
}
