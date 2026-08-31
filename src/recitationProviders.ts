import { registerRecitationProvider } from './recitationRegistry'

/**
 * Provider registration is intentionally metadata-only until a source's
 * redistribution/YouTube-use rights are verified. Quran Foundation's API
 * requires backend credentials and its recitations remain subject to source
 * specific rights; do not treat API availability as a reuse license.
 */
export function registerVerifiedRecitationProvider(input: {
  id: string
  name: string
  website: string
  license: string
  attribution: string
  tracks: Array<{ id: string; name: string; url: string; license?: string; attribution?: string }>
}) {
  registerRecitationProvider(input)
}

export const RECITATION_RIGHTS_NOTICE =
  'Only use recitations for exported videos when the recording rights explicitly permit reuse and publication.'
