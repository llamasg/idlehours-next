'use client'

import type { PortableTextBlock } from '@portabletext/types'
import { PortableText } from '@portabletext/react'

interface StickyNoteProps {
  /** Portable Text content from Sanity */
  content?: PortableTextBlock[]
  /** Simple text fallback (if not using Portable Text) */
  title?: string
  subtitle?: string
  body?: string
  /** Rotation in degrees — default -1 */
  rotate?: number
  className?: string
}

export default function StickyNote({
  content,
  title,
  subtitle,
  body,
  rotate = -1,
  className = '',
}: StickyNoteProps) {
  return (
    <div
      className={`relative flex-shrink-0 rounded-[4px_16px_16px_16px] p-5 shadow-[0_4px_14px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.08)] ${className}`}
      style={{
        backgroundColor: 'hsl(45 33% 93%)',
        backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.07) 1px, transparent 1px)',
        backgroundSize: '10px 10px',
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {/* Dog-ear fold */}
      <div
        className="absolute top-0 right-0 h-0 w-0"
        style={{
          borderStyle: 'solid',
          borderWidth: '0 18px 18px 0',
          borderColor: 'transparent hsl(42 25% 83%) transparent transparent',
          borderRadius: '0 16px 0 0',
        }}
      />
      <div
        className="absolute top-0 right-0 h-[18px] w-[18px] rounded-[0_16px_0_0]"
        style={{
          background: 'hsl(var(--background))',
          clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
        }}
      />

      {/* Content */}
      {content ? (
        <div className="sticky-note-content font-heading text-sm leading-relaxed text-foreground/80 [&_h2]:mb-1 [&_h2]:text-[15px] [&_h2]:font-black [&_h2]:text-foreground [&_h3]:mb-1 [&_h3]:text-[11px] [&_h3]:font-extrabold [&_h3]:uppercase [&_h3]:tracking-[0.2em] [&_h3]:text-foreground/50 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:marker:font-bold [&_ol]:marker:text-amber-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-amber-600">
          <PortableText value={content} />
        </div>
      ) : (
        <>
          {subtitle && (
            <p className="mb-1 font-heading text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50">
              {subtitle}
            </p>
          )}
          {title && (
            <p className="mb-1.5 font-heading text-[15px] font-black text-foreground">
              {title}
            </p>
          )}
          {body && (
            <p className="font-heading text-[12px] font-semibold leading-relaxed text-foreground/70">
              {body}
            </p>
          )}
        </>
      )}
    </div>
  )
}
