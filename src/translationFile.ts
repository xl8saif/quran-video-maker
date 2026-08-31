import type { TranslationLanguage } from './translationUiModel'

export type ImportedTranslation = {
  language: TranslationLanguage
  name: string
  translator?: string
  license?: string
  sourceUrl?: string
  entries: { surah: number; ayah: number; text: string }[]
}

type RawTranslationEntry = { surah?: unknown; ayah?: unknown; chapter?: unknown; verse?: unknown; text?: unknown; translation?: unknown }
type RawTranslationObject = { metadata?: unknown; meta?: unknown; language?: unknown; name?: unknown; entries?: unknown; translator?: unknown; license?: unknown; sourceUrl?: unknown; [key: string]: unknown }

type TranslationMeta = { language?: unknown; name?: unknown; translator?: unknown; license?: unknown; sourceUrl?: unknown }

function isRecord(value: unknown): value is RawTranslationObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isRawEntry(value: unknown): value is RawTranslationEntry {
  return isRecord(value)
}

export async function parseTranslationFile(file: File): Promise<ImportedTranslation> {
  const raw = await file.text()
  const data: unknown = JSON.parse(raw)
  const objectData = isRecord(data) ? data : null
  const metadataValue = objectData?.metadata ?? objectData?.meta
  const meta: TranslationMeta = isRecord(metadataValue) ? metadataValue : {}
  const rawEntries = objectData?.entries
  const rows: RawTranslationEntry[] = Array.isArray(data)
    ? data.filter(isRawEntry)
    : Array.isArray(rawEntries)
      ? rawEntries.filter(isRawEntry)
      : objectData
        ? Object.entries(rawEntries && isRecord(rawEntries) ? rawEntries : objectData).map(([key, text]) => {
            const [surah, ayah] = key.split(':').map(Number)
            return { surah, ayah, text }
          })
        : []
  const languageValue = meta.language ?? objectData?.language ?? 'en'
  const language = String(languageValue) as TranslationLanguage
  if (!['en', 'ur', 'ar'].includes(language)) throw new Error('Translation language must be en, ur, or ar.')
  const entries = rows
    .map((x) => ({
      surah: Number(x.surah ?? x.chapter),
      ayah: Number(x.ayah ?? x.verse),
      text: String(x.text ?? x.translation ?? ''),
    }))
    .filter((x) => Number.isInteger(x.surah) && x.surah > 0 && Number.isInteger(x.ayah) && x.ayah > 0 && Boolean(x.text.trim()))
  if (!entries.length) throw new Error('No valid translation entries were found.')
  const seen = new Set<string>()
  for (const entry of entries) {
    const key = `${entry.surah}:${entry.ayah}`
    if (seen.has(key)) throw new Error(`Duplicate translation entry: ${key}`)
    seen.add(key)
  }
  return {
    language,
    name: String(meta.name ?? objectData?.name ?? file.name),
    translator: typeof meta.translator === 'string' ? meta.translator : undefined,
    license: typeof meta.license === 'string' ? meta.license : undefined,
    sourceUrl: typeof meta.sourceUrl === 'string' ? meta.sourceUrl : undefined,
    entries,
  }
}
