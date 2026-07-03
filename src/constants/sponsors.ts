export interface Sponsor {
  id: number
  name: string
  logo?: string
  link?: string
  /** Use dark background behind logo (e.g. white-on-black brand marks) */
  darkBg?: boolean
}

export const SPONSORS: Sponsor[] = [
  {
    id: 1,
    name: 'Young Boy Toyz',
    logo: '/assets/sponsors/young-boy-toyz.png',
    darkBg: true,
  },
  {
    id: 2,
    name: 'Cannazo India',
    logo: '/assets/sponsors/cannazo-india.png',
  },
]
