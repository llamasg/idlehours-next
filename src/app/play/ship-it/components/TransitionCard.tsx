'use client'

interface TransitionCardProps {
  roundName: string
  title: string
  text: string
  onContinue: () => void
}

export default function TransitionCard({
  roundName,
  title,
  text,
  onContinue,
}: TransitionCardProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
      {/* Stage label */}
      <p className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
        {roundName} Complete
      </p>

      {/* Title */}
      <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">
        {title}
      </h2>

      {/* Narrative text */}
      <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
        {text}
      </p>

      {/* Continue button */}
      <button
        type="button"
        onClick={onContinue}
        className="mt-6 rounded-full bg-primary px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary/80"
      >
        Continue &#9654;
      </button>
    </div>
  )
}
