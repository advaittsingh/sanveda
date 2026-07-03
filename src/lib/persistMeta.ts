import { isSupabaseConfigured } from './supabase'

/** Production data must come from Supabase — never localStorage as source of truth. */
export function isProductionDataMode(): boolean {
  return isSupabaseConfigured && import.meta.env.PROD
}

/** Demo/dev-only localStorage persistence for admin meta overlays. */
export function allowLocalStoragePersistence(): boolean {
  return !isProductionDataMode()
}

export function isDevPasswordAuthAllowed(): boolean {
  return !isSupabaseConfigured || import.meta.env.DEV
}

const CACHE_TTL_MS = 60_000
const cache = new Map<string, { at: number; data: unknown }>()

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCached<T>(key: string, data: T): void {
  cache.set(key, { at: Date.now(), data })
}

export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

export function readPersistedMeta<T>(key: string, fallback: T): T {
  if (!allowLocalStoragePersistence()) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback
  } catch {
    return fallback
  }
}

export function writePersistedMeta<T>(key: string, value: T): void {
  if (!allowLocalStoragePersistence()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota exceeded — skip silently in demo mode
  }
}

export function readPersistedMetaMap<T>(key: string): Record<string, T> {
  if (!allowLocalStoragePersistence()) return {}
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Record<string, T>) : {}
  } catch {
    return {}
  }
}

export function writePersistedMetaMap<T>(key: string, value: Record<string, T>): void {
  if (!allowLocalStoragePersistence()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function writeDevStorageList<T>(key: string, value: T[]): void {
  if (!allowLocalStoragePersistence()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function readDevStorageList<T>(key: string): T[] {
  if (!allowLocalStoragePersistence()) return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}
