const AUTH_BASE_BY_ENV = {
  prelive: 'https://prelive-oauth2.quran.foundation',
  production: 'https://oauth2.quran.foundation',
} as const

type QfEnv = keyof typeof AUTH_BASE_BY_ENV

type TokenResponse = {
  access_token?: unknown
  expires_in?: unknown
}

type CachedToken = {
  access_token: string
  expires_in: number
  expiresAt: number
}

let cachedToken: CachedToken | null = null
let tokenRequest: Promise<CachedToken> | null = null

function getConfig() {
  const clientId = process.env.QF_CLIENT_ID
  const clientSecret = process.env.QF_CLIENT_SECRET
  const env = (process.env.QF_ENV ?? 'prelive') as string

  if (!clientId || !clientSecret) {
    throw new Error('Quran Foundation OAuth credentials are not configured')
  }

  if (!(env in AUTH_BASE_BY_ENV)) {
    throw new Error("QF_ENV must be 'prelive' or 'production'")
  }

  return {
    clientId,
    clientSecret,
    env: env as QfEnv,
  }
}

async function requestToken(): Promise<CachedToken> {
  const { clientId, clientSecret, env } = getConfig()
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetch(`${AUTH_BASE_BY_ENV[env]}/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'content',
    }),
  })

  if (!response.ok) {
    throw new Error(`Quran Foundation token request failed with status ${response.status}`)
  }

  const token = (await response.json()) as TokenResponse
  if (typeof token.access_token !== 'string' || typeof token.expires_in !== 'number') {
    throw new Error('Invalid token response from Quran Foundation')
  }

  return {
    access_token: token.access_token,
    expires_in: token.expires_in,
    expiresAt: Date.now() + token.expires_in * 1000,
  }
}

async function getToken(): Promise<CachedToken> {
  const refreshWindowMs = 30_000

  if (cachedToken && Date.now() < cachedToken.expiresAt - refreshWindowMs) {
    return cachedToken
  }

  if (!tokenRequest) {
    tokenRequest = requestToken()
      .then((token) => {
        cachedToken = token
        return token
      })
      .finally(() => {
        tokenRequest = null
      })
  }

  return tokenRequest
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    })
  }

  try {
    const token = await getToken()

    return new Response(
      JSON.stringify({
        access_token: token.access_token,
        expires_in: token.expires_in,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      },
    )
  } catch (error) {
    console.error(
      'Quran Foundation token retrieval failed:',
      error instanceof Error ? error.message : 'unknown error',
    )

    return new Response(JSON.stringify({ error: 'Unable to retrieve Quran Foundation token' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
