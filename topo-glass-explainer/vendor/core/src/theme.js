const DELIVERY = JSON.parse(process.env.REMOTION_AWP_DELIVERY || "{}");
const DEFAULT_FPS = 60;
const FPS = DELIVERY.fps ?? DEFAULT_FPS;
const W = DELIVERY.width ?? 1920;
const H = DELIVERY.height ?? 1080;
const f60 = (n) => Math.round(n * FPS / 60);
const ON_ONES = { dps: 0 };
const holdFrames = (c, fps = FPS) => c.dps > 0 ? Math.max(1, Math.round(fps / c.dps)) : 1;
const onCadence = (frame, c, fps = FPS) => frame - frame % holdFrames(c, fps);
export {
  DEFAULT_FPS,
  FPS,
  H,
  ON_ONES,
  W,
  f60,
  holdFrames,
  onCadence
};
