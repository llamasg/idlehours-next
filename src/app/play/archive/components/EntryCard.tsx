'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { type GameSlug } from '@/lib/ranks'
import { type ArchiveEntry } from '../lib/archiveAdapter'
import { entrance, useEntranceSteps } from '@/lib/animations'

interface EntryCardProps {
  entry: ArchiveEntry
  gameSlug: GameSlug
  gameLabel: string
  playUrl: string
}

// ── Roller ───────────────────────────────────────────────────────────────────
// Clips a single line of text. When `value` changes, the old text rolls out
// and the new text rolls in (direction controlled by `up` prop).

const ROLL_MS = 280
const ROLL_EASE = 'cubic-bezier(0.22,1,0.36,1)'

function Roller({
  value,
  up,
  className,
  style,
}: {
  value: string
  up: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const [items, setItems] = useState<{ val: string; id: number }[]>([{ val: value, id: 0 }])
  const idRef = useRef(0)
  const prevRef = useRef(value)
  const mounted = useRef(false)

  useEffect(() => {
    // Skip animation on first mount
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (value === prevRef.current) return

    idRef.current++
    const newId = idRef.current
    setItems((prev) => [...prev, { val: value, id: newId }])
    prevRef.current = value

    const timer = setTimeout(() => {
      setItems((cur) => cur.filter((item) => item.id === newId))
    }, ROLL_MS + 50)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <span
      className={`relative inline-flex overflow-hidden align-bottom ${className ?? ''}`}
      style={{ height: '1.3em', ...style }}
    >
      {items.map((item, i) => {
        const isLatest = i === items.length - 1
        const isOld = !isLatest

        let animation: string | undefined
        if (items.length > 1) {
          if (isOld) {
            animation = `${up ? 'ih-roll-out-up' : 'ih-roll-out-down'} ${ROLL_MS}ms ${ROLL_EASE} both`
          } else {
            animation = `${up ? 'ih-roll-in-up' : 'ih-roll-in-down'} ${ROLL_MS}ms ${ROLL_EASE} both`
          }
        }

        return (
          <span
            key={item.id}
            className={isOld ? 'absolute inset-x-0 top-0' : 'relative'}
            style={{ animation, lineHeight: '1.3' }}
          >
            {item.val}
          </span>
        )
      })}
    </span>
  )
}

// ── EntryCard ────────────────────────────────────────────────────────────────

const FIRST_MOUNT_GAPS = [0, 100, 100, 100]

export default function EntryCard({ entry, gameSlug, gameLabel, playUrl }: EntryCardProps) {
  const [hasInitialized, setHasInitialized] = useState(false)
  const prevEntryRef = useRef(entry)

  // Direction: newer entry (earlier date) = roll up, older = roll down
  const rollUp = entry.date > prevEntryRef.current.date

  useEffect(() => {
    prevEntryRef.current = entry
  }, [entry])

  // First mount entrance animation
  const step = useEntranceSteps(4, FIRST_MOUNT_GAPS, !hasInitialized)
  useEffect(() => {
    if (!hasInitialized) {
      const t = setTimeout(() => setHasInitialized(true), 400)
      return () => clearTimeout(t)
    }
  }, [hasInitialized])

  const isFirst = !hasInitialized

  // Split displayDate into parts for per-word rolling
  // Format: "Mon 9th Mar 2026"
  const dateParts = entry.displayDate.split(' ')

  const stripeColor = entry.won
    ? '#4a8fe8'
    : entry.played && entry.finished
      ? '#e85a5a'
      : '#6c63d4'

  // Unified score display — always same layout, only numbers change
  const isShelfPrice = gameSlug === 'shelf-price'
  const scoreNum = isShelfPrice
    ? String(entry.played && entry.finished ? entry.streak : 0)
    : String(entry.score || 0)
  const scoreSuffix = isShelfPrice ? '/10' : 'pts'
  const scoreColor = entry.won
    ? 'text-emerald-600'
    : entry.played && entry.finished && !entry.won
      ? 'text-red-500'
      : 'text-slate-300'
  const rankText = entry.rank || (entry.played && !entry.finished ? 'In progress' : 'Not played yet')
  const rankColor = entry.rank ? 'text-slate-500' : 'text-slate-400'

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: 'rgba(255,255,255,0.96)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        ...(isFirst ? entrance('slide-up', step >= 1) : {}),
      }}
    >
      {/* Colour stripe — transitions between states */}
      <div
        className="h-1"
        style={{
          backgroundColor: stripeColor,
          transition: 'background-color 0.4s ease',
        }}
      />

      <div className="px-5 py-5">
        {/* Eyebrow — static after first mount */}
        <div
          className="font-heading text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400"
          style={isFirst ? entrance('fade', step >= 2) : {}}
        >
          {gameLabel}
        </div>

        {/* Date — roller for each word that changes */}
        <div
          className="mt-1 font-heading text-[22px] font-black leading-tight tracking-tight text-slate-800"
          style={isFirst ? entrance('fade', step >= 2, 50) : {}}
        >
          {hasInitialized ? (
            <span className="flex gap-[0.25em]">
              {dateParts.map((part, i) => (
                <Roller key={i} value={part} up={rollUp} />
              ))}
            </span>
          ) : (
            entry.displayDate
          )}
        </div>

        {/* Game number — roller */}
        <div
          className="font-heading text-[13px] font-bold text-slate-400"
          style={isFirst ? entrance('fade', step >= 2, 50) : {}}
        >
          {hasInitialized ? (
            <Roller value={entry.gameNumber} up={rollUp} />
          ) : (
            entry.gameNumber
          )}
        </div>

        {/* Divider */}
        <div
          className="my-4 border-t border-dashed border-slate-200"
          style={isFirst ? entrance('fade', step >= 3) : {}}
        />

        {/* Score + rank — unified layout, rollers for changing values */}
        <div style={isFirst ? entrance('fade', step >= 3, 50) : {}}>
          <div className="flex items-baseline justify-between">
            <span className={`font-heading font-black ${scoreColor}`} style={{ transition: 'color 0.3s ease' }}>
              {hasInitialized ? (
                <Roller
                  value={scoreNum}
                  up={rollUp}
                  className="text-[28px]"
                />
              ) : (
                <span className="text-[28px]">{scoreNum}</span>
              )}
              <span className="ml-1 text-[16px] font-bold opacity-60">{scoreSuffix}</span>
            </span>
            <div className="text-right">
              <div className="font-heading text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Rank
              </div>
              <span
                className={`font-heading text-[13px] font-bold ${rankColor}`}
                style={{ transition: 'color 0.3s ease' }}
              >
                {hasInitialized ? (
                  <Roller value={rankText} up={rollUp} />
                ) : (
                  rankText
                )}
              </span>
            </div>
          </div>
          <div className="mt-0.5 font-heading text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Points scored
          </div>
        </div>

        {/* Divider */}
        <div
          className="my-4 border-t border-dashed border-slate-200"
          style={isFirst ? entrance('fade', step >= 4) : {}}
        />

        {/* CTA button — stays in place, content swaps instantly */}
        <div style={isFirst ? entrance('slide-up', step >= 4, 50) : {}}>
          <Link
            href={playUrl}
            className="bvl-blue w-full justify-center !gap-1.5 text-[12px]"
          >
            <Image
              src={
                entry.played && entry.finished
                  ? '/images/icons/icon_search-lookup-find.svg'
                  : '/images/icons/icon_Target-aim-practice-games-play.svg'
              }
              alt=""
              width={14}
              height={14}
              className="invert"
            />
            {entry.played && entry.finished ? 'View results' : 'Play'}
          </Link>
        </div>
      </div>
    </div>
  )
}
