import Link from 'next/link'

// "Not playable yet" block for future-dated puzzle URLs. Extracted from the
// near-identical blocks in game-sense and shelf-price (this is the
// game-sense variant); street-date previously had no guard at all.

export default function PlayableGuard({ todayHref }: { todayHref: string }) {
  return (
    <div className="mb-8 rounded-lg border border-white/20 bg-white/10 px-4 py-6 text-center backdrop-blur-sm">
      <p className="text-white/70">
        This game isn&apos;t available yet. Check back on the right day!
      </p>
      <Link
        href={todayHref}
        className="mt-3 inline-block text-sm font-semibold text-white transition-colors hover:text-white/80"
      >
        Go to today&apos;s game &rarr;
      </Link>
    </div>
  )
}
