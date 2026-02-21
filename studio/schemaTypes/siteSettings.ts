import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',

  groups: [
    {name: 'identity', title: 'Identity'},
    {name: 'favicon', title: 'Favicon'},
    {name: 'social', title: 'Social Sharing'},
    {name: 'seo', title: 'SEO Defaults'},
    {name: 'navigation', title: 'Navigation'},
  ],

  fields: [
    // ── Identity ─────────────────────────────────────
    defineField({
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      group: 'identity',
      initialValue: 'Idle Hours',
      description: 'Appears in browser tabs and search results',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'siteTagline',
      title: 'Site Tagline',
      type: 'string',
      group: 'identity',
      description: 'Short descriptor shown in search results alongside the site title',
    }),

    // ── Favicon ───────────────────────────────────────
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      group: 'favicon',
      options: {hotspot: false},
      description:
        'Upload a square PNG or SVG — minimum 512×512px. Used for browser tabs, bookmarks, and Google Search. Generate all size variants at realfavicongenerator.net after uploading.',
    }),

    // ── Social Sharing ────────────────────────────────
    defineField({
      name: 'defaultSocialImage',
      title: 'Default Social Share Image',
      type: 'image',
      group: 'social',
      options: {hotspot: false},
      description:
        "Shown when any page is shared as a link — on Twitter/X, iMessage, Slack, LinkedIn etc. 1200×630px, JPG or PNG. Individual posts can override this.",
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Description for screen readers and search engines',
        }),
      ],
    }),

    // ── SEO Defaults ──────────────────────────────────
    defineField({
      name: 'metaDescription',
      title: 'Default Meta Description',
      type: 'text',
      group: 'seo',
      rows: 3,
      description: "Used when a page doesn't have its own meta description. 150–160 characters.",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'metaKeywords',
      title: 'Meta Keywords',
      type: 'array',
      group: 'seo',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Stored for reference only — not rendered in HTML (Google ignores them).',
    }),

    // ── Navigation & Branding ────────────────────────
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'navigation',
    }),
    defineField({
      name: 'navLinks',
      title: 'Navigation Links',
      type: 'array',
      group: 'navigation',
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
      group: 'navigation',
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
  ],

  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
