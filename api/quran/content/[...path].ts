import { clearQfToken, getQfAccessToken, getQfApiBase, getQfConfig } from '../_auth'

const ALLOWED_PREFIXES = [
  'pages/lookup',
  'verses/by_page/',
  'verses/by_chapter/',
  'verses/by_key/',
  'resources/chapter_reciters',
  'chapter_reciters/',
] as const

function isAllowed(path: string) {
  return ALLOWED_PREFIXES.some(prefix => path === prefix || path.startsWith(prefix))
}

async function requestQf(path: string, query: string, token: string, clientId: string, env: Parameters<typeof getQfApiBase>[0]) {
  const url = new URL(`${getQfApiBase(env)}/content/api/v4/${path}`)
  url.search = query
  return fetch(url, {
    headers: {
      'x-auth-token': token,
      'x-client-id': clientId,
      accept: 'application/json',
    },
  })
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'GET' },
    })
  }

  try {
    const requestUrl = new URL(req.url)
    const marker = '/api/quran/content/'
    const markerIndex = requestUrl.pathname.indexOf(marker)
    const path = markerIndex >= 0 ? requestUrl.pathname.slice(markerIndex + marker.length) : ''

    if (!path || !isAllowed(path)) {
      return new Response(JSON.stringify({ error: 'Quran Foundation endpoint is not allowed' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { clientId, env } = getQfConfig()
    let response = await requestQf(path, requestUrl.search, await getQfAccessToken(), clientId, env)

    if (response.status === 401) {
      clearQfToken()
      response = await requestQf(path, requestUrl.search, await getQfAccessToken(true), clientId, env)
    }

    if (!response.ok) {
      const status = response.status === 403 ? 502 : response.status
      return new Response(JSON.stringify({ error: 'Quran Foundation content request failed' }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await response.text()
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('Quran Foundation content proxy failed:', error instanceof Error ? error.message : 'unknown error')
    return new Response(JSON.stringify({ error: 'Unable to retrieve Quran Foundation content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
