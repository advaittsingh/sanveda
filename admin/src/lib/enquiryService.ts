import { dataApi } from './dataApiClient'

export type EnquiryStatus = 'new' | 'in_progress' | 'resolved' | 'closed'

export interface Enquiry {
  id: string
  name: string
  phone: string
  email: string
  subject: string
  message: string
  status: EnquiryStatus
  adminNotes?: string
  createdAt: string
  updatedAt: string
  ticketCode?: string
  category?: string
  priority?: string
  source?: string
  workflowStage?: string
  organization?: string
  assignedTo?: string
  assignedTeam?: string
  leadScore?: number
  slaTargetHours?: number
  escalated: boolean
}

export interface EnquirySubmitResult {
  enquiry: Enquiry
  /** Present when the API attempted notification delivery. */
  notify?: {
    userEmailSent: boolean
    orgEmailSent: boolean
  }
}

interface EnquiryInput {
  name: string
  phone: string
  email: string
  subject: string
  message: string
}

function rowToEnquiry(row: Record<string, unknown>): Enquiry {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone),
    email: String(row.email),
    subject: String(row.subject),
    message: String(row.message),
    status: row.status as EnquiryStatus,
    adminNotes: row.admin_notes ? String(row.admin_notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    ticketCode: row.ticket_code ? String(row.ticket_code) : undefined,
    category: row.category ? String(row.category) : undefined,
    priority: row.priority ? String(row.priority) : undefined,
    source: row.source ? String(row.source) : undefined,
    workflowStage: row.workflow_stage ? String(row.workflow_stage) : undefined,
    organization: row.organization ? String(row.organization) : undefined,
    assignedTo: row.assigned_to ? String(row.assigned_to) : undefined,
    assignedTeam: row.assigned_team ? String(row.assigned_team) : undefined,
    leadScore: row.lead_score == null ? undefined : Number(row.lead_score),
    slaTargetHours: row.sla_target_hours == null ? undefined : Number(row.sla_target_hours),
    escalated: Boolean(row.escalated),
  }
}

type EnquiryApiIssue = {
  path?: Array<string | number>
  message?: string
}

function messageFromEnquiryApiError(payload: {
  message?: string
  issues?: EnquiryApiIssue[]
}): string {
  const phoneIssue = payload.issues?.find((issue) =>
    (issue.path ?? []).some((part) => part === 'phone'),
  )
  if (phoneIssue?.message) return phoneIssue.message
  const emailIssue = payload.issues?.find((issue) =>
    (issue.path ?? []).some((part) => part === 'email'),
  )
  if (emailIssue?.message) return emailIssue.message
  if (payload.message?.trim()) return payload.message.trim()
  return 'Could not submit enquiry. Please check your details and try again.'
}

export async function submitEnquiry(input: EnquiryInput): Promise<EnquirySubmitResult> {
  let response: Response
  try {
    response = await fetch('/api/data/people', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource: 'enquiries',
        audience: 'auto',
        operation: 'insert',
        columns: '*',
        values: {
          name: input.name.trim(),
          phone: input.phone.trim(),
          email: input.email.trim().toLowerCase(),
          subject: input.subject.trim(),
          message: input.message.trim(),
        },
        filters: [],
        orders: [],
        resultMode: 'single',
      }),
    })
  } catch {
    throw new Error('Network error. Please check your connection and try again.')
  }

  let payload: {
    data?: Record<string, unknown>
    notify?: { userEmailSent: boolean; orgEmailSent: boolean }
    message?: string
    issues?: EnquiryApiIssue[]
  } = {}
  try {
    payload = (await response.json()) as typeof payload
  } catch {
    throw new Error(
      response.ok
        ? 'Could not read the server response. Please try again.'
        : `Could not submit enquiry (error ${response.status}). Please try again.`,
    )
  }

  if (!response.ok || !payload.data) {
    throw new Error(messageFromEnquiryApiError(payload))
  }

  return {
    enquiry: rowToEnquiry(payload.data),
    notify: payload.notify,
  }
}

export async function getEnquiries(): Promise<Enquiry[]> {
  const { data, error } = await dataApi
    .table('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToEnquiry)
}

export async function updateEnquiry(
  id: string,
  patch: Partial<Pick<Enquiry, 'status' | 'adminNotes'>>,
): Promise<Enquiry | undefined> {
  const { data, error } = await dataApi
    .table('enquiries')
    .update({
      status: patch.status,
      admin_notes: patch.adminNotes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return rowToEnquiry(data)
}

export async function createEnquiryAdmin(input: EnquiryInput): Promise<Enquiry> {
  const result = await submitEnquiry(input)
  return result.enquiry
}
