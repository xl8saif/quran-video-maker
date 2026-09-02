export async function GET(req: Request): Promise<Response> {
  if (req.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', Allow: 'GET' } })
  try {
    const requestUrl = new URL(req.url)
    const marker = '/api/quranenc/sura/'
    const index = requestUrl.pathname.indexOf(marker)
    const parts = index >= 0 ? requestUrl.pathname.slice(index + marker.length).split('/') : []
    const key = parts[0]
    const sura = parts[1]
    if (!key || !/^\d+$/.test(sura) || Number(sura) < 1 || Number(sura) > 114) return new Response(JSON.stringify({ error: 'Invalid translation or surah' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    const upstream = `https://quranenc.com/api/v1/translation/sura/${encodeURIComponent(key)}/${sura}`
    const response = await fetch(upstream, { headers: { accept: 'application/json' } })
    if (!response.ok) return new Response(JSON.stringify({ error: `QuranEnc translation request failed (${response.status})` }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    return new Response(await response.text(), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } })
  } catch (error) {
    console.error('QuranEnc sura proxy failed:', error instanceof Error ? error.message : 'unknown error')
    return new Response(JSON.stringify({ error: 'Unable to retrieve QuranEnc translation' }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }
}
