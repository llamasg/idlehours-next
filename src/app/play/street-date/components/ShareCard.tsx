'use client'

import { useState } from 'react'
import type { CoverAttempt, Wager } from '../lib/storage'
import { formatGameNumber } from '../lib/dateUtils'

interface ShareCardProps {
  dateStr: string
  answerYear: number
  score: number
  wager: Wager
  attempts: CoverAttempt[]
}

const WAGER_EMOJI: Record<Wager, string> = {
  low: '🛡️',
  mid: '🎯',
  high: '🔥',
}

export default function ShareCard({
  dateStr,
  score,
  wager,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  function buildShareText(): string {
    const number = formatGameNumber(dateStr)

    const lines: string[] = [
      `Street Date ${number} \u00b7 ${score}/1000 ${WAGER_EMOJI[wager]}`,
      'idlehours.co.uk/play/street-date',
    ]

    return lines.join('\n')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildShareText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Silently fail
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-full bg-[hsl(var(--game-blue))] px-6 py-2.5 font-heading text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
    >
      {copied ? 'Copied!' : 'Share Result'}
    </button>
  )
}
