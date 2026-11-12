import { jsx } from "react/jsx-runtime";
import React from "react";
import { assertTokens } from "./schema";
import { defaultParts } from "./defaults";
const Ctx = React.createContext(null);
const isWorld = (w) => "tokens" in w && "meta" in w;
const WorldProvider = ({ world, parts, meta, children }) => {
  const value = React.useMemo(() => isWorld(world) ? world : {
    tokens: assertTokens(world, meta?.slug ?? "film"),
    parts: parts ?? defaultParts,
    meta: {
      id: "film",
      slug: "film",
      world: "film",
      palette: "film",
      worldName: "film",
      medium: "",
      material: "film",
      family: "film",
      cadence: { dps: 0 },
      name: "film",
      status: "mature",
      tagline: "",
      source: [],
      films: [],
      ...meta
    }
  }, [world, parts, meta]);
  return /* @__PURE__ */ jsx(Ctx.Provider, { value, children });
};
const use = () => {
  const w = React.useContext(Ctx);
  if (!w) throw new Error("no world: render inside <WorldProvider> (the Sample and Frame templates do this)");
  return w;
};
const useWorld = () => use().tokens;
const useParts = () => use().parts;
const useWorldMeta = () => use().meta;
const useCadence = () => use().meta.cadence;
export {
  WorldProvider,
  useCadence,
  useParts,
  useWorld,
  useWorldMeta
};
