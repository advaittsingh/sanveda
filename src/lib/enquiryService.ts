import { isSupabaseConfigured, requireSupabase } from './supabase'
import { enquiryReceivedEmailHtml, sendTransactionalEmail } from './emailService'

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
}

const STORAGE_KEY = 'sanveda_enquiries'

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
  }
}

function readLocal(): Enquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Enquiry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocal(items: Enquiry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export async function submitEnquiry(input: EnquiryInput): Promise<Enquiry> {
  const now = new Date().toISOString()

  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('enquiries')
      .insert({
        name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email.trim().toLowerCase(),
        subject: input.subject.trim(),
        message: input.message.trim(),
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    const enquiry = rowToEnquiry(data)
    await sendTransactionalEmail(
      enquiry.email,
      'We received your enquiry — Sanveda',
      enquiryReceivedEmailHtml(enquiry.name),
      'enquiry_received',
      { enquiryId: enquiry.id },
    )
    return enquiry
  }

  const enquiry: Enquiry = {
    id: crypto.randomUUID(),
    ...input,
    email: input.email.trim().toLowerCase(),
    status: 'new',
    createdAt: now,
    updatedAt: now,
  }
  const all = readLocal()
  all.unshift(enquiry)
  writeLocal(all)
  return enquiry
}

export async function getEnquiries(): Promise<Enquiry[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(rowToEnquiry)
  }

  return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function updateEnquiry(
  id: string,
  patch: Partial<Pick<Enquiry, 'status' | 'adminNotes'>>,
): Promise<Enquiry | undefined> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase()
      .from('enquiries')
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

  const all = readLocal()
  const index = all.findIndex((e) => e.id === id)
  if (index < 0) return undefined

  const updated: Enquiry = {
    ...all[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  all[index] = updated
  writeLocal(all)
  return updated
}

export async function createEnquiryAdmin(input: EnquiryInput): Promise<Enquiry> {
  return submitEnquiry(input)
}
