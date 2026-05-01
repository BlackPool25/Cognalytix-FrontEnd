import { iCol } from "../theme.js";

export function Badge({ label, color, bg }) {
  return (
    <span
      style={{
        fontSize: "10px",
        fontFamily: "var(--font-ui)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: "20px",
        color,
        background: bg,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function DirBadge({ dir, t }) {
  const map = {
    GROWTH: [t.growth, t.growthSoft, "↗ Growth"],
    REGRESSION: [t.caution, t.cautionSoft, "↘ Shift"],
    STABLE: [t.inkMid, t.surfaceEl, "→ Stable"],
  };
  const [c, bg, label] = map[dir] || [t.inkMid, t.surfaceEl, dir];
  return <Badge label={label} color={c} bg={bg} />;
}

export function IntensityDots({ value, t }) {
  const v = Math.min(5, Math.max(0, Number(value) || 0));
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: n <= v ? iCol(v, t) : t.surfaceHi,
            transition: "background 0.2s",
          }}
        />
      ))}
    </div>
  );
}
