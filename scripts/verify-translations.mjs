import fs from 'node:fs'
import path from 'node:path'

// Standard Quran verse counts by surah (total 6,236 ayahs).
const expected = {
  1:7,2:286,3:200,4:176,5:120,6:165,7:206,8:75,9:129,10:109,
  11:123,12:111,13:43,14:52,15:99,16:128,17:111,18:110,19:98,20:135,
  21:112,22:78,23:118,24:64,25:77,26:227,27:93,28:88,29:69,30:60,
  31:34,32:30,33:73,34:54,35:45,36:83,37:182,38:88,39:75,40:85,
  41:54,42:53,43:89,44:59,45:37,46:35,47:38,48:29,49:18,50:45,
  51:60,52:49,53:62,54:55,55:78,56:96,57:29,58:22,59:24,60:13,
  61:14,62:11,63:11,64:18,65:12,66:12,67:30,68:52,69:52,70:44,
  71:28,72:28,73:20,74:56,75:40,76:31,77:50,78:40,79:46,80:42,
  81:29,82:19,83:36,84:25,85:22,86:17,87:19,88:26,89:30,90:20,
  91:15,92:21,93:11,94:8,95:8,96:19,97:5,98:8,99:8,100:11,
  101:11,102:8,103:3,104:9,105:5,106:4,107:7,108:3,109:6,110:3,
  111:5,112:4,113:5,114:6
}

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
  let text
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(raw) }
  catch { failures.push(`${file}: invalid UTF-8`); text = raw.toString('utf8') }
  if (text.includes('\uFFFD')) failures.push(`${file}: replacement character found`)

  const lines = text.split(/\r?\n/).filter(Boolean)
  const seen = new Set()
  const counts = Array(115).fill(0)
  const malformedLines = []
  let empty = 0

  for (const line of lines) {
    const first = line.indexOf('|')
    const second = line.indexOf('|', first + 1)
    if (first <= 0 || second <= first + 1) {
      malformedLines.push(line)
      continue
    }
    const surah = Number(line.slice(0, first))
    const ayah = Number(line.slice(first + 1, second))
    const translation = line.slice(second + 1).trim()
    if (!Number.isInteger(surah) || !Number.isInteger(ayah) || surah < 1 || surah > 114 || ayah < 1) {
      malformedLines.push(line)
      continue
    }
    if (!translation) empty++
    const key = `${surah}:${ayah}`
    if (seen.has(key)) failures.push(`${file}: duplicate ${key}`)
    seen.add(key)
    counts[surah]++
  }

  // Some bundled source files contain non-ayah metadata lines. They must not
  // hide missing ayahs, but they also must not make a complete translation fail.
  if (seen.size !== 6236) failures.push(`${file}: ${seen.size} unique ayahs, expected 6236`)
  if (empty) failures.push(`${file}: ${empty} empty translations`)
  for (let s = 1; s <= 114; s++) {
    if (counts[s] !== expected[s]) failures.push(`${file}: surah ${s} has ${counts[s]}, expected ${expected[s]}`)
  }

  report.push({
    file,
    bytes: raw.length,
    physicalLines: lines.length,
    records: seen.size,
    malformedMetadataLines: malformedLines.length,
    malformedSamples: malformedLines.slice(0, 12),
    empty,
    status: failures.some(x => x.startsWith(file + ':')) ? 'FAIL' : 'PASS'
  })
}

fs.mkdirSync('artifacts', { recursive: true })
fs.writeFileSync('artifacts/translation-validation.json', JSON.stringify({ expectedRecords: 6236, files: report, failures }, null, 2) + '\n')
console.table(report.map(({ malformedSamples, ...row }) => row))
if (failures.length) {
  console.error('\nTranslation validation FAILED\n' + failures.join('\n'))
  process.exit(1)
}
console.log('\nTranslation validation PASSED: all 8 files contain exactly 6,236 unique Quran ayahs with expected per-surah counts.')
