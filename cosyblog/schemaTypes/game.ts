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
      name: 'ratings',
      title: 'Idle Hours Ratings',
      type: 'object',
      fields: [
        {
          name: 'cozyPercent',
          title: 'Cozy %',
          type: 'number',
          validation: (Rule) => Rule.min(0).max(100),
        },
        {
          name: 'brainEffort',
          title: 'Brain Effort',
          type: 'string',
          options: {
            list: [
              {title: 'Low', value: 'Low'},
              {title: 'Medium', value: 'Medium'},
              {title: 'High', value: 'High'},
            ],
            layout: 'radio',
          },
        },
        {
          name: 'snackSafe',
          title: 'Snack Safe?',
          type: 'boolean',
          description: 'Can you eat snacks while playing? (no frantic inputs)',
          initialValue: true,
        },
      ],
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
      cozy: 'ratings.cozyPercent',
    },
    prepare({title, media, cozy}) {
      return {
        title,
        subtitle: cozy != null ? `Cozy: ${cozy}%` : '',
        media,
      }
    },
  },
  orderings: [
    {title: 'Published', name: 'publishedDesc', by: [{field: 'publishedAt', direction: 'desc'}]},
    {title: 'Title', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
  ],
})
