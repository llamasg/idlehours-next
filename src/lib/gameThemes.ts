export interface GameTheme {
  name: string
  slug: string
  gradient: string
  accentColor: string
  textColor: string
}

export const GAME_THEMES: Record<string, GameTheme> = {
  jigsaw: {
    name: 'Jigsaw',
    slug: 'jigsaw',
    gradient: 'linear-gradient(155deg, #8B6914, #2a1800)',
    accentColor: '#C4913A',
    textColor: '#FFF5E6',
  },
}
