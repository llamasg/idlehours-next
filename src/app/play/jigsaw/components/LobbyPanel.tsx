'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoom } from '../hooks/useRoom'

interface LobbyPanelProps {
  onClose: () => void
}

export default function LobbyPanel({ onClose }: LobbyPanelProps) {
  const router = useRouter()
  const { createRoom, joinRoom } = useRoom()
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    setLoading(true)
    setError('')
    const code = await createRoom()
    if (code) {
      router.push(`/play/jigsaw/${code}`)
    } else {
      setError('Failed to create room')
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase()
    if (!code) {
      setError('Enter a room code')
      return
    }
    setLoading(true)
    setError('')
    const room = await joinRoom(code)
    if (room) {
      router.push(`/play/jigsaw/${room.roomCode}`)
    } else {
      setError('Room not found')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="rounded-2xl p-6 shadow-2xl w-[320px]"
        style={{ background: '#F5EDE0' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-[#3D2E1A]">
            Multiplayer
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded text-[#8B7355] hover:text-[#3D2E1A] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2L8 8M8 2L2 8" />
            </svg>
          </button>
        </div>

        {/* Create room */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-heading uppercase tracking-wider font-medium text-[#F5EDE0] transition-colors disabled:opacity-50"
          style={{ background: '#3D2E1A' }}
        >
          {loading ? 'Creating...' : 'Create Room'}
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[#D4C5A9]" />
          <span className="text-xs text-[#8B7355] uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-[#D4C5A9]" />
        </div>

        {/* Join room */}
        <div className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value.toUpperCase())
              setError('')
            }}
            placeholder="Room code"
            maxLength={8}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-mono uppercase text-[#3D2E1A] border border-[#D4C5A9] bg-white/60 placeholder:text-[#B5A88A] focus:outline-none focus:border-[#C4913A]"
          />
          <button
            onClick={handleJoin}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-heading uppercase tracking-wider font-medium border border-[#3D2E1A] text-[#3D2E1A] hover:bg-[#3D2E1A] hover:text-[#F5EDE0] transition-colors disabled:opacity-50"
          >
            Join
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-600 mt-2">{error}</p>
        )}
      </div>
    </div>
  )
}
