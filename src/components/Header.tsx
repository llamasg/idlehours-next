'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { AnimatePresence, motion } from 'framer-motion'

const NAV_LINKS = [
  { label: 'POSTS', href: '/blog', icon: '/images/IH_ICON_PENCIL.svg' },
  { label: 'PLAY', href: '/play/game-sense', icon: '/images/IH_ICON_GAME.svg' },
  { label: 'LIBRARY', href: '/games', icon: '/images/IH_ICON_READ.svg' },
  { label: 'ABOUT', href: '/about', icon: '/images/IH_ICON_HAND.svg' },
]

const PILL_STYLE = {
  background: 'rgba(0,0,0,0.18)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
} as const

export default function Header({ transparent = false }: { transparent?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === 'dark'
  const hasClickedTheme = useRef(false)

  useEffect(() => {
    if (!transparent) return
    const handler = (e: Event) =>
      setScrollProgress((e as CustomEvent).detail.progress)
    window.addEventListener('parallax-scroll', handler)
    return () => window.removeEventListener('parallax-scroll', handler)
  }, [transparent])

  const t = transparent ? Math.min(scrollProgress * 3, 1) : 1
  const pillStyle = transparent
    ? ({
        background: `rgba(0,0,0,${0.18 * t})`,
        backdropFilter: `blur(${14 * t}px)`,
        WebkitBackdropFilter: `blur(${14 * t}px)`,
        border: `1px solid rgba(255,255,255,${0.1 * t})`,
        boxShadow: `0 4px 24px rgba(0,0,0,${0.08 * t})`,
      } as const)
    : PILL_STYLE

  return (
    <>
      {/* Spacer — reserves space in the document flow for the fixed header */}
      {!transparent && <div className="h-16" />}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          {/* Logo pill — desktop: wide text, mobile: circular icon */}
          <Link
            href="/"
            className="shrink-0 flex items-center rounded-full"
            style={pillStyle}
          >
            {/* Desktop: wide text logo, white */}
            <div className="hidden md:flex items-center px-6 py-3">
              <img
                src="/images/icons/icon_Idlehours logo horizontal-wide-mobile header.svg"
                alt="Idle Hours"
                className="h-6 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
                draggable={false}
              />
            </div>
            {/* Mobile/tablet: icon logo in perfect circle */}
            <div className="flex md:hidden items-center justify-center w-11 h-11">
              <img
                src="/images/IH_ICON_LOGO.svg"
                alt="Idle Hours"
                className="h-6 w-6"
                style={{ filter: 'brightness(0) invert(1)' }}
                draggable={false}
              />
            </div>
          </Link>

          {/* Nav pill — desktop */}
          <nav
            className="hidden md:flex items-center gap-6 rounded-full px-2 py-2 absolute left-1/2 -translate-x-1/2"
            style={pillStyle}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-white/70 transition-colors hover:text-white hover:bg-white/10"
              >
                <img
                  src={link.icon}
                  alt=""
                  className="h-5 w-5"
                  style={{ filter: 'brightness(0) invert(1)' }}
                  draggable={false}
                />
                <span className="font-heading text-sm font-bold tracking-[0.1em]">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Theme toggle pill — desktop */}
          <button
            onClick={() => { hasClickedTheme.current = true; setTheme(isDark ? 'light' : 'dark') }}
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full overflow-hidden text-white/70 transition-colors hover:text-white"
            style={pillStyle}
            aria-label="Toggle theme"
          >
            {mounted && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? 'dark' : 'light'}
                  initial={hasClickedTheme.current ? { y: 20, opacity: 0 } : false}
                  animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 12 } }}
                  exit={{ y: [0, 4, -20], opacity: [1, 1, 0], transition: { duration: 0.35, times: [0, 0.3, 1] } }}
                  className="flex items-center justify-center"
                >
                  {isDark ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="5" />
                      <path strokeLinecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </button>

          {/* Burger pill — mobile */}
          <button
            className="relative z-[60] flex items-center justify-center rounded-full p-2.5 md:hidden"
            style={pillStyle}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Full-screen mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] flex flex-col items-center justify-between bg-background px-6 py-8 md:hidden"
          >
            {/* Close button — top right */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-5 rounded-full p-2 text-foreground/60 transition-colors hover:text-foreground hover:bg-secondary"
              aria-label="Close menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Top — wide logo centered */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="mt-12"
            >
              <img
                src="/images/icons/icon_Idlehours logo horizontal-wide-mobile header.svg"
                alt="Idle Hours"
                className="h-7 w-auto opacity-70 dark:invert"
                draggable={false}
              />
            </motion.div>

            {/* Center — nav links stacked and centered */}
            <nav className="flex flex-col items-center gap-2">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-6 py-3 text-foreground transition-colors hover:bg-secondary"
                  >
                    <img
                      src={link.icon}
                      alt=""
                      className="h-5 w-5 opacity-60 dark:invert"
                      draggable={false}
                    />
                    <span className="font-heading text-lg font-bold tracking-[0.12em]">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Bottom — theme toggle + social links centered */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              className="flex items-center gap-5"
            >
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Toggle theme"
              >
                {mounted && (isDark ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" />
                    <path strokeLinecap="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                ))}
              </button>
              <a
                href="https://www.instagram.com/idlehourshq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@idlehourshq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="YouTube"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
