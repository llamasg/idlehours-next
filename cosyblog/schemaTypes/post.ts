// cosyblog/schemaTypes/post.ts

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    // Header Image
    defineField({
      name: 'headerImage',
      title: 'Header Image',
      type: 'image',
      options: {
        hotspot: true, // Allows cropping
      },
      validation: (Rule) => Rule.required(),
    }),
    
    // Title
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    
    // Slug (URL)
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
    
    // Subheader
    defineField({
      name: 'subheader',
      title: 'Subheader',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
    }),
    
    // Author
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      initialValue: 'Alfie Eyden',
    }),
    
    // Published Date
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    
    // Categories/Tags
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    
    // Main Content Body
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        // Regular text blocks
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
              {title: 'Underline', value: 'underline'},
              {title: 'Strike', value: 'strike-through'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'External link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                  {
                    title: 'Open in new tab',
                    name: 'blank',
                    type: 'boolean',
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        },
        
        // Images (can be added anywhere in content)
        {
          type: 'image',
          name: 'inlineImage',
          title: 'Image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt text',
              description: 'Important for SEO and accessibility',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
        
        // YouTube Embeds
        {
          type: 'object',
          name: 'youtube',
          title: 'YouTube Video',
          fields: [
            {
              name: 'url',
              type: 'url',
              title: 'YouTube URL',
              description: 'Paste the full YouTube URL',
              validation: (Rule) =>
                Rule.required().custom((url) => {
                  if (url && !url.includes('youtube.com') && !url.includes('youtu.be')) {
                    return 'Must be a valid YouTube URL'
                  }
                  return true
                }),
            },
          ],
          preview: {
            select: {
              url: 'url',
            },
            prepare({url}) {
              return {
                title: 'YouTube Video',
                subtitle: url,
              }
            },
          },
        },
        
        // Code Blocks
        {
          type: 'code',
          name: 'codeBlock',
          title: 'Code Block',
          options: {
            language: 'javascript',
            languageAlternatives: [
              {title: 'JavaScript', value: 'javascript'},
              {title: 'TypeScript', value: 'typescript'},
              {title: 'JSX', value: 'jsx'},
              {title: 'HTML', value: 'html'},
              {title: 'CSS', value: 'css'},
              {title: 'Python', value: 'python'},
              {title: 'Bash', value: 'bash'},
            ],
            withFilename: true,
          },
        },
        
        // Callout/Alert Box
        {
          type: 'object',
          name: 'callout',
          title: 'Callout Box',
          fields: [
            {
              name: 'type',
              type: 'string',
              title: 'Type',
              options: {
                list: [
                  {title: '💡 Info', value: 'info'},
                  {title: '⚠️ Warning', value: 'warning'},
                  {title: '✅ Success', value: 'success'},
                  {title: '❌ Error', value: 'error'},
                ],
                layout: 'radio',
              },
              initialValue: 'info',
            },
            {
              name: 'title',
              type: 'string',
              title: 'Title (optional)',
            },
            {
              name: 'text',
              type: 'text',
              title: 'Text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              type: 'type',
              text: 'text',
            },
            prepare({type, text}) {
              const icons = {
                info: '💡',
                warning: '⚠️',
                success: '✅',
                error: '❌',
              }
              return {
                title: `${icons[type as keyof typeof icons]} ${type.toUpperCase()}`,
                subtitle: text,
              }
            },
          },
        },
        
        // Divider
        {
          type: 'object',
          name: 'divider',
          title: 'Divider',
          fields: [
            {
              name: 'style',
              type: 'string',
              title: 'Style',
              options: {
                list: [
                  {title: 'Line', value: 'line'},
                  {title: 'Dots', value: 'dots'},
                  {title: 'Stars', value: 'stars'},
                ],
              },
              initialValue: 'line',
            },
          ],
        },
      ],
    }),
    
    // SEO Section
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        {
          name: 'metaDescription',
          type: 'text',
          title: 'Meta Description',
          description: 'Brief summary for search engines (150-160 characters)',
          rows: 3,
          validation: (Rule) => Rule.max(160),
        },
        {
          name: 'metaKeywords',
          type: 'array',
          of: [{type: 'string'}],
          title: 'Meta Keywords',
          options: {
            layout: 'tags',
          },
        },
        {
          name: 'ogImage',
          type: 'image',
          title: 'Social Share Image',
          description: 'Image for social media sharing (optional - uses header image if not set)',
        },
      ],
    }),
  ],
  
  // Preview in Sanity Studio
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'headerImage',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const {author, publishedAt} = selection
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'Not published'
      return {
        ...selection,
        subtitle: `by ${author} • ${date}`,
      }
    },
  },
})