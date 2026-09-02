import { clearQfToken, getQfAccessToken, getQfApiBase, getQfConfig } from '../../../_auth'

function fallbackVerseData(data: any, page: number) {
  const ayahs = Array.isArray(data?.data?.ayahs) ? data.data.ayahs : []
  return {
    verses: ayahs.map((ayah: any, index: number) => {
      const verseKey = `${ayah?.surah?.number || ayah?.numberInSurah?.toString?.() || ''}:${ayah?.numberInSurah || ''}`
      const text = String(ayah?.text || '').trim()
      const words = text ? text.split(/\s+/).map((word: string, position: number) => ({
        id: `${verseKey}:${position + 1}`,
        position: position + 1,
        verse_key: verseKey,
        page_number: page,
        line_number: index + 1,
        text_uthmani: word,
        text_qpc_hafs: word,
      })) : []
      return {
        verse_key: verseKey,
        verse_number: Number(ayah?.numberInSurah || index + 1),
        page_number: page,
        text_uthmani: text,
        text_qpc_hafs: text,
        words,
        translations: [],
      }
    }).filter((verse: any) => /^\d+:\d+$/.test(verse.verse_key)),
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', Allow: 'GET' } })
  try {
    const requestUrl = new URL(req.url)
    const marker = '/api/quran/content/verses/by_page/'
    const markerIndex = requestUrl.pathname.indexOf(marker)
    const page = markerIndex >= 0 ? requestUrl.pathname.slice(markerIndex + marker.length).split('/')[0] : ''
    if (!/^\d+$/.test(page)) return new Response(JSON.stringify({ error: 'Invalid page number' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    const pageNumber = Number(page)
    try {
      const { clientId, env } = getQfConfig()
      const url = new URL(`${getQfApiBase(env)}/content/api/v4/verses/by_page/${page}`)
      requestUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value))
      const request = async (force = false) => fetch(url, { headers: { 'x-auth-token': await getQfAccessToken(force), 'x-client-id': clientId, accept: 'application/json' } })
      let response = await request()
      if (response.status === 401) { clearQfToken(); response = await request(true) }
      if (response.ok) return new Response(await response.text(), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } })
    } catch (error) {
      console.error('Quran Foundation verse request failed; using fallback:', error instanceof Error ? error.message : 'unknown error')
    }

    const fallback = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`, { headers: { accept: 'application/json' } })
    if (!fallback.ok) return new Response(JSON.stringify({ error: 'Quran page source unavailable' }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    const fallbackData = await fallback.json()
    return new Response(JSON.stringify(fallbackVerseData(fallbackData, pageNumber)), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } })
  } catch (error) {
    console.error('Quran page request failed:', error instanceof Error ? error.message : 'unknown error')
    return new Response(JSON.stringify({ error: 'Unable to retrieve Quran page' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
