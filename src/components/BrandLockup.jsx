/**
 * Product mark + name + slogan — uses display serif to match page headings.
 * @param {{ t: object, tagline?: boolean }} props — `tagline` false = compact slogan (still shown).
 */
export function BrandLockup({ t, tagline = true }) {
  const mark = 38;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "12px",
        flexShrink: 0,
        minWidth: 0,
      }}
    >
      <div
        aria-hidden
        style={{
          width: `${mark}px`,
          height: `${mark}px`,
          borderRadius: "11px",
          background: t.emberSoft,
          border: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          lineHeight: 1,
          flexShrink: 0,
          color: t.ember,
        }}
      >
        ◈
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: tagline ? "4px" : "2px",
          minWidth: 0,
          textAlign: "left",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: tagline ? "clamp(17px, 1.75vw, 21px)" : "clamp(15px, 1.55vw, 18px)",
            fontWeight: 600,
            fontOpticalSizing: "auto",
            letterSpacing: "0.03em",
            color: t.ink,
            lineHeight: 1.15,
          }}
        >
          Cognalytix
        </div>
        {tagline ? (
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(11px, 1.1vw, 12px)",
              fontStyle: "italic",
              fontWeight: 400,
              color: t.inkMid,
              letterSpacing: "0.02em",
              lineHeight: 1.4,
              maxWidth: "14rem",
            }}
          >
            self-discovery mirror
          </div>
        ) : (
          <div
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: t.inkDim,
              lineHeight: 1.35,
            }}
          >
            self-discovery mirror
          </div>
        )}
      </div>
    </div>
  );
}
