// cosyblog/schemaTypes/pipDashboard.ts
// Singleton document written nightly by the Pip backend job.
// Beth sees this in Sanity Studio as a read-only reference.

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'pip_dashboard',
  title: 'Pip Dashboard',
  type: 'document',
  fields: [
    defineField({
      name: 'generatedAt',
      title: 'Last Generated',
      type: 'datetime',
      readOnly: true,
    }),

    defineField({
      name: 'morningMessage',
      title: "Pip's Morning Message",
      type: 'text',
      rows: 6,
      readOnly: true,
      description: "Generated nightly by Pip — Beth's AI content strategist",
    }),

    defineField({
      name: 'ideas',
      title: 'Post Ideas',
      type: 'array',
      readOnly: true,
      of: [
        {
          type: 'object',
          fields: [
            {name: 'type', type: 'string', title: 'Type'},
            {name: 'typeEmoji', type: 'string', title: 'Emoji'},
            {name: 'title', type: 'string', title: 'Title'},
            {name: 'reason', type: 'text', title: 'Why this idea', rows: 3},
            {name: 'difficulty', type: 'number', title: 'Difficulty (1-3)'},
            {name: 'cluster', type: 'string', title: 'Cluster'},
            {name: 'trending', type: 'boolean', title: 'Trending'},
          ],
          preview: {
            select: {title: 'title', type: 'type', cluster: 'cluster'},
            prepare({title, type, cluster}) {
              return {title: `[${type}] ${title}`, subtitle: cluster}
            },
          },
        },
      ],
    }),

    defineField({
      name: 'analytics',
      title: 'Analytics Snapshot',
      type: 'object',
      readOnly: true,
      options: {collapsible: true, collapsed: true},
      fields: [
        {name: 'sessions7d', type: 'number', title: 'Sessions (7d)'},
        {name: 'sessionsDelta', type: 'number', title: 'Session change %'},
        {name: 'avgSessionDuration', type: 'number', title: 'Avg session (seconds)'},
        {name: 'returnVisitorPct', type: 'number', title: 'Return visitor %'},
        {name: 'newVisitorPct', type: 'number', title: 'New visitor %'},
        {
          name: 'trafficSources',
          type: 'object',
          title: 'Traffic sources',
          fields: [
            {name: 'organic', type: 'number', title: 'Organic %'},
            {name: 'direct', type: 'number', title: 'Direct %'},
            {name: 'social', type: 'number', title: 'Social %'},
            {name: 'referral', type: 'number', title: 'Referral %'},
          ],
        },
        {
          name: 'weeklyTrend',
          type: 'array',
          title: 'Weekly trend (8 weeks)',
          of: [{type: 'number'}],
        },
        {
          name: 'topPages',
          type: 'array',
          title: 'Top pages',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'title', type: 'string', title: 'Title'},
                {name: 'path', type: 'string', title: 'Path'},
                {name: 'sessions', type: 'number', title: 'Sessions'},
                {name: 'avgReadTime', type: 'number', title: 'Avg read time (s)'},
                {name: 'bounceRate', type: 'number', title: 'Bounce rate %'},
              ],
              preview: {
                select: {title: 'title', sessions: 'sessions'},
                prepare({title, sessions}) {
                  return {title, subtitle: `${sessions} sessions`}
                },
              },
            },
          ],
        },
        {
          name: 'topCountries',
          type: 'array',
          title: 'Top countries',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'country', type: 'string', title: 'Country'},
                {name: 'sessions', type: 'number', title: 'Sessions'},
                {name: 'pct', type: 'number', title: 'Percentage'},
              ],
              preview: {
                select: {country: 'country', pct: 'pct'},
                prepare({country, pct}) {
                  return {title: country, subtitle: `${pct}%`}
                },
              },
            },
          ],
        },
      ],
    }),

    defineField({
      name: 'searchConsole',
      title: 'Search Console Snapshot',
      type: 'object',
      readOnly: true,
      options: {collapsible: true, collapsed: true},
      fields: [
        {name: 'rankingPosts', type: 'number', title: 'Posts in top 20'},
        {name: 'page2Opportunities', type: 'number', title: 'Page 2 quick wins'},
        {
          name: 'topQueries',
          type: 'array',
          title: 'Top queries',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'query', type: 'string', title: 'Query'},
                {name: 'clicks', type: 'number', title: 'Clicks'},
                {name: 'impressions', type: 'number', title: 'Impressions'},
                {name: 'ctr', type: 'number', title: 'CTR %'},
                {name: 'position', type: 'number', title: 'Position'},
              ],
              preview: {
                select: {query: 'query', position: 'position'},
                prepare({query, position}) {
                  return {title: query, subtitle: `Position ${position}`}
                },
              },
            },
          ],
        },
        {
          name: 'quickWins',
          type: 'array',
          title: 'Quick wins',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'query', type: 'string', title: 'Query'},
                {name: 'position', type: 'number', title: 'Position'},
                {name: 'impressions', type: 'number', title: 'Impressions'},
                {name: 'opportunity', type: 'text', title: 'Opportunity note', rows: 2},
              ],
              preview: {
                select: {query: 'query', position: 'position'},
                prepare({query, position}) {
                  return {title: query, subtitle: `Pos ${position} — quick win`}
                },
              },
            },
          ],
        },
      ],
    }),

    defineField({
      name: 'siteStats',
      title: 'Site Stats',
      type: 'object',
      readOnly: true,
      options: {collapsible: true, collapsed: false},
      fields: [
        {name: 'totalPosts', type: 'number', title: 'Total posts published'},
        {name: 'streak', type: 'number', title: 'Publishing streak (weeks)'},
        {name: 'lastUpdated', type: 'datetime', title: 'Last updated'},
      ],
    }),
  ],

  preview: {
    select: {
      generatedAt: 'generatedAt',
      sessions: 'analytics.sessions7d',
    },
    prepare({generatedAt, sessions}) {
      const date = generatedAt
        ? new Date(generatedAt).toLocaleDateString('en-GB', {weekday: 'short', day: 'numeric', month: 'short'})
        : 'Never'
      return {
        title: 'Pip Dashboard',
        subtitle: `Last run: ${date}${sessions ? ` · ${sessions} sessions` : ''}`,
      }
    },
  },
})
