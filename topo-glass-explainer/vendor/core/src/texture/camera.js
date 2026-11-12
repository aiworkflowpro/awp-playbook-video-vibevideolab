import { jsx } from "react/jsx-runtime";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { CURVE, ease } from "../motion";
import { useWorld } from "../tokens/context";
import { alphaOf, withAlpha } from "./tone";
const CAM_REST = { x: 0, y: 0, s: 1, rx: 0, ry: 0, rz: 0 };
const camAt = (f, keys, c0 = CAM_REST) => keys.reduce((c, k) => {
  const p = ease(f, k.at, k.len, k.curve ?? CURVE.inOut);
  return {
    x: c.x + (k.v.x - c.x) * p,
    y: c.y + (k.v.y - c.y) * p,
    s: c.s + (k.v.s - c.s) * p,
    rx: c.rx + (k.v.rx - c.rx) * p,
    ry: c.ry + (k.v.ry - c.ry) * p,
    rz: c.rz + (k.v.rz - c.rz) * p
  };
}, c0);
const breath = (f, period = 720, amp = 1) => {
  const w = (ph) => Math.sin(2 * Math.PI * f / period + ph);
  return { dx: 10 * amp * w(0), dy: 6 * amp * w(Math.PI / 2), rz: 0.3 * amp * w(Math.PI) };
};
const CameraRig = ({ cam, drift, perspective = 2200, children }) => {
  const { width: W, height: H } = useVideoConfig();
  const b = drift ?? { dx: 0, dy: 0, rz: 0 };
  return /* @__PURE__ */ jsx(AbsoluteFill, { style: { perspective, perspectiveOrigin: `${W / 2}px ${H / 2}px` }, children: /* @__PURE__ */ jsx("div", { style: {
    position: "absolute",
    left: 0,
    top: 0,
    width: W,
    height: H,
    transformStyle: "preserve-3d",
    transformOrigin: `${W / 2}px ${H / 2}px`,
    transform: `translate(${(cam.x + b.dx).toFixed(2)}px, ${(cam.y + b.dy).toFixed(2)}px) rotateX(${cam.rx.toFixed(3)}deg) rotateY(${cam.ry.toFixed(3)}deg) rotateZ(${(cam.rz + b.rz).toFixed(3)}deg) scale(${cam.s.toFixed(4)})`
  }, children }) });
};
const FarDots = ({ dx, dy, color, pitch = 40 }) => {
  const t = useWorld();
  const c = color ?? (alphaOf(t.texture.dot) > 0 ? t.texture.dot : withAlpha(t.text.t3, 0.1));
  const mask = "radial-gradient(ellipse 90% 85% at 45% 45%, #000 40%, rgba(0,0,0,0.25) 100%)";
  return /* @__PURE__ */ jsx(AbsoluteFill, { style: {
    pointerEvents: "none",
    backgroundImage: `radial-gradient(circle, ${c} 1.4px, transparent 1.9px)`,
    backgroundSize: `${pitch}px ${pitch}px`,
    backgroundPosition: `${Math.round(dx * 0.3)}px ${Math.round(dy * 0.3)}px`,
    maskImage: mask,
    WebkitMaskImage: mask
  } });
};
export {
  CAM_REST,
  CameraRig,
  FarDots,
  breath,
  camAt
};
