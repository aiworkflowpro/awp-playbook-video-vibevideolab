#!/usr/bin/env node
// The plan's chapter layer: the unit to plan, remove and repeat.
//   node scripts/buyer/chapters.mjs --list [--json]
//   node scripts/buyer/chapters.mjs --remove <chapter id> [--force]   # drop its scenes and close the gap in every timeline
// Only `removable` chapters go without --force; the first (hook) and last (close) chapter never go. Removing re-times scenes,
// presenter spans, morphs and take map, sentences, on-screen word times and sound cues; run align.mjs with your narration
// afterwards. Repeating a chapter is not automatic: its scenes read the same on-screen word ids, so a repeat needs new
// anchors in the engine (see docs/STRUCTURE.md for which chapters are repeatable and how).
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {args, fail, loadPlan, savePlan} from './lib.mjs';

const r2 = (x) => Math.round(x * 100) / 100;
/** The plan with the interval [A, B) (seconds) cut out and everything after it moved earlier (pure). */
export function cutInterval(plan0, A, B) {
  const plan = structuredClone(plan0), L = B - A, fps = plan.clock.fps;
  const t = (x) => (x >= B ? r2(x - L) : x > A ? A : x);
  const spans = (list) => (list ?? []).map(([x, y]) => [t(x), t(y)]).filter(([x, y]) => y - x > 0.001);
  plan.scenes = (plan.scenes ?? []).filter((s) => !(s.a >= A - 0.001 && s.b <= B + 0.001)).map((s) => ({...s, a: t(s.a), b: t(s.b)}));
  const P = plan.presenter;
  if (P && typeof P === 'object') {
    for (const k of Object.keys(P).filter((k) => k.endsWith('_spans'))) P[k] = spans(P[k]);
    if (Array.isArray(P.morphs)) P.morphs = P.morphs.filter((m) => m.b <= A || m.a >= B).map((m) => ({...m, a: t(m.a), b: t(m.b)}));
    if (Array.isArray(P.take_segments)) {
      const fa = Math.round(A * fps), fb = Math.round(B * fps), F = fb - fa, out = [];
      for (const s of P.take_segments) {
        const [x, y] = s.src;
        if (y <= fa) out.push(s);
        else if (x >= fb) out.push({...s, src: [x - F, y - F]});
        else {
          if (x < fa) out.push({...s, src: [x, fa]});
          if (y > fb) out.push({...s, src: [fa, y - F], at: s.at + (fb - x)});
        }
      }
      P.take_segments = out;
    }
  }
  if (plan.narration?.sentences) plan.narration.sentences = plan.narration.sentences.filter((s) => s.s < A || s.s >= B).map((s) => ({...s, s: t(s.s), e: t(s.e)}));
  plan.anchors = (plan.anchors ?? []).map((x) => ({...x, t: t(x.t ?? 0)}));
  plan.sfx = (plan.sfx ?? []).filter((s) => s.t < A || s.t >= B).map((s) => ({...s, t: t(s.t)}));
  plan.clock = {...plan.clock, duration: r2(plan.clock.duration - L)};
  return plan;
}
export function removeChapter(plan, id, {force = false} = {}) {
  const chs = plan.chapters ?? [];
  const i = chs.findIndex((c) => c.id === id);
  if (i < 0) throw new Error(`no chapter ${id} (chapters.mjs --list)`);
  if (i === 0 || i === chs.length - 1) throw new Error(`${id} is the ${i === 0 ? 'hook' : 'close'}; it stays`);
  if (!chs[i].removable && !force) throw new Error(`${id} is not marked removable; pass --force if you are sure`);
  const scenes = (plan.scenes ?? []).filter((s) => chs[i].scenes.includes(s.id));
  const A = Math.min(...scenes.map((s) => s.a)), B = (plan.scenes ?? []).filter((s) => s.a >= Math.max(...scenes.map((x) => x.a)) + 0.001 && !chs[i].scenes.includes(s.id)).reduce((m, s) => Math.min(m, s.a), plan.clock.duration);
  const out = cutInterval(plan, A, B);
  out.chapters = chs.filter((c) => c.id !== id);
  return {plan: out, removed: r2(B - A)};
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const a = args();
  const plan = loadPlan();
  if (!(plan.chapters ?? []).length) fail('this plan has no chapter layer');
  if (a.list) {
    const by = new Map((plan.scenes ?? []).map((s) => [s.id, s]));
    const rows = plan.chapters.map((c) => { const ss = c.scenes.map((x) => by.get(x)).filter(Boolean); const A = Math.min(...ss.map((s) => s.a)), B = Math.max(...ss.map((s) => s.b)); return {...c, a: r2(A), b: r2(B), length: r2(B - A), scenes: ss.length}; });
    if (a.json) console.log(JSON.stringify(rows, null, 1));
    else for (const c of rows) console.log(`${c.id.padEnd(5)} ${String(c.role ?? '').padEnd(8)} ${String(c.length).padStart(7)} s  ${String(c.scenes).padStart(3)} scenes  ${c.removable ? 'removable ' : '          '}${c.repeatable ? 'repeatable ' : '           '}${c.title}`);
    process.exit(0);
  }
  if (a.remove) {
    try {
      const {plan: next, removed} = removeChapter(plan, String(a.remove), {force: Boolean(a.force)});
      savePlan(next);
      console.log(JSON.stringify({removed: a.remove, seconds: removed, duration: next.clock.duration, chapters: next.chapters.length, next: 'run align.mjs with your narration'}));
    } catch (e) { fail(e.message); }
    process.exit(0);
  }
  fail('usage: chapters.mjs --list | --remove <chapter id> [--force]');
}
