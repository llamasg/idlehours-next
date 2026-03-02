'use client'

import { useState } from 'react'

export default function HomepageNewsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div
      className="rounded-2xl bg-muted px-6 py-14 text-center"
    >
      <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
        Good games. Good reads. Once a week.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        No noise. No aggregation. Just things worth your time.
      </p>
      {submitted ? (
        <p className="mt-8 font-heading text-sm font-bold text-foreground">
          You&apos;re in! We&apos;ll be in touch.
        </p>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true) }}
          className="mx-auto mt-8 flex max-w-md gap-2"
        >
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 font-heading text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-foreground px-6 py-2.5 font-heading text-sm font-bold text-background transition-transform hover:scale-105"
          >
            Subscribe
          </button>
        </form>
      )}
      <p className="mt-3 text-xs text-muted-foreground/70">
        We send one email a week. Unsubscribe any time.
      </p>
    </div>
  )
}
