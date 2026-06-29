export interface Sponsor {
  id: number
  name: string
  logo?: string
  link?: string
}

export const SPONSORS: Sponsor[] = [
  { id: 1, name: 'Horizon Care Foundation', logo: '/assets/sponsors/horizon-care.svg' },
  { id: 2, name: 'GreenLeaf Partners', logo: '/assets/sponsors/greenleaf.svg' },
  { id: 3, name: 'Unity Bank CSR', logo: '/assets/sponsors/unity-bank.svg' },
  { id: 4, name: 'NorthStar Global', logo: '/assets/sponsors/northstar.svg' },
  { id: 5, name: 'BrightPath Education Trust', logo: '/assets/sponsors/brightpath.svg' },
]
