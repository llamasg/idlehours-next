// The word-pop game title + subtitle shared by the three daily games.
// Per-game knobs (durations, staggers, easing) preserve each page's exact
// original timings. The surrounding translateY/slide wrapper stays in the
// pages — it is tied to each page's entrance/post-game branching.
//
// Words are joined with non-breaking spaces (' ') exactly like the
// originals — a regular space inside an inline-block span would collapse.

export default function GameTitle({
  title,
  subtitle,
  animate,
  titleDuration = 0.25,
  titleStagger = 0.3,
  subtitleDuration = 0.2,
  subtitleStagger = 0.3,
  easing = 'cubic-bezier(0.34,1.56,0.64,1)',
}: {
  title: string[]
  subtitle: string[]
  animate: boolean
  titleDuration?: number
  titleStagger?: number
  subtitleDuration?: number
  subtitleStagger?: number
  easing?: string
}) {
  return (
    <>
      <h1 className="text-[22px] font-black uppercase leading-none text-white sm:text-[clamp(40px,8vw,64px)]">
        {title.map((word, i) => (
          <span
            key={word}
            className="inline-block"
            style={
              animate
                ? { animation: `gs-word-pop ${titleDuration}s ${easing} ${0.1 + i * titleStagger}s both` }
                : { opacity: 0 }
            }
          >
            {word}{i < title.length - 1 ? ' ' : ''}
          </span>
        ))}
      </h1>
      <p className="mt-0.5 text-sm font-bold text-white/70 sm:mt-1.5 sm:text-xl">
        {subtitle.map((word, i) => (
          <span
            key={word}
            className="inline-block"
            style={
              animate
                ? { animation: `gs-word-pop ${subtitleDuration}s ${easing} ${0.7 + i * subtitleStagger}s both` }
                : { opacity: 0 }
            }
          >
            {word}{i < subtitle.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>
    </>
  )
}
