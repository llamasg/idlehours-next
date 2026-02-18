/**
 * Pip — Sanity Module
 *
 * Reads and writes to Sanity CMS.
 *
 * Reads:  post documents (to check cluster progress, streak)
 * Writes: pipDashboard, pipIdeas, pipClusters
 *
 * Existing Sanity project: ijj3h2lj (production dataset)
 * See src/lib/sanity.ts in the React frontend for the read-only client.
 * This module uses a write token for mutations.
 */
