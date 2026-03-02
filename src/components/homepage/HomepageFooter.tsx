'use client'

import { useState } from 'react'
import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Posts', href: '/blog' },
  { label: 'Play', href: '/play/skill-issue' },
  { label: 'Library', href: '/games' },
  { label: 'About', href: '/about' },
  { label: 'Quizzes', href: '/quizzes' },
]

export default function HomepageFooter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <footer className="border-t border-border/60 mt-16">
      <div className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <img
              src="/images/icons/icon_Idlehours logo horizontal-wide-mobile header.svg"
              alt="Idle Hours"
              className="h-6 w-auto dark:invert"
              draggable={false}
            />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A cozy games blog for people who play games to feel something.
            </p>
          </div>

          {/* Nav links */}
          <nav>
            <h4 className="mb-3 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Navigate
            </h4>
            <ul className="flex flex-col gap-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-heading text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter mini */}
          <div>
            <h4 className="mb-3 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Stay Updated
            </h4>
            {submitted ? (
              <p className="font-heading text-sm text-foreground">
                You&apos;re subscribed!
              </p>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true) }}
                className="flex gap-2"
              >
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 min-w-0 rounded-full border border-border bg-background px-3 py-2 font-heading text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-foreground px-4 py-2 font-heading text-xs font-bold text-background transition-transform hover:scale-105"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        <hr className="my-8 border-border/40" />

        <p className="text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} Idle Hours &middot; idlehours.co.uk &middot; Made with too much free time
        </p>
      </div>
    </footer>
  )
}
