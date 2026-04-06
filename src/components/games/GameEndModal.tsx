'use client'

import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react'
import { type GameSlug, GAME_COLORS } from '@/lib/ranks'

// ── Badge image paths ───────────────────────────────────────────────────────

const BADGE_IMAGES: Record<string, string> = {
  // Game Sense
  'Skill Issue': '/images/badges/game-sense-skill-issue.png',
  'Button Masher': '/images/badges/game-sense-button-masher.png',
  'Big Brain': '/images/badges/game-sense-big-brain.png',
  // Shelf Price
  'Moms Credit Card': '/images/badges/shelf-price-moms-credit-card.png',
  'Bargain Hunter': '/images/badges/shelf-price-bargain-hunter.png',
  'Secret Shopper': '/images/badges/shelf-price-secret-shopper.png',
  'Head of Sales': '/images/badges/shelf-price-head-of-sales.png',
  // Street Date
  'Newbie': '/images/badges/street-date-newbie.png',
}

// ── Types ────────────────────────────────────────────────────────────────────

interface GameEndModalProps {
  game?: GameSlug
  result: 'win' | 'loss'
  score: number
  heading: string
  subheading: string
  rankName: string
  rankFlavour: string
  stats: { label: string; value: string }[]
  heroZone: ReactNode
  /** Optional row of pips (Shelf Price) */
  pipRow?: ReactNode
  /** Legacy: simple share callback (copies to clipboard) */
  onShare?: () => void
  /** New: provide share text and get split action button with multiple share channels */
  shareText?: string
  /** URL to share (used for Twitter/Discord/Email links) */
  shareUrl?: string
  onClose: () => void
}

const spring = 'cubic-bezier(0.34, 1.5, 0.64, 1)'

// ── Confetti ─────────────────────────────────────────────────────────────────

const DEFAULT_CONFETTI = ['#4A8FE8', '#C8873A', '#27A85A', '#F0EBE0', '#2D6BC4']

function Confetti({ colours = DEFAULT_CONFETTI }: { colours?: string[] }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        size: 4 + Math.random() * 8,
        colour: colours[i % colours.length],
        shape: (i % 2 === 0 ? 'square' : 'circle') as 'square' | 'circle',
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-x-0 -top-10 z-10 h-[300px] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-[confetti-fall_2.5s_ease-in_forwards]"
          style={{
            left: `${p.left}%`,
            top: '-5%',
            width: p.size,
            height: p.size,
            backgroundColor: p.colour,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  )
}

// ── Split Share Button ───────────────────────────────────────────────────────

function SplitShareButton({
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

// ── GameEndModal ─────────────────────────────────────────────────────────────

export default function GameEndModal({
  game = 'game-sense',
  result,
  score,
  heading,
  subheading,
  rankName,
  rankFlavour,
  stats,
  heroZone,
  pipRow,
  onShare,
  shareText,
  shareUrl = 'https://idlehours.co.uk/play/game-sense',
  onClose,
}: GameEndModalProps) {
  const colors = GAME_COLORS[game]
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const isWin = result === 'win'

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative mx-4 w-full max-w-[540px]">
        {/* Close button — top right */}
        <button
          onClick={onClose}
          className="absolute -right-2 -top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[hsl(var(--game-ink-mid))] shadow-lg backdrop-blur-sm transition-colors hover:bg-white hover:text-[hsl(var(--game-ink))]"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Confetti — win only */}
        {isWin && <Confetti colours={colors.confetti} />}

        <div
          className={`relative overflow-visible rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.25),0_4px_16px_rgba(0,0,0,0.1)] ${
            isWin ? 'bg-[hsl(var(--game-white))]' : 'bg-[hsl(var(--game-cream))]'
          }`}
        >
          {/* Hero zone — clipped to card corners */}
          {heroZone && (
            <div className="overflow-hidden rounded-t-3xl">
              {heroZone}
            </div>
          )}

          {/* Modal body */}
          <div className="flex flex-col items-center gap-4 px-6 pb-7 pt-5 text-center">
            {/* Result heading */}
            <div>
              <h2 className="font-heading text-[26px] font-black leading-tight text-[hsl(var(--game-ink))]">
                {heading}
              </h2>
              <p className="mt-1 text-sm font-semibold text-[hsl(var(--game-ink-mid))]">
                {subheading}
              </p>
            </div>

            {/* Score pill */}
            <div
              className={`inline-flex items-baseline gap-1.5 rounded-full border-2 px-5 py-2 ${
                isWin
                  ? 'border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-white))]'
                  : 'border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream-mid))]'
              }`}
            >
              <span
                className="font-heading text-[28px] font-black"
                style={{ color: isWin ? colors.accent : 'hsl(var(--game-ink-mid))' }}
              >
                {score}
              </span>
              <span className="font-heading text-xs font-semibold tracking-[0.1em] text-[hsl(var(--game-ink-light))]">
                PTS
              </span>
            </div>

            {/* Rank badge block */}
            <div className="flex flex-col items-center gap-2">
              {BADGE_IMAGES[rankName] ? (
                <div
                  className="flex h-24 w-24 items-center justify-center"
                  style={isWin ? { animation: 'badge-pulse 1.2s ease-out forwards' } : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={BADGE_IMAGES[rankName]} alt={rankName} className="h-full w-full object-contain" />
                </div>
              ) : (
                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-[0.05em] text-white/40 ${
                    !isWin ? 'bg-[hsl(var(--game-ink-light))]' : ''
                  }`}
                  style={isWin ? {
                    backgroundColor: colors.accent,
                    boxShadow: `0 0 32px ${colors.shadow}`,
                    animation: 'badge-pulse 1.2s ease-out forwards',
                  } : undefined}
                >
                  BADGE
                </div>
              )}
              <p
                className="font-heading text-lg font-black tracking-[0.02em]"
                style={{ color: isWin ? colors.accent : 'hsl(var(--game-ink-mid))' }}
              >
                {rankName}
              </p>
              <p className="-mt-1 text-[13px] font-semibold italic text-[hsl(var(--game-ink-mid))]">
                {rankFlavour}
              </p>
            </div>

            {/* Divider */}
            <div className="-mx-6 h-px w-[calc(100%+48px)] bg-[hsl(var(--game-ink))]/10" />

            {/* Stat row */}
            <div className="flex w-full gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`flex flex-1 flex-col items-center gap-px rounded-full py-2 ${
                    isWin ? 'bg-[hsl(var(--game-cream))]' : 'bg-[hsl(var(--game-cream-dark))]'
                  }`}
                >
                  <span className="font-heading text-[15px] font-extrabold text-[hsl(var(--game-ink))]">
                    {stat.value}
                  </span>
                  <span className="font-heading text-[9px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--game-ink-light))]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Pip row (Shelf Price only) */}
            {pipRow}

            {/* Share button — split action or legacy */}
            {shareText ? (
              <SplitShareButton shareText={shareText} shareUrl={shareUrl} isWin={isWin} accentColor={colors.accent} />
            ) : onShare ? (
              <button
                onClick={onShare}
                className={`w-full rounded-full py-3.5 font-heading text-[15px] font-extrabold tracking-[0.04em] text-white transition-all hover:-translate-y-0.5 ${
                  !isWin ? 'bg-[hsl(var(--game-ink-mid))]' : ''
                }`}
                style={isWin ? {
                  backgroundColor: colors.accent,
                  boxShadow: `0 4px 16px ${colors.shadow}`,
                } : undefined}
              >
                Share Result
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
