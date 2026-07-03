export type CampaignWorkflowStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'
  | 'paused'
  | 'completed'
  | 'rejected'
  | 'archived'
  | 'pending'
  | 'active'
  | 'closed'

export type CampaignHealthLevel = 'good' | 'warning' | 'critical'

export interface CampaignBeneficiary {
  name: string
  age?: number
  location?: string
  category?: string
  verified?: boolean
}

export interface CampaignTimelineEvent {
  label: string
  date: string
}

export interface CampaignAdminMeta {
  beneficiary?: CampaignBeneficiary
  focusArea?: string
  createdBy?: string
  createdAt?: string
  endDate?: string
  gallery?: string[]
  videos?: string[]
  documents?: string[]
  timeline?: CampaignTimelineEvent[]
  updateCount?: number
  commentCount?: number
  featured?: boolean
  trending?: boolean
  urgent?: boolean
  recommended?: boolean
}

export interface CampaignKpis {
  active: number
  pendingApproval: number
  completed: number
  drafts: number
  totalRaised: number
  totalDonors: number
}

export interface DonationPeriodStats {
  today: number
  thisWeek: number
  thisMonth: number
}

export type CampaignSortKey = 'newest' | 'oldest' | 'raised' | 'goal' | 'progress' | 'donors'

export interface CampaignFilters {
  query: string
  category: string
  status: string
  focusArea: string
  createdBy: string
  sort: CampaignSortKey
}
