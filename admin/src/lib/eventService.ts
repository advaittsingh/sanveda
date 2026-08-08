import { dataApi } from './dataApiClient'

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'

export interface Event {
  id: string
  slug: string
  title: string
  description?: string
  location?: string
  eventDate: string
  endDate?: string
  capacity?: number
  registeredCount: number
  status: EventStatus
  bannerImage?: string
  createdAt: string
  eventCode?: string
  category?: string
  lifecycleStage?: string
  organizer?: string
  projectId?: string
  campaignId?: string
  adminNotes?: string
}

export interface EventRegistration {
  id: string
  eventId: string
  fullName: string
  email: string
  phone?: string
  status: string
  createdAt: string
}

function rowToEvent(row: Record<string, unknown>): Event {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    location: row.location ? String(row.location) : undefined,
    eventDate: String(row.event_date),
    endDate: row.end_date ? String(row.end_date) : undefined,
    capacity: row.capacity ? Number(row.capacity) : undefined,
    registeredCount: Number(row.registered_count ?? 0),
    status: row.status as EventStatus,
    bannerImage: row.banner_image ? String(row.banner_image) : undefined,
    createdAt: String(row.created_at),
    eventCode: row.event_code ? String(row.event_code) : undefined,
    category: row.category ? String(row.category) : undefined,
    lifecycleStage: row.lifecycle_stage ? String(row.lifecycle_stage) : undefined,
    organizer: row.organizer ? String(row.organizer) : undefined,
    projectId: row.project_id ? String(row.project_id) : undefined,
    campaignId: row.campaign_id ? String(row.campaign_id) : undefined,
    adminNotes: row.admin_notes ? String(row.admin_notes) : undefined,
  }
}

export async function getPublishedEvents(): Promise<Event[]> {
  const { data, error } = await dataApi.publicTable('events').select('*').order('event_date', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToEvent)
}

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await dataApi.table('events').select('*').order('event_date', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToEvent)
}

export async function saveEvent(input: Partial<Event> & { title: string; slug: string; eventDate: string }): Promise<Event> {
  const now = new Date().toISOString()
  const row = {
    slug: input.slug,
    title: input.title,
    description: input.description ?? null,
    location: input.location ?? null,
    event_date: input.eventDate,
    end_date: input.endDate ?? null,
    capacity: input.capacity ?? null,
    status: input.status ?? 'draft',
    banner_image: input.bannerImage ?? null,
    updated_at: now,
  }

  if (input.id) {
    const { data, error } = await dataApi.table('events').update(row).eq('id', input.id).select().single()
    if (error) throw new Error(error.message)
    return rowToEvent(data)
  }
  const { data, error } = await dataApi.table('events').insert(row).select().single()
  if (error) throw new Error(error.message)
  return rowToEvent(data)
}

export async function registerForEvent(eventId: string, fullName: string, email: string, phone?: string): Promise<void> {
  const { error } = await dataApi.table('event_registrations').insert({
    event_id: eventId,
    full_name: fullName,
    email: email.toLowerCase(),
    phone: phone ?? null,
  })
  if (error) throw new Error(error.message)
}

export async function getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
  const { data, error } = await dataApi.table('event_registrations').select('*').eq('event_id', eventId)
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: String(r.id),
    eventId: String(r.event_id),
    fullName: String(r.full_name),
    email: String(r.email),
    phone: r.phone ? String(r.phone) : undefined,
    status: String(r.status),
    createdAt: String(r.created_at),
  }))
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await dataApi.table('events').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
