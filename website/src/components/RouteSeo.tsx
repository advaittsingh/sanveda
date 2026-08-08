import { useEffect } from 'react'
import { matchPath, useLocation } from 'react-router-dom'

const SITE_NAME = 'Sanveda Global Humanitarian Foundation'
const DEFAULT_DESCRIPTION =
  "Sanveda Global Humanitarian Foundation — India's Humanitarian Assistance for Ayurvedic healing, Sports & Health Force by Hamdan pathan."

interface RouteMetadata {
  path: string
  title: string
  description: string
  noIndex?: boolean
}

const ROUTE_METADATA: RouteMetadata[] = [
  { path: '/', title: SITE_NAME, description: DEFAULT_DESCRIPTION },
  {
    path: '/campaigns',
    title: `Campaigns | ${SITE_NAME}`,
    description: 'Explore humanitarian campaigns and support causes that need urgent action.',
  },
  {
    path: '/campaign/:slug',
    title: `Campaign | ${SITE_NAME}`,
    description: 'Learn about this Sanveda campaign, its impact, and ways to contribute.',
  },
  {
    path: '/about',
    title: `About Us | ${SITE_NAME}`,
    description: 'Learn about Sanveda, our mission, values, and humanitarian work.',
  },
  {
    path: '/blogs',
    title: `Stories & Updates | ${SITE_NAME}`,
    description: 'Read stories, field updates, and humanitarian insights from Sanveda.',
  },
  {
    path: '/blogs/:id',
    title: `Story | ${SITE_NAME}`,
    description: 'Read a story or update from Sanveda Global Humanitarian Foundation.',
  },
  {
    path: '/contact',
    title: `Contact Us | ${SITE_NAME}`,
    description: 'Contact Sanveda Global Humanitarian Foundation.',
  },
  {
    path: '/volunteer',
    title: `Volunteer | ${SITE_NAME}`,
    description: 'Volunteer with Sanveda and contribute your time and skills to humanitarian work.',
  },
  {
    path: '/membership',
    title: `Membership | ${SITE_NAME}`,
    description: 'Join the Sanveda community and support sustained humanitarian action.',
  },
  {
    path: '/internship',
    title: `Internships | ${SITE_NAME}`,
    description: 'Explore internship opportunities with Sanveda.',
  },
  {
    path: '/documents',
    title: `Documents | ${SITE_NAME}`,
    description: 'View Sanveda public documents and organizational information.',
  },
  {
    path: '/gallery',
    title: `Gallery | ${SITE_NAME}`,
    description: 'See Sanveda humanitarian work and community impact.',
  },
  {
    path: '/donate/checkout',
    title: `Donate | ${SITE_NAME}`,
    description: 'Make a secure donation to support Sanveda humanitarian programs.',
    noIndex: true,
  },
]

function upsertMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.append(element)
  }
  element.content = content
}

export default function RouteSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const metadata = ROUTE_METADATA.find(({ path }) => matchPath({ path, end: true }, pathname))
    const title = metadata?.title ?? `Page | ${SITE_NAME}`
    const description = metadata?.description ?? DEFAULT_DESCRIPTION

    document.title = title
    upsertMeta('description', description)
    upsertMeta(
      'robots',
      metadata?.noIndex || pathname.startsWith('/admin') ? 'noindex, nofollow' : 'index, follow',
    )
    upsertMeta('og:title', title, 'property')
    upsertMeta('og:description', description, 'property')

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = new URL(pathname, window.location.origin).href
  }, [pathname])

  return null
}
