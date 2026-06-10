// Box Set purple-tier wordplay matchers — claims about the TITLE STRING only,
// verified by string operations. Seeded in phase 1b; the registry is injected
// into predicates.mjs so concepts can reference matchers by name.

import {
  containsWordFromList,
  titleRegex,
  titleWords,
  registerWordplayMatchers,
} from './predicates.mjs'

/** Populated in phase 1b. Name → (title: string) => boolean. */
export const WORDPLAY_MATCHERS = {}

registerWordplayMatchers(WORDPLAY_MATCHERS)

// Re-export helpers so matcher definitions read cleanly at the call site.
export { containsWordFromList, titleRegex, titleWords }
