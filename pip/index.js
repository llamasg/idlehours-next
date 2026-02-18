/**
 * Pip — Nightly Job Entry Point
 *
 * Runs every night via GitHub Actions.
 * Sequence:
 *   1. Fetch GA4 + Search Console data (research.js)
 *   2. Generate ideas + morning message via Claude (generate.js)
 *   3. Write results to Sanity (sanity.js)
 *
 * Usage: node pip/index.js
 */
