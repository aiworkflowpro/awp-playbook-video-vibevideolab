import React from 'react';
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const ramp = (f: number, a: number, b: number) => clamp01((f - a) / Math.max(1, b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Keyframed value: [[frame, value], ...]; linear between, held outside.
export const track = (f: number, keys: ReadonlyArray<readonly [number, number]>, ease: (t: number) => number = (t) => t): number => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) {
      const [a, va] = keys[i - 1];
      const [b, vb] = keys[i];
      return lerp(va, vb, ease((f - a) / Math.max(1, b - a)));
    }
  }
  return keys[keys.length - 1][1];
};
export const SrcFrameContext = React.createContext(0);
export const useSrc = () => React.useContext(SrcFrameContext);
