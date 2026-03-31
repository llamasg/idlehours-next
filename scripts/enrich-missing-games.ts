// scripts/enrich-missing-games.ts
// Enriches 201 games in games-db.ts that have empty genres and platforms arrays.
// Run with: npx tsx scripts/enrich-missing-games.ts

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const GAMES_DB_PATH = path.resolve(__dirname, '../src/data/games-db.ts')

const ENRICHMENT: Record<string, { genres: string[]; platforms: string[] }> = {
  'actraiser': { genres: ['Action', 'Platform'], platforms: ['Nintendo'] },
  'castlevania-iii-dracula-s-curse': { genres: ['Action', 'Platform'], platforms: ['Nintendo'] },
  'king-s-quest-v-absence-makes-the-heart-go-yonder': { genres: ['Adventure', 'Point-and-Click'], platforms: ['PC'] },
  'metal-gear-2-solid-snake': { genres: ['Action', 'Adventure'], platforms: ['Nintendo'] },
  'microsoft-minesweeper': { genres: ['Puzzle'], platforms: ['PC'] },
  'ninja-gaiden-ii-the-dark-sword-of-chaos': { genres: ['Action', 'Platform'], platforms: ['Nintendo'] },
  'golden-axe-ii': { genres: ['Action'], platforms: ['Nintendo'] },
  'metroid-ii-return-of-samus': { genres: ['Action', 'Adventure', 'Platform'], platforms: ['Nintendo'] },
  'monkey-island-2-lechuck-s-revenge': { genres: ['Adventure', 'Point-and-Click'], platforms: ['PC'] },
  'streets-of-rage': { genres: ['Action'], platforms: ['Nintendo'] },
  'sunset-riders': { genres: ['Action', 'Arcade'], platforms: ['Nintendo'] },
  'the-legend-of-zelda-a-link-to-the-past': { genres: ['Action', 'Adventure', 'RPG'], platforms: ['Nintendo'] },
  'the-simpsons-arcade-game': { genres: ['Action', 'Arcade'], platforms: ['Nintendo', 'PlayStation', 'Xbox'] },
  'alone-in-the-dark': { genres: ['Horror', 'Adventure'], platforms: ['PC'] },
  'batman-returns': { genres: ['Action'], platforms: ['Nintendo'] },
  'ecco-the-dolphin': { genres: ['Adventure', 'Platform'], platforms: ['Nintendo'] },
  'final-fantasy-v': { genres: ['RPG'], platforms: ['Nintendo', 'PlayStation'] },
  'final-fantasy-mystic-quest': { genres: ['RPG'], platforms: ['Nintendo'] },
  'indiana-jones-and-the-fate-of-atlantis': { genres: ['Adventure', 'Point-and-Click'], platforms: ['PC'] },
  'soul-blazer': { genres: ['Action', 'RPG'], platforms: ['Nintendo'] },
  'super-mario-land-2-6-golden-coins': { genres: ['Platform'], platforms: ['Nintendo'] },
  'castlevania-rondo-of-blood': { genres: ['Action', 'Platform'], platforms: ['Nintendo'] },
  'disney-s-aladdin': { genres: ['Platform'], platforms: ['Nintendo'] },
  'doom': { genres: ['Shooter', 'Action'], platforms: ['PC'] },
  'gabriel-knight-sins-of-the-fathers': { genres: ['Adventure', 'Point-and-Click'], platforms: ['PC'] },
  'street-fighter-ii-turbo': { genres: ['Fighting'], platforms: ['Nintendo'] },
  'the-lost-vikings': { genres: ['Puzzle', 'Platform'], platforms: ['Nintendo', 'PC'] },
  'castlevania-bloodlines': { genres: ['Action', 'Platform'], platforms: ['Nintendo'] },
  'heretic': { genres: ['Shooter', 'Action'], platforms: ['PC'] },
  'mega-man-x2': { genres: ['Action', 'Platform'], platforms: ['Nintendo'] },
  'mortal-kombat-ii': { genres: ['Fighting'], platforms: ['Nintendo', 'PlayStation', 'PC'] },
  'sonic-knuckles': { genres: ['Platform'], platforms: ['Nintendo'] },
  'super-street-fighter-ii-turbo': { genres: ['Fighting'], platforms: ['Nintendo', 'PC'] },
  'x-com-ufo-defense': { genres: ['Strategy', 'Tactical'], platforms: ['PC'] },
  'castlevania-dracula-x': { genres: ['Action', 'Platform'], platforms: ['Nintendo'] },
  'donkey-kong-country-2-diddy-s-kong-quest': { genres: ['Platform'], platforms: ['Nintendo'] },
  'earthworm-jim-2': { genres: ['Platform', 'Action'], platforms: ['Nintendo'] },
  'full-throttle': { genres: ['Adventure', 'Point-and-Click'], platforms: ['PC'] },
  'mortal-kombat-3': { genres: ['Fighting'], platforms: ['Nintendo', 'PlayStation', 'PC'] },
  'tekken-2': { genres: ['Fighting'], platforms: ['PlayStation'] },
  'the-dig': { genres: ['Adventure', 'Point-and-Click'], platforms: ['PC'] },
  'twisted-metal': { genres: ['Action', 'Racing'], platforms: ['PlayStation'] },
  'circle-of-blood': { genres: ['Adventure', 'Point-and-Click'], platforms: ['PC'] },
  'mega-man-8': { genres: ['Action', 'Platform'], platforms: ['PlayStation'] },
  'pok-mon-blue-version': { genres: ['RPG'], platforms: ['Nintendo'] },
  'quake': { genres: ['Shooter'], platforms: ['PC'] },
  'sid-meier-s-civilization-ii': { genres: ['Strategy'], platforms: ['PC'] },
  'street-fighter-alpha-2': { genres: ['Fighting'], platforms: ['PlayStation', 'Nintendo', 'PC'] },
  'age-of-empires': { genres: ['Strategy'], platforms: ['PC'] },
  'blood': { genres: ['Shooter'], platforms: ['PC'] },
  'crash-bandicoot-2-cortex-strikes-back': { genres: ['Platform'], platforms: ['PlayStation'] },
  'final-fantasy-tactics': { genres: ['RPG', 'Tactical', 'Strategy'], platforms: ['PlayStation'] },
  'quake-ii': { genres: ['Shooter'], platforms: ['PC'] },
  'theme-hospital': { genres: ['Simulation', 'Strategy'], platforms: ['PC'] },
  'yoshi-s-story': { genres: ['Platform'], platforms: ['Nintendo'] },
  'commandos-behind-enemy-lines': { genres: ['Strategy', 'Tactical'], platforms: ['PC'] },
  'grim-fandango': { genres: ['Adventure', 'Point-and-Click'], platforms: ['PC'] },
  'mario-party': { genres: ['Puzzle'], platforms: ['Nintendo'] },
  'age-of-empires-ii-the-age-of-kings': { genres: ['Strategy'], platforms: ['PC'] },
  'crazy-taxi': { genres: ['Racing', 'Arcade'], platforms: ['PlayStation', 'PC'] },
  'pok-mon-stadium': { genres: ['RPG', 'Strategy'], platforms: ['Nintendo'] },
  'spyro-2-ripto-s-rage': { genres: ['Platform', 'Adventure'], platforms: ['PlayStation'] },
  'super-smash-bros': { genres: ['Fighting'], platforms: ['Nintendo'] },
  'baldur-s-gate-ii-shadows-of-amn': { genres: ['RPG'], platforms: ['PC'] },
  'mario-tennis': { genres: ['Sports'], platforms: ['Nintendo'] },
  'metal-slug-3': { genres: ['Action', 'Arcade'], platforms: ['Nintendo', 'PlayStation'] },
  'pok-mon-crystal-version': { genres: ['RPG'], platforms: ['Nintendo'] },
  'the-legend-of-zelda-majora-s-mask': { genres: ['Action', 'Adventure', 'RPG'], platforms: ['Nintendo'] },
  'thief-ii-the-metal-age': { genres: ['Action', 'Adventure'], platforms: ['PC'] },
  'tony-hawk-s-pro-skater-2': { genres: ['Sports'], platforms: ['PlayStation', 'PC', 'Nintendo'] },
  'gothic': { genres: ['RPG', 'Action'], platforms: ['PC'] },
  'half-life-blue-shift': { genres: ['Shooter'], platforms: ['PC'] },
  'harry-potter-and-the-sorcerer-s-stone': { genres: ['Adventure', 'Action'], platforms: ['PC', 'PlayStation', 'Nintendo'] },
  'pikmin': { genres: ['Strategy', 'Puzzle'], platforms: ['Nintendo'] },
  'red-faction': { genres: ['Shooter'], platforms: ['PC', 'PlayStation'] },
  'gothic-ii': { genres: ['RPG', 'Action'], platforms: ['PC'] },
  'mafia': { genres: ['Action', 'Adventure', 'Shooter'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'pok-mon-ruby-version': { genres: ['RPG'], platforms: ['Nintendo'] },
  'star-wars-jedi-knight-ii-jedi-outcast': { genres: ['Shooter', 'Action'], platforms: ['PC', 'Xbox', 'Nintendo'] },
  'tony-hawk-s-pro-skater-4': { genres: ['Sports'], platforms: ['PlayStation', 'Xbox', 'PC', 'Nintendo'] },
  'call-of-duty': { genres: ['Shooter'], platforms: ['PC'] },
  'castlevania-aria-of-sorrow': { genres: ['Action', 'RPG', 'Platform'], platforms: ['Nintendo'] },
  'manhunt': { genres: ['Action', 'Horror'], platforms: ['PlayStation', 'Xbox', 'PC'] },
  'the-lord-of-the-rings-the-return-of-the-king': { genres: ['Action', 'Adventure'], platforms: ['PlayStation', 'Xbox', 'PC', 'Nintendo'] },
  'warcraft-iii-the-frozen-throne': { genres: ['Strategy'], platforms: ['PC'] },
  'garry-s-mod': { genres: ['Simulation'], platforms: ['PC'] },
  'pok-mon-firered-version': { genres: ['RPG'], platforms: ['Nintendo'] },
  'prince-of-persia-warrior-within': { genres: ['Action', 'Adventure', 'Platform'], platforms: ['PlayStation', 'Xbox', 'PC', 'Nintendo'] },
  'star-wars-knights-of-the-old-republic-ii-the-sith-lords': { genres: ['RPG'], platforms: ['PC', 'Xbox'] },
  'the-lord-of-the-rings-the-battle-for-middle-earth': { genres: ['Strategy'], platforms: ['PC'] },
  'age-of-empires-iii': { genres: ['Strategy'], platforms: ['PC'] },
  'animal-crossing-wild-world': { genres: ['Simulation'], platforms: ['Nintendo'] },
  'battlefield-2': { genres: ['Shooter'], platforms: ['PC'] },
  'indigo-prophecy': { genres: ['Adventure'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'kingdom-hearts-ii': { genres: ['Action', 'RPG'], platforms: ['PlayStation'] },
  'prince-of-persia-the-two-thrones': { genres: ['Action', 'Adventure', 'Platform'], platforms: ['PlayStation', 'Xbox', 'PC', 'Nintendo'] },
  'call-of-duty-3': { genres: ['Shooter'], platforms: ['PlayStation', 'Xbox', 'Nintendo'] },
  'lego-star-wars-ii-the-original-trilogy': { genres: ['Action', 'Adventure'], platforms: ['PlayStation', 'Xbox', 'PC', 'Nintendo'] },
  'pok-mon-pearl-version': { genres: ['RPG'], platforms: ['Nintendo'] },
  'roblox': { genres: ['Simulation', 'Adventure'], platforms: ['PC', 'Xbox', 'Mobile'] },
  'tomb-raider-legend': { genres: ['Action', 'Adventure'], platforms: ['PlayStation', 'Xbox', 'PC', 'Nintendo'] },
  'dragon-ball-z-budokai-tenkaichi-3': { genres: ['Fighting'], platforms: ['PlayStation', 'Nintendo'] },
  'half-life-2-episode-two': { genres: ['Shooter'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'super-paper-mario': { genres: ['RPG', 'Platform'], platforms: ['Nintendo'] },
  'fable-ii': { genres: ['RPG', 'Action'], platforms: ['Xbox'] },
  'gears-of-war-2': { genres: ['Shooter', 'Action'], platforms: ['Xbox'] },
  'mario-kart-wii': { genres: ['Racing'], platforms: ['Nintendo'] },
  'star-wars-the-force-unleashed': { genres: ['Action', 'Adventure'], platforms: ['PlayStation', 'Xbox', 'PC', 'Nintendo'] },
  'the-witcher-enhanced-edition': { genres: ['RPG', 'Action'], platforms: ['PC'] },
  'assassin-s-creed-ii': { genres: ['Action', 'Adventure'], platforms: ['PlayStation', 'Xbox', 'PC'] },
  'plants-vs-zombies': { genres: ['Strategy', 'Puzzle'], platforms: ['PC', 'Mobile'] },
  'prototype': { genres: ['Action', 'Adventure'], platforms: ['PlayStation', 'Xbox', 'PC'] },
  'torchlight': { genres: ['RPG', 'Action'], platforms: ['PC'] },
  'trine': { genres: ['Action', 'Platform', 'Puzzle'], platforms: ['PC', 'PlayStation'] },
  'call-of-duty-black-ops': { genres: ['Shooter'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'fable-iii': { genres: ['RPG', 'Action'], platforms: ['Xbox', 'PC'] },
  'heavy-rain': { genres: ['Adventure'], platforms: ['PlayStation', 'PC'] },
  'super-meat-boy': { genres: ['Platform', 'Indie'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'alice-madness-returns': { genres: ['Action', 'Adventure', 'Platform'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'bastion': { genres: ['Action', 'RPG', 'Indie'], platforms: ['PC', 'Xbox'] },
  'battlefield-3': { genres: ['Shooter'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'dead-island': { genres: ['Action', 'RPG', 'Horror'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'the-binding-of-isaac': { genres: ['Action', 'Indie'], platforms: ['PC'] },
  'uncharted-3-drake-s-deception': { genres: ['Action', 'Adventure', 'Shooter'], platforms: ['PlayStation'] },
  'assassin-s-creed-iii': { genres: ['Action', 'Adventure'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'borderlands-2': { genres: ['Shooter', 'RPG', 'Action'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'darksiders-ii': { genres: ['Action', 'RPG', 'Adventure'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'far-cry-3': { genres: ['Shooter', 'Action', 'Adventure'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'ftl-faster-than-light': { genres: ['Strategy', 'Indie'], platforms: ['PC', 'Mac'] },
  'max-payne-3': { genres: ['Shooter', 'Action'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'torchlight-ii': { genres: ['RPG', 'Action'], platforms: ['PC'] },
  'batman-arkham-origins': { genres: ['Action', 'Adventure'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'bioshock-infinite': { genres: ['Shooter', 'Action', 'Adventure'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'crysis-3': { genres: ['Shooter'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'dota-2': { genres: ['MOBA', 'Strategy'], platforms: ['PC'] },
  'grand-theft-auto-v': { genres: ['Action', 'Adventure', 'Shooter'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'metro-last-light': { genres: ['Shooter', 'Horror'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'the-walking-dead-season-two': { genres: ['Adventure'], platforms: ['PC', 'PlayStation', 'Xbox', 'Mobile'] },
  'the-wolf-among-us': { genres: ['Adventure'], platforms: ['PC', 'PlayStation', 'Xbox', 'Mobile'] },
  'dark-souls-ii': { genres: ['Action', 'RPG'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'hearthstone': { genres: ['Card & Board Game', 'Strategy'], platforms: ['PC', 'Mobile'] },
  'resident-evil': { genres: ['Horror', 'Action', 'Adventure'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'tales-from-the-borderlands': { genres: ['Adventure'], platforms: ['PC', 'PlayStation', 'Xbox', 'Mobile'] },
  'the-last-of-us-remastered': { genres: ['Action', 'Adventure', 'Horror'], platforms: ['PlayStation'] },
  'valiant-hearts-the-great-war': { genres: ['Adventure', 'Puzzle'], platforms: ['PC', 'PlayStation', 'Xbox', 'Mobile'] },
  'watch-dogs': { genres: ['Action', 'Adventure'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'wolfenstein-the-new-order': { genres: ['Shooter', 'Action'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'call-of-duty-black-ops-iii': { genres: ['Shooter'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'rocket-league': { genres: ['Sports', 'Racing'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'uncharted-the-nathan-drake-collection': { genres: ['Action', 'Adventure', 'Shooter'], platforms: ['PlayStation'] },
  'battlefield-1': { genres: ['Shooter'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'final-fantasy-xv': { genres: ['RPG', 'Action'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'no-man-s-sky': { genres: ['Adventure', 'Action', 'Simulation'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'overwatch': { genres: ['Shooter'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'superhot': { genres: ['Shooter', 'Action', 'Indie'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'titanfall-2': { genres: ['Shooter', 'Action'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'uncharted-4-a-thief-s-end': { genres: ['Action', 'Adventure', 'Shooter'], platforms: ['PlayStation', 'PC'] },
  'assassin-s-creed-origins': { genres: ['Action', 'Adventure', 'RPG'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'destiny-2': { genres: ['Shooter', 'Action', 'RPG'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'mario-kart-8-deluxe': { genres: ['Racing'], platforms: ['Nintendo'] },
  'pubg-battlegrounds': { genres: ['Shooter', 'Battle Royale'], platforms: ['PC', 'PlayStation', 'Xbox', 'Mobile'] },
  'tom-clancy-s-ghost-recon-wildlands': { genres: ['Shooter', 'Action', 'Adventure'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'a-way-out': { genres: ['Adventure', 'Action'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'assassin-s-creed-odyssey': { genres: ['Action', 'Adventure', 'RPG'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'forza-horizon-4': { genres: ['Racing'], platforms: ['PC', 'Xbox'] },
  'marvel-s-spider-man': { genres: ['Action', 'Adventure'], platforms: ['PlayStation', 'PC'] },
  'vampyr': { genres: ['Action', 'RPG'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'apex-legends': { genres: ['Shooter', 'Battle Royale'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'] },
  'mortal-kombat-11': { genres: ['Fighting'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'the-dark-pictures-anthology-man-of-medan': { genres: ['Adventure', 'Horror'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'cyberpunk-2077': { genres: ['RPG', 'Action', 'Shooter'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'doom-eternal': { genres: ['Shooter', 'Action'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'fall-guys': { genres: ['Action', 'Indie'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'half-life-alyx': { genres: ['Shooter', 'Action', 'Adventure'], platforms: ['PC', 'VR'] },
  'resident-evil-3': { genres: ['Horror', 'Action'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'valorant': { genres: ['Shooter'], platforms: ['PC'] },
  'diablo-ii-resurrected': { genres: ['RPG', 'Action'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'it-takes-two': { genres: ['Action', 'Adventure', 'Platform'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'little-nightmares-ii': { genres: ['Adventure', 'Horror', 'Platform'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'cult-of-the-lamb': { genres: ['Action', 'Strategy', 'Indie'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'ghostwire-tokyo': { genres: ['Action', 'Adventure', 'Horror'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'neon-white': { genres: ['Action', 'Shooter', 'Platform'], platforms: ['PC', 'PlayStation', 'Nintendo'] },
  'vampire-survivors': { genres: ['Action', 'Indie'], platforms: ['PC', 'Xbox', 'Nintendo', 'Mobile'] },
  'baldur-s-gate-iii': { genres: ['RPG'], platforms: ['PC', 'PlayStation', 'Xbox', 'Mac'] },
  'counter-strike-2': { genres: ['Shooter'], platforms: ['PC'] },
  'dave-the-diver': { genres: ['Adventure', 'RPG', 'Indie'], platforms: ['PC', 'PlayStation', 'Nintendo'] },
  'diablo-iv': { genres: ['RPG', 'Action'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'dredge': { genres: ['Adventure', 'Indie'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'hogwarts-legacy': { genres: ['Action', 'RPG', 'Adventure'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'] },
  'helldivers-2': { genres: ['Shooter', 'Action'], platforms: ['PC', 'PlayStation'] },
  'senua-s-saga-hellblade-ii': { genres: ['Action', 'Adventure'], platforms: ['PC', 'Xbox'] },
  'the-first-descendant': { genres: ['Shooter', 'RPG'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'zenless-zone-zero': { genres: ['Action', 'RPG'], platforms: ['PC', 'PlayStation', 'Mobile'] },
  'arena-breakout-infinite': { genres: ['Shooter'], platforms: ['PC'] },
  'assassin-s-creed-shadows': { genres: ['Action', 'Adventure', 'RPG'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'clair-obscur-expedition-33': { genres: ['RPG'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'escape-from-tarkov': { genres: ['Shooter', 'Action'], platforms: ['PC'] },
  'peak': { genres: ['Shooter'], platforms: ['PC'] },
  'r-e-p-o': { genres: ['Action', 'Horror', 'Indie'], platforms: ['PC'] },
  'split-fiction': { genres: ['Action', 'Adventure'], platforms: ['PC', 'PlayStation', 'Xbox'] },
  'supermarket-simulator': { genres: ['Simulation', 'Indie'], platforms: ['PC'] },
}

function main() {
  console.log('Reading games-db.ts...')
  let content = fs.readFileSync(GAMES_DB_PATH, 'utf-8')

  let updatedCount = 0
  let missingIds: string[] = []

  for (const [id, data] of Object.entries(ENRICHMENT)) {
    // Escape special regex characters in the id
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Find the game entry block by its id
    // We look for the id line and then replace the next genres: [] and platforms: []
    const idPattern = new RegExp(`(id: '${escapedId}',)`)
    const idMatch = content.match(idPattern)

    if (!idMatch) {
      missingIds.push(id)
      continue
    }

    const idIndex = content.indexOf(idMatch[0])

    // Find the next genres: [] after this id
    const afterId = content.substring(idIndex)
    const genresEmptyMatch = afterId.match(/genres: \[\]/)
    const platformsEmptyMatch = afterId.match(/platforms: \[\]/)

    if (!genresEmptyMatch || !platformsEmptyMatch) {
      // Already enriched or different format
      console.log(`  Skipping ${id} — genres/platforms not empty`)
      continue
    }

    // Make sure these empty arrays are within the same entry (within ~500 chars of the id)
    const genresPos = afterId.indexOf('genres: []')
    const platformsPos = afterId.indexOf('platforms: []')

    if (genresPos > 500 || platformsPos > 500) {
      console.log(`  Skipping ${id} — empty arrays too far from id (possibly wrong entry)`)
      continue
    }

    const genresStr = `genres: [${data.genres.map(g => `'${g}'`).join(', ')}]`
    const platformsStr = `platforms: [${data.platforms.map(p => `'${p}'`).join(', ')}]`

    // Replace genres: [] first (it comes before platforms: [])
    const beforeGenres = content.substring(0, idIndex)
    const fromId = content.substring(idIndex)

    // Replace the first occurrence of genres: [] after this id
    const updatedFromId = fromId.replace('genres: []', genresStr).replace('platforms: []', platformsStr)

    // Only count if we actually changed something
    if (updatedFromId !== fromId) {
      content = beforeGenres + updatedFromId
      updatedCount++
    }
  }

  if (missingIds.length > 0) {
    console.log(`\nWARNING: ${missingIds.length} IDs not found in games-db.ts:`)
    missingIds.forEach(id => console.log(`  - ${id}`))
  }

  console.log(`\nUpdated ${updatedCount} games.`)

  fs.writeFileSync(GAMES_DB_PATH, content, 'utf-8')
  console.log('Wrote updated games-db.ts')
}

main()
