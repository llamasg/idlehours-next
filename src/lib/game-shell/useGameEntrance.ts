import { useEffect, useRef, useState } from 'react'
import { ENTRANCE_TIMINGS } from '@/lib/gameConstants'

// The entrance step machine shared by the three daily games:
// circle wipe starts on a double-rAF, then six timed steps from
// ENTRANCE_TIMINGS. Skipped entirely (step 6 immediately) when the day is
// already finished or the user prefers reduced motion.
//
// Step meanings (by page convention):
// 0 waiting · 1 title word-pops · 2 title up + game area scales in
// 3 game content · 4 input/score · 5 rest fades in · 6 done

export function useGameEntrance(ready: boolean, alreadyDone: boolean) {
  const [entranceStep, setEntranceStep] = useState(0)
  const [wipeStarted, setWipeStarted] = useState(false)
  const triggered = useRef(false)

  useEffect(() => {
    if (!ready || triggered.current) return
    triggered.current = true

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (alreadyDone || reducedMotion) {
      setWipeStarted(true)
      setEntranceStep(6)
      return
    }

    requestAnimationFrame(() => requestAnimationFrame(() => setWipeStarted(true)))
    const timers = ENTRANCE_TIMINGS.map((ms, i) =>
      setTimeout(() => setEntranceStep(i + 1), ms),
    )
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return { entranceStep, wipeStarted }
}
