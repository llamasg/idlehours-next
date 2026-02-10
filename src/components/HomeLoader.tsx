import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HomeLoaderProps {
  onComplete: () => void
}

export default function HomeLoader({ onComplete }: HomeLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [contentFaded, setContentFaded] = useState(false)
  const [curtainsOpen, setCurtainsOpen] = useState(false)

  // Counter 0 → 100
  useEffect(() => {
    let frame: number
    const start = performance.now()
    const duration = 2000

    function tick(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(Math.round(eased * 100))

      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        // At 100%: fade out leaf + text, then open curtains
        setTimeout(() => setContentFaded(true), 200)
        setTimeout(() => setCurtainsOpen(true), 700)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!curtainsOpen ? (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[99999] overflow-hidden"
        >
          {/* Left curtain */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-background"
            initial={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Right curtain */}
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-background"
            initial={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Centred content (leaf + counter) — fades out before curtains part */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="flex flex-col items-center"
              animate={{ opacity: contentFaded ? 0 : 1 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              {/* Floating leaf */}
              <motion.img
                src="/images/leaf.png"
                alt=""
                className="mb-6 h-16 w-16"
                style={{ imageRendering: 'pixelated' }}
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Counter */}
              <span className="font-heading text-4xl font-bold text-accent tabular-nums">
                {progress}%
              </span>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        /* Curtains splitting apart */
        <motion.div
          key="curtains"
          className="fixed inset-0 z-[99999] overflow-hidden pointer-events-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1, delay: 1.8 }}
        >
          {/* Left curtain — slides off left */}
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-background"
            initial={{ x: 0 }}
            animate={{ x: '-100%' }}
            transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Right curtain — slides off right */}
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-background"
            initial={{ x: 0 }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={onComplete}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
