import { jsx, jsxs } from "react/jsx-runtime";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { hash01 } from "../motion";
import { holdFrames } from "../theme";
import { useWorld } from "../tokens/context";
import { FILM_GRAIN_TILES, grainTile, specksTile } from "./noise";
import { fillRgb, grainScale, isDark, keyRgb } from "./tone";
const clear = (rgb) => `rgba(${rgb},0)`;
const Light = ({ from, to, strength }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const t = useWorld();
  const k = strength ?? (isDark(t) ? 1 : 0.6);
  const p = Math.min(1, Math.max(0, (f - from) / Math.max(1, to - from)));
  const u = W / 1920;
  const kx = (-140 + 300 * p) * u, ky = (-40 + 90 * p) * u;
  const key = keyRgb(t), fill = fillRgb(t), vig = t.light.vignetteRgb;
  const [ax, ay] = t.light.keyAt;
  const vigA = Math.min(0.6, t.light.vignette * 3) * k;
  return /* @__PURE__ */ jsxs(AbsoluteFill, { style: { pointerEvents: "none" }, children: [
    /* @__PURE__ */ jsx("div", { style: {
      position: "absolute",
      left: -W / 4 + kx,
      top: -H / 4 + ky,
      width: W * 1.5,
      height: H * 1.5,
      mixBlendMode: "soft-light",
      background: `radial-gradient(ellipse 40% 44% at ${((ax + 25) / 1.5).toFixed(2)}% ${((ay + 25) / 1.5).toFixed(2)}%, rgba(${key},${(0.55 * k).toFixed(3)}) 0%, ${clear(key)} 70%)`
    } }),
    fill ? /* @__PURE__ */ jsx("div", { style: {
      position: "absolute",
      inset: 0,
      mixBlendMode: "soft-light",
      background: `radial-gradient(ellipse 50% 55% at ${(t.light.fillAt[0] - 10 * p).toFixed(2)}% ${t.light.fillAt[1]}%, rgba(${fill},${(0.22 * k).toFixed(3)}) 0%, ${clear(fill)} 70%)`
    } }) : null,
    vigA > 0 ? /* @__PURE__ */ jsx("div", { style: {
      position: "absolute",
      inset: 0,
      mixBlendMode: "multiply",
      background: `radial-gradient(ellipse 85% 80% at 42% 40%, ${clear(vig)} 52%, rgba(${vig},${vigA.toFixed(3)}) 100%)`
    } }) : null
  ] });
};
const Finish = ({ grain, specks, seed = 23 }) => {
  const t = useWorld();
  const dark = isDark(t), s = grainScale(t);
  const g = grain ?? (dark ? 0.28 : 0.4) * s;
  const sp = specks ?? 0.16 * s;
  if (g <= 0 && (!dark || sp <= 0)) return null;
  return /* @__PURE__ */ jsxs(AbsoluteFill, { style: { pointerEvents: "none" }, children: [
    g > 0 ? /* @__PURE__ */ jsx(AbsoluteFill, { style: {
      backgroundImage: `url(${grainTile(512, seed, dark ? 0 : 420)})`,
      backgroundSize: "512px 512px",
      mixBlendMode: dark ? "overlay" : "multiply",
      opacity: g
    } }) : null,
    dark && sp > 0 ? /* @__PURE__ */ jsx(AbsoluteFill, { style: { backgroundImage: `url(${specksTile(512, 5)})`, backgroundSize: "512px 512px", mixBlendMode: "screen", opacity: sp } }) : null
  ] });
};
const FilmGrain = () => {
  const f = useCurrentFrame();
  const g = useWorld().texture.grain;
  if (!FILM_GRAIN_TILES.length || g <= 0) return null;
  const k = String(Math.floor(f / holdFrames({ dps: 12 })));
  const tile = FILM_GRAIN_TILES[Math.floor(hash01("t" + k) * FILM_GRAIN_TILES.length)];
  const ox = Math.round(hash01("x" + k) * 256), oy = Math.round(hash01("y" + k) * 256);
  return /* @__PURE__ */ jsx(AbsoluteFill, { style: { pointerEvents: "none", backgroundImage: `url(${tile})`, backgroundSize: "256px 256px", backgroundPosition: `${ox}px ${oy}px`, opacity: g } });
};
export {
  FilmGrain,
  Finish,
  Light
};
