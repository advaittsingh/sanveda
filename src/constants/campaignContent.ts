import type { Campaign } from '../types'

export interface SanvedaCampaign extends Campaign {
  FeatureUrgentCampaign?: number
  featureRecentCampaign?: number
}

function storyHtml(tagline: string, paragraphs: string[], focusItems: string[]): string {
  return [
    `<p><strong>${tagline}</strong></p>`,
    ...paragraphs.map((p) => `<p>${p}</p>`),
    '<h3>Campaign Focus</h3>',
    '<ul>',
    ...focusItems.map((item) => `<li>${item}</li>`),
    '</ul>',
  ].join('')
}

export const SANVEDA_CAMPAIGNS: SanvedaCampaign[] = [
  {
    id: 1001,
    title: "NEET Students' Families Humanitarian Relief Fund",
    category: '["Education"]',
    banner_image: '/assets/focus-areas/education.jpg',
    thumbnail_image: '/assets/focus-areas/education.jpg',
    goal: 5000000,
    raised: 0,
    total_donors: 0,
    exemption_tag: 'Tax Benefit',
    hide_goal: 0,
    hide_raised: 0,
    description: 'Every Dream Matters. Every Family Deserves Support.',
    FeatureUrgentCampaign: 1,
    featureRecentCampaign: 1,
    redirects: [
      {
        primary_name: "NEET Students' Families Humanitarian Relief Fund",
        primary_url: 'neet-students-families-humanitarian-relief-fund',
      },
    ],
    CampaignDescriptions: [
      {
        id: 1,
        status: 1,
        description: storyHtml(
          'Every Dream Matters. Every Family Deserves Support.',
          [
            'Sanveda Global Humanitarian Foundation is initiating a humanitarian fundraising campaign to provide one-time financial relief to the families of students who lost their lives by suicide while preparing for the NEET examination during the current year.',
            'The objective of this initiative is to help ease the immediate financial burden on affected families. The assistance may be used by the family for essential household needs, outstanding expenses, or to support the education and future of other children in the family.',
            'Every contribution is intended to stand as a gesture of compassion, solidarity, and hope during an unimaginably difficult time.',
          ],
          [
            'One-time financial relief for eligible families',
            "Support for siblings' education and future",
            'Compassionate humanitarian assistance',
            'Promoting awareness of student mental health',
          ],
        ),
      },
    ],
  },
  {
    id: 1002,
    title: "Support India's Unsponsored Athletes",
    category: '["Sports"]',
    banner_image: '/assets/focus-areas/sports.jpg',
    thumbnail_image: '/assets/focus-areas/sports.jpg',
    goal: 5000000,
    raised: 0,
    total_donors: 0,
    exemption_tag: 'Tax Benefit',
    hide_goal: 0,
    hide_raised: 0,
    description: 'Talent Should Never Stop Because of Money.',
    FeatureUrgentCampaign: 1,
    featureRecentCampaign: 1,
    redirects: [
      {
        primary_name: "Support India's Unsponsored Athletes",
        primary_url: 'support-indias-unsponsored-athletes',
      },
    ],
    CampaignDescriptions: [
      {
        id: 2,
        status: 1,
        description: storyHtml(
          'Talent Should Never Stop Because of Money.',
          [
            'Every year, countless athletes proudly represent India despite having little or no financial support. This campaign aims to help genuine athletes continue their journey by providing resources they need to compete at the highest level.',
          ],
          [
            'Training and coaching support',
            'Competition and travel expenses',
            'Sports equipment',
            'Nutrition and rehabilitation',
            'Genuine sponsorship opportunities',
          ],
        ),
      },
    ],
  },
  {
    id: 1003,
    title: 'Sanveda Wish of Hope',
    category: '["Medical","Children"]',
    banner_image: '/assets/focus-areas/healthcare.jpg',
    thumbnail_image: '/assets/focus-areas/healthcare.jpg',
    goal: 5000000,
    raised: 0,
    total_donors: 0,
    exemption_tag: 'Tax Benefit',
    hide_goal: 0,
    hide_raised: 0,
    description: 'Turning Courage into Smiles.',
    FeatureUrgentCampaign: 1,
    featureRecentCampaign: 1,
    redirects: [
      {
        primary_name: 'Sanveda Wish of Hope',
        primary_url: 'sanveda-wish-of-hope',
      },
    ],
    CampaignDescriptions: [
      {
        id: 3,
        status: 1,
        description: storyHtml(
          'Turning Courage into Smiles.',
          [
            'Sanveda Global Humanitarian Foundation is launching Sanveda Wish of Hope, a humanitarian initiative dedicated to fulfilling meaningful wishes of young cancer patients while extending compassionate support to their families during one of life\'s most challenging journeys.',
            'Every child deserves moments of happiness, hope, and dignity. Through this campaign, we aim to bring smiles by fulfilling special wishes, supporting essential needs where possible, and creating lasting memories that inspire strength and courage.',
          ],
          [
            'Wish fulfilment for young cancer patients',
            'Humanitarian assistance for families',
            'Essential care and support',
            'Educational assistance, where applicable',
            'Creating memorable experiences that inspire hope',
          ],
        ),
      },
    ],
  },
]

export function filterSanvedaCampaigns(
  campaigns: SanvedaCampaign[],
  params?: Record<string, string | number>,
): Campaign[] {
  let list = [...campaigns]

  if (params?.FeatureUrgentCampaign !== undefined) {
    list = list.filter((c) => c.FeatureUrgentCampaign === Number(params.FeatureUrgentCampaign))
  }
  if (params?.featureRecentCampaign !== undefined) {
    list = list.filter((c) => c.featureRecentCampaign === Number(params.featureRecentCampaign))
  }

  const limit = params?.limit ? Number(params.limit) : undefined
  if (limit && limit > 0) list = list.slice(0, limit)

  return list
}
