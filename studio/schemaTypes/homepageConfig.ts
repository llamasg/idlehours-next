import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'homepageConfig',
  title: 'Homepage Configuration',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Homepage Config',
      hidden: true,
    }),
    defineField({
      name: 'featuredPost',
      title: 'Featured Post',
      type: 'reference',
      to: [{type: 'post'}],
      description: 'Large hero post shown at the top',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'latestPostsCount',
      title: 'Latest Posts Count',
      type: 'number',
      description: 'Number of latest posts to show',
      initialValue: 8,
      validation: (Rule) => Rule.required().min(3).max(20),
    }),
    defineField({
      name: 'featuredProducts',
      title: 'Featured Products',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'product'}]}],
      description: 'Products to show in "Shop Picks" section',
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: 'featuredQuizzes',
      title: 'Featured Quizzes',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'quiz'}]}],
      description: 'Quizzes to show in "Quizzes & Tools" section',
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: 'displaySections',
      title: 'Display Sections',
      type: 'object',
      description: 'Toggle visibility of homepage sections',
      fields: [
        {
          name: 'showFeaturedHero',
          title: 'Show Featured Hero',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'showLatestArticles',
          title: 'Show Latest Articles',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'showQuizzes',
          title: 'Show Quizzes',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'showShopPicks',
          title: 'Show Shop Picks',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'showMoreReading',
          title: 'Show More Reading',
          type: 'boolean',
          initialValue: true,
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Homepage Configuration',
        subtitle: 'Configure homepage content and layout',
      }
    },
  },
})
