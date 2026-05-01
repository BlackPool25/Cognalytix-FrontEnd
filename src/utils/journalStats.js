import { localDayKey } from "./dates.js";

/** Count consecutive calendar days (local) with at least one entry, ending today */
export function computeCurrentStreak(entries) {
  const days = new Set(entries.map((e) => localDayKey(e.createdAt)));
  let streak = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.has(localDayKey(d.toISOString()))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** Dominant mood label frequencies → top entries with rough percentages */
export function moodHistogram(entries) {
  const counts = new Map();
  for (const e of entries) {
    const label = e.moodAnalysis?.moodLabel;
    if (!label) continue;
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((s, [, c]) => s + c, 0);
  return sorted.slice(0, 6).map(([label, c]) => ({
    label,
    pct: total ? Math.round((c / total) * 100) : 0,
  }));
}
