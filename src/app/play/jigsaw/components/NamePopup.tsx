'use client'

import { useState } from 'react'
import ColorPicker from './ColorPicker'
import type { ColorResult } from 'react-color'

interface NamePopupProps {
  initialName: string
  guestColor: string
  onSubmit: (name: string, color: string) => void
}

export default function NamePopup({ initialName, guestColor, onSubmit }: NamePopupProps) {
  const [name, setName] = useState(initialName)
  const [color, setColor] = useState(guestColor)
  const [showPicker, setShowPicker] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(name.trim(), color)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl p-6 shadow-2xl w-[320px]"
        style={{ background: '#F5EDE0' }}
      >
        <h2 className="font-heading text-base font-bold text-[#3D2E1A] mb-1">
          What should we call you?
        </h2>
        <p className="text-xs text-[#8B7355] mb-4">
          Other players will see this name and colour.
        </p>

        {/* Name + color dot */}
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setShowPicker(v => !v)}
            className="w-7 h-7 rounded-full shrink-0 border-2 border-[#D4C5A9] hover:border-[#C4913A] transition-colors"
            style={{ background: color }}
            title="Pick a colour"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={20}
            autoFocus
            className="flex-1 rounded-lg border border-[#D4C5A9] bg-white px-3 py-1.5 text-sm text-[#3D2E1A] outline-none focus:border-[#C4913A] transition-colors"
          />
        </div>

        {/* Color picker (collapsible) */}
        {showPicker && (
          <div className="mb-3 rounded-lg border border-[#D4C5A9] bg-white p-3">
            <ColorPicker
              color={color}
              onChangeComplete={(c: ColorResult) => setColor(c.hex)}
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-lg py-2 text-sm font-medium text-[#F5EDE0] transition-colors hover:opacity-90"
          style={{ background: '#3D2E1A' }}
        >
          {name.trim() ? 'Join as ' + name.trim() : 'Join anonymously'}
        </button>
      </form>
    </div>
  )
}
