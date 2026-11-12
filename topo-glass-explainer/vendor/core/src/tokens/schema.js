import SLOTS from "./slots.json";
const DIMENSIONS = ["medium", "shape", "texture", "space", "line", "cadence", "type", "footage", "camera_editing", "sound", "colour_logic", "light"];
const SLOT_LIST = SLOTS.slots;
const TOKEN_SCHEMA_VERSION = SLOTS.schema_version;
const get = (o, path) => path.split(".").reduce((v, k) => v && typeof v === "object" ? v[k] : void 0, o);
const OK = {
  hex: (v) => typeof v === "string" && /^#[0-9A-Fa-f]{6}$/.test(v),
  rgb: (v) => typeof v === "string" && /^\d{1,3},\d{1,3},\d{1,3}$/.test(v),
  rgba: (v) => typeof v === "string" && /^rgba\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*[\d.]+\)$/.test(v),
  num: (v) => typeof v === "number",
  pt: (v) => Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === "number"),
  font: (v) => typeof v === "string" && v.length > 0
};
const okFor = (kind) => kind.startsWith("enum:") ? (v) => typeof v === "string" && kind.slice(5).split("|").includes(v) : OK[kind];
const assertTokens = (t, where) => {
  const bad = SLOT_LIST.filter(([path, kind]) => !okFor(kind)(get(t, path))).map(([path, kind]) => `${path} (${kind}): ${JSON.stringify(get(t, path))}`);
  if (bad.length) throw new Error(`world ${where}: bad token slots
  ${bad.join("\n  ")}`);
  return t;
};
export {
  DIMENSIONS,
  SLOT_LIST,
  TOKEN_SCHEMA_VERSION,
  assertTokens
};
