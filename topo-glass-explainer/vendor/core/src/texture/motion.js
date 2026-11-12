import { jsx } from "react/jsx-runtime";
import { CURVE, ease } from "../motion";
import { FPS } from "../theme";
const DirBlur = ({ id, x, y }) => /* @__PURE__ */ jsx("svg", { width: 0, height: 0, style: { position: "absolute" }, children: /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("filter", { id, x: "-20%", y: "-20%", width: "140%", height: "140%", children: /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: `${x.toFixed(2)} ${y.toFixed(2)}` }) }) }) });
const motionBlur = (pos, f, gain = 0.9, max = { x: 30, y: 40 }) => {
  const a = pos(f), b = pos(f + 1);
  return { x: Math.min(max.x, Math.abs(b.x - a.x) * gain), y: Math.min(max.y, Math.abs(b.y - a.y) * gain) };
};
const Rise = ({ at, f, len = 30, dist = 1.1, children, style }) => {
  const p = ease(f, at, len, CURVE.out);
  return /* @__PURE__ */ jsx("div", { style: { overflow: "hidden", paddingBottom: "0.12em", ...style }, children: /* @__PURE__ */ jsx("div", { style: { transform: `translateY(${((1 - p) * dist * 100).toFixed(2)}%)`, visibility: f < at ? "hidden" : "visible" }, children }) });
};
const jolt = (f, at, amp, fps = FPS) => {
  const d = (f - at) / fps;
  return d < 0 ? 0 : amp * Math.exp(-9 * d) * Math.cos(16 * d);
};
export {
  DirBlur,
  Rise,
  jolt,
  motionBlur
};
