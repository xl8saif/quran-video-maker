export type ReciterSource = {
  id: number
  name: string
  style?: string
  qirat?: string
  sourceType: 'chapter'
}

/** Public catalog metadata only. Actual Content API calls require backend credentials. */
export const recitationSourceConfig = {
  chapterRecitersEndpoint: 'https://apis.quran.foundation/content/api/v4/resources/chapter_reciters',
  chapterAudioEndpoint: 'https://apis.quran.foundation/content/api/v4/chapter_recitations/{reciterId}/{chapter}',
  defaultReciterId: 7,
}
