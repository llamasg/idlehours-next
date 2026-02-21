import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'musicTrack',
  title: 'Music Track',
  type: 'document',
  icon: () => '🎵',
  fields: [
    defineField({
      name: 'title',
      title: 'Song Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'artist',
      title: 'Artist',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'audioFile',
      title: 'MP3 File',
      type: 'file',
      options: {
        accept: 'audio/*',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverArt',
      title: 'Cover Art',
      type: 'image',
      options: {hotspot: true},
      description: 'Album art shown on the CD player disc',
    }),
    defineField({
      name: 'order',
      title: 'Play Order',
      type: 'number',
      description: 'Order in the playlist (lower numbers play first)',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to remove from the site playlist without deleting',
    }),
  ],
  orderings: [
    {
      title: 'Play Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'artist',
      media: 'coverArt',
    },
  },
})
