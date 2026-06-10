// Box Set wordplay matcher suite — targeted expectations per matcher family,
// plus registry integrity (every banked wordplay concept references a real
// matcher). Titles here are synthetic where that's clearer; matchers operate
// on strings only.

import { describe, it, expect } from 'vitest'
import { WORDPLAY_MATCHERS } from '@/app/play/box-set/lib/wordplayMatchers.mjs'
import { CONCEPTS } from '@/app/play/box-set/lib/conceptBank'

const m = (name: string) => {
  const fn = WORDPLAY_MATCHERS[name]
  if (!fn) throw new Error(`missing matcher ${name}`)
  return fn
}

describe('wordplay matchers', () => {
  it('contains-colour', () => {
    expect(m('contains-colour')('Red Dead Redemption 2')).toBe(true)
    expect(m('contains-colour')('Doom')).toBe(false)
    // substring is not a word match
    expect(m('contains-colour')('Bordersland')).toBe(false)
  })

  it('contains-number-word', () => {
    expect(m('contains-number-word')('It Takes Two')).toBe(true)
    expect(m('contains-number-word')('Halo 3')).toBe(false) // digit, not word
  })

  it('one-word-title', () => {
    expect(m('one-word-title')('Doom')).toBe(true)
    expect(m('one-word-title')('God of War')).toBe(false)
    expect(m('one-word-title')("Assassin's Creed")).toBe(false)
  })

  it('roman-numeral', () => {
    expect(m('roman-numeral')('Final Fantasy VII')).toBe(true)
    expect(m('roman-numeral')('Grand Theft Auto V')).toBe(true)
    expect(m('roman-numeral')('Civilization VI: Gathering Storm')).toBe(true)
    expect(m('roman-numeral')('Halo 3')).toBe(false)
    expect(m('roman-numeral')('Victor Vran')).toBe(false)
  })

  it('hides-<sub> requires the substring inside a longer word', () => {
    expect(m('hides-ape')('Escape Academy')).toBe(true) // esc-APE
    expect(m('hides-ape')('Ape Out')).toBe(false) // whole word doesn't count
    expect(m('hides-rat')('Stratego')).toBe(true) // st-RAT-ego
    expect(m('hides-rat')('Rat Race')).toBe(false)
  })

  it('possessive-title', () => {
    expect(m('possessive-title')("Assassin's Creed")).toBe(true)
    expect(m('possessive-title')('Dark Souls')).toBe(false)
  })

  it('alliterative-title', () => {
    expect(m('alliterative-title')('Counter Combat Crew')).toBe(true)
    expect(m('alliterative-title')('Donkey Kong')).toBe(false)
    expect(m('alliterative-title')('Hades')).toBe(false) // one word is not alliteration
  })

  it('one-word-verb', () => {
    expect(m('one-word-verb')('Control')).toBe(true)
    expect(m('one-word-verb')('Celeste')).toBe(false)
    expect(m('one-word-verb')('Total Control')).toBe(false)
  })

  it('one-word-gerund', () => {
    expect(m('one-word-gerund')('Unpacking')).toBe(true)
    expect(m('one-word-gerund')('Ring')).toBe(false) // too short, not a gerund
    expect(m('one-word-gerund')('Burning Rangers')).toBe(false)
  })

  it('starts-with-the / of-the / colon / digit', () => {
    expect(m('starts-with-the')('The Last of Us')).toBe(true)
    expect(m('starts-with-the')('Beyond the Wire')).toBe(false)
    expect(m('of-the-title')('Legend of the Mystical Ninja')).toBe(true)
    expect(m('title-with-colon')('Portal 2: The Final Hours')).toBe(true)
    expect(m('title-with-digit')('Left 4 Dead')).toBe(true)
    expect(m('title-with-digit')('Final Fantasy VII')).toBe(false)
  })

  it('repeated-word-title', () => {
    expect(m('repeated-word-title')('Danger Danger')).toBe(true)
    expect(m('repeated-word-title')('Dark Souls')).toBe(false)
  })
})

describe('wordplay registry integrity', () => {
  it('every banked wordplay concept references an existing matcher', () => {
    const missing = CONCEPTS.filter(
      (c) =>
        c.type === 'wordplay' &&
        !WORDPLAY_MATCHERS[(c.predicate as { matcher?: string }).matcher ?? ''],
    ).map((c) => c.id)
    expect(missing).toEqual([])
  })
})
