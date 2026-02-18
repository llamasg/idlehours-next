/* ──────────────────────────────────────────────
   Pip Dashboard v2 — GROQ Queries for Sanity
   ────────────────────────────────────────────── */

/** Fetch all posts, newest first, with fields Pip needs. */
export const PIP_POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id, title, slug, publishedAt, clusterName, clusterRole, moodTags, excerpt,
  "wordCount": length(pt::text(body))
}`;

/** Fetch the singleton Pip dashboard document. */
export const PIP_DASHBOARD_QUERY = `*[_type == "pip_dashboard"][0] {
  analytics, audiencePersonas, boostPlan, contentIdeas
}`;
