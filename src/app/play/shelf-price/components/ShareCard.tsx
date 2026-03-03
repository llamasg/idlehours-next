'use client'

import { useState } from 'react'
import { formatGameNumber } from '../lib/dateUtils'

interface ShareCardProps {
  dateStr: string
  stars: number
  actualPrice: number
}

export default function ShareCard({
  dateStr,
  stars,
  actualPrice,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  // Suppress unused variable warning — actualPrice is part of the interface
  // for potential future use in share text
  void actualPrice

  function buildShareText(): string {
    const number = formatGameNumber(dateStr)
    const starLine =
      '\u2605'.repeat(stars) +
      '\u2606'.repeat(5 - stars) +
      ` \u00b7 ${stars * 100} pts`

    const lines: string[] = [
      `Shelf Price ${number}`,
      starLine,
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
