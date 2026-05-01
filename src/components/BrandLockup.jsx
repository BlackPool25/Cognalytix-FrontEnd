/**
 * Compact product mark for the top-right of a page (no full-width header bar).
 * @param {{ t: object, tagline?: boolean }} props
 */
export function BrandLockup({ t, tagline = true }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        flexShrink: 0,
        maxWidth: "min(200px, 38vw)",
      }}
    >
      <div style={{ textAlign: "right", minWidth: 0 }}>
        <div
          style={{
            fontSize: "clamp(13px, 1.45vw, 15px)",
            fontWeight: 700,
            color: t.ink,
            fontFamily: "var(--font-ui)",
            letterSpacing: "0.02em",
            lineHeight: 1.2,
          }}
        >
          Cognalytix
        </div>
        {tagline && (
          <div
            style={{
              fontSize: "10px",
              color: t.inkDim,
              fontFamily: "var(--font-ui)",
              marginTop: "3px",
              lineHeight: 1.35,
            }}
          >
            self-discovery mirror
          </div>
        )}
      </div>
      <div
        aria-hidden
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "10px",
          background: t.emberSoft,
          border: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "15px",
          flexShrink: 0,
        }}
      >
        ◈
      </div>
    </div>
  );
}
