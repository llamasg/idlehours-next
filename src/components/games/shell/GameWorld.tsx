import type { CSSProperties, ReactNode } from 'react'

// The full-bleed game world container: per-game gradient plus the circle
// clip-path wipe entrance. The wipe mechanics were copy-pasted across the
// three daily games; the gradient and outer classes are per-game identity.

export default function GameWorld({
  gradient,
  wipeStarted,
  shouldAnimate,
  className = 'game-container mx-0 -mt-16 flex flex-1 flex-col rounded-none sm:mx-4 sm:mt-4 sm:rounded-[20px]',
  style,
  children,
}: {
  gradient: string
  wipeStarted: boolean
  /** false once the day is finished — renders fully revealed with no transition. */
  shouldAnimate: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <div
      className={className}
      style={{
        background: gradient,
        clipPath: (!shouldAnimate || wipeStarted) ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)',
        transition: shouldAnimate ? 'clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
