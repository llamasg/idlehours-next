// Day-of-week flavour lines — picked randomly on mount for post-game display

export const DAY_FLAVOUR: Record<number, string[]> = {
  0: ['Good way to spend a Sunday.', 'Sunday well played.', 'Before the week starts again. Worth it.'],
  1: ['Not bad for a Monday.', 'Better start to the week than most.', 'Monday redeemed, slightly.'],
  2: ['Not bad for a Tuesday.', 'Quietly solid. Very Tuesday of you.', 'Tuesday energy. Understated but present.'],
  3: ['Halfway there.', 'Hump day. You cleared it.', 'Wednesday and already winning something.'],
  4: ['Nearly Friday. This helps.', "Thursday is just Friday's waiting room.", "One more sleep. You've got this."],
  5: ['Going into the weekend with that score.', 'Friday well spent.', 'Weekend starts here.'],
  6: ['Playing games on a Saturday. As it should be.', 'No notes. This is what Saturdays are for.', 'Ideal Saturday activity, honestly.'],
}

export function pickDayFlavour(): string {
  const day = new Date().getDay()
  const lines = DAY_FLAVOUR[day]
  return lines[Math.floor(Math.random() * lines.length)]
}
