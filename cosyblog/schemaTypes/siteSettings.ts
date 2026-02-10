import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      initialValue: 'Idle Hours',
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      rows: 2,
      description: 'Default meta description for SEO',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
    }),
    defineField({
      name: 'navLinks',
      title: 'Navigation Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', type: 'string', title: 'Label', validation: (Rule) => Rule.required()},
            {
              name: 'linkType',
              type: 'string',
              title: 'Link Type',
              options: {list: ['internal', 'external'], layout: 'radio'},
              initialValue: 'internal',
            },
            {name: 'href', type: 'string', title: 'Path or URL', validation: (Rule) => Rule.required()},
          ],
          preview: {
            select: {title: 'label', subtitle: 'href'},
          },
        },
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              type: 'string',
              title: 'Platform',
              options: {
                list: ['Twitter', 'Instagram', 'YouTube', 'TikTok', 'Discord', 'Bluesky', 'RSS'],
              },
            },
            {name: 'url', type: 'url', title: 'URL'},
          ],
          preview: {
            select: {title: 'platform', subtitle: 'url'},
          },
        },
      ],
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default Social Share Image',
      type: 'image',
      description: 'Fallback image for social sharing when a page has none',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
