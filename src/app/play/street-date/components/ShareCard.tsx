'use client'

import { useState } from 'react'
import type { CoverAttempt } from '../lib/storage'
import { formatGameNumber } from '../lib/dateUtils'

interface ShareCardProps {
  dateStr: string
  answerYear: number
  stars: number
  attempts: CoverAttempt[]
}

export default function ShareCard({
  dateStr,
  stars,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  function buildShareText(): string {
    const number = formatGameNumber(dateStr)
    const starLine =
      '★'.repeat(stars) + '☆'.repeat(5 - stars) + ` · ${stars * 100} pts`

    const lines: string[] = [
      `Street Date ${number}`,
      starLine,
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
      // Fallback: silently fail if clipboard API unavailable
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-full bg-primary px-6 py-2.5 font-heading text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
    >
      {copied ? 'Copied!' : 'Share Result'}
    </button>
  )
}
