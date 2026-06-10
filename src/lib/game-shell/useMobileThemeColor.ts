import { useEffect } from 'react'

// Mobile status-bar treatment for the game worlds: solid body background on
// small screens (iOS safe-area) + theme-color meta. Was duplicated
// line-for-line in the game-sense and street-date pages (bar the hex);
// shelf-price lacked it entirely.
//
// IMPORTANT: Next.js renders and OWNS the <meta name="theme-color"> node
// (viewport.themeColor in the root/game layouts). This hook must only update
// that node's content attribute IN PLACE — removing or replacing the node
// breaks Next's head reconciliation on navigation with
// "Cannot read properties of null (reading 'removeChild')", which surfaced
// as nav-pill clicks needing a double click.

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

    // Update the existing Next-managed meta in place; only create one if
    // somehow absent (root layout always renders one), and only ever remove
    // a node this hook itself created.
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    let created = false
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
      created = true
    }
    const prevContent = meta.getAttribute('content')
    meta.setAttribute('content', hex)

    return () => {
      document.body.style.backgroundColor = prevBg
      mq.removeEventListener('change', onChange)
      if (created) {
        meta.remove()
      } else if (document.head.contains(meta)) {
        meta.setAttribute('content', prevContent ?? RESTORE_HEX)
      }
    }
  }, [hex])
}
