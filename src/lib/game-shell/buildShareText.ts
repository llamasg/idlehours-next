// Share-text format shared by the daily games:
//   "<Title> #NNN · <score>/1000" / per-game emoji rows / canonical URL.
// Emoji-row generation stays inside each game (it is game identity);
// only the framing is shared.

export function buildShareText(opts: {
  title: string
  number: string
  score: number
  rows: string[]
  url: string
}): string {
  const { title, number, score, rows, url } = opts
  return [`${title} ${number} · ${score}/1000`, ...rows.filter(Boolean), url].join('\n')
}
