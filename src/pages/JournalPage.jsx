import { useEffect, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { getJournal, listJournals } from "../api/journalsApi.js";
import { Badge, IntensityDots } from "../components/Badge.jsx";
import { BrandLockup } from "../components/BrandLockup.jsx";
import { iCol } from "../theme.js";
import { formatMediumDate } from "../utils/dates.js";

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

    return (
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
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
        <div style={{ height: "1px", background: t.border, marginBottom: "32px" }} />
        <p style={{ fontSize: "16px", lineHeight: "1.88", color: t.inkMid, fontFamily: "var(--font-display)" }}>{e.content}</p>

        <div style={{ marginTop: "44px", paddingTop: "32px", borderTop: `1px solid ${t.border}` }}>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.15em",
              color: t.inkDim,
              fontFamily: "var(--font-ui)",
              textTransform: "uppercase",
              marginBottom: "18px",
            }}
          >
            AI Analysis · Entry Sections
          </div>
          {sections.length === 0 && (
            <p style={{ color: t.inkDim, fontStyle: "italic", fontFamily: "var(--font-display)" }}>
              {e.analysisStatus === "DONE"
                ? "No sections were stored for this entry."
                : `Analysis status: ${e.analysisStatus}`}
            </p>
          )}
          {sections.map((s) => (
            <div
              key={s.id}
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: "14px",
                padding: "16px 20px",
                boxShadow: t.shadowSm,
                marginBottom: "10px",
                borderLeft: `3px solid ${iCol(s.intensity, t)}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Badge label={s.topic?.label || "—"} color={t.ember} bg={t.emberSoft} />
                  <Badge label={s.emotion?.label || "—"} color={iCol(s.intensity, t)} bg={`${iCol(s.intensity, t)}1A`} />
                </div>
                <IntensityDots value={s.intensity} t={t} />
              </div>
              {s.content && (
                <p style={{ margin: "10px 0 0", fontSize: "13px", color: t.inkMid, fontFamily: "var(--font-display)", lineHeight: 1.6 }}>
                  {s.content}
                </p>
              )}
            </div>
          ))}
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
          alignItems: "baseline",
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
