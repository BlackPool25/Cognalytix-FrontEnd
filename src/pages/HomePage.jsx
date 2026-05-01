import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getGrowthLatest } from "../api/insightsApi.js";
import { listJournals } from "../api/journalsApi.js";
import { Badge, DirBadge } from "../components/Badge.jsx";
import { iCol } from "../theme.js";
import { formatLongDate, formatMediumDate, getWeekDays, localCalendarKey, localDayKey, todayLocalKey } from "../utils/dates.js";
import { moodHistogram } from "../utils/journalStats.js";

function greetingFirstName(fullName) {
  const first = (fullName || "there").trim().split(/\s+/)[0];
  const h = new Date().getHours();
  const bit = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `Good ${bit}, ${first}.`;
}

function dirFromGrowth(res) {
  const d = res?.trajectory?.mirrorCard?.direction;
  if (d === "GROWTH" || d === "REGRESSION" || d === "STABLE") return d;
  return "REGRESSION";
}

export function HomePage() {
  const { t } = useOutletContext();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entries, setEntries] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [mirror, setMirror] = useState({ text: "", dir: "REGRESSION", ready: false });
  const [todayCard, setTodayCard] = useState(null);
  const [hovDay, setHovDay] = useState(null);
  const [hovEntry, setHovEntry] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    listJournals({ page: 0, size: 120 })
      .then(async (page) => {
        if (!alive) return;
        const content = page.content || [];
        setEntries(content);
        setTotalEntries(page.totalElements ?? content.length);

        const todayKey = todayLocalKey();
        const todayEntry = content.find((e) => localDayKey(e.createdAt) === todayKey && e.analysisStatus === "DONE");
        if (todayEntry?.moodAnalysis) {
          setTodayCard({
            insight: todayEntry.moodAnalysis.insight || "Your reflection is ready.",
            intensity: todayEntry.moodAnalysis.intensity ?? 0,
          });
        } else {
          setTodayCard(null);
        }

        const done = content.find((e) => e.analysisStatus === "DONE");
        if (done) {
          try {
            const g = await getGrowthLatest(done.id);
            if (!alive) return;
            const text =
              g?.trajectory?.mirrorCard?.integratedBody ||
              g?.trajectory?.mirrorCard?.headline ||
              g?.day?.summaryInsight ||
              "";
            if (text) {
              setMirror({
                text,
                dir: dirFromGrowth(g),
                ready: true,
              });
            } else {
              setMirror({
                text:
                  "Your entries build the mirror — keep writing, and patterns will surface in their own time.",
                dir: "STABLE",
                ready: true,
              });
            }
          } catch {
            setMirror({
              text:
                "Your journal is shaping the mirror. When analysis completes, this space holds what your data notices.",
              dir: "STABLE",
              ready: true,
            });
          }
        } else {
          setMirror({
            text: "Start with one honest entry — the mirror grows from what you actually write.",
            dir: "STABLE",
            ready: true,
          });
        }
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message || "Could not load home");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const weekDays = useMemo(() => getWeekDays(new Date()), []);
  const weekCells = useMemo(() => {
    return weekDays.map((dayDate) => {
      const key = localCalendarKey(dayDate);
      const todayKey = todayLocalKey();
      const onDay = entries.filter((e) => localDayKey(e.createdAt) === key);
      let intensity = 0;
      let wrote = onDay.length > 0;
      for (const e of onDay) {
        const i = e.moodAnalysis?.intensity ?? 0;
        if (i > intensity) intensity = i;
      }
      const today = key === todayKey;
      const labels = ["S", "M", "T", "W", "T", "F", "S"];
      const dow = dayDate.getDay();
      return {
        d: labels[dow],
        dateNum: dayDate.getDate(),
        wrote,
        intensity,
        today,
      };
    });
  }, [entries, weekDays]);

  const recent = entries.slice(0, 3);
  const moodBars = moodHistogram(entries).slice(0, 4);
  const palette = [t.caution, t.ember, t.growth, "#7A8E9E"];

  if (loading) {
    return (
      <div style={{ maxWidth: "1080px", margin: "0 auto", color: t.inkDim, fontFamily: "Georgia,serif" }}>
        Loading your mirror…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "1080px", margin: "0 auto", color: t.caution, fontFamily: "sans-serif" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            fontSize: "11px",
            color: t.inkDim,
            fontFamily: "sans-serif",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          {formatLongDate(new Date().toISOString())}
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(22px,3vw,30px)",
            color: t.ink,
            fontWeight: 400,
            fontFamily: "Georgia,serif",
          }}
        >
          {greetingFirstName(user?.name)}
        </h1>
      </div>

      <div style={{ marginBottom: "48px", paddingLeft: "20px", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "4px",
            bottom: "4px",
            width: "2px",
            borderRadius: "2px",
            background: `linear-gradient(180deg,${t.ember},${t.ember}20)`,
          }}
        />
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.18em",
            color: t.ember,
            fontFamily: "sans-serif",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          This Week&apos;s Mirror
        </div>
        <p
          style={{
            fontSize: "clamp(16px,2vw,20px)",
            lineHeight: "1.75",
            color: t.ink,
            fontStyle: "italic",
            margin: "0 0 14px",
            maxWidth: "640px",
            fontFamily: "Georgia,serif",
          }}
        >
          &ldquo;{mirror.text}&rdquo;
        </p>
        {mirror.ready && <DirBadge dir={mirror.dir} t={t} />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr clamp(260px,28%,320px)", gap: "28px", alignItems: "start" }}>
        <div>
          <div style={{ background: t.surface, borderRadius: "18px", padding: "22px", boxShadow: t.shadowSm, marginBottom: "24px" }}>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.12em",
                color: t.inkDim,
                fontFamily: "sans-serif",
                textTransform: "uppercase",
                marginBottom: "18px",
              }}
            >
              This Week
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {weekCells.map((day, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHovDay(i)}
                  onMouseLeave={() => setHovDay(null)}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 4px",
                    borderRadius: "14px",
                    cursor: "default",
                    background: day.today ? t.emberSoft : hovDay === i ? t.surfaceEl : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      color: day.today ? t.ember : t.inkDim,
                      fontFamily: "sans-serif",
                      fontWeight: day.today ? 700 : 400,
                    }}
                  >
                    {day.d}
                  </span>
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: day.wrote ? `${iCol(day.intensity, t)}22` : t.surfaceEl,
                      border: `2px solid ${day.wrote ? iCol(day.intensity, t) : "transparent"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                      boxShadow:
                        day.wrote && day.intensity >= 4 ? `0 0 14px ${iCol(day.intensity, t)}50` : "none",
                    }}
                  >
                    {day.wrote && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: iCol(day.intensity, t),
                        }}
                      />
                    )}
                  </div>
                  <span style={{ fontSize: "11px", color: day.today ? t.ink : t.inkDim, fontFamily: "sans-serif" }}>
                    {day.dateNum}
                  </span>
                  {day.wrote ? (
                    <span style={{ fontSize: "9px", color: iCol(day.intensity, t), fontFamily: "sans-serif", fontWeight: 600 }}>
                      {day.intensity}/5
                    </span>
                  ) : (
                    <span style={{ fontSize: "9px", color: t.inkDim, fontFamily: "sans-serif" }}>—</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.12em",
                color: t.inkDim,
                fontFamily: "sans-serif",
                textTransform: "uppercase",
              }}
            >
              Recent Entries
            </div>
            <button
              type="button"
              onClick={() => navigate("/journal")}
              style={{
                background: "none",
                border: "none",
                color: t.ember,
                fontSize: "11px",
                fontFamily: "sans-serif",
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              See all →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recent.length === 0 && (
              <div style={{ color: t.inkDim, fontFamily: "Georgia,serif", fontStyle: "italic", padding: "24px 0" }}>
                No entries yet — open Write and add your first reflection.
              </div>
            )}
            {recent.map((e) => {
              const mood = e.moodAnalysis?.moodLabel || (e.analysisStatus === "DONE" ? "Reflecting" : "Analyzing…");
              const inten = e.moodAnalysis?.intensity ?? 2;
              return (
                <div
                  key={e.id}
                  onMouseEnter={() => setHovEntry(e.id)}
                  onMouseLeave={() => setHovEntry(null)}
                  onClick={() => navigate("/journal", { state: { focusId: e.id } })}
                  style={{
                    background: t.surface,
                    borderRadius: "16px",
                    padding: "18px 20px",
                    boxShadow: hovEntry === e.id ? t.shadow : t.shadowSm,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    transform: hovEntry === e.id ? "translateY(-2px)" : "none",
                    borderLeft: `3px solid ${iCol(inten, t)}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: 500, color: t.ink, fontFamily: "sans-serif" }}>{e.title}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <Badge label={mood} color={iCol(inten, t)} bg={`${iCol(inten, t)}1A`} />
                      <span style={{ fontSize: "11px", color: t.inkDim, fontFamily: "sans-serif" }}>
                        {formatMediumDate(e.createdAt).split(",")[0]}
                      </span>
                    </div>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      lineHeight: "1.6",
                      color: t.inkMid,
                      fontStyle: "italic",
                      fontFamily: "Georgia,serif",
                    }}
                  >
                    &ldquo;{(e.content || "").slice(0, 110)}
                    …&rdquo;
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: t.surface, borderRadius: "18px", padding: "20px", boxShadow: t.shadowSm }}>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.12em",
                color: t.inkDim,
                fontFamily: "sans-serif",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Today&apos;s Reflection
            </div>
            {todayCard ? (
              <>
                <p
                  style={{
                    margin: "0 0 14px",
                    fontSize: "13px",
                    lineHeight: "1.65",
                    color: t.inkMid,
                    fontStyle: "italic",
                    fontFamily: "Georgia,serif",
                  }}
                >
                  &ldquo;{todayCard.insight}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ flex: 1, height: "4px", background: t.surfaceEl, borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, (todayCard.intensity / 5) * 100)}%`,
                        background: t.growth,
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "11px", color: t.growth, fontFamily: "sans-serif", fontWeight: 600 }}>
                    {todayCard.intensity.toFixed(1)} / 5
                  </span>
                </div>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: "13px", color: t.inkDim, fontFamily: "Georgia,serif", fontStyle: "italic" }}>
                Write today or wait for analysis to finish — your dominant mood will land here.
              </p>
            )}
          </div>

          {totalEntries >= 30 && (
            <div
              style={{
                borderRadius: "18px",
                padding: "20px",
                background: `linear-gradient(140deg,${t.emberSoft},${t.surfaceEl})`,
                boxShadow: t.shadowSm,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ fontSize: "18px" }}>◈</span>
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    color: t.ember,
                    fontFamily: "sans-serif",
                    textTransform: "uppercase",
                  }}
                >
                  Milestone · {totalEntries} Entries
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.65", color: t.inkMid, fontFamily: "Georgia,serif" }}>
                You&apos;ve crossed a depth threshold — the mirror has enough signal to show trajectory, not noise.
              </p>
            </div>
          )}

          <div style={{ background: t.surface, borderRadius: "18px", padding: "20px", boxShadow: t.shadowSm }}>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.12em",
                color: t.inkDim,
                fontFamily: "sans-serif",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Emotional Range
            </div>
            {moodBars.length === 0 ? (
              <p style={{ margin: 0, fontSize: "12px", color: t.inkDim, fontFamily: "Georgia,serif" }}>No analyzed moods yet.</p>
            ) : (
              moodBars.map((r, idx) => (
                <div key={r.label} style={{ marginBottom: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "12px", fontFamily: "sans-serif", color: t.inkMid }}>{r.label}</span>
                    <span style={{ fontSize: "11px", color: palette[idx % palette.length], fontFamily: "sans-serif", fontWeight: 600 }}>
                      {r.pct}%
                    </span>
                  </div>
                  <div style={{ height: "4px", background: t.surfaceEl, borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${r.pct}%`,
                        background: palette[idx % palette.length],
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
