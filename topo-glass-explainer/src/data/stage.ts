import type {StagePlace} from '../parts/Stage';

// Per-shot composition on the stage (narration-only windows without a presenter take): where the guide emblem sits and how far
// the overlays move (dx, dy in px). Shots not listed keep the emblem centred and the overlays where they are.
export type StageShot = {emblem?: StagePlace; dx?: number; dy?: number};
export const STAGE_DEFAULT: StagePlace = {x: 960, y: 480, size: 250};
const LEFT: StagePlace = {x: 600, y: 480, size: 250};
const RIGHT: StagePlace = {x: 1320, y: 480, size: 250};
// Questions that alternate left and right at mid-height: the emblem sits low between them.
const LOW: StageShot = {emblem: {x: 960, y: 770, size: 190}};
export const STAGE_SHOTS: Record<string, StageShot> = {
  S1: {emblem: {x: 960, y: 388, size: 250}}, // the guide between the four things it carries
  S21: {emblem: LEFT, dx: -380}, // tile cluster from the lower right toward the centre
  S48: {emblem: {x: 560, y: 480, size: 250}, dx: -100},
  S71: {emblem: LEFT},
  S86: {emblem: {x: 640, y: 480, size: 250}, dx: 260}, // model and program tiles move right of centre
  S107: {emblem: RIGHT, dx: 120},
  S108: {emblem: {x: 740, y: 480, size: 250}},
  S110: {emblem: RIGHT, dx: 120},
  S111: {emblem: {x: 760, y: 480, size: 250}, dx: -300},
  S116: {emblem: {x: 640, y: 480, size: 250}, dx: -200},
  S123: {emblem: {x: 640, y: 480, size: 250}},
  S127: {emblem: LEFT},
  S134: {emblem: {x: 520, y: 480, size: 250}}, // folder window slides in from the right
  S143: LOW,
  S144: LOW,
  S145: LOW,
  S146: LOW,
  S147: LOW,
  S153: {emblem: LEFT},
  S197: {emblem: {x: 700, y: 480, size: 250}},
  S218: {emblem: {x: 560, y: 480, size: 250}}, // glass heading and three marks on the right
  S236: {emblem: LEFT},
};
