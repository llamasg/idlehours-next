import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'quiz',
  title: 'Quiz',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Quiz Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(250),
    }),
    defineField({
      name: 'emoji',
      title: 'Emoji',
      type: 'string',
      description: 'Single emoji to represent this quiz',
      validation: (Rule) => Rule.required().max(2),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'questions',
      title: 'Questions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'answers',
              title: 'Answers',
              type: 'array',
              of: [{type: 'string'}],
              validation: (Rule) => Rule.required().min(2).max(6),
            }),
            defineField({
              name: 'resultWeights',
              title: 'Result Weights',
              type: 'object',
              description: 'Map each answer index to result type and weight',
              fields: [
                {
                  name: 'weights',
                  title: 'Answer Weights',
                  type: 'array',
                  of: [
                    {
                      type: 'object',
                      fields: [
                        {name: 'answerIndex', type: 'number', title: 'Answer Index'},
                        {name: 'resultType', type: 'string', title: 'Result Type'},
                        {name: 'weight', type: 'number', title: 'Weight'},
                      ],
                    },
                  ],
                },
              ],
            }),
          ],
          preview: {
            select: {
              question: 'question',
              answerCount: 'answers.length',
            },
            prepare(selection) {
              return {
                title: selection.question,
                subtitle: `${selection.answerCount} answers`,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(3),
    }),
    defineField({
      name: 'results',
      title: 'Result Types',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'resultType',
              title: 'Result Type ID',
              type: 'string',
              description: 'e.g., "archivist", "investor", "casual"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'title',
              title: 'Result Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Result Description',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'recommendedPosts',
              title: 'Recommended Posts',
              type: 'array',
              of: [{type: 'reference', to: [{type: 'post'}]}],
            }),
            defineField({
              name: 'recommendedProducts',
              title: 'Recommended Products',
              type: 'array',
              of: [{type: 'reference', to: [{type: 'product'}]}],
            }),
          ],
          preview: {
            select: {
              title: 'title',
              resultType: 'resultType',
            },
            prepare(selection) {
              return {
                title: selection.title,
                subtitle: `Type: ${selection.resultType}`,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      description: 'Set to true to show quiz on site',
      initialValue: false,
    }),
    defineField({
      name: 'questionCount',
      title: 'Question Count',
      type: 'number',
      description: 'Auto-calculated from questions array',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      emoji: 'emoji',
      published: 'published',
      questionCount: 'questions.length',
    },
    prepare(selection) {
      const {title, emoji, published, questionCount} = selection
      return {
        title: `${emoji} ${title}`,
        subtitle: `${questionCount} questions • ${published ? 'Published' : 'Draft'}`,
      }
    },
  },
})
