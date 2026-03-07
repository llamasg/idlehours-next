'use client'

import { useState } from 'react'
import { formatGameNumber } from '../lib/dateUtils'

interface ShareCardProps {
  dateStr: string
  score: number
  streak: number
  won: boolean
}

export default function ShareCard({ dateStr, score, streak, won }: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  function buildShareText(): string {
    const number = formatGameNumber(dateStr)

    const lines: string[] = [
      `Shelf Price ${number} \u00b7 ${score}/1000`,
      `${streak}/10 correct${won ? ' \u00b7 Perfect! \ud83c\udfc6' : ''}`,
      'idlehours.co.uk/play/shelf-price',
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
