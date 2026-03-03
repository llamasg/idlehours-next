// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface Exec {
  name: string
  title: string
  avatar: string // Emoji now, will be replaced with image later
}

export interface Sticker {
  text: string // Two-line sticker text, e.g. "NOW WITH\nMICROTRANSACTIONS"
  type: 'bad' | 'warning' | 'good'
  top?: string
  left?: string
  right?: string
  bottom?: string
  rot: string // CSS rotation, e.g. "-3deg"
}

export interface ReviewNote {
  text: string
  impact: 'neg' | 'pos' | 'neutral'
  score: number // Added to base 75. Negative for bad, positive for good
}

export interface Offer {
  id: string
  exec: Exec
  pitch: string // Quoted dialogue — satirical, funny, in-character
  funding: string // Display string, e.g. "+$250"
  fundingVal: number // Numeric value
  vision: string // Display string, e.g. "-25%"
  visionVal: number // Positive = vision LOST, negative = vision GAINED
  sticker: Sticker
  reviewNote: ReviewNote
  type: string // Category label, e.g. "Monetisation"
  titleSuffix: string // Appended to game name if accepted, e.g. "Now with Microtransactions"
}

// ─── Offers ────────────────────────────────────────────────────────────────────

export const ALL_OFFERS: Offer[] = [
  // ── Original 9 ──────────────────────────────────────────────────────────────

  // 1. Microtransactions
  {
    id: 'microtx',
    exec: {
      name: 'Derek Huang',
      title: 'VP of Monetisation Strategy',
      avatar: '💼',
    },
    pitch:
      '"Love the emotional core. We\'re thinking — what if grief had a season pass? Players pay £4.99 a month to unlock the sadder endings. Engagement metrics through the roof."',
    funding: '+$250',
    fundingVal: 250,
    vision: '-25%',
    visionVal: 25,
    sticker: {
      text: 'NOW WITH\nMICROTRANSACTIONS',
      type: 'bad',
      top: '8%',
      left: '5%',
      rot: '-3deg',
    },
    reviewNote: {
      text: 'Microtransactions in a cozy game',
      impact: 'neg',
      score: -20,
    },
    type: 'Monetisation',
    titleSuffix: 'Now with Microtransactions',
  },

  // 2. Live Service
  {
    id: 'liveservice',
    exec: {
      name: 'Sarah Chen',
      title: 'Head of Live Operations',
      avatar: '📊',
    },
    pitch:
      '"One-time purchases are dead. We need daily quests, weekly challenges, seasonal events. Players should feel like missing a day has consequences. FOMO is a feature."',
    funding: '+$300',
    fundingVal: 300,
    vision: '-30%',
    visionVal: 30,
    sticker: {
      text: 'LIVE SERVICE\nEDITION',
      type: 'bad',
      top: '38%',
      left: '-8%',
      rot: '4deg',
    },
    reviewNote: {
      text: 'Mandatory daily login system',
      impact: 'neg',
      score: -25,
    },
    type: 'Live Service',
    titleSuffix: 'Live Service Edition',
  },

  // 3. AI Integration
  {
    id: 'ai',
    exec: {
      name: 'Marcus Webb',
      title: 'Chief Innovation Officer',
      avatar: '🤖',
    },
    pitch:
      '"Have you considered replacing your hand-crafted dialogue with AI generation? We could ship 10,000 unique NPCs at zero cost. Sure, they\'re a bit… uncanny. But think of the scale."',
    funding: '+$300',
    fundingVal: 300,
    vision: '-35%',
    visionVal: 35,
    sticker: {
      text: 'AI-OPTIMISED\nCONTENT',
      type: 'bad',
      top: '55%',
      right: '0%',
      rot: '-2deg',
    },
    reviewNote: {
      text: 'AI-generated dialogue replacing hand-written story',
      impact: 'neg',
      score: -30,
    },
    type: 'AI Integration',
    titleSuffix: 'AI-Enhanced',
  },

  // 4. Battle Pass
  {
    id: 'battlepass',
    exec: {
      name: 'Tiffany Monroe',
      title: 'Director of Player Engagement',
      avatar: '🎯',
    },
    pitch:
      '"A battle pass. Hear me out. Not a violent one — a cozy battle pass. Seasonal cosmetics, exclusive crops. Players love it. We\'ve seen it work in everything. Literally everything."',
    funding: '+$220',
    fundingVal: 220,
    vision: '-20%',
    visionVal: 20,
    sticker: {
      text: 'BATTLE PASS\nINCLUDED',
      type: 'bad',
      top: '20%',
      right: '-5%',
      rot: '5deg',
    },
    reviewNote: {
      text: 'Cosmetic battle pass cluttering the UI',
      impact: 'neg',
      score: -15,
    },
    type: 'Battle Pass',
    titleSuffix: 'Battle Pass Included',
  },

  // 5. NFT / Web3
  {
    id: 'nft',
    exec: {
      name: 'Brendan Frost',
      title: 'Web3 Synergy Lead',
      avatar: '🪙',
    },
    pitch:
      '"What if the seeds in your farming game were NFTs? Players would truly own their crops. We\'re a little late to the trend but I feel like it\'s coming back. I really do."',
    funding: '+$320',
    fundingVal: 320,
    vision: '-40%',
    visionVal: 40,
    sticker: {
      text: 'BLOCKCHAIN\nFEATURES',
      type: 'bad',
      top: '65%',
      left: '8%',
      rot: '-5deg',
    },
    reviewNote: {
      text: 'Mandatory NFT wallet integration',
      impact: 'neg',
      score: -35,
    },
    type: 'Web3',
    titleSuffix: 'Blockchain Edition',
  },

  // 6. Mobile Port
  {
    id: 'mobile',
    exec: {
      name: 'Lisa Park',
      title: 'Platform Expansion Director',
      avatar: '📱',
    },
    pitch:
      '"We need a mobile version by launch. Same game, different screen. The development team said six months — I said six weeks. They\'ll figure it out. The market is huge."',
    funding: '+$200',
    fundingVal: 200,
    vision: '-15%',
    visionVal: 15,
    sticker: {
      text: 'NOW ON\nMOBILE',
      type: 'warning',
      top: '78%',
      right: '5%',
      rot: '3deg',
    },
    reviewNote: {
      text: 'Rushed mobile port with broken controls',
      impact: 'neg',
      score: -10,
    },
    type: 'Platform Grab',
    titleSuffix: 'Mobile & Desktop',
  },

  // 7. Sequel / Franchise
  {
    id: 'sequel',
    exec: {
      name: 'Tom Bradley',
      title: 'Franchise Strategy VP',
      avatar: '🎬',
    },
    pitch:
      '"Add \'Origins\' to the title. It implies there\'s more coming. Creates franchise expectation. We don\'t need to have the sequel planned — we just need the market to think we do."',
    funding: '+$100',
    fundingVal: 100,
    vision: '-10%',
    visionVal: 10,
    sticker: {
      text: 'ORIGINS\nEDITION',
      type: 'warning',
      top: '12%',
      right: '8%',
      rot: '-4deg',
    },
    reviewNote: {
      text: 'Sequel-baiting title change',
      impact: 'neutral',
      score: -5,
    },
    type: 'Franchise Build',
    titleSuffix: 'Origins',
  },

  // 8. Good — Indie Press
  {
    id: 'goodpress',
    exec: {
      name: 'Anya Kowalski',
      title: 'Head of Indie Relations',
      avatar: '🌿',
    },
    pitch:
      '"We\'d like to feature your game in our Indie Spotlight newsletter. 200k subscribers, all genuine players. No strings, no branding requirements. We just think it\'s special."',
    funding: '+$0',
    fundingVal: 0,
    vision: '+10%',
    visionVal: -10,
    sticker: {
      text: 'INDIE\nSPOTLIGHT',
      type: 'good',
      top: '30%',
      left: '-5%',
      rot: '2deg',
    },
    reviewNote: {
      text: 'Organic press coverage from genuine fans',
      impact: 'pos',
      score: 15,
    },
    type: 'Press Feature',
    titleSuffix: '',
  },

  // 9. Good — Arts Council Grant
  {
    id: 'goodgrant',
    exec: {
      name: 'James Osei',
      title: 'Arts Council Gaming Fund',
      avatar: '🏛️',
    },
    pitch:
      '"We provide grants to games with genuine cultural merit. No equity stake, no creative control, no obligations beyond a 500-word report. Your game qualifies on every criterion."',
    funding: '+$300',
    fundingVal: 300,
    vision: '+0%',
    visionVal: 0,
    sticker: {
      text: 'ARTS COUNCIL\nGRANTED',
      type: 'good',
      top: '85%',
      left: '20%',
      rot: '-2deg',
    },
    reviewNote: {
      text: 'Arts council recognition',
      impact: 'pos',
      score: 15,
    },
    type: 'Grant Funding',
    titleSuffix: '',
  },

  // ── New Characters ──────────────────────────────────────────────────────────

  // 10. Platform Exclusivity
  {
    id: 'exclusive',
    exec: {
      name: 'Victor Nash',
      title: 'Strategic Partnerships Director',
      avatar: '🔒',
    },
    pitch:
      '"We\'ll put your game on the front page of our store for a full week. All we need is two years of exclusivity. Your fans on other platforms? They\'ll wait. They always wait. They have no choice."',
    funding: '+$280',
    fundingVal: 280,
    vision: '-20%',
    visionVal: 20,
    sticker: {
      text: 'PLATFORM\nEXCLUSIVE',
      type: 'bad',
      top: '45%',
      left: '3%',
      rot: '3deg',
    },
    reviewNote: {
      text: 'Locked to a single storefront for two years',
      impact: 'neg',
      score: -15,
    },
    type: 'Exclusivity Deal',
    titleSuffix: 'Store Exclusive',
  },

  // 11. Early Access / Perpetual Beta
  {
    id: 'earlyaccess',
    exec: {
      name: 'Doug Mercer',
      title: 'Release Strategy Consultant',
      avatar: '🚧',
    },
    pitch:
      '"Why finish the game when you can launch it now? Call it Early Access. Charge full price. Promise a roadmap. If the roadmap takes three years, that\'s three years of community engagement. It\'s genius."',
    funding: '+$200',
    fundingVal: 200,
    vision: '-25%',
    visionVal: 25,
    sticker: {
      text: 'EARLY ACCESS\nFOREVER',
      type: 'bad',
      top: '50%',
      left: '-5%',
      rot: '-4deg',
    },
    reviewNote: {
      text: 'Launched unfinished with a vague roadmap',
      impact: 'neg',
      score: -20,
    },
    type: 'Early Access',
    titleSuffix: '(Early Access)',
  },

  // 12. Influencer Marketing
  {
    id: 'influencer',
    exec: {
      name: 'Chloe Ramirez',
      title: 'Influencer Partnerships Manager',
      avatar: '🎥',
    },
    pitch:
      '"We\'ve got a streamer lined up. 2 million followers. He\'s never played a cozy game. He doesn\'t know what your game is. But he\'ll act surprised for exactly 45 minutes and his chat will spam emotes. That\'s marketing."',
    funding: '+$150',
    fundingVal: 150,
    vision: '-15%',
    visionVal: 15,
    sticker: {
      text: 'STREAMER\nAPPROVED',
      type: 'warning',
      top: '70%',
      right: '-3%',
      rot: '4deg',
    },
    reviewNote: {
      text: 'Paid streamer deal with zero audience overlap',
      impact: 'neg',
      score: -10,
    },
    type: 'Influencer Deal',
    titleSuffix: 'Streamer Edition',
  },

  // 13. Crunch Culture
  {
    id: 'crunch',
    exec: {
      name: 'Richard Hale',
      title: 'Production Efficiency Director',
      avatar: '⏰',
    },
    pitch:
      '"Your team works 40-hour weeks? That\'s adorable. We call those half-days. Listen, passion isn\'t measured in work-life balance. It\'s measured in sleeping bags under desks. Ship date is ship date."',
    funding: '+$280',
    fundingVal: 280,
    vision: '-30%',
    visionVal: 30,
    sticker: {
      text: 'BUILT WITH\nPASSION™',
      type: 'bad',
      top: '25%',
      left: '-3%',
      rot: '-3deg',
    },
    reviewNote: {
      text: 'Shipped six months early, riddled with bugs',
      impact: 'neg',
      score: -25,
    },
    type: 'Crunch Culture',
    titleSuffix: 'Launch Day Edition',
  },

  // 14. Gacha / Loot Boxes
  {
    id: 'gacha',
    exec: {
      name: 'Karen Whitfield',
      title: 'Surprise Mechanics Designer',
      avatar: '🎰',
    },
    pitch:
      '"Loot boxes are just surprise mechanics. Players love surprises. What if every harvest gave you a random seed? You might get a golden pumpkin, you might get nothing. The dopamine hit is the real crop."',
    funding: '+$260',
    fundingVal: 260,
    vision: '-30%',
    visionVal: 30,
    sticker: {
      text: 'SURPRISE\nMECHANICS',
      type: 'bad',
      top: '60%',
      left: '15%',
      rot: '2deg',
    },
    reviewNote: {
      text: 'Randomised progression locked behind loot boxes',
      impact: 'neg',
      score: -25,
    },
    type: 'Gacha',
    titleSuffix: 'Collectors Edition',
  },

  // 15. Data / Telemetry
  {
    id: 'telemetry',
    exec: {
      name: 'Alan Briggs',
      title: 'Player Insights Architect',
      avatar: '👁️',
    },
    pitch:
      '"We need to track everything. Mouse movement, pause frequency, how long they stare at the sunset. If a player cries, we want to know which pixel did it. Privacy policy? That\'s legal\'s problem."',
    funding: '+$180',
    fundingVal: 180,
    vision: '-20%',
    visionVal: 20,
    sticker: {
      text: 'DATA\nDRIVEN',
      type: 'bad',
      top: '35%',
      right: '3%',
      rot: '-5deg',
    },
    reviewNote: {
      text: 'Invasive telemetry tracking every player action',
      impact: 'neg',
      score: -15,
    },
    type: 'Player Analytics',
    titleSuffix: 'Connected Edition',
  },

  // 16. Brand Tie-In
  {
    id: 'branddeal',
    exec: {
      name: 'Patricia Lowell',
      title: 'Brand Integration Specialist',
      avatar: '🏷️',
    },
    pitch:
      '"What if your character drank real energy drinks? We\'ve got a deal with a major brand. They\'ll sponsor your entire harvest festival if every scarecrow wears their logo. It\'s synergy. It\'s beautiful."',
    funding: '+$300',
    fundingVal: 300,
    vision: '-25%',
    visionVal: 25,
    sticker: {
      text: 'BRAND\nPARTNER',
      type: 'bad',
      top: '75%',
      left: '-2%',
      rot: '5deg',
    },
    reviewNote: {
      text: 'Immersion-breaking product placement throughout',
      impact: 'neg',
      score: -20,
    },
    type: 'Brand Deal',
    titleSuffix: 'Sponsored Edition',
  },

  // 17. Forced Multiplayer / Always Online
  {
    id: 'alwayson',
    exec: {
      name: 'Greg Tanaka',
      title: 'Social Features Evangelist',
      avatar: '🌐',
    },
    pitch:
      '"Single-player is a red flag for investors. We need always-online. Co-op. Leaderboards. What if you could see other players\' farms? Competition drives retention. Solitude is a bug, not a feature."',
    funding: '+$240',
    fundingVal: 240,
    vision: '-25%',
    visionVal: 25,
    sticker: {
      text: 'ALWAYS\nONLINE',
      type: 'bad',
      top: '15%',
      left: '10%',
      rot: '3deg',
    },
    reviewNote: {
      text: 'Single-player game requires constant internet',
      impact: 'neg',
      score: -20,
    },
    type: 'Forced Online',
    titleSuffix: 'Online Required',
  },

  // 18. Good — Accessibility Advocate
  {
    id: 'goodaccess',
    exec: {
      name: 'Mei-Lin Torres',
      title: 'Accessibility Partnerships Lead',
      avatar: '♿',
    },
    pitch:
      '"We run a free accessibility consultancy for indie games. Colour-blind modes, remappable controls, screen reader support. No cost, no credit required. We just want more people to be able to play your game."',
    funding: '+$0',
    fundingVal: 0,
    vision: '+8%',
    visionVal: -8,
    sticker: {
      text: 'ACCESSIBILITY\nFIRST',
      type: 'good',
      top: '42%',
      right: '-4%',
      rot: '-2deg',
    },
    reviewNote: {
      text: 'Comprehensive accessibility options praised by players',
      impact: 'pos',
      score: 10,
    },
    type: 'Accessibility',
    titleSuffix: '',
  },

  // 19. Good — Localisation Grant
  {
    id: 'goodlocal',
    exec: {
      name: 'Sofia Andersson',
      title: 'Global Games Initiative',
      avatar: '🌍',
    },
    pitch:
      '"Our foundation funds localisation for indie games into 12 languages. Professional translators, cultural consultants, native QA testers. Your story deserves to be understood everywhere, not just in English."',
    funding: '+$150',
    fundingVal: 150,
    vision: '+5%',
    visionVal: -5,
    sticker: {
      text: '12 LANGUAGES\nSUPPORTED',
      type: 'good',
      top: '88%',
      right: '8%',
      rot: '2deg',
    },
    reviewNote: {
      text: 'Professional localisation into 12 languages',
      impact: 'pos',
      score: 10,
    },
    type: 'Localisation',
    titleSuffix: '',
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

export const BAD_OFFERS: Offer[] = ALL_OFFERS.filter(
  (o) => o.sticker.type !== 'good',
)
export const GOOD_OFFERS: Offer[] = ALL_OFFERS.filter(
  (o) => o.sticker.type === 'good',
)

// ─── Rounds ────────────────────────────────────────────────────────────────────

export const ROUNDS = [
  {
    name: 'Pitch Round',
    transition: {
      title: 'Funding Secured',
      text: 'The money is in. Development begins. Three months pass. Your game is taking shape — but the meetings keep coming.',
    },
  },
  {
    name: 'Dev Round',
    transition: {
      title: 'Alpha Approved',
      text: 'The alpha passed. Reviews are promising. One more gauntlet before launch day.',
    },
  },
  {
    name: 'Pre-Launch',
    transition: null,
  },
]
