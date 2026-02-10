import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import type { NewsletterSection } from '@/types'

interface NewsletterProps {
  data: NewsletterSection
}

export default function Newsletter({ data }: NewsletterProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    // Stub — connect to Mailchimp / ConvertKit later
    setSubmitted(true)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border/60 bg-card px-6 py-10 text-center shadow-sm sm:px-10 sm:py-14"
    >
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Mail size={20} className="text-primary" />
      </div>

      <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
        {data.title}
      </h2>

      {data.copy && (
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          {data.copy}
        </p>
      )}

      {submitted ? (
        <div className="mt-6 rounded-full bg-primary/10 px-6 py-3 font-heading text-sm font-medium text-primary">
          You're in! Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={data.placeholderText}
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-primary px-5 py-2.5 font-heading text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            {data.buttonLabel}
          </button>
        </form>
      )}

      {data.disclaimer && !submitted && (
        <p className="mx-auto mt-3 max-w-sm text-xs text-muted-foreground">
          {data.disclaimer}
        </p>
      )}
    </motion.section>
  )
}
