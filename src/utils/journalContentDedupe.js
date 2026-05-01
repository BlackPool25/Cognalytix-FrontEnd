/** Collapse whitespace for comparison */
export function normalizeJournalWhitespace(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when the model stored the same (or almost the same) text as the full entry,
 * so repeating it under "Excerpt" adds no value.
 */
export function isSectionExcerptRedundant(entryBody, excerpt) {
  const full = normalizeJournalWhitespace(entryBody);
  const ex = normalizeJournalWhitespace(excerpt);
  if (!ex) return true;
  if (!full) return false;
  if (full === ex) return true;
  if (full.length < 40) {
    return full === ex || (ex.length >= full.length * 0.95 && full.startsWith(ex.slice(0, Math.min(ex.length, full.length))));
  }
  const ratio = ex.length / full.length;
  if (ratio >= 0.88) {
    const probe = ex.slice(0, Math.min(160, ex.length));
    return full.includes(probe);
  }
  return false;
}
