import type { TranslationLanguage } from './translationUiModel'

export type ImportedTranslation = {
  language: TranslationLanguage
  name: string
  translator?: string
  license?: string
  sourceUrl?: string
  entries: { surah: number; ayah: number; text: string }[]
}

export async function parseTranslationFile(file: File): Promise<ImportedTranslation> {
  const raw = await file.text()
  const data = JSON.parse(raw)
  const meta = Array.isArray(data) ? {} : (data.metadata || data.meta || {})
  const rows = Array.isArray(data) ? data : (Array.isArray(data.entries) ? data.entries : Object.entries(data.entries || data).map(([key, text]) => {
    const [surah, ayah] = key.split(':').map(Number)
    return { surah, ayah, text }
  }))
  const language = String(meta.language || data.language || 'en') as TranslationLanguage
  if (!['en', 'ur', 'ar'].includes(language)) throw new Error('Translation language must be en, ur, or ar.')
  const entries = rows.map((x: any) => ({ surah: Number(x.surah ?? x.chapter), ayah: Number(x.ayah ?? x.verse), text: String(x.text ?? x.translation ?? '') })).filter(x => Number.isInteger(x.surah) && x.surah > 0 && Number.isInteger(x.ayah) && x.ayah > 0 && x.text.trim())
  if (!entries.length) throw new Error('No valid translation entries were found.')
  const seen = new Set<string>()
  for (const entry of entries) {
    const key = `${entry.surah}:${entry.ayah}`
    if (seen.has(key)) throw new Error(`Duplicate translation entry: ${key}`)
    seen.add(key)
  }
  return { language, name: String(meta.name || data.name || file.name), translator: meta.translator, license: meta.license, sourceUrl: meta.sourceUrl, entries }
}
