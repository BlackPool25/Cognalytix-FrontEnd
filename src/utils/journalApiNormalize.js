/** @param {unknown} ref */
function labelRef(ref) {
  if (!ref || typeof ref !== "object") return ref;
  return {
    id: ref.id,
    label: ref.label,
  };
}

/** @param {unknown} sec */
function normalizeSection(sec) {
  if (!sec || typeof sec !== "object") return sec;
  return {
    id: sec.id,
    sortOrder: sec.sortOrder ?? sec.sort_order,
    topic: labelRef(sec.topic),
    emotion: labelRef(sec.emotion),
    content: sec.content,
    intensity: sec.intensity,
  };
}

/** @param {unknown} m */
function normalizeMoodAnalysis(m) {
  if (!m || typeof m !== "object") return null;
  return {
    moodLabel: m.moodLabel ?? m.mood_label,
    aggregateEmotionLabelId: m.aggregateEmotionLabelId ?? m.aggregate_emotion_label_id,
    intensity: m.intensity,
    insight: m.insight,
    copingTip: m.copingTip ?? m.coping_tip,
    themes: Array.isArray(m.themes) ? m.themes : [],
  };
}

/** @param {unknown} st */
function normalizeAnalysisState(st) {
  if (!st || typeof st !== "object") return st;
  return {
    attemptCount: st.attemptCount ?? st.attempt_count,
    failCount: st.failCount ?? st.fail_count,
    inProgress: st.inProgress ?? st.in_progress,
    lastErrorCode: st.lastErrorCode ?? st.last_error_code,
  };
}

/**
 * Map journal API payloads to the camelCase shape the UI expects.
 * Handles accidental snake_case or mixed keys from proxies / older servers.
 * @param {unknown} raw
 */
export function normalizeJournalEntry(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const j = /** @type {Record<string, unknown>} */ (raw);
  const sectionsRaw = j.sections ?? j.journal_entry_sections ?? j.entry_sections;
  const sections = Array.isArray(sectionsRaw) ? sectionsRaw.map(normalizeSection) : [];

  return {
    ...j,
    analysisStatus: j.analysisStatus ?? j.analysis_status,
    analysisState: normalizeAnalysisState(j.analysisState ?? j.analysis_state),
    moodAnalysis: normalizeMoodAnalysis(j.moodAnalysis ?? j.mood_analysis),
    sections,
  };
}
