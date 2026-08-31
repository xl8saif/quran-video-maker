import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/validate-mushaf-page.mjs <page.json>');
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];

if (!Number.isInteger(data.pageNumber)) errors.push('pageNumber must be an integer');
if (!['hafs', 'indo-pak'].includes(data.style)) errors.push('style must be hafs or indo-pak');
if (!Array.isArray(data.words) || data.words.length === 0) errors.push('words must be a non-empty array');

const seen = new Set();
for (const [i, word] of (data.words ?? []).entries()) {
  const required = ['id', 'verseKey', 'text', 'position', 'pageNumber', 'lineNumber'];
  for (const key of required) if (!(key in word)) errors.push(`word ${i}: missing ${key}`);
  if (word.pageNumber !== data.pageNumber) errors.push(`word ${i}: pageNumber ${word.pageNumber} != page ${data.pageNumber}`);
  if (!Number.isInteger(word.lineNumber) || word.lineNumber < 1 || word.lineNumber > 15) errors.push(`word ${i}: invalid lineNumber`);
  if (!Number.isInteger(word.position) || word.position < 1) errors.push(`word ${i}: invalid position`);
  if (seen.has(word.id)) errors.push(`word ${i}: duplicate id ${word.id}`);
  seen.add(word.id);
}

const byLine = new Map();
for (const word of data.words ?? []) {
  if (!byLine.has(word.lineNumber)) byLine.set(word.lineNumber, []);
  byLine.get(word.lineNumber).push(word.position);
}
for (const [line, positions] of byLine) {
  const sorted = [...positions].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) if (sorted[i] !== i + 1) errors.push(`line ${line}: positions must start at 1 and be contiguous`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Valid Mushaf page: ${file}`);
