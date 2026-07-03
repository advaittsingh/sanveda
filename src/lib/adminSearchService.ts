import { getAllCampaignsAdmin } from './campaignService'
import { getAllDonations } from './donationService'
import { getBeneficiaries } from './beneficiaryService'
import { getVolunteerApplications } from './volunteerStore'
import { getMemberships } from './membershipService'
import { getAllBlogsAdmin } from './blogService'

export interface SearchResult {
  id: string
  type: string
  title: string
  subtitle?: string
  to: string
}

export async function globalAdminSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase()
  if (!q || q.length < 2) return []

  const [campaigns, donations, volunteers, beneficiaries, memberships, blogs] = await Promise.all([
    getAllCampaignsAdmin(),
    getAllDonations(),
    getVolunteerApplications(),
    getBeneficiaries(),
    getMemberships(),
    getAllBlogsAdmin().catch(() => []),
  ])

  const results: SearchResult[] = []

  campaigns
    .filter((c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
    .slice(0, 5)
    .forEach((c) => results.push({ id: `c-${c.id}`, type: 'Campaign', title: c.title, subtitle: c.status, to: '/admin/campaigns' }))

  donations
    .filter((d) => (d.donorName?.toLowerCase().includes(q) || d.campaignTitle.toLowerCase().includes(q) || d.donorEmail?.toLowerCase().includes(q)))
    .slice(0, 5)
    .forEach((d) => results.push({ id: `d-${d.id}`, type: 'Donation', title: `₹${d.amount.toLocaleString('en-IN')}`, subtitle: d.campaignTitle, to: '/admin/donations' }))

  volunteers
    .filter((v) => v.fullName.toLowerCase().includes(q) || v.email.toLowerCase().includes(q))
    .slice(0, 5)
    .forEach((v) => results.push({ id: `v-${v.id}`, type: 'Volunteer', title: v.fullName, subtitle: v.status, to: '/admin/volunteers' }))

  beneficiaries
    .filter((b) => b.fullName.toLowerCase().includes(q) || b.program?.toLowerCase().includes(q))
    .slice(0, 5)
    .forEach((b) => results.push({ id: `b-${b.id}`, type: 'Beneficiary', title: b.fullName, subtitle: b.program, to: '/admin/beneficiaries' }))

  memberships
    .filter((m) => m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach((m) => results.push({ id: `m-${m.id}`, type: 'Member', title: m.fullName, subtitle: m.tier, to: '/admin/memberships' }))

  blogs
    .filter((b) => b.title.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach((b) => results.push({ id: `blog-${b.id}`, type: 'Blog', title: b.title, subtitle: b.status, to: '/admin/blogs' }))

  return results.slice(0, 12)
}
