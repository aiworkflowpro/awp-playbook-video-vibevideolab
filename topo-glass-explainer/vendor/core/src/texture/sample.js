import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CURVE, ease } from "../motion";
import { f60 } from "../theme";
import { useWorld } from "../tokens/context";
import { breath, camAt, CameraRig, FarDots } from "./camera";
import { Finish, Light } from "./light";
import { Face, Piece, roundRectPath } from "./material";
import { DirBlur, jolt, motionBlur, Rise } from "./motion";
import { Shadow } from "./shadow";
const P = { w: 520, h: 360, r: 32, notch: 56, seam: 8, depth: 30 };
const socketPath = () => {
  const { w, h, r, notch: R } = P, cy = h / 2;
  return `M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${cy - R} A ${R} ${R} 0 0 0 ${w} ${cy + R} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`;
};
const tabPath = () => {
  const { w, h, r, notch: R } = P, cy = h / 2;
  return `M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${cy + R} A ${R} ${R} 0 0 1 0 ${cy - R} V ${r} Q 0 0 ${r} 0 Z`;
};
const T = { lift: f60(90), land: f60(210), rows: [f60(250), f60(285), f60(320)], push: f60(200), slide: f60(300) };
const DURATION = f60(480);
const STILLS = { AIR: f60(120), DROP: f60(195), SETTLED: f60(440) };
const ROWS = ["Grain on every face", "Shadow follows the lift", "Light drifts with time"];
const C0 = { x: 0, y: 30, s: 0.94, rx: 20, ry: -14, rz: -3 };
const Label = ({ title, sub, left }) => {
  const t = useWorld();
  return /* @__PURE__ */ jsxs("div", { style: { position: "absolute", left, top: 70, right: 70, fontFamily: t.type.sans }, children: [
    /* @__PURE__ */ jsx("div", { style: { fontWeight: 800, fontSize: 76, letterSpacing: "-0.03em", color: t.text.t1, lineHeight: 1 }, children: title }),
    /* @__PURE__ */ jsx("div", { style: { marginTop: 16, fontWeight: 500, fontSize: 34, color: t.text.t3 }, children: sub })
  ] });
};
const Shot = () => {
  const f = useCurrentFrame();
  const t = useWorld();
  const slide = 70, rise = 280;
  const go = (k) => ease(k, T.lift, T.land - T.lift, CURVE.exit);
  const posB = (k) => ({ x: P.w + P.seam + slide * (1 - go(k)), y: -rise * (1 - go(k)) });
  const recoil = jolt(f, T.land, 10), kick = -jolt(f, T.land + 2, 7);
  const b = posB(f);
  const bx = b.x - Math.max(0, recoil), by = b.y + Math.max(0, -recoil) * 0.4;
  const blur = f < T.land ? motionBlur(posB, f) : { x: 0, y: 0 };
  const lift = 1 - go(f);
  const hot = f >= T.land ? Math.max(0, 1 - (f - T.land) / f60(70)) : 0;
  const cam = camAt(f, [
    { at: 0, len: f60(80), v: { x: 0, y: 10, s: 0.98, rx: 14, ry: -10, rz: -2 }, curve: CURVE.out },
    { at: T.push, len: f60(72), v: { x: -60, y: -10, s: 1.04, rx: 5, ry: -4, rz: 0 } },
    { at: T.slide, len: f60(84), v: { x: -20, y: -10, s: 1, rx: 4, ry: 6, rz: 0 } }
  ], C0);
  const br = breath(f);
  const GX = 80, GY = 300, GW = 2 * P.w + P.seam;
  const cw = 640, ch = 620;
  const newest = T.rows.reduce((k, at, i) => f >= at ? i : k, -1);
  return /* @__PURE__ */ jsxs(AbsoluteFill, { children: [
    /* @__PURE__ */ jsx(FarDots, { dx: -cam.x - br.dx, dy: -cam.y - br.dy }),
    /* @__PURE__ */ jsx(DirBlur, { id: "tex-sample-blur", x: blur.x, y: blur.y }),
    /* @__PURE__ */ jsxs(CameraRig, { cam, drift: br, children: [
      /* @__PURE__ */ jsxs("div", { style: { position: "absolute", left: GX, top: GY, width: GW, height: P.h, transformStyle: "preserve-3d" }, children: [
        /* @__PURE__ */ jsx(Shadow, { d: socketPath(), w: P.w, h: P.h, id: "tex-sh-a", lift: 0, x: kick }),
        /* @__PURE__ */ jsx(Shadow, { d: tabPath(), w: P.w, h: P.h, id: "tex-sh-b", lift, x: bx, y: by * 0.25 }),
        /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: kick, top: 0, width: P.w, height: P.h, transformStyle: "preserve-3d" }, children: /* @__PURE__ */ jsx(Piece, { d: socketPath(), w: P.w, h: P.h, depth: P.depth, id: "tex-a", seed: 13, hot, children: /* @__PURE__ */ jsx(Label, { title: "Part A", sub: "rests from the start", left: 60 }) }) }),
        /* @__PURE__ */ jsx("div", { style: {
          position: "absolute",
          left: bx,
          top: by,
          width: P.w,
          height: P.h,
          transformStyle: "preserve-3d",
          transform: `translateZ(${(lift * 160).toFixed(2)}px)`,
          filter: blur.x + blur.y > 0.3 ? "url(#tex-sample-blur)" : void 0
        }, children: /* @__PURE__ */ jsx(Piece, { d: tabPath(), w: P.w, h: P.h, depth: P.depth, id: "tex-b", seed: 29, hot, children: /* @__PURE__ */ jsx(Label, { title: "Part B", sub: "drops into place", left: 100 }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { position: "absolute", left: 1220, top: 210, width: cw, height: ch, transformStyle: "preserve-3d", transform: "translateZ(140px)" }, children: [
        /* @__PURE__ */ jsx(Shadow, { d: roundRectPath(cw, ch, 28), w: cw, h: ch, id: "tex-sh-card", lift: 0.5, z: -1 }),
        /* @__PURE__ */ jsxs("div", { style: { position: "absolute", inset: 0 }, children: [
          /* @__PURE__ */ jsx(Face, { d: roundRectPath(cw, ch, 28), w: cw, h: ch, id: "tex-card", seed: 41 }),
          /* @__PURE__ */ jsxs("div", { style: { position: "absolute", left: 60, top: 54, right: 60, fontFamily: t.type.sans }, children: [
            /* @__PURE__ */ jsx(Rise, { at: f60(20), f, len: 28, children: /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 24, letterSpacing: "0.08em", textTransform: "uppercase", color: t.text.t3 }, children: "Texture parts" }) }),
            ROWS.map((r, i) => {
              const rule = ease(f, T.rows[i] + 6, 30, CURVE.out);
              return /* @__PURE__ */ jsxs("div", { style: { position: "relative", padding: "30px 0", minHeight: 120 }, children: [
                i ? /* @__PURE__ */ jsx("div", { style: { position: "absolute", left: 0, top: 0, height: 1, width: `${(rule * 100).toFixed(2)}%`, background: t.line } }) : null,
                /* @__PURE__ */ jsx(Rise, { at: T.rows[i], f, len: 26, children: /* @__PURE__ */ jsx("div", { style: { fontWeight: 750, fontSize: 46, lineHeight: 1.12, letterSpacing: "-0.02em", color: i === newest ? t.text.t1 : t.text.t2 }, children: r }) })
              ] }, r);
            })
          ] })
        ] })
      ] })
    ] })
  ] });
};
const Sample = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Shot, {}),
  /* @__PURE__ */ jsx(Light, { from: 0, to: DURATION }),
  /* @__PURE__ */ jsx(Finish, {})
] });
const sample = { duration: DURATION, worlds: ["papercraft-warm", "spec-lab-geek"], Component: Sample };
export {
  DURATION,
  STILLS,
  sample
};
