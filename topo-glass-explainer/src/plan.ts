/**
 * The film plan (docs/film-plan.md): everything that belongs to one film lives in film.plan.json, a copy of
 * plan.<variant>.json picked by remotion.config.ts / scripts/plan.mjs. Media paths are relative to public/.
 */
import {staticFile} from 'remotion';
import raw from '../film.plan.json';

declare const require: {context: (dir: string, deep: boolean, re: RegExp) => {keys: () => string[]; (key: string): unknown}};

export type Anchor = {id: string; word: string; sentence: string | null; t: number; where?: string};
export type Slot = {file: string | null; license?: string; note?: string; in?: number};
/**
 * A scene on the film clock (seconds). `window` plays only part of the component's layout window (layout frames, inside it);
 * `hold` freezes the last frame for that many seconds at the end of the span. The played part maps linearly onto the rest.
 */
export type PlanScene = {id: string; a: number; b: number; component: string; chapter?: string; window?: [number, number]; hold?: number; uses?: Record<string, string[]>};
/** A chapter of the plan: its scenes in order; the pill shows anchor `chapter.<id>` (missing or empty: no pill). */
export type PlanChapter = {id: string; title: string; role: string | null; scenes: string[]; target_words?: [number, number]; removable: boolean; repeatable: boolean};
export type FilmPlan = {
  schema_version: 1;
  id: string;
  variant: 'original' | 'clean';
  clock: {fps: number; width: number; height: number; duration: number};
  audio: {narration: string | null; bgm: string | null; sfx: string | null};
  anchors: Anchor[];
  presenter: {
    take: string | null;
    person: string | null;
    person_spans: Array<[number, number, number]>;
    take_segments: Array<{src: [number, number]; at: number}>;
  };
  slots: Record<string, Record<string, Slot>>;
  scenes: PlanScene[];
  chapters?: PlanChapter[];
  data: {uiHome: string; uiPages: string};
  narration?: {words: string | null; sentences: Array<{id: string; text?: string; s: number; e: number}>};
};
export const PLAN = raw as unknown as FilmPlan;
const ANCHORS = new Map(PLAN.anchors.map((a) => [a.id, a]));
/** On-screen word of anchor `id`. */
export const word = (id: string): string => {
  const a = ANCHORS.get(id);
  if (!a) throw new Error(`film plan: anchor ${id} missing`);
  return a.word;
};
/** Slot `name` of `kind`; file null means draw a placeholder. */
export const slot = (kind: string, name: string): Slot => {
  const s = PLAN.slots[kind]?.[name];
  if (!s) throw new Error(`film plan: slot ${kind}.${name} missing`);
  return s;
};
export const asset = (kind: string, name: string): string | null => {
  const f = slot(kind, name).file;
  return f ? staticFile(f) : null;
};
const DATA = require.context('../public/data', true, /\.json$/);
/** A data/… file named by the plan, read synchronously. */
export const planData = <T,>(rel: string): T => DATA(`./${rel.replace(/^data\//, '')}`) as T;
