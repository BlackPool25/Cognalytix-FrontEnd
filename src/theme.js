/** Design tokens from product reference (ember / warm paper mirror aesthetic). */
export function getT(dark) {
  return {
    bg: dark ? "#0F0D0B" : "#F5EFE3",
    surface: dark ? "#181410" : "#FFFDF7",
    surfaceEl: dark ? "#201C17" : "#F0E8D8",
    surfaceHi: dark ? "#2A241E" : "#E6DCC8",
    ink: dark ? "#EDE0CF" : "#1C1208",
    inkMid: dark ? "#9A8E7E" : "#5A4A32",
    inkDim: dark ? "#5A5048" : "#9A8A70",
    ember: dark ? "#C4854A" : "#A06828",
    emberSoft: dark ? "rgba(196,133,74,0.13)" : "rgba(160,104,40,0.11)",
    emberLine: dark ? "rgba(196,133,74,0.4)" : "rgba(160,104,40,0.35)",
    growth: dark ? "#7A9E7E" : "#4A7A52",
    growthSoft: dark ? "rgba(122,158,126,0.14)" : "rgba(74,122,82,0.11)",
    caution: dark ? "#B87C5A" : "#8A4E2A",
    cautionSoft: dark ? "rgba(184,124,90,0.14)" : "rgba(138,78,42,0.11)",
    shadow: dark ? "0 4px 28px rgba(0,0,0,0.45)" : "0 4px 28px rgba(0,0,0,0.09)",
    shadowSm: dark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.06)",
    shadowLg: dark ? "0 12px 48px rgba(0,0,0,0.6)" : "0 12px 48px rgba(0,0,0,0.14)",
    overlay: dark ? "rgba(10,8,6,0.82)" : "rgba(240,232,218,0.85)",
  };
}

export function iCol(intensity, t) {
  const i = Number(intensity) || 0;
  if (i <= 2) return t.growth;
  if (i <= 3) return t.ember;
  return t.caution;
}
