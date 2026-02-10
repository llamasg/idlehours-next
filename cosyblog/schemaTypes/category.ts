import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categoryType',
      title: 'Category Type',
      type: 'string',
      options: {
        list: [
          {title: 'Game Genre', value: 'game'},
          {title: 'Blog Category', value: 'blog'},
          {title: 'Both', value: 'both'},
        ],
        layout: 'radio',
      },
      initialValue: 'both',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {title: 'title', type: 'categoryType'},
    prepare({title, type}) {
      return {
        title,
        subtitle: type ? type.charAt(0).toUpperCase() + type.slice(1) : '',
      }
    },
  },
})
