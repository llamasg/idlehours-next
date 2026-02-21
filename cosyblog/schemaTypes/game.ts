import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'game',
  title: 'Game',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(250),
    }),
    defineField({
      name: 'longDescription',
      title: 'Long Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'platforms',
      title: 'Platforms',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'PC', value: 'PC'},
          {title: 'Switch', value: 'Switch'},
          {title: 'PS5', value: 'PS5'},
          {title: 'Xbox', value: 'Xbox'},
          {title: 'Mobile', value: 'Mobile'},
        ],
      },
    }),
    defineField({
      name: 'genres',
      title: 'Genres / Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'e.g. "cozy", "travel", "short-session", "rainy-day"',
    }),
    defineField({
      name: 'coop',
      title: 'Co-op / Multiplayer',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'affiliateLinks',
      title: 'Buy Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', type: 'string', title: 'Store Name'},
            {
              name: 'url',
              type: 'url',
              title: 'URL',
              validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
            },
          ],
          preview: {
            select: {title: 'label', subtitle: 'url'},
          },
        },
      ],
    }),
    defineField({
      name: 'openCriticScore',
      title: 'OpenCritic Score',
      type: 'number',
      description: '0–100 score from OpenCritic (leave blank if not yet scored)',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'openCriticId',
      title: 'OpenCritic ID',
      type: 'string',
      description: 'Integer ID from OpenCritic URL (e.g. "10703" for Stardew Valley). Used by nightly job to auto-fetch score.',
    }),
    defineField({
      name: 'steamAppId',
      title: 'Steam App ID',
      type: 'string',
      description: 'Steam numeric App ID (e.g. "413150" for Stardew Valley). Used for future price fetching.',
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'number',
      description: '1 = Beginner friendly, 2 = Intermediate, 3 = Experienced players',
      options: {
        list: [
          {title: '1 — Beginner friendly', value: 1},
          {title: '2 — Intermediate', value: 2},
          {title: '3 — Experienced players', value: 3},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.min(1).max(3).integer(),
    }),
    defineField({
      name: 'replayability',
      title: 'Replayability',
      type: 'number',
      description: '1–5, supports 0.5 increments (e.g. 3.5)',
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: 'greatSoundtrack',
      title: 'Great Soundtrack',
      type: 'boolean',
      description: 'Does this game have a standout soundtrack?',
      initialValue: false,
    }),
    defineField({
      name: 'genre',
      title: 'Genre Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          'farming', 'survival', 'roguelike', 'turn-based', 'puzzle',
          'platformer', 'adventure', 'RPG', 'simulation', 'sandbox',
          'visual novel', 'horror',
        ],
        layout: 'tags',
      },
    }),
    defineField({
      name: 'currentPrice',
      title: 'Current Price (£)',
      type: 'number',
      description: 'Updated by nightly job',
    }),
    defineField({
      name: 'isFree',
      title: 'Free to Play',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'lastPriceUpdated',
      title: 'Last Price Updated',
      type: 'datetime',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      score: 'openCriticScore',
    },
    prepare({title, media, score}) {
      return {
        title,
        subtitle: score != null ? `OpenCritic: ${score}` : '',
        media,
      }
    },
  },
  orderings: [
    {title: 'Published', name: 'publishedDesc', by: [{field: 'publishedAt', direction: 'desc'}]},
    {title: 'Title', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
  ],
})
