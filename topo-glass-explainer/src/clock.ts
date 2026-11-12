// Film clock from the plan. Components time everything in layout frames (the scene library's own clock); the plan maps film frames onto them.
import {PLAN} from './plan';

// 23.976, not 24000/1001: the render runner parses the composition listing, and a long fps runs into the width column. Drift over the film is about 1 ms.
export const FPS = PLAN.clock.fps;
export const WIDTH = PLAN.clock.width;
export const HEIGHT = PLAN.clock.height;
export const SEGMENTS: ReadonlyArray<readonly [number, number]> = PLAN.presenter.take_segments.map((s) => s.src);
export const TOTAL_FRAMES = Math.floor(PLAN.clock.duration * FPS);

export const filmFrame = (source: number): number => {
  let base = 0;
  for (const [a, b] of SEGMENTS) {
    if (source < b) return base + Math.max(0, source - a);
    base += b - a;
  }
  return base;
};
export const sec = (s: number) => s * FPS;
