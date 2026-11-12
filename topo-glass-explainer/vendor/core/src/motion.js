import { Easing, interpolate } from "remotion";
const CURVE = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  exit: Easing.bezier(0.7, 0, 0.84, 0),
  gentle: Easing.bezier(0.45, 0, 0.2, 1)
};
const ease = (frame, start, len, curve = CURVE.inOut) => interpolate(frame, [start, start + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: curve });
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const hash01 = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 1e5 / 1e5;
};
export {
  CURVE,
  clamp01,
  ease,
  hash01,
  lerp
};
