import {FPS} from '../clock';
import {PLAN, type PlanScene} from '../plan';
import shots from './windows.json';

export type Shot = {i: number; a: number; b: number; kind: string};
const SHOTS = shots as Shot[];
// One scene per shot of the layout; a plan places S<i> on the film clock and the shot's window stretches onto it. Library windows are layout frames.
export const SCENE_LIBRARY: Record<string, {first: number; last: number; kind: string}> = Object.fromEntries(
  SHOTS.map((s) => [`S${s.i}`, {first: s.a, last: s.b, kind: s.kind}]),
);
export const AROLL = SHOTS.filter((s) => s.kind === 'aroll');
// Each plan scene with its film span and the layout window it plays (the library window, or the plan's trimmed `window`).
const SPANS = PLAN.scenes.map((scene) => {
  const entry = SCENE_LIBRARY[scene.component];
  if (!entry) throw new Error(`film plan: scene component ${scene.component} is not in SCENE_LIBRARY`);
  const [first, last] = scene.window ?? [entry.first, entry.last];
  const from = Math.round(scene.a * FPS);
  const to = Math.round(scene.b * FPS);
  const play = Math.max(1, to - from - Math.round((scene.hold ?? 0) * FPS));
  return {scene, from, to, first, last, play};
});
const spanOf = (film: number) => SPANS.find((s) => film >= s.from && film < s.to) ?? SPANS[SPANS.length - 1];
export const sceneAt = (film: number): PlanScene | undefined => SPANS.find((s) => film >= s.from && film < s.to)?.scene;
/** The plan scene playing at film frame `film`, with its film span and its layout window. */
export const spanAt = (film: number) => spanOf(film);
// Film frame to layout frame: components keep their own times, the window stretches onto the played part of the span,
// then holds its last frame.
export const layoutFrame = (film: number): number => {
  const span = spanOf(film);
  return span.first + Math.min(span.last - span.first - 1, Math.floor(((film - span.from) * (span.last - span.first)) / span.play));
};
