import fs from 'node:fs'
import path from 'node:path'

const expected = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6]
const files = [
  'ar.muyassar.txt','en.daryabadi.txt','hi.farooq.txt','ko.korean.txt',
  'ta.tamil.txt','ur.jalandhry.txt','ur.junagarhi.txt','zh.jian.txt'
]
const root = path.resolve('public/data')
const failures = []
const report = []

for (const file of files) {
  const full = path.join(root, file)
  const raw = fs.readFileSync(full)
  const text = raw.toString('utf8')
  if (text.includes('\uFFFD')) failures.push(`${file}: replacement character found`)
  const lines = text.split(/\r?\n/).filter(Boolean)
  const seen = new Set()
  const counts = Array(115).fill(0)
  let malformed = 0
  let empty = 0
  for (const line of lines) {
    const first = line.indexOf('|')
    const second = line.indexOf('|', first + 1)
    if (first <= 0 || second <= first + 1) { malformed++; continue }
    const surah = Number(line.slice(0, first))
    const ayah = Number(line.slice(first + 1, second))
    const translation = line.slice(second + 1).trim()
    if (!Number.isInteger(surah) || !Number.isInteger(ayah) || surah < 1 || surah > 114 || ayah < 1) { malformed++; continue }
    if (!translation) empty++
    const key = `${surah}:${ayah}`
    if (seen.has(key)) failures.push(`${file}: duplicate ${key}`)
    seen.add(key); counts[surah]++
  }
  if (lines.length !== 6236) failures.push(`${file}: ${lines.length} records, expected 6236`)
  if (malformed) failures.push(`${file}: ${malformed} malformed records`)
  if (empty) failures.push(`${file}: ${empty} empty translations`)
  for (let s = 1; s <= 114; s++) if (counts[s] !== expected[s-1]) failures.push(`${file}: surah ${s} has ${counts[s]}, expected ${expected[s-1]}`)
  report.push({ file, bytes: raw.length, records: lines.length, unique: seen.size, malformed, empty, status: failures.some(x => x.startsWith(file + ':')) ? 'FAIL' : 'PASS' })
}

fs.mkdirSync('artifacts', { recursive: true })
fs.writeFileSync('artifacts/translation-validation.json', JSON.stringify({ expectedRecords: 6236, files: report, failures }, null, 2) + '\n')
console.table(report)
if (failures.length) { console.error('\nTranslation validation FAILED\n' + failures.join('\n')); process.exit(1) }
console.log('\nTranslation validation PASSED: all 8 files contain exactly 6,236 unique Quran ayahs with expected per-surah counts.')
