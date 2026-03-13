interface PullQuoteProps {
  text: string
  author: string
  className?: string
}

export default function PullQuote({ text, author, className = '' }: PullQuoteProps) {
  return (
    <div
      className={`relative rounded-[0_14px_14px_0] border-l-4 border-amber-600 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)] ${className}`}
      style={{
        backgroundColor: 'hsl(45 33% 93%)',
        backgroundImage: 'radial-gradient(circle, rgba(26,26,20,0.07) 1px, transparent 1px)',
        backgroundSize: '10px 10px',
        transform: 'rotate(-0.5deg)',
      }}
    >
      <p className="mb-3 font-heading text-lg font-bold italic leading-relaxed text-foreground sm:text-xl">
        &ldquo;{text}&rdquo;
      </p>
      <p className="font-heading text-xs font-extrabold uppercase tracking-[0.12em] text-amber-600">
        {author}
      </p>
    </div>
  )
}
