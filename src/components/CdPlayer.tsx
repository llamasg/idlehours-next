import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Disc3, X } from 'lucide-react'
import { getMusicTracks } from '@/lib/queries'
import type { MusicTrack } from '@/types'

// Local fallback tracks — used when Sanity CMS hasn't been deployed yet.
// Once musicTrack documents exist in Sanity, these are ignored.
const LOCAL_TRACKS: MusicTrack[] = [
  {
    _id: 'local-1',
    title: 'Twilight Serenity',
    artist: 'Genshin Impact OST',
    audioUrl: '/images/Twilight Serenity (Genshin Impact Main Theme Var.).mp3',
    coverArt: '/images/genshin.jpg',
  },
]

export default function CdPlayer() {
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [isMinimised, setIsMinimised] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentTrack = tracks[currentIndex] ?? null

  // Fetch tracks from Sanity, fall back to local tracks, then auto-play
  useEffect(() => {
    function loadAndPlay(data: MusicTrack[]) {
      setTracks(data)
      setLoaded(true)
      // Attempt auto-play (browsers may block without prior interaction)
      setIsPlaying(true)
    }

    getMusicTracks()
      .then((data) => {
        loadAndPlay(data && data.length > 0 ? data : LOCAL_TRACKS)
      })
      .catch(() => {
        loadAndPlay(LOCAL_TRACKS)
      })
  }, [])

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Play / pause
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false))
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentTrack])

  // When track changes, load new src
  useEffect(() => {
    if (!audioRef.current || !currentTrack?.audioUrl) return
    audioRef.current.src = currentTrack.audioUrl
    audioRef.current.load()
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentTrack?.audioUrl])

  const handlePlayPause = useCallback(() => {
    if (!currentTrack) return
    setIsPlaying((p) => !p)
  }, [currentTrack])

  const handlePrev = useCallback(() => {
    if (tracks.length === 0) return
    setCurrentIndex((i) => (i === 0 ? tracks.length - 1 : i - 1))
  }, [tracks.length])

  const handleNext = useCallback(() => {
    if (tracks.length === 0) return
    setCurrentIndex((i) => (i === tracks.length - 1 ? 0 : i + 1))
  }, [tracks.length])

  const handleEnded = useCallback(() => {
    handleNext()
  }, [handleNext])

  // Don't render until fetch attempt completes
  if (!loaded || tracks.length === 0) return null

  // Minimised state — small floating disc button
  if (isMinimised) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 80, bottom: 0 }}
        className="fixed bottom-6 right-6 z-[9999]"
        style={{ touchAction: 'none' }}
      >
        <button
          onClick={() => setIsMinimised(false)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3a2f2a] shadow-lg transition-transform hover:scale-110"
          title="Open CD Player"
        >
          <Disc3
            size={24}
            className="text-[#f5efe6]"
            style={isPlaying ? { animation: 'spin 3s linear infinite' } : undefined}
          />
        </button>
        <audio ref={audioRef} onEnded={handleEnded} preload="auto" />
      </motion.div>
    )
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{ left: -window.innerWidth + 320, right: 0, top: -window.innerHeight + 200, bottom: 0 }}
      className="fixed bottom-6 right-6 z-[9999] w-[300px] select-none overflow-hidden rounded-2xl bg-[#3a2f2a] shadow-2xl"
      style={{ touchAction: 'none' }}
    >
      <audio ref={audioRef} onEnded={handleEnded} preload="auto" />

      {/* Header / drag handle */}
      <div className="flex cursor-grab items-center justify-between border-b border-white/5 px-4 py-2 active:cursor-grabbing">
        <span className="font-heading text-[10px] font-semibold uppercase tracking-widest text-[#f5efe6]/50">
          Now Playing
        </span>
        <button
          onClick={() => setIsMinimised(true)}
          className="rounded p-0.5 text-[#f5efe6]/40 transition-colors hover:text-[#f5efe6]/80"
          title="Minimise"
        >
          <X size={14} />
        </button>
      </div>

      {/* Disc + Track info */}
      <div className="flex items-center gap-4 px-4 py-4">
        {/* Rotating disc */}
        <div className="relative h-16 w-16 shrink-0">
          <div
            className="h-full w-full rounded-full border-2 border-[#f5efe6]/10 bg-gradient-to-br from-[#2a2220] to-[#4a3f3a] shadow-inner"
            style={isPlaying ? { animation: 'spin 3s linear infinite' } : undefined}
          >
            {/* Cover art centre */}
            <div className="absolute inset-2 overflow-hidden rounded-full border border-[#f5efe6]/10">
              {currentTrack?.coverArt ? (
                <img
                  src={currentTrack.coverArt}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#4a3f3a]">
                  <Disc3 size={16} className="text-[#f5efe6]/30" />
                </div>
              )}
            </div>
            {/* Center hole */}
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3a2f2a] ring-1 ring-[#f5efe6]/10" />
          </div>
        </div>

        {/* Track info */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-semibold leading-tight text-[#f5efe6]">
            {currentTrack?.title || 'No track'}
          </p>
          <p className="mt-0.5 truncate text-xs text-[#f5efe6]/50">
            {currentTrack?.artist || 'Unknown artist'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="rounded-full p-1.5 text-[#f5efe6]/60 transition-colors hover:bg-white/5 hover:text-[#f5efe6]"
            title="Previous"
          >
            <SkipBack size={14} />
          </button>

          <button
            onClick={handlePlayPause}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5efe6]/10 text-[#f5efe6] transition-colors hover:bg-[#f5efe6]/20"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            className="rounded-full p-1.5 text-[#f5efe6]/60 transition-colors hover:bg-white/5 hover:text-[#f5efe6]"
            title="Next"
          >
            <SkipForward size={14} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="rounded p-1 text-[#f5efe6]/50 transition-colors hover:text-[#f5efe6]/80"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value))
              if (isMuted) setIsMuted(false)
            }}
            className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-[#f5efe6]/10 accent-[#f5efe6]/60"
          />
        </div>
      </div>
    </motion.div>
  )
}
