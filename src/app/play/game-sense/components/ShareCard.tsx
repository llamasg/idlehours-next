'use client'

import { useState } from 'react'
import type { GuessRecord } from '../lib/storage'
import { formatGameNumber } from '../lib/dateUtils'

interface ShareCardProps {
  dateStr: string
  gameTitle: string
  score: number
  guesses: GuessRecord[]
  lifelinesUsedCount: number
}

function proximityEmoji(proximity: number): string {
  if (proximity <= 100) return '🟩'
  if (proximity <= 300) return '🟨'
  if (proximity <= 600) return '🟧'
  return '🟥'
}

export default function ShareCard({
  dateStr,
  gameTitle,
  score,
  guesses,
  lifelinesUsedCount,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  function buildShareText(): string {
    const number = formatGameNumber(dateStr)
    const emojiRow = guesses.map((g) => proximityEmoji(g.proximity)).join('')

    const lines: string[] = [
      `Game Sense ${number} \u00b7 ${score}/1000`,
      emojiRow,
    ]

    if (lifelinesUsedCount > 0) {
      lines.push(`${guesses.length} guesses \u00b7 ${lifelinesUsedCount} lifelines`)
    } else {
      lines.push(`${guesses.length} guesses`)
    }

    lines.push('idlehours.co.uk/play/game-sense')

    return lines.join('\n')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildShareText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: silently fail if clipboard API unavailable
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-full bg-primary px-6 py-2.5 font-heading text-sm font-semibold text-white transition-transform hover:scale-105"
    >
      {copied ? 'Copied!' : 'Share Result'}
    </button>
  )
}
