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
    
    // Category (reference)
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
    }),

    // Tags
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),

    // Legacy categories field (kept for backward compatibility)
    defineField({
      name: 'categories',
      title: 'Categories (legacy)',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      hidden: true,
    }),

    // Read Time
    defineField({
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(60),
    }),

    // Featured
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      initialValue: false,
    }),

    // Excerpt
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary for cards and SEO. Falls back to subheader if empty.',
      validation: (Rule) => Rule.max(300),
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

        // Affiliate CTA
        {
          type: 'object',
          name: 'affiliateCTA',
          title: 'Affiliate CTA',
          fields: [
            {
              name: 'buttonText',
              type: 'string',
              title: 'Button Text',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'url',
              type: 'url',
              title: 'Affiliate URL',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'disclaimer',
              type: 'text',
              title: 'Disclaimer Text',
              rows: 2,
              initialValue: 'This is an affiliate link. We may earn a commission at no extra cost to you.',
            },
          ],
          preview: {
            select: {
              buttonText: 'buttonText',
            },
            prepare({buttonText}) {
              return {
                title: `🔗 Affiliate CTA: ${buttonText}`,
              }
            },
          },
        },

        // Product Callout
        {
          type: 'object',
          name: 'productCallout',
          title: 'Product Callout',
          fields: [
            {
              name: 'product',
              type: 'reference',
              to: [{type: 'product'}],
              title: 'Product',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'verdict',
              type: 'text',
              title: 'Quick Verdict',
              rows: 2,
              description: '1-2 sentence recommendation',
            },
            {
              name: 'customBadge',
              type: 'string',
              title: 'Custom Badge',
              description: 'Override product badge (optional)',
              options: {
                list: [
                  {title: 'Best Overall', value: 'Best Overall'},
                  {title: 'Best Budget', value: 'Best Budget'},
                  {title: 'Runner-up', value: 'Runner-up'},
                  {title: 'Best Value', value: 'Best Value'},
                ],
              },
            },
          ],
          preview: {
            select: {
              productName: 'product.name',
            },
            prepare({productName}) {
              return {
                title: `📦 Product: ${productName || 'Select product'}`,
              }
            },
          },
        },

        // Game Reference
        {
          type: 'object',
          name: 'gameReference',
          title: 'Game Reference',
          fields: [
            {
              name: 'game',
              type: 'reference',
              to: [{type: 'game'}],
              title: 'Game',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'position',
              type: 'number',
              title: 'Position (optional)',
              description: 'Position number e.g. 1 = #1 in a top list',
              validation: (Rule: any) => Rule.integer().min(1),
            },
          ],
          preview: {
            select: {
              gameName: 'game.title',
              position: 'position',
            },
            prepare({gameName, position}: {gameName?: string; position?: number}) {
              return {
                title: position ? `#${position} — ${gameName || 'Select game'}` : (gameName || 'Select game'),
                subtitle: 'Game Reference',
              }
            },
          },
        },
      ],
    }),

    // Related Products
    defineField({
      name: 'relatedProducts',
      title: 'Related Products',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'product'}]}],
      description: 'Products mentioned or recommended in this post',
    }),

    // Affiliate Disclosure
    defineField({
      name: 'affiliateDisclosureRequired',
      title: 'Show Affiliate Disclosure',
      type: 'boolean',
      description: 'Display affiliate disclosure banner on this post',
      initialValue: false,
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