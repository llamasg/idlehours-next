interface StarScoreProps {
  stars: number
  size?: 'sm' | 'lg'
}

function StarIcon({
  filled,
  sizeClass,
}: {
  filled: boolean
  sizeClass: string
}) {
  return (
    <svg
      className={`${sizeClass} ${filled ? 'text-amber-500' : 'text-muted-foreground/30'}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export default function StarScore({ stars, size = 'sm' }: StarScoreProps) {
  const sizeClass = size === 'lg' ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-4 h-4'

  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} filled={i < stars} sizeClass={sizeClass} />
      ))}
    </div>
  )
}
