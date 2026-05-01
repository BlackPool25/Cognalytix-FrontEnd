/**
 * Vintage paper (light) + muted ink (dark) — semantic tokens aligned with product palette.
 * Legacy keys (bg, surface, ember, …) are preserved so existing components keep working.
 */

function rgba(hex, alpha) {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const LIGHT = {
  bgPrimary: "#F4EDE4",
  bgSecondary: "#E6D6C6",
  bgElevated: "#FFFFFF",
  textPrimary: "#3E2F26",
  textSecondary: "#7A675A",
  textMuted: "#A08D7F",
  accentPrimary: "#C97C5D",
  accentSecondary: "#A67B5B",
  accentSoft: "#E8BFA7",
  border: "#D8C7B5",
  inputBg: "#EFE4D6",
  hover: "#EAD9C7",
  highlightRose: "#D8A7A7",
  highlightSage: "#A3B18A",
  highlightAmber: "#D4A373",
};

const DARK = {
  bgPrimary: "#1E1A18",
  bgSecondary: "#2A2421",
  bgElevated: "#332C28",
  textPrimary: "#F1E7DC",
  textSecondary: "#C6B7A6",
  textMuted: "#9A8C7C",
  accentPrimary: "#E09A7B",
  accentSecondary: "#C08A6A",
  accentSoft: "#8C5A44",
  border: "#4A3F38",
  inputBg: "#2F2926",
  hover: "#3A322E",
  highlightRose: "#B07A7A",
  highlightSage: "#7C8F6A",
  highlightAmber: "#B08968",
};

/** Typography stacks (loaded in index.html). */
export const fonts = {
  display: '"Fraunces", "Libre Baskerville", Georgia, serif',
  ui: '"Figtree", system-ui, sans-serif',
};

/**
 * @param {boolean} dark
 * @returns {Record<string, string>}
 */
export function getT(dark) {
  const c = dark ? DARK : LIGHT;

  return {
    // —— Canonical semantic names (for new code) ——
    bgPrimary: c.bgPrimary,
    bgSecondary: c.bgSecondary,
    bgElevated: c.bgElevated,
    textPrimary: c.textPrimary,
    textSecondary: c.textSecondary,
    textMuted: c.textMuted,
    accentPrimary: c.accentPrimary,
    accentSecondary: c.accentSecondary,
    accentSoft: c.accentSoft,
    border: c.border,
    inputBg: c.inputBg,
    hover: c.hover,
    highlightRose: c.highlightRose,
    highlightSage: c.highlightSage,
    highlightAmber: c.highlightAmber,

    fontDisplay: fonts.display,
    fontUi: fonts.ui,

    /** WCAG-friendly text on filled accent buttons */
    onAccent: dark ? "#1E1A18" : "#3E2F26",

    /** Sidebar / rail: warm strip off the main parchment */
    navBg: c.bgSecondary,

    // —— Legacy aliases (existing components) ——
    bg: c.bgPrimary,
    surface: c.bgElevated,
    surfaceEl: c.inputBg,
    surfaceHi: c.border,
    ink: c.textPrimary,
    inkMid: c.textSecondary,
    inkDim: c.textMuted,
    ember: c.accentPrimary,
    emberSoft: rgba(c.accentPrimary, dark ? 0.16 : 0.14),
    emberLine: rgba(c.accentPrimary, dark ? 0.55 : 0.42),
    growth: c.highlightSage,
    growthSoft: rgba(c.highlightSage, dark ? 0.2 : 0.18),
    caution: c.highlightRose,
    cautionSoft: rgba(c.highlightRose, dark ? 0.22 : 0.2),
    shadow: dark ? "0 4px 28px rgba(12, 8, 6, 0.42)" : "0 4px 28px rgba(62, 47, 38, 0.08)",
    shadowSm: dark ? "0 2px 12px rgba(12, 8, 6, 0.35)" : "0 2px 12px rgba(62, 47, 38, 0.06)",
    shadowLg: dark ? "0 12px 48px rgba(8, 5, 4, 0.55)" : "0 12px 40px rgba(62, 47, 38, 0.1)",
    overlay: dark ? "rgba(22, 18, 16, 0.78)" : "rgba(244, 237, 228, 0.88)",

    /** Extra bar / chart accent (dusty blue-green off-palette, desaturated) */
    highlightCool: dark ? "#6B7B78" : "#8B9B96",

    /** List row / nav hover wash */
    hover: c.hover,
  };
}

/** Intensity strip: calm sage → terracotta → rose (no saturation spikes). */
export function iCol(intensity, t) {
  const i = Number(intensity) || 0;
  if (i <= 2) return t.growth;
  if (i <= 3) return t.ember;
  return t.caution;
}
