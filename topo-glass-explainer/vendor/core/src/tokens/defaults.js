import { jsx, jsxs } from "react/jsx-runtime";
import { AbsoluteFill } from "remotion";
import { useWorld } from "./context";
const elevation = (t, lift = 0.4) => {
  const k = Math.max(0, lift) * (t.shadow.strength ?? 0.5) * 2;
  return `0 ${(2 + 14 * k).toFixed(1)}px ${(6 + 34 * k).toFixed(1)}px rgba(${t.shadow.rgb},${(0.1 + 0.18 * k).toFixed(3)}), 0 1px 2px rgba(${t.shadow.rgb},0.12)`;
};
const Ground = () => {
  const t = useWorld();
  const [kx, ky] = t.light.keyAt;
  return /* @__PURE__ */ jsxs(AbsoluteFill, { style: { background: `linear-gradient(180deg, ${t.ground.top} 0%, ${t.ground.mid} 55%, ${t.ground.bottom} 100%)` }, children: [
    /* @__PURE__ */ jsx(AbsoluteFill, { style: { background: `radial-gradient(circle at ${kx}% ${ky}%, ${t.light.key}, transparent 60%)` } }),
    /* @__PURE__ */ jsx(AbsoluteFill, { style: { background: `radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(${t.light.vignetteRgb},${t.light.vignette}) 100%)` } })
  ] });
};
const Card = ({ box, lift = 0.4, ink, radius = 14, style, children }) => {
  const t = useWorld();
  return /* @__PURE__ */ jsx("div", { style: {
    position: "absolute",
    left: box.x,
    top: box.y,
    width: box.w,
    height: box.h,
    borderRadius: radius,
    overflow: "hidden",
    background: ink ? t.ink.card : t.card.stock,
    border: `1px solid ${ink ? t.ink.edge : t.card.edge}`,
    boxShadow: elevation(t, lift),
    ...style
  }, children });
};
const defaultParts = { Ground, Card, elevation };
export {
  defaultParts
};
