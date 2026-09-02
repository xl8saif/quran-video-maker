import { clearQfToken, getQfAccessToken, getQfApiBase, getQfConfig } from '../_auth'

type VercelRequest = {
  method?: string
  url?: string
  headers: Record<string, string | string[] | undefined>
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => VercelResponse
  json: (body: unknown) => VercelResponse
}

const ALLOWED_PREFIXES = [
  'pages/lookup',
  'verses/by_page/',
  'verses/by_chapter/',
  'verses/by_key/',
  'resources/translations',
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

function getRequestUrl(req: VercelRequest) {
  const host = typeof req.headers.host === 'string' ? req.headers.host : 'localhost'
  return new URL(req.url ?? '/', `https://${host}`)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .setHeader('Allow', 'GET')
      .json({ error: 'Method not allowed' })
  }

  try {
    const requestUrl = getRequestUrl(req)
    const marker = '/api/quran/content/'
    const markerIndex = requestUrl.pathname.indexOf(marker)
    const path = markerIndex >= 0 ? requestUrl.pathname.slice(markerIndex + marker.length) : ''

    if (!path || !isAllowed(path)) {
      return res.status(404).json({ error: 'Quran Foundation endpoint is not allowed' })
    }

    const { clientId, env } = getQfConfig()
    let response = await requestQf(path, requestUrl.search, await getQfAccessToken(), clientId, env)

    if (response.status === 401) {
      clearQfToken()
      response = await requestQf(path, requestUrl.search, await getQfAccessToken(true), clientId, env)
    }

    if (!response.ok) {
      const status = response.status === 403 ? 502 : response.status
      return res.status(status).json({ error: 'Quran Foundation content request failed' })
    }

    const body = await response.text()
    res.setHeader('Content-Type', response.headers.get('content-type') ?? 'application/json')
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600')
    return res.status(200).json(JSON.parse(body))
  } catch (error) {
    console.error('Quran Foundation content proxy failed:', error instanceof Error ? error.message : 'unknown error')
    return res.status(500).json({ error: 'Unable to retrieve Quran Foundation content' })
  }
}
