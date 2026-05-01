import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getGrowthLatest } from "../api/insightsApi.js";
import { createJournal, getJournal } from "../api/journalsApi.js";
import { DirBadge } from "../components/Badge.jsx";
import { BrandLockup } from "../components/BrandLockup.jsx";
import { formatLongDate } from "../utils/dates.js";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function dirFromGrowth(res) {
  const d = res?.trajectory?.mirrorCard?.direction;
  if (d === "GROWTH" || d === "REGRESSION" || d === "STABLE") return d;
  return "REGRESSION";
}

export function WritePage() {
  const { t } = useOutletContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | analyzing | mirror | error
  const [errorMsg, setErrorMsg] = useState(null);
  const [mirrorPayload, setMirrorPayload] = useState(null);
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = async () => {
    if (!content.trim() || phase !== "idle") return;
    setErrorMsg(null);
    setPhase("analyzing");
    try {
      const created = await createJournal({
        title: title.trim() || "Untitled",
        content: content.trim(),
      });
      const id = created.id;

      const deadline = Date.now() + 180_000;
      let last = created;
      while (Date.now() < deadline) {
        last = await getJournal(id);
        if (last.analysisStatus === "DONE" || last.analysisStatus === "FAILED") break;
        await sleep(2000);
      }

      let growth = null;
      if (last.analysisStatus === "DONE") {
        for (let i = 0; i < 8; i++) {
          growth = await getGrowthLatest(id);
          if (growth.hasTrajectory || growth.mirrorReady) break;
          await sleep(2500);
        }
      }

      const primary =
        growth?.trajectory?.mirrorCard?.integratedBody ||
        growth?.trajectory?.mirrorCard?.headline ||
        growth?.day?.summaryInsight ||
        (last.analysisStatus === "FAILED"
          ? "Analysis did not complete — your entry is saved and you can try Reanalyze from the journal."
          : "Your entry is saved. When patterns emerge, they will appear here.");

      setMirrorPayload({
        text: primary,
        sub:
          growth?.trajectory?.mirrorCard?.trajectoryLine ||
          growth?.day?.dominantMoodLabel ||
          "",
        dir: dirFromGrowth(growth),
        dateLine: formatLongDate(last.createdAt),
      });
      setPhase("mirror");
    } catch (e) {
      setErrorMsg(e.message || "Could not save entry");
      setPhase("error");
    }
  };

  const resetForm = () => {
    setPhase("idle");
    setTitle("");
    setContent("");
    setMirrorPayload(null);
    setErrorMsg(null);
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", position: "relative" }}>
      {(phase === "analyzing" || phase === "mirror" || phase === "error") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: t.overlay,
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => phase === "mirror" && resetForm()}
          onKeyDown={(e) => e.key === "Escape" && phase === "mirror" && resetForm()}
          role="presentation"
        >
          {phase === "analyzing" ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "36px",
                  marginBottom: "20px",
                  display: "inline-block",
                  animation: "spin 2s linear infinite",
                }}
              >
                ◈
              </div>
              <div style={{ fontSize: "16px", color: t.ink, fontFamily: "var(--font-display)", fontStyle: "italic" }}>
                Reflecting on your entry...
              </div>
              <div style={{ fontSize: "12px", color: t.inkDim, fontFamily: "var(--font-ui)", marginTop: "8px" }}>
                Finding patterns across your history
              </div>
            </div>
          ) : phase === "error" ? (
            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: "22px",
                padding: "36px",
                maxWidth: "500px",
                width: "100%",
                boxShadow: t.shadowLg,
              }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
            >
              <p style={{ color: t.caution, fontFamily: "var(--font-ui)", marginBottom: "16px" }}>{errorMsg}</p>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: t.emberSoft,
                  border: "none",
                  borderRadius: "12px",
                  color: t.ember,
                  fontSize: "13px",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: "22px",
                padding: "36px",
                maxWidth: "500px",
                width: "100%",
                boxShadow: t.shadowLg,
              }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <span style={{ fontSize: "22px" }}>◈</span>
                <div>
                  <div
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.15em",
                      color: t.ember,
                      fontFamily: "var(--font-ui)",
                      textTransform: "uppercase",
                    }}
                  >
                    Mirror · Post Entry
                  </div>
                  <div style={{ fontSize: "11px", color: t.inkDim, fontFamily: "var(--font-ui)" }}>
                    {mirrorPayload?.dateLine}
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: "17px",
                  lineHeight: "1.78",
                  color: t.ink,
                  fontStyle: "italic",
                  fontFamily: "var(--font-display)",
                  margin: "0 0 18px",
                }}
              >
                &ldquo;{mirrorPayload?.text}&rdquo;
              </p>
              <DirBadge dir={mirrorPayload?.dir || "STABLE"} t={t} />
              {mirrorPayload?.sub && (
                <p style={{ fontSize: "13px", color: t.inkMid, fontFamily: "var(--font-display)", margin: "16px 0 0", lineHeight: "1.65" }}>
                  {mirrorPayload.sub}
                </p>
              )}
              <button
                type="button"
                onClick={resetForm}
                style={{
                  marginTop: "24px",
                  width: "100%",
                  padding: "13px",
                  background: t.emberSoft,
                  border: "none",
                  borderRadius: "12px",
                  color: t.ember,
                  fontSize: "13px",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "44px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ fontSize: "11px", color: t.inkDim, fontFamily: "var(--font-ui)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {formatLongDate(new Date().toISOString())}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <BrandLockup t={t} tagline={false} />
          <span style={{ fontSize: "12px", color: t.inkDim, fontFamily: "var(--font-ui)" }}>{words} words</span>
          <button
            type="button"
            onClick={handleSave}
            disabled={!content.trim() || phase !== "idle"}
            style={{
              padding: "10px 22px",
              background: content.trim() && phase === "idle" ? t.ember : t.surfaceEl,
              border: "none",
              borderRadius: "12px",
              color: content.trim() && phase === "idle" ? t.onAccent : t.inkDim,
              fontSize: "13px",
              fontFamily: "var(--font-ui)",
              fontWeight: 600,
              cursor: content.trim() && phase === "idle" ? "pointer" : "default",
              transition: "all 0.2s",
              boxShadow: content.trim() && phase === "idle" ? `0 4px 16px ${t.ember}50` : "none",
            }}
          >
            {phase === "idle" ? "Save & Reflect" : "Saving..."}
          </button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What's on your mind?"
        style={{
          width: "100%",
          background: "none",
          border: "none",
          outline: "none",
          fontSize: "clamp(22px,3vw,30px)",
          color: t.ink,
          fontFamily: "var(--font-display)",
          marginBottom: "20px",
          caretColor: t.ember,
        }}
      />
      <div style={{ height: "1px", background: t.border, marginBottom: "28px" }} />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write freely. This is just for you."
        style={{
          width: "100%",
          background: "none",
          border: "none",
          outline: "none",
          fontSize: "16px",
          color: t.inkMid,
          fontFamily: "var(--font-display)",
          lineHeight: "1.85",
          resize: "none",
          minHeight: "min(420px, 55vh)",
          caretColor: t.ember,
        }}
      />
    </div>
  );
}
