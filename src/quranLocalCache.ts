import type { ApiVerse } from './mushafApi'

const DB_NAME = 'waraq-quran-cache'
const STORE = 'pages'
const VERSION = 1

type CachedPage = { key: string; verses: ApiVerse[]; savedAt: number }

const memory = new Map<string, CachedPage>()

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  return new Promise(resolve => {
    const request = indexedDB.open(DB_NAME, VERSION)
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'key' }) }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
  })
}

export async function getCachedQuranPage(key: string): Promise<ApiVerse[] | null> {
  const inMemory = memory.get(key)
  if (inMemory) return inMemory.verses
  const db = await openDb()
  if (!db) return null
  return new Promise(resolve => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(key)
    request.onsuccess = () => { const value = request.result as CachedPage | undefined; if (value?.verses?.length) memory.set(key, value); resolve(value?.verses || null) }
    request.onerror = () => resolve(null)
  })
}

export async function cacheQuranPage(key: string, verses: ApiVerse[]) {
  if (!verses.length) return
  const value: CachedPage = { key, verses, savedAt: Date.now() }
  memory.set(key, value)
  const db = await openDb()
  if (!db) return
  await new Promise<void>(resolve => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(value)
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
  })
}

export function quranPageCacheKey(page: number, style: string) {
  return `${style}:page:${page}`
}
