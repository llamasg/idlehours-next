'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { type GameSlug } from '@/lib/ranks'
import { GAME_CONFIGS, type GameConfig } from '../lib/archiveAdapter'

const spring = 'cubic-bezier(0.34,1.5,0.64,1)'

interface GameTabsProps {
  activeGame: GameSlug
  onSelect: (slug: GameSlug) => void
}

export default function GameTabs({ activeGame, onSelect }: GameTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const activeIndex = GAME_CONFIGS.findIndex((c) => c.slug === activeGame)

  const updateIndicator = useCallback((index: number) => {
    const el = tabRefs.current[index]
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
  }, [])

  useEffect(() => {
    updateIndicator(activeIndex)
  }, [activeIndex, updateIndicator])

  return (
    <div
      className="relative inline-flex rounded-full bg-white/10 p-1"
      style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-full bg-white shadow-md"
        style={{
          left: indicator.left,
          width: indicator.width,
          transition: `left 0.3s ${spring}, width 0.3s ${spring}`,
        }}
      />

      {GAME_CONFIGS.map((cfg: GameConfig, i: number) => {
        const isActive = cfg.slug === activeGame
        return (
          <button
            key={cfg.slug}
            ref={(el) => { tabRefs.current[i] = el }}
            onClick={() => onSelect(cfg.slug)}
            className="relative z-10 rounded-full px-5 py-2 font-heading text-[13px] font-extrabold tracking-wide"
            style={{
              color: isActive ? '#2D6BC4' : 'rgba(255,255,255,0.7)',
              transition: 'color 0.2s ease',
            }}
          >
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}
