import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getGrowthLatest } from "../api/insightsApi.js";
import { listJournals } from "../api/journalsApi.js";
import { Badge, DirBadge } from "../components/Badge.jsx";
import { BrandLockup } from "../components/BrandLockup.jsx";
import { formatMediumDate } from "../utils/dates.js";

function dirFromGrowth(res) {
  const d = res?.trajectory?.mirrorCard?.direction;
  if (d === "GROWTH" || d === "REGRESSION" || d === "STABLE") return d;
  return "STABLE";
}

function narrationFrom(g) {
  return (
    g?.trajectory?.mirrorCard?.integratedBody ||
    g?.trajectory?.mirrorCard?.headline ||
    g?.day?.summaryInsight ||
    ""
  );
}

export function InsightsPage() {
  const { t } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [hov, setHov] = useState(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setError(null);

    listJournals({ page: 0, size: 24 })
      .then(async (page) => {
        const entries = page.content || [];
        const total = page.totalElements ?? entries.length;
        const done = entries.filter((e) => e.analysisStatus === "DONE").slice(0, 12);

        const ms = [];
        if (total >= 30) {
          ms.push({
            count: total,
            text: "You've crossed a depth threshold — trajectories become meaningful when the mirror has enough signal.",
            dir: "GROWTH",
          });
        }
        if (total >= 10 && total < 30) {
          ms.push({
            count: total,
            text: "Keep writing — milestone narratives unlock as your archive deepens.",
            dir: "STABLE",
          });
        }
        setMilestones(ms);

        const growthRows = await Promise.all(
          done.map(async (e) => {
            try {
              const g = await getGrowthLatest(e.id);
              return { entry: e, g };
            } catch {
              return { entry: e, g: null };
            }
          })
        );

        if (cancel) return;

        const tl = growthRows
          .map(({ entry, g }) => {
            const text = g ? narrationFrom(g) : "";
            if (!text) return null;
            const topic =
              g?.trajectory?.mirrorCard?.headline?.slice(0, 40) ||
              entry.moodAnalysis?.moodLabel ||
              "your patterns";
            return {
              id: entry.id,
              dir: g ? dirFromGrowth(g) : "STABLE",
              type: g?.hasTrajectory ? "Post-Entry" : "Snapshot",
              patternType: g?.patternType || null,
              topic,
              date: formatMediumDate(entry.createdAt),
              narration: text,
            };
          })
          .filter(Boolean);

        setTimeline(tl);
      })
      .catch((e) => {
        if (!cancel) setError(e.message || "Failed to load insights");
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });

    return () => {
      cancel = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: "820px", margin: "0 auto", color: t.inkDim, fontFamily: "var(--font-display)" }}>
        Gathering patterns…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "820px", margin: "0 auto", color: t.caution, fontFamily: "var(--font-ui)" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "820px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "8px",
        }}
      >
        <h1 style={{ fontSize: "clamp(20px,3vw,26px)", fontFamily: "var(--font-display)", color: t.ink, fontWeight: 400, margin: 0, flex: "1 1 220px", minWidth: 0 }}>
          Your Growth
        </h1>
        <BrandLockup t={t} tagline={false} />
      </div>
      <p style={{ fontSize: "14px", color: t.inkDim, fontFamily: "var(--font-ui)", margin: "0 0 40px" }}>
        Patterns your data has noticed. You might not have.
      </p>

      {milestones.length > 0 && (
        <div style={{ marginBottom: "44px" }}>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.15em",
              color: t.inkDim,
              fontFamily: "var(--font-ui)",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Milestones
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "14px" }}>
            {milestones.map((m, i) => (
              <div
                key={i}
                style={{
                  background: `linear-gradient(140deg,${t.emberSoft},${t.surfaceEl})`,
                  border: `1px solid ${t.border}`,
                  borderRadius: "18px",
                  padding: "22px",
                  boxShadow: t.shadowSm,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "20px" }}>◈</span>
                  <span
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.12em",
                      color: t.ember,
                      fontFamily: "var(--font-ui)",
                      textTransform: "uppercase",
                    }}
                  >
                    {m.count} Entries
                  </span>
                </div>
                <p style={{ margin: "0 0 16px", fontSize: "14px", lineHeight: "1.7", color: t.inkMid, fontFamily: "var(--font-display)" }}>{m.text}</p>
                <DirBadge dir={m.dir} t={t} />
              </div>
            ))}
          </div>
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
            marginBottom: "20px",
          }}
        >
          Pattern Timeline
        </div>
        {timeline.length === 0 ? (
          <p style={{ color: t.inkDim, fontFamily: "var(--font-display)", fontStyle: "italic" }}>
            No mirror narratives yet — finish a few analyzed entries and check back.
          </p>
        ) : (
          <div style={{ position: "relative", paddingLeft: "10px" }}>
            <div
              style={{
                position: "absolute",
                left: "15px",
                top: "8px",
                bottom: "8px",
                width: "1px",
                background: `linear-gradient(180deg,${t.ember}70,transparent)`,
              }}
            />
            {timeline.map((g, i) => (
              <div
                key={g.id}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                style={{ display: "flex", gap: "22px", alignItems: "flex-start", paddingBottom: "22px" }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    zIndex: 1,
                    background: hov === i ? t.ember : t.surface,
                    border: `2px solid ${hov === i ? t.ember : t.emberLine}`,
                    marginTop: "16px",
                    transition: "all 0.2s",
                    boxShadow: hov === i ? `0 0 14px ${t.ember}60` : t.shadowSm,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    borderRadius: "16px",
                    padding: "18px 22px",
                    boxShadow: hov === i ? t.shadow : t.shadowSm,
                    transition: "all 0.2s",
                    transform: hov === i ? "translateX(4px)" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <DirBadge dir={g.dir} t={t} />
                      <Badge label={g.type} color={t.inkMid} bg={t.surfaceEl} />
                      {g.patternType && (
                        <Badge label={g.patternType.replace(/_/g, " ")} color={t.ember} bg={t.emberSoft} />
                      )}
                    </div>
                    <span style={{ fontSize: "11px", color: t.inkDim, fontFamily: "var(--font-ui)" }}>{g.date}</span>
                  </div>
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: "14px",
                      lineHeight: "1.75",
                      color: t.ink,
                      fontStyle: "italic",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    &ldquo;{g.narration}&rdquo;
                  </p>
                  <span style={{ fontSize: "11px", color: t.inkDim, fontFamily: "var(--font-ui)" }}>Topic: {g.topic}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
