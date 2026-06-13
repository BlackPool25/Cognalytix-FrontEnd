import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { createJournal } from "../api/journalsApi.js";
import { BrandLockup } from "../components/BrandLockup.jsx";
import { formatLongDate } from "../utils/dates.js";

export function WritePage() {
  const { t } = useOutletContext();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | saving | error
  const [errorMsg, setErrorMsg] = useState(null);
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = async () => {
    if (!content.trim() || phase !== "idle") return;
    setErrorMsg(null);
    setPhase("saving");
    try {
      const created = await createJournal({
        title: title.trim() || "Untitled",
        content: content.trim(),
      });
      navigate("/journal", { state: { focusId: created.id } });
    } catch (e) {
      setErrorMsg(e.message || "Could not save entry");
      setPhase("error");
    }
  };

  const resetForm = () => {
    setPhase("idle");
    setErrorMsg(null);
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", position: "relative" }}>
      {(phase === "saving" || phase === "error") && (
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
          onClick={() => phase === "error" && resetForm()}
          onKeyDown={(e) => e.key === "Escape" && phase === "error" && resetForm()}
          role="presentation"
        >
          {phase === "saving" ? (
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
                Saving your entry...
              </div>
              <div style={{ fontSize: "12px", color: t.inkDim, fontFamily: "var(--font-ui)", marginTop: "8px" }}>
                Analysis runs in the background, you can continue right away.
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
          ) : null}
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
