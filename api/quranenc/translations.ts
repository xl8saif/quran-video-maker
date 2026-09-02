export async function GET(req: Request): Promise<Response> {
  if (req.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', Allow: 'GET' } })
  try {
    const incoming = new URL(req.url)
    const upstream = new URL('https://quranenc.com/api/v1/translations/list/')
    incoming.searchParams.forEach((value, key) => upstream.searchParams.set(key, value))
    const response = await fetch(upstream, { headers: { accept: 'application/json' } })
    if (!response.ok) return new Response(JSON.stringify({ error: `QuranEnc translation list failed (${response.status})` }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    return new Response(await response.text(), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } })
  } catch (error) {
    console.error('QuranEnc translation list proxy failed:', error instanceof Error ? error.message : 'unknown error')
    return new Response(JSON.stringify({ error: 'Unable to retrieve QuranEnc translation catalogue' }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }
}
