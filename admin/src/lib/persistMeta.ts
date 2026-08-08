/** Administrative dashboards always operate on canonical data. */
export function isProductionDataMode(): boolean {
  return true
}

/** @deprecated Local browser persistence is intentionally disabled. */
export function allowLocalStoragePersistence(): boolean {
  return false
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
  void key
  return fallback
}

export function writePersistedMeta<T>(key: string, value: T): void {
  void key
  void value
  throw new Error('This metadata is not backed by a canonical database table.')
}

export function readPersistedMetaMap<T>(key: string): Record<string, T> {
  void key
  return {}
}

export function writePersistedMetaMap<T>(key: string, value: Record<string, T>): void {
  void key
  void value
  throw new Error('This metadata is not backed by a canonical database table.')
}

export function writeDevStorageList<T>(key: string, value: T[]): void {
  void key
  void value
  throw new Error('Local operational storage has been removed; use the server data API.')
}

export function readDevStorageList<T>(key: string): T[] {
  void key
  return []
}
