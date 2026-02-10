import {defineField, defineType} from 'sanity'

// ─── Shared: CMS Link object ──────────────────────────
const cmsLink = [
  {
    name: 'label',
    type: 'string',
    title: 'Label',
    validation: (Rule: any) => Rule.required(),
  },
  {
    name: 'linkType',
    type: 'string',
    title: 'Link Type',
    options: {list: ['internal', 'external'], layout: 'radio'},
    initialValue: 'internal',
  },
  {
    name: 'internalRef',
    type: 'reference',
    title: 'Internal Page',
    to: [{type: 'game'}, {type: 'post'}, {type: 'product'}],
    hidden: ({parent}: any) => parent?.linkType !== 'internal',
  },
  {
    name: 'externalUrl',
    type: 'url',
    title: 'External URL',
    hidden: ({parent}: any) => parent?.linkType !== 'external',
  },
  {
    name: 'internalPath',
    type: 'string',
    title: 'Internal Path',
    description: 'Manual path like /games or /quizzes (use if not referencing a document)',
    hidden: ({parent}: any) => parent?.linkType !== 'internal',
  },
]

// ─── Section: Hero ────────────────────────────────────
const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'subheadline', title: 'Subheadline', type: 'text', rows: 2}),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'primaryButton',
      title: 'Primary Button',
      type: 'object',
      fields: cmsLink,
    }),
    defineField({
      name: 'secondaryButton',
      title: 'Secondary Button',
      type: 'object',
      fields: cmsLink,
    }),
    defineField({
      name: 'tags',
      title: 'Small Badges / Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
  ],
  preview: {
    select: {title: 'headline', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {
        title: `Hero: ${title || 'Untitled'}`,
        subtitle: enabled ? 'Enabled' : 'Disabled',
      }
    },
  },
})

// ─── Section: Carousel Row (Netflix row) ──────────────
const carouselRowSection = defineType({
  name: 'carouselRowSection',
  title: 'Carousel Row',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({
      name: 'rowTitle',
      title: 'Row Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'rowSubtitle', title: 'Row Subtitle', type: 'string'}),
    defineField({
      name: 'rowType',
      title: 'Row Content Type',
      type: 'string',
      options: {
        list: [
          {title: 'Games', value: 'games'},
          {title: 'Blog Posts', value: 'posts'},
          {title: 'Products', value: 'products'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sourceType',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          {title: 'Hand-picked (Curated)', value: 'curated'},
          {title: 'Auto-fill (Dynamic)', value: 'dynamic'},
        ],
        layout: 'radio',
      },
      initialValue: 'curated',
    }),
    // Curated items
    defineField({
      name: 'curatedGames',
      title: 'Curated Games',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'game'}]}],
      hidden: ({parent}) => parent?.sourceType !== 'curated' || parent?.rowType !== 'games',
    }),
    defineField({
      name: 'curatedPosts',
      title: 'Curated Posts',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'post'}]}],
      hidden: ({parent}) => parent?.sourceType !== 'curated' || parent?.rowType !== 'posts',
    }),
    defineField({
      name: 'curatedProducts',
      title: 'Curated Products',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'product'}]}],
      hidden: ({parent}) => parent?.sourceType !== 'curated' || parent?.rowType !== 'products',
    }),
    // Dynamic query filters
    defineField({
      name: 'dynamicQuery',
      title: 'Dynamic Query Filters',
      type: 'object',
      hidden: ({parent}) => parent?.sourceType !== 'dynamic',
      fields: [
        {
          name: 'filterByCategory',
          type: 'reference',
          title: 'Filter by Category',
          to: [{type: 'category'}],
        },
        {
          name: 'filterByTags',
          type: 'array',
          title: 'Filter by Tags',
          of: [{type: 'string'}],
          options: {layout: 'tags'},
        },
        {
          name: 'filterByPlatform',
          type: 'string',
          title: 'Filter by Platform',
          options: {
            list: ['PC', 'Switch', 'PS5', 'Xbox', 'Mobile'],
          },
        },
        {
          name: 'filterByCoop',
          type: 'boolean',
          title: 'Co-op Only',
        },
        {
          name: 'sortBy',
          type: 'string',
          title: 'Sort By',
          options: {
            list: [
              {title: 'Trending', value: 'trending'},
              {title: 'Newest', value: 'newest'},
              {title: 'Editor Pick', value: 'editorPick'},
              {title: 'Cozy Rating', value: 'rating'},
              {title: 'Random', value: 'random'},
            ],
          },
          initialValue: 'newest',
        },
        {
          name: 'limit',
          type: 'number',
          title: 'Max Items',
          initialValue: 10,
          validation: (Rule: any) => Rule.min(1).max(20),
        },
        {
          name: 'timeWindowDays',
          type: 'number',
          title: 'Time Window (days)',
          description: 'Only show items published within this many days (for trending)',
        },
      ],
    }),
    defineField({
      name: 'seeAllLink',
      title: 'See All Link',
      type: 'object',
      fields: cmsLink,
    }),
  ],
  preview: {
    select: {title: 'rowTitle', rowType: 'rowType', enabled: 'enabled'},
    prepare({title, rowType, enabled}) {
      return {
        title: `Row: ${title || 'Untitled'}`,
        subtitle: `${rowType || '?'} • ${enabled ? 'Enabled' : 'Disabled'}`,
      }
    },
  },
})

// ─── Section: Quiz CTA ────────────────────────────────
const quizCtaSection = defineType({
  name: 'quizCtaSection',
  title: 'Quiz CTA',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
    defineField({
      name: 'buttonLabel',
      title: 'Button Label',
      type: 'string',
      initialValue: 'Take the quiz',
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'object',
      fields: cmsLink,
    }),
    defineField({name: 'icon', title: 'Icon Name', type: 'string', description: 'Lucide icon name (e.g. "sparkles")'}),
  ],
  preview: {
    select: {title: 'title', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {
        title: `Quiz CTA: ${title || 'Untitled'}`,
        subtitle: enabled ? 'Enabled' : 'Disabled',
      }
    },
  },
})

// ─── Section: Game of the Month ───────────────────────
const gameOfMonthSection = defineType({
  name: 'gameOfMonthSection',
  title: 'Game of the Month',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'title', title: 'Section Title', type: 'string', initialValue: 'Game of the Month'}),
    defineField({
      name: 'featuredGame',
      title: 'Featured Game',
      type: 'reference',
      to: [{type: 'game'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'customBlurb', title: 'Custom Blurb', type: 'text', rows: 4}),
    defineField({name: 'buttonLabel', title: 'Button Label', type: 'string', initialValue: 'Read more'}),
    defineField({
      name: 'link',
      title: 'Custom Link (overrides game page)',
      type: 'object',
      fields: cmsLink,
    }),
  ],
  preview: {
    select: {title: 'title', gameName: 'featuredGame.title', enabled: 'enabled'},
    prepare({title, gameName, enabled}) {
      return {
        title: `${title || 'Game of the Month'}: ${gameName || '(none)'}`,
        subtitle: enabled ? 'Enabled' : 'Disabled',
      }
    },
  },
})

// ─── Section: Product Feature ─────────────────────────
const productFeatureSection = defineType({
  name: 'productFeatureSection',
  title: 'Product Feature',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'subtitle', title: 'Subtitle', type: 'string'}),
    defineField({
      name: 'products',
      title: 'Products',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'product'}]}],
      validation: (Rule) => Rule.min(1).max(8),
    }),
    defineField({
      name: 'cta',
      title: 'CTA Button',
      type: 'object',
      fields: cmsLink,
    }),
  ],
  preview: {
    select: {title: 'title', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {
        title: `Products: ${title || 'Untitled'}`,
        subtitle: enabled ? 'Enabled' : 'Disabled',
      }
    },
  },
})

// ─── Section: Blog Feature ────────────────────────────
const blogFeatureSection = defineType({
  name: 'blogFeatureSection',
  title: 'Blog Feature',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'subtitle', title: 'Subtitle', type: 'string'}),
    defineField({
      name: 'sourceType',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          {title: 'Hand-picked (Curated)', value: 'curated'},
          {title: 'Auto-fill (Dynamic)', value: 'dynamic'},
        ],
        layout: 'radio',
      },
      initialValue: 'curated',
    }),
    defineField({
      name: 'curatedPosts',
      title: 'Curated Posts',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'post'}]}],
      hidden: ({parent}) => parent?.sourceType !== 'curated',
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: 'dynamicQuery',
      title: 'Dynamic Query',
      type: 'object',
      hidden: ({parent}) => parent?.sourceType !== 'dynamic',
      fields: [
        {
          name: 'category',
          type: 'reference',
          title: 'Category',
          to: [{type: 'category'}],
        },
        {
          name: 'tags',
          type: 'array',
          title: 'Tags',
          of: [{type: 'string'}],
          options: {layout: 'tags'},
        },
        {
          name: 'sortBy',
          type: 'string',
          title: 'Sort By',
          options: {list: ['newest', 'featured']},
          initialValue: 'newest',
        },
        {
          name: 'limit',
          type: 'number',
          title: 'Max Posts',
          initialValue: 4,
          validation: (Rule: any) => Rule.min(1).max(6),
        },
      ],
    }),
  ],
  preview: {
    select: {title: 'title', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {
        title: `Blog: ${title || 'Untitled'}`,
        subtitle: enabled ? 'Enabled' : 'Disabled',
      }
    },
  },
})

// ─── Section: Newsletter ──────────────────────────────
const newsletterSection = defineType({
  name: 'newsletterSection',
  title: 'Newsletter Signup',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'copy', title: 'Copy', type: 'text', rows: 3}),
    defineField({
      name: 'placeholderText',
      title: 'Input Placeholder',
      type: 'string',
      initialValue: 'your@email.com',
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button Label',
      type: 'string',
      initialValue: 'Subscribe',
    }),
    defineField({name: 'disclaimer', title: 'Small Disclaimer', type: 'string'}),
  ],
  preview: {
    select: {title: 'title', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {
        title: `Newsletter: ${title || 'Untitled'}`,
        subtitle: enabled ? 'Enabled' : 'Disabled',
      }
    },
  },
})

// ─── Homepage Document ────────────────────────────────
const homePage = defineType({
  name: 'homePage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      initialValue: 'Homepage',
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      description: 'Drag to reorder homepage sections',
      type: 'array',
      of: [
        {type: 'heroSection'},
        {type: 'carouselRowSection'},
        {type: 'quizCtaSection'},
        {type: 'gameOfMonthSection'},
        {type: 'productFeatureSection'},
        {type: 'blogFeatureSection'},
        {type: 'newsletterSection'},
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Homepage'}
    },
  },
})

// Export all types (document + objects)
export const homePageSchemas = [
  heroSection,
  carouselRowSection,
  quizCtaSection,
  gameOfMonthSection,
  productFeatureSection,
  blogFeatureSection,
  newsletterSection,
  homePage,
]
