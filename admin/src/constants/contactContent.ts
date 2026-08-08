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

/** Sheetal Nagar, Mira Road — precise pin for map embed */
export const CONTACT_MAP_COORDS = {
  lat: 19.2831,
  lng: 72.8728,
}

/**
 * OpenStreetMap embed (no API key).
 * Google’s legacy `maps.google.com/...&output=embed` URLs now 404; Maps Embed API
 * would need a billed key we do not configure.
 */
export function getContactMapEmbedUrl() {
  const { lat, lng } = CONTACT_MAP_COORDS
  const delta = 0.012
  const bbox = encodeURIComponent(
    [lng - delta, lat - delta, lng + delta, lat + delta].join(','),
  )
  const marker = encodeURIComponent(`${lat},${lng}`)
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`
}

/** External deep-link for users who prefer Google Maps. */
export function getContactMapExternalUrl() {
  const { lat, lng } = CONTACT_MAP_COORDS
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
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
