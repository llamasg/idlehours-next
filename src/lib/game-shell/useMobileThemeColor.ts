import { useEffect } from 'react'

// Mobile status-bar treatment for the game worlds: solid body background on
// small screens (iOS safe-area) + theme-color meta. Was duplicated
// line-for-line in the game-sense and street-date pages (bar the hex);
// shelf-price lacked it entirely.
//
// One fix over the originals: the media-query listener is now removed with
// the same function reference it was added with (the originals passed a
// fresh arrow function to removeEventListener, so the listener leaked).

const RESTORE_HEX = '#f5f0e8'

export function useMobileThemeColor(hex: string) {
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const prevBg = document.body.style.backgroundColor

    const applyMobileBg = (mobile: boolean) => {
      document.body.style.backgroundColor = mobile ? hex : prevBg
    }
    const onChange = (e: MediaQueryListEvent) => applyMobileBg(e.matches)

    applyMobileBg(mq.matches)
    mq.addEventListener('change', onChange)

    // Theme-color meta for iOS status bar (always set — only iOS uses it)
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove())
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = hex
    document.head.appendChild(meta)

    return () => {
      document.body.style.backgroundColor = prevBg
      mq.removeEventListener('change', onChange)
      meta.remove()
      const restore = document.createElement('meta')
      restore.name = 'theme-color'
      restore.content = RESTORE_HEX
      document.head.appendChild(restore)
    }
  }, [hex])
}
