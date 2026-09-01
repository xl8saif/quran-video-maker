const API_BASE_BY_ENV = {
  prelive: 'https://apis-prelive.quran.foundation',
  production: 'https://apis.quran.foundation',
} as const

const AUTH_BASE_BY_ENV = {
  prelive: 'https://prelive-oauth2.quran.foundation',
  production: 'https://oauth2.quran.foundation',
} as const

type QfEnv = keyof typeof API_BASE_BY_ENV

type CachedToken = {
  access_token: string
  expiresAt: number
}

type TokenResponse = {
  access_token?: unknown
  expires_in?: unknown
}

let cachedToken: CachedToken | null = null
let tokenRequest: Promise<CachedToken> | null = null

function getConfig() {
  const clientId = process.env.QF_CLIENT_ID
  const clientSecret = process.env.QF_CLIENT_SECRET
  const env = (process.env.QF_ENV ?? 'prelive') as string

  if (!clientId || !clientSecret) throw new Error('Quran Foundation OAuth credentials are not configured')
  if (!(env in API_BASE_BY_ENV)) throw new Error("QF_ENV must be 'prelive' or 'production'")

  return { clientId, clientSecret, env: env as QfEnv }
}

async function requestToken(): Promise<CachedToken> {
  const { clientId, clientSecret, env } = getConfig()
  const response = await fetch(`${AUTH_BASE_BY_ENV[env]}/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'content' }),
  })

  if (!response.ok) throw new Error(`Quran Foundation token request failed with status ${response.status}`)
  const token = (await response.json()) as TokenResponse
  if (typeof token.access_token !== 'string' || typeof token.expires_in !== 'number') {
    throw new Error('Invalid token response from Quran Foundation')
  }

  return { access_token: token.access_token, expiresAt: Date.now() + token.expires_in * 1000 }
}

async function getToken(forceRefresh = false): Promise<CachedToken> {
  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAt - 30_000) return cachedToken
  if (!tokenRequest) {
    tokenRequest = requestToken().then(token => {
      cachedToken = token
      return token
    }).finally(() => { tokenRequest = null })
  }
  return tokenRequest
}

async function fetchChapters(token: string, clientId: string, env: QfEnv, language: string) {
  const url = new URL(`${API_BASE_BY_ENV[env]}/content/api/v4/chapters`)
  if (language) url.searchParams.set('language', language)

  return fetch(url, {
    headers: {
      'x-auth-token': token,
      'x-client-id': clientId,
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
    const { clientId, env } = getConfig()
    const language = new URL(req.url).searchParams.get('language') ?? 'en'
    const token = await getToken()
    let response = await fetchChapters(token.access_token, clientId, env, language)

    if (response.status === 401) {
      cachedToken = null
      response = await fetchChapters((await getToken(true)).access_token, clientId, env, language)
    }

    if (!response.ok) {
      const status = response.status === 403 ? 502 : response.status
      return new Response(JSON.stringify({ error: 'Quran Foundation chapters request failed' }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json() as { chapters?: unknown }
    if (!Array.isArray(data.chapters)) {
      return new Response(JSON.stringify({ error: 'Invalid chapters response from Quran Foundation' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Quran Foundation chapters request failed:', error instanceof Error ? error.message : 'unknown error')
    return new Response(JSON.stringify({ error: 'Unable to retrieve Quran Foundation chapters' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
