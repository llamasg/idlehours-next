'use client'

import { useState, useEffect, useRef } from 'react'

// Extracted from the removed GameEndModal.tsx — currently has no importers.
// Kept for the planned return of share UI with the game shell.

const spring = 'cubic-bezier(0.34, 1.5, 0.64, 1)'

export default function SplitShareButton({
  shareText,
  shareUrl,
  isWin,
  accentColor,
}: {
  shareText: string
  shareUrl: string
  isWin: boolean
  accentColor?: string
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [dropdownOpen])

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  function shareTwitter() {
    const text = encodeURIComponent(shareText)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener')
    setDropdownOpen(false)
  }

  function shareDiscord() {
    // Discord doesn't have a share intent — copy text formatted for Discord
    navigator.clipboard.writeText(shareText).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setDropdownOpen(false)
  }

  function shareEmail() {
    const subject = encodeURIComponent('My Game Sense Result')
    const body = encodeURIComponent(shareText)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self')
    setDropdownOpen(false)
  }

  const bg = isWin ? (accentColor ?? 'hsl(var(--game-blue))') : 'hsl(var(--game-ink-mid))'
  const shadowColor = isWin ? 'hsl(var(--game-ink))' : 'hsl(var(--game-ink))'

  return (
    <div ref={containerRef} className="relative inline-flex">
      {/* Primary action — copy to clipboard */}
      <button
        onClick={copyToClipboard}
        className="rounded-l-full py-3 pl-7 pr-5 font-heading text-[14px] font-[800] text-white"
        style={{
          background: bg,
          boxShadow: `0 5px 0 ${shadowColor}`,
          transition: `all 0.15s ${spring}`,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)' }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)' }}
      >
        {copied ? 'Copied!' : 'Share result'}
      </button>

      {/* Divider */}
      <div
        className="w-[1px] self-stretch bg-white/25"
        style={{ boxShadow: `0 5px 0 ${shadowColor}` }}
      />

      {/* Dropdown chevron */}
      <button
        className="rounded-r-full py-3 pl-3 pr-4 text-white"
        style={{
          background: shadowColor,
          boxShadow: `0 5px 0 ${shadowColor}`,
          transition: `all 0.15s ${spring}`,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.15)' }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)' }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="Share options"
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: `transform 0.2s ${spring}`, transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div
          className="absolute left-0 top-full z-50 mt-3 w-48 overflow-hidden rounded-xl border border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))] py-1 shadow-lg"
          style={{ animation: `dropdown-in 0.25s ${spring}` }}
        >
          <style>{`@keyframes dropdown-in { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
          {[
            { label: 'Copy result', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z', action: copyToClipboard },
            { label: 'Twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', action: shareTwitter },
            { label: 'Discord', icon: 'M20.317 4.37a19.791 19.791 0 00-4.885-1.515M6.568 2.855A19.791 19.791 0 001.683 4.37M8.5 14.5A1.5 1.5 0 1010 13a1.5 1.5 0 00-1.5 1.5zm7 0A1.5 1.5 0 1017 13a1.5 1.5 0 00-1.5 1.5z', action: shareDiscord },
            { label: 'Email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', action: shareEmail },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left font-heading text-[13px] font-semibold text-[hsl(var(--game-ink))] transition-colors hover:bg-[hsl(var(--game-cream))]"
            >
              <svg className="h-4 w-4 flex-shrink-0 text-[hsl(var(--game-ink-light))]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
