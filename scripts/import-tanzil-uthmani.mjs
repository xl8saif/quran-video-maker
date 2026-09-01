import fs from 'node:fs'
import path from 'node:path'

const input = process.argv[2] || 'quran-uthmani.txt'
const output = process.argv[3] || 'data/quran/tanzil-uthmani.json'

if (!fs.existsSync(input)) {
  console.error(`Input file not found: ${input}`)
  console.error('Download the official Tanzil Uthmani text first from https://tanzil.net/download/')
  process.exit(1)
}

const lines = fs.readFileSync(input, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean)
const surahMap = new Map()

for (const line of lines) {
  const first = line.indexOf('|')
  const second = line.indexOf('|', first + 1)
  if (first < 1 || second < first) continue

  const surah = Number(line.slice(0, first))
  const ayah = Number(line.slice(first + 1, second))
  const text = line.slice(second + 1)
  if (!Number.isInteger(surah) || !Number.isInteger(ayah) || !text) continue

  if (!surahMap.has(surah)) surahMap.set(surah, [])
  surahMap.get(surah).push({ verseKey: `${surah}:${ayah}`, surah, ayah, text })
}

const surahs = [...surahMap.entries()]
  .sort(([a], [b]) => a - b)
  .map(([number, verses]) => ({ number, ayahs: verses.length, verses }))

if (surahs.length !== 114) {
  throw new Error(`Expected 114 surahs, found ${surahs.length}. Check the downloaded Tanzil file.`)
}

const dataset = {
  source: 'Tanzil Uthmani',
  version: '1.1',
  license: 'Creative Commons Attribution 3.0',
  sourceUrl: 'https://tanzil.net/download/',
  attribution: 'Tanzil Quran Text. Copyright (C) 2007-2021 Tanzil Project. License: Creative Commons Attribution 3.0.',
  surahs,
}

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify(dataset, null, 2) + '\n', 'utf8')
console.log(`Imported ${surahs.length} surahs and ${surahs.reduce((n, s) => n + s.ayahs, 0)} ayahs.`)
console.log(`Wrote ${output}`)
