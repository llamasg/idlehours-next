'use client'

import { useState, useEffect, useCallback } from 'react'

const ID_KEY = 'jigsaw_guest_id'
const NAME_KEY = 'jigsaw_guest_name'
const COLOR_KEY = 'jigsaw_guest_color'

const PALETTE = [
  '#E67E22', // orange
  '#3498DB', // blue
  '#2ECC71', // green
  '#9B59B6', // purple
  '#E74C3C', // red
  '#1ABC9C', // teal
  '#F1C40F', // yellow
  '#E84393', // pink
]

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function generateGuestId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `guest_${code}`
}

export function useGuestId() {
  const [guestId, setGuestId] = useState('')
  const [guestColor, setGuestColor] = useState(PALETTE[0])
  const [guestName, setGuestNameState] = useState('')

  useEffect(() => {
    let id = localStorage.getItem(ID_KEY)
    if (!id) {
      id = generateGuestId()
      localStorage.setItem(ID_KEY, id)
    }
    setGuestId(id)

    const savedColor = localStorage.getItem(COLOR_KEY)
    setGuestColor(savedColor || PALETTE[hashCode(id) % PALETTE.length])

    const name = localStorage.getItem(NAME_KEY) || ''
    setGuestNameState(name)
  }, [])

  const setGuestName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 20)
    setGuestNameState(trimmed)
    localStorage.setItem(NAME_KEY, trimmed)
  }, [])

  const setGuestColorPersist = useCallback((color: string) => {
    setGuestColor(color)
    localStorage.setItem(COLOR_KEY, color)
  }, [])

  /** Display name: custom name or fallback to the ID suffix */
  const displayName = guestName || guestId.replace('guest_', '')

  return { guestId, guestColor, guestName, displayName, setGuestName, setGuestColor: setGuestColorPersist }
}
