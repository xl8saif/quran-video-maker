import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { inflateRawSync } from 'node:zlib'

const root = resolve(process.cwd())
const outputDir = resolve(root, 'public/fonts')
mkdirSync(outputDir, { recursive: true })

const sources = [
  { zip: 'public/data/fonts/Amiri_Quran.zip', output: 'amiri-quran.ttf', keywords: ['amiri', 'quran'] },
  { zip: 'public/data/fonts/Muhammadi Quran font.zip', output: 'muhammadi-quran.ttf', keywords: ['muhammadi', 'quran'] },
  { zip: 'public/data/fonts/Noto_Nastaliq_Urdu.zip', output: 'noto-nastaliq-urdu.ttf', keywords: ['noto', 'nastaliq', 'urdu'] },
]

function readU16(buf, offset) { return buf.readUInt16LE(offset) }
function readU32(buf, offset) { return buf.readUInt32LE(offset) }

function entriesFromZip(buf) {
  const eocd = Buffer.from([0x50, 0x4b, 0x05, 0x06])
  let eocdOffset = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.subarray(i, i + 4).equals(eocd)) { eocdOffset = i; break }
  }
  if (eocdOffset < 0) throw new Error('ZIP end record not found')
  const count = readU16(buf, eocdOffset + 10)
  const centralSize = readU32(buf, eocdOffset + 12)
  const centralOffset = readU32(buf, eocdOffset + 16)
  const entries = []
  let p = centralOffset
  for (let i = 0; i < count; i++) {
    if (readU32(buf, p) !== 0x02014b50) throw new Error('Invalid ZIP central directory')
    const method = readU16(buf, p + 10)
    const compressedSize = readU32(buf, p + 20)
    const uncompressedSize = readU32(buf, p + 24)
    const nameLength = readU16(buf, p + 28)
    const extraLength = readU16(buf, p + 30)
    const commentLength = readU16(buf, p + 32)
    const localOffset = readU32(buf, p + 42)
    const name = buf.subarray(p + 46, p + 46 + nameLength).toString('utf8')
    entries.push({ name, method, compressedSize, uncompressedSize, localOffset })
    p += 46 + nameLength + extraLength + commentLength
  }
  if (p > centralOffset + centralSize + 4) throw new Error('Invalid ZIP central directory size')
  return entries
}

function extractEntry(buf, entry) {
  const p = entry.localOffset
  if (readU32(buf, p) !== 0x04034b50) throw new Error(`Invalid local ZIP header for ${entry.name}`)
  const nameLength = readU16(buf, p + 26)
  const extraLength = readU16(buf, p + 28)
  const start = p + 30 + nameLength + extraLength
  const compressed = buf.subarray(start, start + entry.compressedSize)
  if (entry.method === 0) return compressed
  if (entry.method === 8) return inflateRawSync(compressed)
  throw new Error(`Unsupported ZIP compression method ${entry.method} for ${entry.name}`)
}

function chooseFont(entries, keywords) {
  const fonts = entries.filter(entry => /\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/.test(entry.name))
  const ranked = fonts.map(entry => {
    const lower = entry.name.toLowerCase()
    const score = keywords.reduce((n, keyword) => n + (lower.includes(keyword.toLowerCase()) ? 10 : 0), 0)
    return { entry, score }
  }).sort((a, b) => b.score - a.score || a.entry.name.length - b.entry.name.length)
  return ranked[0]?.entry
}

for (const source of sources) {
  const target = resolve(root, outputDir, source.output)
  if (!existsSync(source.zip)) {
    console.warn(`Local font package not found: ${source.zip}`)
    continue
  }
  if (existsSync(target)) continue
  const zip = readFileSync(resolve(root, source.zip))
  const entry = chooseFont(entriesFromZip(zip), source.keywords)
  if (!entry) throw new Error(`No font file found in ${source.zip}`)
  const data = extractEntry(zip, entry)
  if (!data.length) throw new Error(`Empty font extracted from ${source.zip}`)
  writeFileSync(target, data)
  console.log(`Prepared local font: ${basename(target)} from ${entry.name}`)
}
