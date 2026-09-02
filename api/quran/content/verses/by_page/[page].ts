import { clearQfToken, getQfAccessToken, getQfApiBase, getQfConfig } from '../../../_auth'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', Allow: 'GET' } })
  try {
    const requestUrl = new URL(req.url)
    const marker = '/api/quran/content/verses/by_page/'
    const markerIndex = requestUrl.pathname.indexOf(marker)
    const page = markerIndex >= 0 ? requestUrl.pathname.slice(markerIndex + marker.length).split('/')[0] : ''
    if (!/^\d+$/.test(page)) return new Response(JSON.stringify({ error: 'Invalid page number' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    const { clientId, env } = getQfConfig()
    const url = new URL(`${getQfApiBase(env)}/content/api/v4/verses/by_page/${page}`)
    requestUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value))
    const request = async (force = false) => fetch(url, { headers: { 'x-auth-token': await getQfAccessToken(force), 'x-client-id': clientId, accept: 'application/json' } })
    let response = await request()
    if (response.status === 401) { clearQfToken(); response = await request(true) }
    if (!response.ok) return new Response(JSON.stringify({ error: 'Quran Foundation verse request failed' }), { status: response.status === 403 ? 502 : response.status, headers: { 'Content-Type': 'application/json' } })
    return new Response(await response.text(), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } })
  } catch (error) {
    console.error('Quran Foundation verse request failed:', error instanceof Error ? error.message : 'unknown error')
    return new Response(JSON.stringify({ error: 'Unable to retrieve Quran Foundation verses' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
