/* ──────────────────────────────────────────────
   Pip Dashboard v2 — Mock Data & Shared Types
   ────────────────────────────────────────────── */

// ─── Interfaces ──────────────────────────────

export interface PipIdea {
  id: string;
  type: string;
  typeEmoji: string;
  title: string;
  reason: string;
  difficulty: 1 | 2 | 3;
  cluster: string;
  trending: boolean;
}

export interface AnalyticsData {
  overview: {
    sessions7d: number;
    sessionsDelta: number;
    avgReadTime: number;
    returnVisitorPct: number;
    newVisitorPct: number;
    trafficSources: { organic: number; direct: number; social: number; referral: number };
    weeklyTrend: number[];
  };
  topPosts: Array<{
    title: string;
    sessions: number;
    readTime: number;
    bounceRate: number;
    position: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  audience: {
    topCountries: Array<{ country: string; sessions: number; pct: number }>;
    deviceSplit: { mobile: number; desktop: number; tablet: number };
    personas: Array<{
      name: string;
      icon: string;
      findsVia: string;
      readsMost: string;
      avgTime: string;
      peakHours: string;
      need: string;
    }>;
  };
  search: {
    topQueries: Array<{
      query: string;
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;
    quickWins: Array<{
      query: string;
      position: number;
      impressions: number;
      opportunity: string;
    }>;
  };
}

export interface PipCluster {
  id: string;
  name: string;
  steps: Array<{
    title: string;
    role: 'Pillar' | 'Supporting' | 'Mood Editorial' | 'Standalone';
    status: 'published' | 'drafted' | 'planned';
  }>;
}

export interface PipAchievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: 'published' | 'planned' | 'social';
}

export interface ContentIdea {
  id: string;
  emoji: string;
  mood: string;
  title: string;
  why: string;
  shotList?: string[];
  effort: 1 | 2 | 3;
}

export interface PinterestPin {
  id: string;
  postTitle: string;
  pinTitle: string;
  description: string;
  board: string;
  imageBrief: string;
}

export interface InstagramCaption {
  id: string;
  postTitle: string;
  hookLine: string;
  fullCaption: string;
  suggestedTime: string;
}

export interface SeoSuggestion {
  id: string;
  title: string;
  difficulty: 'Low' | 'Medium' | 'High';
  volume: number;
}

export interface BoostPlan {
  headline: string;
  target: string;
  honestAssessment: string;
  weeks: Array<{
    weekRange: string;
    focus: string;
    tasks: Array<{ task: string; why: string; effort: 'low' | 'medium' | 'high' }>;
  }>;
  bigBet: string;
  pipNote: string;
}

export interface BoostContext {
  sessions: number;
  sessionsDelta: number;
  totalPosts: number;
  activeCluster: string;
  clusterProgress: number;
  clusterTotal: number;
  streak: number;
  topPost: { title: string; sessions: number };
  quickWin: { query: string; position: number };
}

// ─── Mock Ideas ──────────────────────────────

export const mockIdeas: PipIdea[] = [
  {
    id: 'idea-1',
    type: 'List',
    typeEmoji: '\u{1F4CB}',
    title: 'Games to play when you\'re too tired to make decisions',
    reason:
      'This one could do really well. Your anxiety content already resonates, and "too tired to decide" is a feeling almost everyone has had but nobody writes about specifically. It\'s the kind of search people make at 11pm on a Tuesday.',
    difficulty: 1,
    cluster: 'Anxiety & Low Energy',
    trending: true,
  },
  {
    id: 'idea-2',
    type: 'Essay',
    typeEmoji: '\u{270D}\u{FE0F}',
    title: 'Why people return to Stardew Valley after a hard year',
    reason:
      'Your Stardew content already pulls in readers, and this angle is different from the usual "best mods" stuff. It taps into something emotional that your audience clearly connects with. The personal take is what will set it apart.',
    difficulty: 2,
    cluster: 'Games Like Stardew Valley',
    trending: false,
  },
  {
    id: 'idea-3',
    type: 'List',
    typeEmoji: '\u{1F4CB}',
    title: '5 games that feel like a warm bath',
    reason:
      'The sensory framing is what makes this special. People search for how games feel, not just what they are. This kind of title does well on Pinterest too, and it\'s genuinely low effort to put together since you\'ve played all of these.',
    difficulty: 1,
    cluster: 'Anxiety & Low Energy',
    trending: true,
  },
  {
    id: 'idea-4',
    type: 'Review',
    typeEmoji: '\u{2B50}',
    title: 'A Short Hike might be the perfect 2-hour game',
    reason:
      'Short Hike already gets traffic to the site, and a focused review with this angle fills a real gap. Most reviews don\'t talk about why a short game is actually a feature, not a flaw. Your voice is perfect for this.',
    difficulty: 2,
    cluster: 'Cosy Lifestyle',
    trending: false,
  },
  {
    id: 'idea-5',
    type: 'Mood Editorial',
    typeEmoji: '\u{1F319}',
    title: 'Games for when your brain won\'t stop',
    reason:
      'This is already one of your top-performing search terms and the existing post does well, but a dedicated mood editorial would go deeper. It\'s the kind of content people bookmark and come back to. High emotional resonance.',
    difficulty: 1,
    cluster: 'Anxiety & Low Energy',
    trending: true,
  },
  {
    id: 'idea-6',
    type: 'Essay',
    typeEmoji: '\u{270D}\u{FE0F}',
    title: 'Spiritfarer and learning to let go',
    reason:
      'Your Spiritfarer review is your top post by a wide margin, so there\'s clearly an audience hungry for more depth here. An essay about the emotional core of the game would attract a different kind of reader \u2014 one who stays longer and shares more.',
    difficulty: 3,
    cluster: 'Standalone',
    trending: false,
  },
  {
    id: 'idea-7',
    type: 'List',
    typeEmoji: '\u{1F4CB}',
    title: 'The best cosy games on Game Pass right now',
    reason:
      'Game Pass lists have high search volume and the "cosy" angle is underserved in that space. This could pull in the returning-gamer persona who already has a subscription but doesn\'t know where to start. Easy to keep updated too.',
    difficulty: 2,
    cluster: 'Games Like Stardew Valley',
    trending: false,
  },
  {
    id: 'idea-8',
    type: 'Essay',
    typeEmoji: '\u{270D}\u{FE0F}',
    title: 'Why cosy games aren\'t just for casual players',
    reason:
      'This is a conversation-starter piece. It challenges a common assumption and could attract readers from outside your usual audience. It\'s harder to write because the argument needs to be thoughtful, but the payoff in shares and discussion could be significant.',
    difficulty: 3,
    cluster: 'Standalone',
    trending: false,
  },
];

// ─── Mock Analytics ──────────────────────────

export const mockAnalytics: AnalyticsData = {
  overview: {
    sessions7d: 847,
    sessionsDelta: 23,
    avgReadTime: 228,
    returnVisitorPct: 34,
    newVisitorPct: 66,
    trafficSources: { organic: 58, direct: 22, social: 14, referral: 6 },
    weeklyTrend: [312, 398, 445, 502, 589, 634, 710, 847],
  },
  topPosts: [
    { title: 'Spiritfarer review', sessions: 312, readTime: 252, bounceRate: 28, position: 14, trend: 'up' },
    { title: '10 games for when your brain won\'t stop', sessions: 289, readTime: 216, bounceRate: 31, position: 18, trend: 'up' },
    { title: 'A Short Hike review', sessions: 146, readTime: 186, bounceRate: 35, position: 22, trend: 'stable' },
    { title: 'Stardew Valley: why we keep coming back', sessions: 134, readTime: 312, bounceRate: 22, position: 11, trend: 'up' },
    { title: 'Best cosy games for anxiety', sessions: 98, readTime: 198, bounceRate: 40, position: 26, trend: 'down' },
  ],
  audience: {
    topCountries: [
      { country: 'United Kingdom', sessions: 423, pct: 50 },
      { country: 'United States', sessions: 212, pct: 25 },
      { country: 'Australia', sessions: 85, pct: 10 },
      { country: 'Canada', sessions: 68, pct: 8 },
      { country: 'Germany', sessions: 59, pct: 7 },
    ],
    deviceSplit: { mobile: 54, desktop: 38, tablet: 8 },
    personas: [
      {
        name: 'The Late-Night Winder-Downer',
        icon: '\u{1F319}',
        findsVia: 'Google searches for relaxing/anxiety games',
        readsMost: 'Mood editorial, anxiety games content',
        avgTime: '4+ minutes',
        peakHours: '9pm\u2013midnight',
        need: 'Games that help them decompress after a hard day.',
      },
      {
        name: 'The Returning Gamer',
        icon: '\u{1F3AE}',
        findsVia: 'Searches for games like Stardew Valley',
        readsMost: 'Detailed reviews, "games like X" lists',
        avgTime: '3 minutes',
        peakHours: 'Weekend mornings',
        need: 'Permission to get back into gaming after years away.',
      },
      {
        name: 'The Anxious Discoverer',
        icon: '\u{1F33F}',
        findsVia: 'Pinterest, mental health + gaming searches',
        readsMost: 'Mood editorial, anxiety-friendly tag',
        avgTime: '5+ minutes',
        peakHours: 'Sundays, late afternoon',
        need: 'Games that genuinely won\'t stress them out.',
      },
    ],
  },
  search: {
    topQueries: [
      { query: 'games for anxiety', clicks: 89, impressions: 1240, ctr: 7.2, position: 14.3 },
      { query: 'cosy games no fail state', clicks: 67, impressions: 890, ctr: 7.5, position: 11.8 },
      { query: 'spiritfarer review', clicks: 54, impressions: 430, ctr: 12.6, position: 8.2 },
      { query: 'games like stardew valley pc', clicks: 41, impressions: 2100, ctr: 2.0, position: 19.4 },
      { query: 'short hike game review', clicks: 38, impressions: 310, ctr: 12.3, position: 9.1 },
    ],
    quickWins: [
      { query: 'cosy games for anxiety', position: 14, impressions: 1240, opportunity: 'One internal link from the pillar could push this into top 10' },
      { query: 'games like stardew valley pc', position: 19, impressions: 2100, opportunity: 'High volume \u2014 this is Cluster 2. One strong post would move the needle.' },
    ],
  },
};

// ─── Mock Clusters ───────────────────────────

export const mockClusters: PipCluster[] = [
  {
    id: 'cluster-1',
    name: 'Anxiety & Low Energy',
    steps: [
      { title: 'Best cosy games for anxiety (Pillar)', role: 'Pillar', status: 'published' },
      { title: '10 games for when your brain won\'t stop', role: 'Supporting', status: 'published' },
      { title: 'Games to play when you\'re too tired to decide', role: 'Supporting', status: 'drafted' },
      { title: '5 games that feel like a warm bath', role: 'Mood Editorial', status: 'planned' },
      { title: 'Games for when your brain won\'t stop (mood editorial)', role: 'Mood Editorial', status: 'planned' },
    ],
  },
  {
    id: 'cluster-2',
    name: 'Games Like Stardew Valley',
    steps: [
      { title: 'Stardew Valley: why we keep coming back', role: 'Pillar', status: 'published' },
      { title: 'Best cosy games on Game Pass right now', role: 'Supporting', status: 'drafted' },
      { title: 'Why people return to Stardew Valley after a hard year', role: 'Supporting', status: 'planned' },
      { title: 'Games like Stardew Valley you haven\'t tried yet', role: 'Supporting', status: 'planned' },
    ],
  },
  {
    id: 'cluster-3',
    name: 'Cosy Lifestyle',
    steps: [
      { title: 'A Short Hike might be the perfect 2-hour game', role: 'Pillar', status: 'planned' },
      { title: 'Building a cosy gaming setup on a budget', role: 'Supporting', status: 'planned' },
      { title: 'The case for short games in a busy life', role: 'Mood Editorial', status: 'planned' },
    ],
  },
];

// ─── Mock Achievements ───────────────────────

export const mockAchievements: PipAchievement[] = [
  { id: 'ach-1', emoji: '\u{1F4DD}', name: 'First Post', description: 'Published your very first article', earned: true },
  { id: 'ach-2', emoji: '\u{1F3AF}', name: 'Cluster Complete', description: 'Finished every post in a content cluster', earned: false },
  { id: 'ach-3', emoji: '\u{1F525}', name: 'Week Streak', description: 'Published something every week for a month', earned: true },
  { id: 'ach-4', emoji: '\u{1F4C8}', name: '100 Sessions', description: 'Hit 100 sessions in a single week', earned: true },
  { id: 'ach-5', emoji: '\u{1F3C6}', name: 'SEO Win', description: 'Reached the top 10 for a target keyword', earned: false },
  { id: 'ach-6', emoji: '\u{1F98B}', name: 'Social Butterfly', description: 'Got 50+ clicks from social in one week', earned: false },
];

// ─── Mock Calendar Events ────────────────────

export const mockCalendarEvents: CalendarEvent[] = [
  { id: 'cal-1', date: '2026-02-02', title: 'Spiritfarer review published', type: 'published' },
  { id: 'cal-2', date: '2026-02-09', title: '10 games for anxious brains published', type: 'published' },
  { id: 'cal-3', date: '2026-02-16', title: 'A Short Hike review published', type: 'published' },
  { id: 'cal-4', date: '2026-02-23', title: 'Stardew essay (draft due)', type: 'planned' },
  { id: 'cal-5', date: '2026-03-02', title: 'Games like a warm bath (publish)', type: 'planned' },
  { id: 'cal-6', date: '2026-03-05', title: 'Pinterest batch \u2014 anxiety cluster', type: 'social' },
  { id: 'cal-7', date: '2026-03-09', title: 'Game Pass list (publish)', type: 'planned' },
  { id: 'cal-8', date: '2026-03-16', title: 'Instagram reel \u2014 cosy desk setup', type: 'social' },
];

// ─── Mock Video Ideas ────────────────────────

export const mockVideoIdeas: ContentIdea[] = [
  {
    id: 'vid-1',
    emoji: '\u{1F319}',
    mood: 'Gentle, ASMR-adjacent',
    title: 'Cosy games to fall asleep to',
    why: 'Sleep content does incredibly well on YouTube, and combining it with cosy games is a niche nobody owns yet. Think soft voiceover, gameplay footage, lo-fi music.',
    shotList: ['Slow gameplay clips (Stardew night scenes, Spiritfarer sailing)', 'Soft lighting desk setup B-roll', 'Rain ambience overlay'],
    effort: 2,
  },
  {
    id: 'vid-2',
    emoji: '\u{1F3AE}',
    mood: 'Warm, conversational',
    title: 'I played only cosy games for a week',
    why: 'Challenge/experiment formats pull in casual viewers who wouldn\'t normally search for cosy games. It\'s a gateway video that introduces your whole niche.',
    shotList: ['Daily diary-style talking head', 'Screen recordings of each game', 'End-of-week reflection with favourites list'],
    effort: 3,
  },
  {
    id: 'vid-3',
    emoji: '\u{2615}',
    mood: 'Quick, upbeat',
    title: '5 cosy games under 3 hours',
    why: 'Short-form list videos are perfect for YouTube Shorts or TikTok. Low effort, high replay value, and they funnel people to your longer reviews.',
    shotList: ['15-second clip per game', 'Text overlay with game name and playtime', 'Upbeat lo-fi background track'],
    effort: 1,
  },
];

// ─── Mock Pinterest Pins ─────────────────────

export const mockPinterestPins: PinterestPin[] = [
  {
    id: 'pin-1',
    postTitle: 'Best cosy games for anxiety',
    pinTitle: '12 Cosy Games That Actually Help With Anxiety',
    description: 'Struggling to unwind? These cosy games have no fail states, no time pressure, and genuinely help you decompress. Perfect for anxious evenings. #cosygames #anxiety #gaming',
    board: 'Cosy Gaming',
    imageBrief: 'Soft gradient background (lavender to warm peach), game screenshots in rounded frames, handwritten-style title text, small leaf decorations',
  },
  {
    id: 'pin-2',
    postTitle: 'Spiritfarer review',
    pinTitle: 'Spiritfarer Will Make You Cry (In the Best Way)',
    description: 'A beautiful game about saying goodbye. Read our full review of Spiritfarer and find out why it\'s one of the most emotionally resonant games ever made. #spiritfarer #indiegames #cosygames',
    board: 'Game Reviews',
    imageBrief: 'Spiritfarer key art with warm overlay, star/constellation decorative elements, clean serif title text at bottom',
  },
  {
    id: 'pin-3',
    postTitle: 'A Short Hike review',
    pinTitle: 'The Perfect Game for a Sunday Afternoon',
    description: 'A Short Hike is a tiny, joyful game you can finish in two hours. It\'s about climbing a mountain, but really it\'s about slowing down. #ashorthike #shortgames #cosygaming',
    board: 'Cosy Gaming',
    imageBrief: 'Mountain scene illustration style, soft blues and greens, A Short Hike character small in centre, large friendly title text',
  },
];

// ─── Mock Instagram Captions ─────────────────

export const mockInstagramCaptions: InstagramCaption[] = [
  {
    id: 'ig-1',
    postTitle: 'Spiritfarer review',
    hookLine: 'This game made me ugly cry at 2am and I\'d do it again.',
    fullCaption: 'This game made me ugly cry at 2am and I\'d do it again.\n\nSpiritfarer is about caring for spirits before they move on. It sounds heavy, and it is, but it\'s also one of the warmest games I\'ve ever played.\n\nFull review on the blog (link in bio).\n\n#spiritfarer #cosygames #indiegames #gamingreview #cosygaming',
    suggestedTime: 'Thursday 7pm',
  },
  {
    id: 'ig-2',
    postTitle: 'Best cosy games for anxiety',
    hookLine: 'Your brain is loud. These games are quiet.',
    fullCaption: 'Your brain is loud. These games are quiet.\n\nI put together a list of cosy games that genuinely help when anxiety is running the show. No jump scares, no time pressure, no fail states.\n\nJust gentle worlds you can exist in for a while.\n\nFull list on the blog \u2014 link in bio.\n\n#anxietygames #cosygames #mentalhealthgaming #gamingcommunity #relaxinggames',
    suggestedTime: 'Sunday 5pm',
  },
  {
    id: 'ig-3',
    postTitle: 'A Short Hike review',
    hookLine: 'What if a game respected your time?',
    fullCaption: 'What if a game respected your time?\n\nA Short Hike is two hours long and it\'s perfect. You climb a mountain, you talk to birds, you skip stones. That\'s it. That\'s the game.\n\nSometimes that\'s all you need.\n\nReview on the blog, link in bio.\n\n#ashorthike #shortgames #indiegames #cosygaming #sundaygaming',
    suggestedTime: 'Saturday 10am',
  },
];

// ─── Mock SEO Suggestions ────────────────────

export const mockSeoSuggestions: SeoSuggestion[] = [
  { id: 'seo-1', title: 'cosy games for anxiety', difficulty: 'Medium', volume: 1240 },
  { id: 'seo-2', title: 'games like stardew valley pc', difficulty: 'High', volume: 2100 },
  { id: 'seo-3', title: 'relaxing games no fail state', difficulty: 'Low', volume: 890 },
  { id: 'seo-4', title: 'best short cosy games', difficulty: 'Low', volume: 720 },
  { id: 'seo-5', title: 'spiritfarer review 2026', difficulty: 'Low', volume: 430 },
];

// ─── Mock Goal ───────────────────────────────

export const mockGoal = {
  title: 'Reach 1,500 sessions/week',
  current: 847,
  target: 1500,
  milestones: [500, 1000, 1500, 2000],
};

// ─── Mock Boost Plan ─────────────────────────

export const mockBoostPlan: BoostPlan = {
  headline: 'From 847 to 1,500 sessions/week in 8 weeks',
  target: '1,500 sessions/week by end of April 2026',
  honestAssessment:
    'You\'re at 847 sessions with strong growth (+23% week-on-week). Your anxiety content is clearly resonating and Spiritfarer is doing the heavy lifting in search. The main gap is Cluster 2 \u2014 Stardew/similar games content has huge search volume but you only have one post there. Filling that cluster is the single biggest lever.',
  weeks: [
    {
      weekRange: 'Week 1\u20132',
      focus: 'Quick wins & internal linking',
      tasks: [
        { task: 'Add internal links from Spiritfarer review to anxiety cluster posts', why: 'Your top post has no outbound internal links \u2014 this is leaving authority on the table', effort: 'low' },
        { task: 'Publish "Games to play when you\'re too tired to decide"', why: 'Low difficulty, high-trending topic, strengthens your strongest cluster', effort: 'medium' },
        { task: 'Create 3 Pinterest pins for anxiety cluster', why: 'Pinterest is already 14% of traffic \u2014 lean into what\'s working', effort: 'low' },
      ],
    },
    {
      weekRange: 'Week 3\u20134',
      focus: 'Cluster 2 foundation',
      tasks: [
        { task: 'Publish "Best cosy games on Game Pass right now"', why: 'High search volume keyword, fills a gap in Cluster 2', effort: 'medium' },
        { task: 'Publish "Why people return to Stardew Valley after a hard year"', why: 'Emotional essay that builds topical authority for "games like Stardew"', effort: 'high' },
        { task: 'Interlink all Cluster 2 posts with the Stardew pillar', why: 'Cluster strategy only works when everything is connected', effort: 'low' },
      ],
    },
    {
      weekRange: 'Week 5\u20136',
      focus: 'Mood editorial & social push',
      tasks: [
        { task: 'Publish "Games for when your brain won\'t stop" mood editorial', why: 'Deepens your strongest topic with a format that gets bookmarked and shared', effort: 'medium' },
        { task: 'Run Instagram campaign for anxiety content', why: 'Your Anxious Discoverer persona finds you through social \u2014 meet them there', effort: 'medium' },
        { task: 'Publish "5 games that feel like a warm bath"', why: 'Sensory title that performs well on Pinterest, low effort', effort: 'low' },
      ],
    },
    {
      weekRange: 'Week 7\u20138',
      focus: 'Consolidate & measure',
      tasks: [
        { task: 'Audit all posts for meta descriptions and title tags', why: 'Quick SEO hygiene pass that compounds over time', effort: 'low' },
        { task: 'Publish one Cluster 3 starter post', why: 'Plants the seed for your next growth phase without overcommitting', effort: 'medium' },
        { task: 'Review analytics and adjust plan for next cycle', why: 'What got you to 1,500 won\'t get you to 3,000 \u2014 reassess', effort: 'low' },
      ],
    },
  ],
  bigBet:
    'The Stardew cluster. "Games like Stardew Valley" has 2,100 impressions and you\'re at position 19. Two strong posts could move you into the top 10, which alone could add 200+ sessions/week.',
  pipNote:
    'You\'re closer than you think. The growth trend is real and the content quality is there. The main thing holding you back isn\'t talent \u2014 it\'s just coverage. More posts in the clusters that are already working. You don\'t need to reinvent anything.',
};

// ─── Mock Boost Context ──────────────────────

export const mockBoostContext: BoostContext = {
  sessions: 847,
  sessionsDelta: 23,
  totalPosts: 5,
  activeCluster: 'Anxiety & Low Energy',
  clusterProgress: 2,
  clusterTotal: 5,
  streak: 4,
  topPost: { title: 'Spiritfarer review', sessions: 312 },
  quickWin: { query: 'cosy games for anxiety', position: 14 },
};
