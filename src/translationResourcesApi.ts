import type { TranslationLanguage } from './translationUiModel'

export type TranslationResource = {
  id: number
  name: string
  author_name: string
  language_name: string
}

type TranslationResourcesResponse = { translations: TranslationResource[] }

export async function fetchTranslationResources(): Promise<TranslationResource[]> {
  const response = await fetch('/api/quran/content/resources/translations?language=en', {
    headers: { accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`Quran translation resources request failed (${response.status}).`)
  const data = await response.json() as TranslationResourcesResponse
  if (!Array.isArray(data.translations)) throw new Error('Invalid Quran translation resources response.')
  return data.translations.filter(item =>
    Number.isInteger(item.id) && item.id > 0 &&
    typeof item.name === 'string' && typeof item.author_name === 'string' &&
    typeof item.language_name === 'string',
  )
}

function normalizeLanguage(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z]/g, '')
}

export function selectDefaultTranslationResources(
  resources: TranslationResource[],
): Partial<Record<TranslationLanguage, TranslationResource>> {
  const result: Partial<Record<TranslationLanguage, TranslationResource>> = {}
  const preferredAuthors: Record<TranslationLanguage, string[]> = {
    en: ['mustafa khattab'],
    ur: ['taqi usmani'],
    ar: [],
  }

  for (const language of ['en', 'ur', 'ar'] as TranslationLanguage[]) {
    const candidates = resources.filter(resource => normalizeLanguage(resource.language_name).startsWith(language))
    const preferred = candidates.find(resource => preferredAuthors[language].some(author =>
      resource.author_name.toLowerCase().includes(author),
    ))
    result[language] = preferred || candidates[0]
  }

  return result
}
