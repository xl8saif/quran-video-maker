import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const root = resolve(process.cwd())
const output = resolve(root, 'public/data/mushaf/page-map.json')
const source = 'https://raw.githubusercontent.com/Mushaf-Learning/quran-text/main/metadata/pages.json'

if (existsSync(output)) {
  try {
    const parsed = JSON.parse(readFileSync(output, 'utf8'))
    if (Array.isArray(parsed) && parsed.length === 604) {
      console.log(`Mushaf page map already present: ${parsed.length} pages`)
      process.exit(0)
    }
  } catch {}
}

console.log('Preparing local 604-page Mushaf metadata…')
const response = await fetch(source, { headers: { accept: 'application/json' } })
if (!response.ok) throw new Error(`Unable to download Mushaf page metadata (${response.status})`)
const pages = await response.json()
if (!Array.isArray(pages) || pages.length !== 604) throw new Error(`Unexpected Mushaf page metadata: expected 604 pages, received ${Array.isArray(pages) ? pages.length : 'invalid data'}`)

mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, `${JSON.stringify(pages, null, 2)}\n`, 'utf8')
console.log(`Local Mushaf page map generated: ${output}`)
