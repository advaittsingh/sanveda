import { isSupabaseConfigured, requireSupabase } from './supabase'

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

const EVENTS_KEY = 'sanveda_events'
const REGS_KEY = 'sanveda_event_regs'

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
  }
}

function readEvents(): Event[] {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeEvents(items: Event[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(items))
}

export async function getPublishedEvents(): Promise<Event[]> {
  const all = await getEvents()
  return all.filter((e) => e.status === 'published')
}

export async function getEvents(): Promise<Event[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase().from('events').select('*').order('event_date', { ascending: true })
    if (error) throw new Error(error.message)
    return (data ?? []).map(rowToEvent)
  }
  return readEvents()
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

  if (isSupabaseConfigured) {
    if (input.id) {
      const { data, error } = await requireSupabase().from('events').update(row).eq('id', input.id).select().single()
      if (error) throw new Error(error.message)
      return rowToEvent(data)
    }
    const { data, error } = await requireSupabase().from('events').insert(row).select().single()
    if (error) throw new Error(error.message)
    return rowToEvent(data)
  }

  const event: Event = {
    id: input.id ?? crypto.randomUUID(),
    slug: input.slug,
    title: input.title,
    description: input.description,
    location: input.location,
    eventDate: input.eventDate,
    endDate: input.endDate,
    capacity: input.capacity,
    registeredCount: input.registeredCount ?? 0,
    status: input.status ?? 'draft',
    bannerImage: input.bannerImage,
    createdAt: now,
  }
  const all = readEvents()
  if (input.id) {
    const i = all.findIndex((e) => e.id === input.id)
    all[i] = { ...all[i], ...event }
  } else {
    all.unshift(event)
  }
  writeEvents(all)
  return event
}

export async function registerForEvent(eventId: string, fullName: string, email: string, phone?: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await requireSupabase().from('event_registrations').insert({
      event_id: eventId,
      full_name: fullName,
      email: email.toLowerCase(),
      phone: phone ?? null,
    })
    if (error) throw new Error(error.message)

    const { data: event } = await requireSupabase().from('events').select('registered_count').eq('id', eventId).single()
    await requireSupabase().from('events').update({ registered_count: (event?.registered_count ?? 0) + 1 }).eq('id', eventId)
    return
  }

  const regs = JSON.parse(localStorage.getItem(REGS_KEY) ?? '[]') as EventRegistration[]
  regs.push({ id: crypto.randomUUID(), eventId, fullName, email, phone, status: 'registered', createdAt: new Date().toISOString() })
  localStorage.setItem(REGS_KEY, JSON.stringify(regs))

  const events = readEvents()
  const idx = events.findIndex((e) => e.id === eventId)
  if (idx >= 0) {
    events[idx].registeredCount += 1
    writeEvents(events)
  }
}

export async function getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await requireSupabase().from('event_registrations').select('*').eq('event_id', eventId)
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
  return (JSON.parse(localStorage.getItem(REGS_KEY) ?? '[]') as EventRegistration[]).filter((r) => r.eventId === eventId)
}

export async function deleteEvent(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    await requireSupabase().from('events').delete().eq('id', id)
    return
  }
  writeEvents(readEvents().filter((e) => e.id !== id))
  const regs = (JSON.parse(localStorage.getItem(REGS_KEY) ?? '[]') as EventRegistration[]).filter((r) => r.eventId !== id)
  localStorage.setItem(REGS_KEY, JSON.stringify(regs))
}
