const rng = (seed) => () => {
  seed |= 0;
  seed = seed + 1831565813 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
const hash2 = (x, y, s) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 2147483647);
  h = Math.imul(h ^ h >>> 13, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
};
const vnoise = (x, y, s, per) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const w = (a2) => (a2 % per + per) % per;
  const sm = (t) => t * t * (3 - 2 * t);
  const a = hash2(w(xi), w(yi), s), b = hash2(w(xi + 1), w(yi), s), c = hash2(w(xi), w(yi + 1), s), d = hash2(w(xi + 1), w(yi + 1), s);
  return a + (b - a) * sm(xf) + (c - a) * sm(yf) + (a - b - c + d) * sm(xf) * sm(yf);
};
const tiles = /* @__PURE__ */ new Map();
const canvas = (size, key, draw) => {
  const hit = tiles.get(key);
  if (hit !== void 0) return hit;
  if (typeof document === "undefined") return "";
  const cv = document.createElement("canvas");
  cv.width = size;
  cv.height = size;
  draw(cv.getContext("2d"));
  const url = cv.toDataURL("image/png");
  tiles.set(key, url);
  return url;
};
const grainTile = (size = 512, seed = 11, fibres = 0, gain = 78) => canvas(size, `grain-${size}-${seed}-${fibres}-${gain}`, (x) => {
  const id = x.createImageData(size, size), d = id.data;
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const v = (hash2(i, j, seed) - 0.5) * 0.75 + (vnoise(i / 48, j / 48, seed + 1, size / 48) - 0.5) * 0.3 + (vnoise(i / 12, j / 12, seed + 2, size / 12) - 0.5) * 0.22 + (vnoise(i / 3, j / 3, seed + 3, size / 3) - 0.5) * 0.3;
    const o = (j * size + i) * 4, c = v > 0 ? 255 : 0;
    d[o] = c;
    d[o + 1] = c;
    d[o + 2] = c;
    d[o + 3] = Math.min(255, Math.abs(v) * gain);
  }
  x.putImageData(id, 0, 0);
  const r = rng(seed * 7 + 77);
  for (let k = 0; k < fibres; k++) {
    const sx = 20 + r() * (size - 40), sy = 20 + r() * (size - 40), a = r() * 6.283, l = 6 + r() * 22;
    x.strokeStyle = r() < 0.6 ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.10)";
    x.lineWidth = 0.6 + r() * 0.7;
    x.beginPath();
    x.moveTo(sx, sy);
    x.quadraticCurveTo(sx + Math.cos(a + 0.6) * l * 0.6, sy + Math.sin(a + 0.6) * l * 0.6, sx + Math.cos(a) * l, sy + Math.sin(a) * l);
    x.stroke();
  }
});
const specksTile = (size = 512, seed = 5) => canvas(size, `specks-${size}-${seed}`, (x) => {
  const id = x.createImageData(size, size), d = id.data;
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const n = hash2(i, j, seed), v = n > 0.985 ? 30 + hash2(j, i, seed + 9) * 50 : n * 14;
    const o = (j * size + i) * 4;
    d[o] = v;
    d[o + 1] = v;
    d[o + 2] = v;
    d[o + 3] = 255;
  }
  x.putImageData(id, 0, 0);
});
const FILM_GRAIN_TILES = (() => {
  if (typeof document === "undefined") return [];
  let seed = 918273;
  const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  return Array.from({ length: 6 }, (_, t) => canvas(256, `film-${t}`, (g) => {
    const img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 205 + (rnd() - 0.5) * 150 + (rnd() - 0.5) * 60;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.max(0, Math.min(255, v));
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }));
})();
export {
  FILM_GRAIN_TILES,
  grainTile,
  hash2,
  rng,
  specksTile,
  vnoise
};
