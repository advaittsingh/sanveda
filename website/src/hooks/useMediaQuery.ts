import { useEffect, useState } from 'react'

/** Canonical breakpoints — keep CSS @media rules aligned with these values. */
export const BREAKPOINTS = {
  mobile: 600,
  tablet: 900,
  nav: 960,
  layout: 1000,
  wide: 1200,
} as const

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = () => setMatches(mq.matches)
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

export function useBreakpoints() {
  const mobile = useMediaQuery(`(max-width: ${BREAKPOINTS.mobile}px)`)
  const tablet = useMediaQuery(`(max-width: ${BREAKPOINTS.layout}px)`)
  const md = useMediaQuery(`(max-width: ${BREAKPOINTS.nav}px)`)
  const wide = useMediaQuery(`(min-width: ${BREAKPOINTS.wide}px)`)
  const xl = useMediaQuery('(min-width: 1575px)')
  return { mobile, tablet, md, wide, xl }
}
