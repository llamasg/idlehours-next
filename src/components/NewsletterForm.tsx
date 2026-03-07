'use client'

import { useState } from 'react'

export default function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <p className="text-sm text-muted-foreground">
        You&apos;re in! We&apos;ll be in touch.
      </p>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <input
        type="email"
        required
        placeholder="your@email.com"
        className="rounded-full border border-border/60 bg-transparent px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        className="rounded-full bg-primary px-4 py-2 font-heading text-sm font-semibold text-white"
      >
        Subscribe
      </button>
    </form>
  )
}
