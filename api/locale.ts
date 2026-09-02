type HeaderMap = Record<string, string | string[] | undefined>

type VercelRequest = {
  headers?: HeaderMap
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => VercelResponse
  json: (body: unknown) => void
}

function getHeader(headers: HeaderMap | Headers | undefined, name: string): string {
  if (!headers) return ''
  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name) || ''
  }

  const value = headers[name.toLowerCase()]
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const country = getHeader(req.headers, 'x-vercel-ip-country') || getHeader(req.headers, 'cf-ipcountry')
  const continent = getHeader(req.headers, 'x-vercel-ip-continent')
  const language = getHeader(req.headers, 'accept-language')

  res
    .status(200)
    .setHeader('content-type', 'application/json; charset=utf-8')
    .setHeader('cache-control', 'private, no-store')
    .json({ country, continent, language })
}
