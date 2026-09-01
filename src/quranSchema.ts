export type QuranVerse = {
  verseKey: string
  surah: number
  ayah: number
  text: string
}

export type QuranSurah = {
  number: number
  name: string
  arabic: string
  ayahs: number
  verses: QuranVerse[]
}

export type QuranDataset = {
  source: string
  version: string
  license: string
  sourceUrl: string
  attribution: string
  surahs: QuranSurah[]
}

export type QuranTranslation = {
  language: 'en' | 'ur' | 'ar'
  source: string
  translator?: string
  license?: string
  verses: Record<string, string>
}

export const TANZIL_QURAN_METADATA = {
  source: 'Tanzil Uthmani',
  version: '1.1',
  license: 'Creative Commons Attribution 3.0',
  sourceUrl: 'https://tanzil.net/download/',
  licenseUrl: 'https://tanzil.net/docs/Text_License',
  attribution:
    'Tanzil Quran Text. Copyright (C) 2007-2021 Tanzil Project. License: Creative Commons Attribution 3.0.'
} as const
