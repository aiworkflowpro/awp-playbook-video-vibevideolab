import React from 'react';
import {THEME} from '../theme';

// Contour lines, the one implementation: a height field traced with marching squares into one SVG path per level.
// Pure functions of their inputs (seeded where random), traced once per field and cached.

export type Field = (x: number, y: number) => number;

/** One path per level over [0, width] x [0, height], sampled every `step` px. */
export const traceContours = (field: Field, width: number, height: number, step: number, levels: number[]): string[] => {
  const cols = Math.ceil(width / step) + 1;
  const rows = Math.ceil(height / step) + 1;
  const v = new Float64Array(cols * rows);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) v[j * cols + i] = field(i * step, j * step);
  return levels.map((level) => {
    let d = '';
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const c = [v[j * cols + i], v[j * cols + i + 1], v[(j + 1) * cols + i + 1], v[(j + 1) * cols + i]];
        const corner = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
        const pts: Array<[number, number]> = [];
        for (let e = 0; e < 4; e++) {
          const a = c[e];
          const b = c[(e + 1) % 4];
          if (a < level !== b < level) {
            const t = (level - a) / (b - a);
            const [x0, y0] = corner[e];
            const [x1, y1] = corner[(e + 1) % 4];
            pts.push([(x0 + (x1 - x0) * t) * step, (y0 + (y1 - y0) * t) * step]);
          }
        }
        for (let k = 0; k + 1 < pts.length; k += 2) d += `M${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)}L${pts[k + 1][0].toFixed(1)} ${pts[k + 1][1].toFixed(1)}`;
      }
    }
    return d;
  });
};

const peak = (x: number, y: number, cx: number, cy: number, sx: number, sy: number, h: number) => h * Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2));
/** The diagram terrain: a few summits and a ridge on the 1920x1080 frame. */
export const frameTerrain: Field = (x, y) =>
  peak(x, y, 1390, 300, 420, 300, 1) + peak(x, y, 420, 830, 340, 260, 0.8) + peak(x, y, 1720, 990, 260, 220, 0.55) + peak(x, y, 860, 120, 520, 150, 0.35) + 0.05 * Math.sin(x / 140 + y / 210) + 0.04 * Math.cos(y / 95 - x / 260);

// Seeded PRNG (mulberry32).
const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
/** A seeded terrain over width x height: gaussian hills (some hollows) and a few long swells. */
export const seededTerrain = (seed: number, width: number, height: number): Field => {
  const r = rng(seed);
  const hills = Array.from({length: 9}, () => ({x: r() * width, y: r() * height, s: 180 + r() * 420, h: (r() < 0.25 ? -0.6 : 1) * (0.5 + r())}));
  const waves = Array.from({length: 4}, () => ({kx: (r() - 0.5) * 0.008, ky: (r() - 0.5) * 0.008, p: r() * 6.283, h: 0.12 + r() * 0.12}));
  return (x, y) => {
    let v = 0;
    for (const k of hills) v += k.h * Math.exp(-((x - k.x) ** 2 + (y - k.y) ** 2) / (2 * k.s * k.s));
    for (const w of waves) v += w.h * Math.sin(x * w.kx + y * w.ky + w.p);
    return v;
  };
};
export const levels = (from: number, to: number, n: number) => Array.from({length: n}, (_, i) => from + ((to - from) * i) / (n - 1));

/** Contour paths drawn in glacier; every `index`-th line (from `indexFrom`) is an index contour, bolder and brighter. */
export const ContourPaths: React.FC<{paths: string[]; line?: [opacity: number, width: number]; indexLine?: [opacity: number, width: number]; index?: number; indexFrom?: number}> = ({paths, line = [0.09, 1.4], indexLine = [0.2, 2], index = 4, indexFrom = 3}) => (
  <>
    {paths.map((d, k) => {
      const [o, w] = k % index === indexFrom ? indexLine : line;
      return <path key={k} d={d} fill="none" stroke={THEME.glacier} strokeOpacity={o} strokeWidth={w} strokeLinecap="round" />;
    })}
  </>
);

const FRAME_PATHS = traceContours(frameTerrain, 1920, 1080, 16, Array.from({length: 16}, (_, k) => 0.06 + k * 0.058));
/** The diagram backdrop's contour map, gently drifting with `drift`. */
export const Contours: React.FC<{drift?: number; opacity?: number}> = ({drift = 0, opacity = 1}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity, transform: `translate(${Math.sin(drift) * 14}px, ${Math.cos(drift * 0.8) * 10}px) scale(1.03)`}}>
    <ContourPaths paths={FRAME_PATHS} />
  </svg>
);
