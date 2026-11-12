import { jsx, jsxs } from "react/jsx-runtime";
import { useWorld } from "../tokens/context";
import { PAD } from "./material";
import { isDark } from "./tone";
const Shadow = ({ d, w, h, id, lift, x = 0, y = 0, z = -60 }) => {
  const t = useWorld();
  const dark = isDark(t);
  const P = PAD * 3, W = w + 2 * P, H = h + 2 * P;
  const far = { dx: 26 + lift * 70, dy: 44 + lift * 90, b: 26 + lift * 26, o: (dark ? 0.75 : 0.32) * (1 - 0.35 * lift) };
  const near = { dx: 3, dy: 6, b: 5, o: (dark ? 0.9 : 0.4) * (1 - lift) };
  const col = `rgb(${t.shadow.rgb})`;
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      width: W,
      height: H,
      viewBox: `${-P} ${-P} ${W} ${H}`,
      style: { position: "absolute", left: x - P, top: y - P, transform: `translateZ(${z}px)`, overflow: "visible", pointerEvents: "none" },
      children: [
        /* @__PURE__ */ jsxs("defs", { children: [
          /* @__PURE__ */ jsx("filter", { id: `${id}-far`, x: "-50%", y: "-50%", width: "200%", height: "200%", children: /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: far.b }) }),
          /* @__PURE__ */ jsx("filter", { id: `${id}-near`, x: "-50%", y: "-50%", width: "200%", height: "200%", children: /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: near.b }) })
        ] }),
        /* @__PURE__ */ jsx("path", { d, fill: col, opacity: far.o, transform: `translate(${far.dx} ${far.dy})`, filter: `url(#${id}-far)` }),
        near.o > 0.01 ? /* @__PURE__ */ jsx("path", { d, fill: col, opacity: near.o, transform: `translate(${near.dx} ${near.dy})`, filter: `url(#${id}-near)` }) : null
      ]
    }
  );
};
export {
  Shadow
};
