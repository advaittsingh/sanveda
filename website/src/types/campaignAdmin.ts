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

export type CampaignType = 'medical' | 'education' | 'sports' | 'community' | 'emergency' | 'animal_welfare'
export type CampaignVisibility = 'public' | 'private' | 'invite_only'
export type CampaignPriority = 'low' | 'medium' | 'high' | 'emergency'

export interface CampaignUploadedFile {
  id: string
  name: string
  type: string
  url: string
  verified?: boolean
  category?: string
}

export interface CampaignBeneficiary {
  name: string
  age?: number
  location?: string
  category?: string
  verified?: boolean
  photo?: string
  gender?: string
  phone?: string
  aadhaarPan?: string
  familyIncome?: number
  medicalCondition?: string
  guardianName?: string
  guardianPhone?: string
  bankAccount?: string
  verificationDocs?: CampaignUploadedFile[]
  verificationNotes?: string
}

export interface CampaignStory {
  summary?: string
  fullStory?: string
  problemStatement?: string
  howFundsHelp?: string
  expectedImpact?: string
  beneficiaryQuote?: string
  ctaMessage?: string
}

export interface FundBreakdownItem {
  label: string
  amount: number
}

export interface CampaignFinancials {
  fundBreakdown?: FundBreakdownItem[]
  platformFee?: number
  ngoFee?: number
  emergencyFlag?: boolean
  taxBenefit?: string
  monthlyTarget?: number
  minimumDonation?: number
}

export interface CampaignPublishing {
  publishNow?: boolean
  scheduledPublish?: string
  expiryDate?: string
  approvedBy?: string
  approvalNotes?: string
  staffPick?: boolean
  homepage?: boolean
}

export interface CampaignCommunication {
  updates?: string[]
  donorEmailTemplate?: string
  whatsappEnabled?: boolean
  progressUpdates?: string
  faqs?: { question: string; answer: string }[]
}

export interface CampaignTimelineEvent {
  label: string
  date: string
}

export interface CampaignAdminMeta {
  campaignType?: CampaignType
  visibility?: CampaignVisibility
  priority?: CampaignPriority
  campaignOwner?: string
  beneficiary?: CampaignBeneficiary
  story?: CampaignStory
  focusArea?: string
  createdBy?: string
  createdAt?: string
  endDate?: string
  gallery?: string[]
  videos?: string[]
  documents?: string[]
  beforeImage?: string
  afterImage?: string
  financials?: CampaignFinancials
  documentFiles?: CampaignUploadedFile[]
  publishing?: CampaignPublishing
  communication?: CampaignCommunication
  timeline?: CampaignTimelineEvent[]
  updateCount?: number
  commentCount?: number
  featured?: boolean
  trending?: boolean
  urgent?: boolean
  recommended?: boolean
  lastSavedAt?: string
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

export type WizardStepStatus = 'complete' | 'warning' | 'invalid' | 'pending'

export interface WizardStepValidation {
  status: WizardStepStatus
  message?: string
}
