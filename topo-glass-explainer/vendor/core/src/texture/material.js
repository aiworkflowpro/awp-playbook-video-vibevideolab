import { jsx, jsxs } from "react/jsx-runtime";
import { useWorld } from "../tokens/context";
import { grainTile } from "./noise";
import { grainScale, keyRgb, luma, mix } from "./tone";
const PAD = 60;
const roundRectPath = (w, h, r) => `M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`;
const stockOf = (t, ink) => {
  const base = ink ? t.ink.card : t.card.stock;
  return { base, edge: ink ? t.ink.edge : t.card.edge, light: `rgb(${keyRgb(t)})`, dark: luma(base) < 0.18 };
};
const Face = ({ d, w, h, id, seed, hot = 0, ink = false, grain }) => {
  const t = useWorld();
  const s = stockOf(t, ink);
  const g = grain ?? (s.dark ? 0.3 : 0.35) * grainScale(t);
  const tile = g > 0 ? grainTile(512, seed, s.dark ? 0 : 420, s.dark ? 90 : 70) : "";
  const W = w + 2 * PAD, H = h + 2 * PAD;
  const top = mix(s.base, s.light, s.dark ? 0.1 : 0.55), bot = mix(s.base, `rgb(${t.shadow.rgb})`, s.dark ? 0.3 : 0.05);
  const lit = s.dark ? [0.42, 0.1, 0.03] : [1, 0.4, 0];
  const far = s.dark ? `rgba(${keyRgb(t)},${lit[2]})` : `rgba(${t.card.rimRgb},0.18)`;
  return /* @__PURE__ */ jsxs("svg", { width: W, height: H, viewBox: `${-PAD} ${-PAD} ${W} ${H}`, style: { position: "absolute", left: -PAD, top: -PAD, overflow: "visible" }, children: [
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsxs("linearGradient", { id: `${id}-fill`, x1: "0", y1: "0", x2: "0.35", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0", stopColor: top }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: bot })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: `${id}-rim`, x1: "0", y1: "0", x2: "1", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0", stopColor: `rgba(${keyRgb(t)},${lit[0]})` }),
        /* @__PURE__ */ jsx("stop", { offset: "0.45", stopColor: `rgba(${keyRgb(t)},${lit[1]})` }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: far })
      ] }),
      /* @__PURE__ */ jsx("clipPath", { id: `${id}-clip`, children: /* @__PURE__ */ jsx("path", { d }) })
    ] }),
    /* @__PURE__ */ jsx("path", { d, fill: `url(#${id}-fill)` }),
    tile ? /* @__PURE__ */ jsx("g", { clipPath: `url(#${id}-clip)`, children: /* @__PURE__ */ jsx(
      "image",
      {
        href: tile,
        x: -(seed * 37 % 512),
        y: -(seed * 91 % 512),
        width: 1024,
        height: 1024,
        preserveAspectRatio: "none",
        style: { mixBlendMode: s.dark ? "overlay" : "multiply" },
        opacity: g
      }
    ) }) : null,
    /* @__PURE__ */ jsx("path", { d, fill: "none", stroke: `url(#${id}-rim)`, strokeWidth: 2.4 }),
    hot > 0 ? /* @__PURE__ */ jsx("path", { d, fill: "none", stroke: t.accent.color, strokeWidth: 3, opacity: hot }) : null
  ] });
};
const Piece = ({ depth = 34, children, ...face }) => {
  const t = useWorld();
  const s = stockOf(t, !!face.ink);
  const W = face.w + 2 * PAD, H = face.h + 2 * PAD;
  const deep = mix(s.edge, `rgb(${t.shadow.rgb})`, 0.35), mid = mix(s.base, s.edge, 0.7), near = mix(s.base, s.light, s.dark ? 0.15 : 0.6);
  const edge = (i) => i === depth ? deep : i <= 2 ? near : mid;
  return /* @__PURE__ */ jsxs("div", { style: { position: "absolute", inset: 0, transformStyle: "preserve-3d" }, children: [
    Array.from({ length: depth }, (_, i) => depth - i).filter((i) => i % 2 === 0 || i <= 2).map((i) => /* @__PURE__ */ jsx("svg", { width: W, height: H, viewBox: `${-PAD} ${-PAD} ${W} ${H}`, style: { position: "absolute", left: -PAD, top: -PAD, transform: `translateZ(${-i}px)` }, children: /* @__PURE__ */ jsx("path", { d: face.d, fill: edge(i) }) }, i)),
    /* @__PURE__ */ jsxs("div", { style: { position: "absolute", inset: 0 }, children: [
      /* @__PURE__ */ jsx(Face, { ...face }),
      children
    ] })
  ] });
};
export {
  Face,
  PAD,
  Piece,
  roundRectPath
};
