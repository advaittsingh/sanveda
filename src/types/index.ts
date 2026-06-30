export interface CMSItem {
  id: number
  title?: string
  sub_title?: string
  stand_title?: string
  description?: string
  image?: string | null
  image2?: string | null
  image3?: string | null
  link?: string | null
  status?: number | boolean
  section?: string
  section_title?: string
  page?: string
  relatedCMS?: CMSItem[]
}

export interface CampaignDescription {
  id?: number
  title?: string
  description?: string
  status?: number | boolean
}

export interface Campaign {
  id: number
  title: string
  banner_image?: string
  thumbnail_image?: string
  goal: number
  raised: number
  description?: string
  exemption_tag?: string
  total_donors?: number
  redirects?: { primary_url: string; primary_name?: string }[]
  hide_goal?: number
  hide_raised?: number
  category?: string | string[] | null
  CampaignDescriptions?: CampaignDescription[]
  youtube_link?: string | null
  comments?: unknown[]
  updates?: unknown[]
}

export interface BlogPost {
  id: number
  title: string
  status?: number
  banner_image?: string
  description?: string
  createdAt?: string
  BlogDescs?: { id: number; description?: string; title?: string; link?: string; image?: string | null }[]
}

export interface MonthlyDonation {
  id: number
  title: string
  thumbnail_image?: string
  banner_image?: string
  monthly_image_carousel?: string[]
  goal?: number
  raised?: number
  totalDonors?: number
  total_donors?: number
  exemption_tag?: string
  description?: string
}

export interface Category {
  id: number
  name: string
  icon: string
  slug: string
}
