import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'promoBanner',
  title: 'Promotional Banner',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal title for reference (not displayed on site)',
      initialValue: 'Promotional Banner',
    }),
    defineField({
      name: 'text',
      title: 'Banner Text',
      type: 'string',
      validation: (Rule) => Rule.required().max(150),
      description: 'The promotional message to display',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      description: 'HSL format (e.g., "210 100% 50%") or hex code',
      validation: (Rule) => Rule.required(),
      initialValue: '210 100% 50%',
    }),
    defineField({
      name: 'textColor',
      title: 'Text Color',
      type: 'string',
      description: 'HSL format (e.g., "0 0% 100%") or hex code',
      validation: (Rule) => Rule.required(),
      initialValue: '0 0% 100%',
    }),
    defineField({
      name: 'isActive',
      title: 'Display Banner',
      type: 'boolean',
      description: 'Toggle to show/hide the banner on the homepage',
      initialValue: false,
    }),
    defineField({
      name: 'link',
      title: 'Link URL (Optional)',
      type: 'url',
      description: 'Make the banner clickable by adding a link',
    }),
  ],
  preview: {
    select: {
      text: 'text',
      isActive: 'isActive',
    },
    prepare(selection) {
      const {text, isActive} = selection
      return {
        title: text,
        subtitle: isActive ? '✅ Active' : '❌ Hidden',
      }
    },
  },
})
