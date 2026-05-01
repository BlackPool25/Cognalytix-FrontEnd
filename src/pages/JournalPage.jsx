import { useEffect, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { getGrowthLatest } from "../api/insightsApi.js";
import { getJournal, listJournals } from "../api/journalsApi.js";
import { Badge, DirBadge, IntensityDots } from "../components/Badge.jsx";
import { BrandLockup } from "../components/BrandLockup.jsx";
import { iCol } from "../theme.js";
import { isSectionExcerptRedundant } from "../utils/journalContentDedupe.js";
import { formatMediumDate } from "../utils/dates.js";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function dirFromGrowth(res) {
  const d = res?.trajectory?.mirrorCard?.direction;
  if (d === "GROWTH" || d === "REGRESSION" || d === "STABLE") return d;
  return "STABLE";
}

export function JournalPage() {
  const { t } = useOutletContext();
  const location = useLocation();
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadDetail, setLoadDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [hov, setHov] = useState(null);
  const [error, setError] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [growth, setGrowth] = useState(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    listJournals({ page: 0, size: 100 })
      .then((page) => {
        if (!cancel) setList(page.content || []);
      })
      .catch((e) => {
        if (!cancel) setError(e.message);
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    const id = location.state?.focusId;
    if (id) {
      setSelected(id);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      setDetailError(null);
      return;
    }
    let cancel = false;
    setLoadDetail(true);
    setDetailError(null);
    getJournal(selected)
      .then((d) => {
        if (!cancel) setDetail(d);
      })
      .catch((e) => {
        if (!cancel) setDetailError(e.message || "Could not load entry");
      })
      .finally(() => {
        if (!cancel) setLoadDetail(false);
      });
    return () => {
      cancel = true;
    };
  }, [selected]);

  useEffect(() => {
    if (!selected || !detail || detail.id !== selected || detail.analysisStatus !== "DONE") {
      setGrowth(null);
      return;
    }
    let cancelled = false;
    setGrowth(null);

    (async () => {
      for (let i = 0; i < 8; i++) {
        if (cancelled) return;
        try {
          const g = await getGrowthLatest(selected);
          if (cancelled) return;
          setGrowth(g);
          if (g?.hasTrajectory) break;
        } catch {
          if (!cancelled) setGrowth(null);
          break;
        }
        if (i < 7) await sleep(2500);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selected, detail?.id, detail?.analysisStatus]);

  const filtered = list.filter((e) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return [e.title, e.content, e.moodAnalysis?.moodLabel].some((s) => (s || "").toLowerCase().includes(q));
  });

  if (selected && detailError) {
    return (
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setDetailError(null);
          }}
          style={{
            background: "none",
            border: "none",
            color: t.ember,
            fontSize: "13px",
            fontFamily: "var(--font-ui)",
            cursor: "pointer",
            marginBottom: "28px",
            padding: 0,
            letterSpacing: "0.04em",
          }}
        >
          ← Back to journal
        </button>
        <p style={{ color: t.caution, fontFamily: "var(--font-ui)" }}>{detailError}</p>
      </div>
    );
  }

  if (selected && detail) {
    const e = detail;
    const mood = e.moodAnalysis?.moodLabel || e.analysisStatus;
    const intensity = e.moodAnalysis?.intensity ?? 0;
    const sections = e.sections || [];
    const ma = e.moodAnalysis;
    const hasInsight = ma && typeof ma.insight === "string" && ma.insight.trim().length > 0;
    const hasCoping = ma && typeof ma.copingTip === "string" && ma.copingTip.trim().length > 0;
    const hasThemes = ma && Array.isArray(ma.themes) && ma.themes.length > 0;
    const showAiReflection = e.analysisStatus === "DONE" && ma && (hasInsight || hasCoping || hasThemes);
    const hasTrajectoryMirror = Boolean(growth?.hasTrajectory && growth?.trajectory?.mirrorCard);

    return (
      <div className="journal-detail-shell" style={{ maxWidth: "min(1160px, 100%)", margin: "0 auto" }}>
        <style>{`
          .journal-detail-split{display:flex;flex-direction:row;align-items:flex-start;gap:clamp(20px,3vw,40px)}
          .journal-entry-col{flex:1 1 300px;min-width:0}
          .journal-analysis-col{
            flex:0 1 360px;width:min(360px,100%);position:sticky;top:8px;align-self:flex-start;
            max-height:calc(100vh - 80px);overflow-y:auto;padding-right:6px
          }
          @media (max-width:900px){
            .journal-detail-split{flex-direction:column}
            .journal-analysis-col{position:static;max-height:none;width:100%;flex:1 1 auto;order:-1}
            .journal-entry-col{order:0}
          }
        `}</style>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            style={{
              background: "none",
              border: "none",
              color: t.ember,
              fontSize: "13px",
              fontFamily: "var(--font-ui)",
              cursor: "pointer",
              padding: 0,
              letterSpacing: "0.04em",
            }}
          >
            ← Back to journal
          </button>
          <BrandLockup t={t} tagline={false} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <Badge label={String(mood)} color={iCol(intensity, t)} bg={`${iCol(intensity, t)}1A`} />
        </div>
        <h1 style={{ fontSize: "clamp(20px,3vw,26px)", fontFamily: "var(--font-display)", color: t.ink, fontWeight: 400, margin: "12px 0 6px" }}>
          {e.title}
        </h1>
        <div
          style={{
            fontSize: "12px",
            color: t.inkDim,
            fontFamily: "var(--font-ui)",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span>{formatMediumDate(e.createdAt)}</span>
          <IntensityDots value={intensity} t={t} />
        </div>
        <div style={{ height: "1px", background: t.border, marginBottom: "28px" }} />

        <div className="journal-detail-split">
          <div className="journal-entry-col">
            {e.analysisStatus === "DONE" && sections.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.14em",
                    color: t.inkDim,
                    fontFamily: "var(--font-ui)",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}
                >
                  What the model highlighted
                </div>
                {sections.map((s) => {
                  const redundant = isSectionExcerptRedundant(e.content, s.content);
                  return (
                    <div
                      key={`pull-${s.id}`}
                      style={{
                        marginBottom: "12px",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        background: t.surfaceEl,
                        border: `1px solid ${t.border}`,
                      }}
                    >
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: redundant ? 0 : "8px" }}>
                        <Badge label={s.topic?.label || "—"} color={t.ember} bg={t.emberSoft} />
                        <Badge label={s.emotion?.label || "—"} color={iCol(s.intensity, t)} bg={`${iCol(s.intensity, t)}1A`} />
                        <IntensityDots value={s.intensity} t={t} />
                      </div>
                      {redundant ? (
                        <p style={{ margin: 0, fontSize: "11px", color: t.inkDim, fontFamily: "var(--font-ui)", fontStyle: "italic", lineHeight: 1.45 }}>
                          Excerpt matches your full entry — see below.
                        </p>
                      ) : s.content ? (
                        <p style={{ margin: 0, fontSize: "13px", color: t.inkMid, fontFamily: "var(--font-display)", lineHeight: 1.65 }}>{s.content}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.14em",
                color: t.inkDim,
                fontFamily: "var(--font-ui)",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Your entry
            </div>
            <p style={{ fontSize: "16px", lineHeight: "1.88", color: t.inkMid, fontFamily: "var(--font-display)", margin: 0 }}>{e.content}</p>
          </div>

          <aside className="journal-analysis-col">
            {(e.analysisStatus === "PENDING" || e.analysisState?.inProgress) && (
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: "13px",
                  color: t.inkDim,
                  fontFamily: "var(--font-ui)",
                  fontStyle: "italic",
                  lineHeight: 1.5,
                }}
              >
                Analysis is still running — check back shortly for the reflection and topic breakdown.
              </p>
            )}

            {e.analysisStatus === "FAILED" && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: t.cautionSoft,
                  border: `1px solid ${t.border}`,
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 600, color: t.caution, fontFamily: "var(--font-ui)", marginBottom: "6px" }}>
                  Analysis could not complete
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: t.inkMid, fontFamily: "var(--font-ui)" }}>
                  {e.analysisState?.lastErrorCode
                    ? `Code: ${e.analysisState.lastErrorCode}. You can try Reanalyze from the journal list when the model is available.`
                    : "You can try Reanalyze when the model is available."}
                </p>
              </div>
            )}

            {showAiReflection && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "20px 18px 18px",
                  borderRadius: "16px",
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  boxShadow: t.shadowSm,
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.15em",
                    color: t.ember,
                    fontFamily: "var(--font-ui)",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}
                >
                  AI reflection · summary
                </div>
                {hasInsight ? (
                  <p
                    style={{
                      margin: "0 0 14px",
                      fontSize: "14px",
                      lineHeight: "1.72",
                      color: t.ink,
                      fontStyle: "italic",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {ma.insight}
                  </p>
                ) : null}
                {hasThemes ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: hasCoping ? "12px" : 0 }}>
                    {ma.themes.map((th) => (
                      <span
                        key={String(th)}
                        style={{
                          fontSize: "9px",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          borderRadius: "999px",
                          background: t.surfaceEl,
                          color: t.inkMid,
                          fontFamily: "var(--font-ui)",
                          fontWeight: 600,
                          border: `1px solid ${t.border}`,
                        }}
                      >
                        {String(th)}
                      </span>
                    ))}
                  </div>
                ) : null}
                {hasCoping ? (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      background: t.surfaceEl,
                      borderLeft: `3px solid ${t.ember}`,
                    }}
                  >
                    <div style={{ fontSize: "8px", letterSpacing: "0.1em", color: t.inkDim, fontFamily: "var(--font-ui)", marginBottom: "4px" }}>
                      COPING SUGGESTION
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.6", color: t.inkMid, fontFamily: "var(--font-display)" }}>{ma.copingTip}</p>
                  </div>
                ) : null}
              </div>
            )}

            {hasTrajectoryMirror && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "18px 16px 16px",
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${t.emberSoft}, ${t.surface})`,
                  border: `1px solid ${t.border}`,
                  boxShadow: t.shadowSm,
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.15em",
                    color: t.ember,
                    fontFamily: "var(--font-ui)",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                  }}
                >
                  Trajectory · mirror
                </div>
                {(growth.trajectory.mirrorCard.headline || growth.trajectory.mirrorCard.dayAnchorLine) && (
                  <div style={{ fontSize: "10px", color: t.inkDim, fontFamily: "var(--font-ui)", marginBottom: "8px" }}>
                    {[growth.trajectory.mirrorCard.headline, growth.trajectory.mirrorCard.dayAnchorLine].filter(Boolean).join(" · ")}
                  </div>
                )}
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: "14px",
                    lineHeight: "1.72",
                    color: t.ink,
                    fontStyle: "italic",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  &ldquo;
                  {growth.trajectory.mirrorCard.integratedBody ||
                    growth.trajectory.mirrorCard.headline ||
                    "Your entries show a shift over time."}
                  &rdquo;
                </p>
                {growth.trajectory.mirrorCard.trajectoryLine && (
                  <p style={{ margin: "0 0 10px", fontSize: "12px", color: t.inkMid, fontFamily: "var(--font-display)", lineHeight: 1.55 }}>
                    {growth.trajectory.mirrorCard.trajectoryLine}
                  </p>
                )}
                <DirBadge dir={dirFromGrowth(growth)} t={t} />
              </div>
            )}

            <div>
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  color: t.inkDim,
                  fontFamily: "var(--font-ui)",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Topics · intensity
              </div>
              <p style={{ margin: "0 0 14px", fontSize: "11px", color: t.inkDim, fontFamily: "var(--font-ui)", lineHeight: 1.45 }}>
                Labels for each section. Pull-quotes (when different from your entry) sit in the left column above your text.
              </p>
              {sections.length === 0 && (
                <p style={{ color: t.inkDim, fontStyle: "italic", fontFamily: "var(--font-display)", fontSize: "13px" }}>
                  {e.analysisStatus === "DONE"
                    ? "No sections were stored for this entry."
                    : `Analysis status: ${e.analysisStatus}`}
                </p>
              )}
              {sections.map((s) => {
                const redundant = isSectionExcerptRedundant(e.content, s.content);
                return (
                  <div
                    key={s.id}
                    style={{
                      background: t.surface,
                      border: `1px solid ${t.border}`,
                      borderRadius: "12px",
                      padding: "12px 14px",
                      boxShadow: t.shadowSm,
                      marginBottom: "8px",
                      borderLeft: `3px solid ${iCol(s.intensity, t)}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <Badge label={s.topic?.label || "—"} color={t.ember} bg={t.emberSoft} />
                        <Badge label={s.emotion?.label || "—"} color={iCol(s.intensity, t)} bg={`${iCol(s.intensity, t)}1A`} />
                      </div>
                      <IntensityDots value={s.intensity} t={t} />
                    </div>
                    {s.content && redundant && (
                      <p
                        style={{
                          margin: "10px 0 0",
                          fontSize: "11px",
                          color: t.inkDim,
                          fontFamily: "var(--font-ui)",
                          fontStyle: "italic",
                          lineHeight: 1.45,
                        }}
                      >
                        Excerpt matches your full entry — see left column.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (selected && loadDetail) {
    return (
      <div style={{ maxWidth: "700px", margin: "0 auto", color: t.inkDim, fontFamily: "var(--font-display)" }}>
        Opening entry…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(20px,3vw,26px)",
            fontFamily: "var(--font-display)",
            color: t.ink,
            fontWeight: 400,
            margin: 0,
            flex: "1 1 200px",
            minWidth: 0,
          }}
        >
          Journal
        </h1>
        <BrandLockup t={t} tagline={false} />
      </div>
      {error && (
        <p style={{ color: t.caution, fontFamily: "var(--font-ui)", marginBottom: "16px" }}>
          {error}
        </p>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: "14px",
          padding: "11px 16px",
          boxShadow: t.shadowSm,
          marginBottom: "24px",
        }}
      >
        <span style={{ color: t.inkDim, fontSize: "15px" }}>⌕</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries, moods, topics..."
          style={{
            flex: 1,
            background: "none",
            border: "none",
            outline: "none",
            fontSize: "13px",
            color: t.ink,
            fontFamily: "var(--font-ui)",
            caretColor: t.ember,
          }}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            style={{
              background: "none",
              border: "none",
              color: t.inkDim,
              cursor: "pointer",
              fontSize: "14px",
              padding: 0,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: t.inkDim, fontFamily: "var(--font-display)" }}>Loading entries…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((e) => {
            const mood = e.moodAnalysis?.moodLabel || (e.analysisStatus === "DONE" ? "—" : e.analysisStatus);
            const intensity = e.moodAnalysis?.intensity ?? 0;
            return (
              <div
                key={e.id}
                onClick={() => setSelected(e.id)}
                onMouseEnter={() => setHov(e.id)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderRadius: "16px",
                  padding: "18px 22px",
                  boxShadow: hov === e.id ? t.shadow : t.shadowSm,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  transform: hov === e.id ? "translateY(-2px)" : "none",
                  borderLeft: `3px solid ${iCol(intensity, t)}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: t.ink, fontFamily: "var(--font-ui)", marginBottom: "6px" }}>
                      {e.title}
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <Badge label={String(mood)} color={iCol(intensity, t)} bg={`${iCol(intensity, t)}1A`} />
                      <IntensityDots value={intensity} t={t} />
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", color: t.inkDim, fontFamily: "var(--font-ui)", flexShrink: 0, marginTop: "2px" }}>
                    {formatMediumDate(e.createdAt)}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    lineHeight: "1.6",
                    color: t.inkMid,
                    fontStyle: "italic",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  &ldquo;{(e.content || "").slice(0, 120)}…&rdquo;
                </p>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 0", color: t.inkDim, fontFamily: "var(--font-display)", fontStyle: "italic" }}>
              {search ? `No entries match "${search}"` : "No entries yet."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
