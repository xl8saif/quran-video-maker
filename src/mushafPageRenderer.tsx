import React from 'react'
import type { QuranWord } from './quranData'

export type MushafLine = { lineNumber: number; words: QuranWord[] }

export function groupWordsIntoLines(words: QuranWord[]): MushafLine[] {
  const groups = new Map<number, QuranWord[]>()
  for (const word of words) {
    const line = word.line ?? 1
    const current = groups.get(line) ?? []
    current.push(word)
    groups.set(line, current)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([lineNumber, lineWords]) => ({ lineNumber, words: lineWords }))
}

type Props = {
  words: QuranWord[]
  activeWordIndex?: number
  activeLine?: number
  highlightColor?: string
  highlightOpacity?: number
  dir?: 'rtl' | 'ltr'
}

export function MushafPageRenderer({
  words,
  activeWordIndex = -1,
  activeLine = -1,
  highlightColor = '#d9bd63',
  highlightOpacity = 0.22,
  dir = 'rtl',
}: Props) {
  const lines = groupWordsIntoLines(words)
  let flatIndex = 0

  return (
    <div className="mushaf-rendered-page" dir={dir}>
      {lines.map((line) => {
        const lineStart = flatIndex
        flatIndex += line.words.length
        const active = line.lineNumber === activeLine
        return (
          <div
            key={line.lineNumber}
            className={`mushaf-line ${active ? 'is-active' : ''}`}
            style={active ? { backgroundColor: hexToRgba(highlightColor, highlightOpacity) } : undefined}
            data-line-number={line.lineNumber}
          >
            {line.words.map((word, index) => {
              const wordIndex = lineStart + index
              const wordActive = wordIndex === activeWordIndex
              return (
                <span key={`${word.verseKey}-${word.index}`} className={`mushaf-word ${wordActive ? 'is-active-word' : ''}`}>
                  {word.text}{' '}
                </span>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace('#', '')
  const normalized = value.length === 3 ? value.split('').map((x) => x + x).join('') : value
  const number = Number.parseInt(normalized, 16)
  const r = (number >> 16) & 255
  const g = (number >> 8) & 255
  const b = number & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
