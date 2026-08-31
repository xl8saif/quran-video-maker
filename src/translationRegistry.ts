export type TranslationLanguage = 'ar' | 'en' | 'ur'

export interface TranslationTrack {
  id: string
  language: TranslationLanguage
  name: string
  translator: string
  url?: string
  license?: string
  attribution?: string
  commercialUse?: boolean
}

export const translationTracks: TranslationTrack[] = [
  {
    id: 'tanzil-ar-muyassar', language: 'ar', name: 'Tafsir al-Muyassar', translator: 'King Fahad Quran Complex',
    url: 'https://tanzil.net/trans/', license: 'Tanzil translations: non-commercial unless permission is obtained', attribution: 'Tanzil Project', commercialUse: false,
  },
  {
    id: 'tanzil-en-itani', language: 'en', name: 'English — Talal Itani', translator: 'Talal Itani',
    url: 'https://tanzil.net/trans/', license: 'Tanzil translations: non-commercial unless permission is obtained', attribution: 'Tanzil Project', commercialUse: false,
  },
  {
    id: 'tanzil-ur-jalandhry', language: 'ur', name: 'Urdu — Fateh Muhammad Jalandhry', translator: 'Fateh Muhammad Jalandhry',
    url: 'https://tanzil.net/trans/', license: 'Tanzil translations: non-commercial unless permission is obtained', attribution: 'Tanzil Project', commercialUse: false,
  },
]

export function getTranslations(language?: TranslationLanguage) {
  return language ? translationTracks.filter(item => item.language === language) : translationTracks
}

export function findTranslation(id: string) { return translationTracks.find(item => item.id === id) }
