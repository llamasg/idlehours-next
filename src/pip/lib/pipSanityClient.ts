/* ──────────────────────────────────────────────
   Pip Dashboard v2 — Browser-side Sanity helpers
   Write operations use localStorage until a
   server-side API route is added for the write token.
   ────────────────────────────────────────────── */

const LS_SELECTED_KEY = 'pip_selected_ideas';

export function markIdeaSelected(ideaId: string): void {
  try {
    const raw = localStorage.getItem(LS_SELECTED_KEY);
    const selected: string[] = raw ? JSON.parse(raw) : [];
    if (!selected.includes(ideaId)) {
      selected.push(ideaId);
      localStorage.setItem(LS_SELECTED_KEY, JSON.stringify(selected));
    }
  } catch {
    // Ignore localStorage errors (e.g. private mode)
  }
}
