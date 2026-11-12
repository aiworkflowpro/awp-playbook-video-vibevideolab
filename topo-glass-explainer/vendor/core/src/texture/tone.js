const rgbOf = (c) => {
  const s = c.trim();
  if (s.startsWith("#")) {
    const n = parseInt(s.slice(1), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  const m = s.replace(/^rgba?\(/, "").replace(/\)$/, "").split(",").map((x) => parseFloat(x));
  return [m[0] ?? 0, m[1] ?? 0, m[2] ?? 0];
};
const alphaOf = (c) => {
  const m = /^rgba\([^)]*,\s*([\d.]+)\)$/.exec(c.trim());
  return m ? parseFloat(m[1]) : 1;
};
const rgbStr = (c) => rgbOf(c).map((v) => Math.round(v)).join(",");
const mix = (a, b, t) => {
  const x = rgbOf(a), y = rgbOf(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
const withAlpha = (c, a) => `rgba(${rgbStr(c)},${a.toFixed(3)})`;
const luma = (c) => {
  const [r, g, b] = rgbOf(c).map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const isDark = (t) => luma(t.ground.mid) < 0.18;
const keyRgb = (t) => alphaOf(t.light.key) > 0 ? rgbStr(t.light.key) : "255,255,255";
const fillRgb = (t) => alphaOf(t.light.fill) > 0 ? rgbStr(t.light.fill) : null;
const grainScale = (t) => Math.max(0, Math.min(1.5, t.texture.grain / 0.03));
export {
  alphaOf,
  fillRgb,
  grainScale,
  isDark,
  keyRgb,
  luma,
  mix,
  rgbOf,
  rgbStr,
  withAlpha
};
