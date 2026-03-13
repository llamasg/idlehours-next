import {defineType, defineField, defineArrayMember} from 'sanity'

export const curatedRowGame = defineType({
  name: 'curatedRowGame',
  title: 'Curated Row Game',
  type: 'object',
  fields: [
    defineField({
      name: 'game',
      title: 'Game',
      type: 'reference',
      to: [{type: 'game'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isStaffPick',
      title: 'Staff Pick',
      type: 'boolean',
      initialValue: false,
      description:
        'Displays this game with a prominent stipple popup card instead of a standard tile',
    }),
  ],
  preview: {
    select: {
      title: 'game.title',
      media: 'game.coverImage',
      isStaffPick: 'isStaffPick',
    },
    prepare({title, media, isStaffPick}) {
      return {
        title: title || 'Untitled game',
        media,
        subtitle: isStaffPick ? '⭐ Staff Pick' : undefined,
      }
    },
  },
})

export const curatedRow = defineType({
  name: 'curatedRow',
  title: 'Curated Row',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Supports *italic* with asterisks for styled emphasis',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'games',
      title: 'Games',
      type: 'array',
      of: [defineArrayMember({type: 'curatedRowGame'})],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'noteEnabled',
      title: 'Add Note',
      type: 'boolean',
      initialValue: false,
      description: 'Add an editorial note at the end of this row',
    }),
    defineField({
      name: 'noteStyle',
      title: 'Note Style',
      type: 'string',
      options: {
        list: [
          {title: 'Simple Note', value: 'simple'},
          {title: 'Recipe / How-to', value: 'recipe'},
          {title: 'Pull Quote', value: 'pullQuote'},
        ],
        layout: 'radio',
      },
      initialValue: 'simple',
      hidden: ({parent}) => !parent?.noteEnabled,
    }),
    defineField({
      name: 'noteContent',
      title: 'Note Content',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
      description:
        'Use headings for note title/subtitle. Use bullets or numbers for recipe steps.',
      hidden: ({parent}) => !parent?.noteEnabled,
    }),
    defineField({
      name: 'noteAuthor',
      title: 'Note Author',
      type: 'string',
      description: 'For pull quotes — e.g. Beth · Idle Hours',
      hidden: ({parent}) => parent?.noteStyle !== 'pullQuote',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})

export const featureBanner = defineType({
  name: 'featureBanner',
  title: 'Feature Banner',
  type: 'object',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'linkedPost',
      title: 'Linked Post',
      type: 'reference',
      to: [{type: 'post'}],
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button Label',
      type: 'string',
      initialValue: 'Read more →',
    }),
  ],
  preview: {
    select: {
      headline: 'headline',
    },
    prepare({headline}) {
      return {
        title: `🏷️ ${headline}`,
      }
    },
  },
})

const gameLibrary = defineType({
  name: 'gameLibrary',
  title: 'Game Library',
  type: 'document',
  fields: [
    defineField({
      name: 'featuredPick',
      title: 'Featured Pick',
      type: 'object',
      fields: [
        defineField({
          name: 'game',
          title: 'Game',
          type: 'reference',
          to: [{type: 'game'}],
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow',
          type: 'string',
          initialValue: "Beth's pick this week",
        }),
        defineField({
          name: 'quote',
          title: 'Quote',
          type: 'text',
          rows: 3,
        }),
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [
        defineArrayMember({type: 'curatedRow'}),
        defineArrayMember({type: 'featureBanner'}),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Game Library',
      }
    },
  },
})

export default gameLibrary
