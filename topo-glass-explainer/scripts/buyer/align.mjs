#!/usr/bin/env node
// Narration timing: put your narration in the film and re-time the whole plan to it.
//   node scripts/buyer/align.mjs <narration audio> [--script script.txt] [--words asr.json] [--lang en] [--model <asr model>]
//                                [--duration <seconds>] [--keep-take-map] [--no-captions] [--force]
// 1. copies the audio to public/buyer/narration.<ext> (plan audio.narration);
// 2. word timings: --words <json> from any ASR (whisper, faster-whisper, mlx-whisper, a cloud service: segments[].words,
//    words[] or items[] with word/start/end), else the first local ASR found: mlx_whisper (Apple Silicon), whisper
//    (openai-whisper), whisper-ctranslate2 (faster-whisper); --lang (default en) is passed to it;
// 3. sentences: one per non-empty line of --script (a .txt, or a .tsv with a `text` column), else the ASR segments;
// 4. re-times scenes, presenter spans and morphs, anchors and sfx from the old sentences to the new ones (sentence by sentence
//    when both have as many sentences, else uniformly), cuts snap to sentence starts, the film lasts the audio + 0.4 s;
// 5. regenerates the captions (captions.mjs) when the plan has captions, unless --no-captions.
// A scene may stretch 0.7–1.3× of its length. Beyond that nothing is saved: it lists, chapter by chapter, how many seconds are
// over or under and what to do (remove a removable chapter with chapters.mjs, add shot instances in a repeatable chapter, or
// change the script); --force saves anyway.
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {alignLines, args, duration, fail, has, importMedia, loadPlan, readScript, savePlan, spokenAt, timedTokens, tokens, warp, wordsOf, writeData} from './lib.mjs';
import {buildCaptions} from './captions.mjs';

/** Local ASR commands in order of preference: [command, argv]. */
export function asrCommands(file, out, {lang = 'en', model} = {}) {
  return [
    ['mlx_whisper', [file, '--model', model ?? 'mlx-community/whisper-large-v3-turbo', '--word-timestamps', 'True', '--output-format', 'json', '--output-dir', out, '--language', lang]],
    ['whisper', [file, '--model', model ?? 'turbo', '--word_timestamps', 'True', '--output_format', 'json', '--output_dir', out, '--language', lang]],
    ['whisper-ctranslate2', [file, '--model', model ?? 'small', '--word_timestamps', 'True', '--output_format', 'json', '--output_dir', out, '--language', lang]],
  ];
}
export function asr(file, opts = {}) {
  const out = mkdtempSync(path.join(tmpdir(), 'align-'));
  for (const [cmd, argv] of asrCommands(file, out, opts)) {
    if (!has(cmd)) continue;
    console.error(`transcribing with ${cmd} (${opts.lang ?? 'en'}) …`);
    const r = spawnSync(cmd, argv, {stdio: ['ignore', 'ignore', 'inherit']});
    const json = readdirSync(out).find((f) => f.endsWith('.json'));
    if (r.status === 0 && json) return JSON.parse(readFileSync(path.join(out, json), 'utf8'));
  }
  fail('no word timings: pass --words <asr.json> from any ASR, or install mlx_whisper, openai-whisper or whisper-ctranslate2');
}

/** Re-time the plan to new sentences (pure: returns the plan). */
export function retime(plan, sentences, words, newDur, {keepTakeMap = false} = {}) {
  const fps = plan.clock.fps;
  const oldDur = plan.clock.duration;
  const old = plan.narration?.sentences ?? [];
  const knots = old.length && old.length === sentences.length
    ? [[0, 0], ...old.map((s, i) => [s.s, sentences[i].s]), [oldDur, newDur]].sort((x, y) => x[0] - y[0])
    : [[0, 0], [oldDur, newDur]];
  const W = warp(knots);
  const starts = sentences.map((s) => s.s);
  const snap = (t) => {
    let best = t, d = 0.6;
    for (const s of starts) if (Math.abs(s - t) < d) { d = Math.abs(s - t); best = s; }
    return best;
  };
  const cuts = [...new Set((plan.scenes ?? []).flatMap((s) => [s.a, s.b]))].sort((x, y) => x - y);
  const moved = new Map();
  let last = -1;
  for (const c of cuts) {
    // the film start and end stay put; every other cut lands on the nearest new sentence start
    let t = c <= 0.01 ? 0 : c >= oldDur - 0.01 ? newDur : snap(+W(c).toFixed(2));
    if (t < last + 0.3) t = +(last + 0.3).toFixed(2);
    moved.set(c, Math.min(t, newDur));
    last = t;
  }
  const nearCut = (t) => cuts.reduce((best, c) => (Math.abs(c - t) < Math.abs(best - t) ? c : best), cuts[0] ?? t);
  const move = (t) => {
    const c = nearCut(t);
    return cuts.length && Math.abs(c - t) <= 0.5 ? +(moved.get(c) + (t - c)).toFixed(2) : +W(t).toFixed(2);
  };
  plan.scenes = (plan.scenes ?? []).map((s) => ({...s, a: moved.get(s.a), b: moved.get(s.b)}));
  const P = plan.presenter;
  if (P && typeof P === 'object') {
    const oldMorphs = P.morphs ?? [];
    if (Array.isArray(P.morphs)) P.morphs = P.morphs.map((m) => {
      const anchorA = Math.abs(nearCut(m.a) - m.a) <= Math.abs(nearCut(m.b) - m.b);
      const a2 = anchorA ? move(m.a) : +(move(m.b) - (m.b - m.a)).toFixed(2);
      return {...m, a: a2, b: +(a2 + (m.b - m.a)).toFixed(2)};
    });
    const spanEnd = (t) => {
      const i = oldMorphs.findIndex((m) => Math.abs(m.a - t) < 0.005 || Math.abs(m.b - t) < 0.005);
      if (i < 0) return move(t);
      return Math.abs(oldMorphs[i].a - t) < 0.005 ? P.morphs[i].a : P.morphs[i].b;
    };
    for (const key of Object.keys(P).filter((k) => k.endsWith('_spans') && Array.isArray(P[k])))
      P[key] = P[key].map(([x, y]) => [spanEnd(x), y >= oldDur - 0.01 ? +(newDur + (key === 'full_spans' ? 0.08 : 0)).toFixed(2) : spanEnd(y)]);
    if (Array.isArray(P.take_segments) && !keepTakeMap) P.take_segments = [{src: [0, Math.floor(newDur * fps)], at: 0}];
  }
  const heard = timedTokens(words);
  plan.anchors = (plan.anchors ?? []).map((x) => {
    const t = move(x.t ?? 0);
    const at = spokenAt(x.word ?? '', heard, t) ?? t;
    const sentence = sentences.find((s) => at >= s.s && at < s.e)?.id ?? null;
    return {...x, t: at, sentence};
  });
  plan.sfx = (plan.sfx ?? []).map((s) => ({...s, t: move(s.t)}));
  plan.clock.duration = newDur;
  return {plan, retime: knots.length > 2 ? 'sentence by sentence' : 'uniform (sentence counts differ)', W};
}

export const STRETCH = [0.7, 1.3];
/**
 * Scenes the narration stretches beyond STRETCH, grouped by chapter with the seconds to win back or fill and a suggestion.
 * The stretch of a scene is what the time map W does to it, (W(b) − W(a)) / (b − a): the narration's pace over that scene.
 * Snapping cuts to sentence starts moves edges by a fraction of a second and is not a stretch.
 */
export function stretchReport(oldPlan, W, chaptersOf = oldPlan) {
  const bad = (oldPlan.scenes ?? []).filter((s) => s.b - s.a >= 0.2).map((s) => ({id: s.id, was: s.b - s.a, now: W(s.b) - W(s.a)}))
    .map((x) => ({...x, ratio: x.now / x.was})).filter((x) => x.ratio < STRETCH[0] - 1e-6 || x.ratio > STRETCH[1] + 1e-6);
  const newPlan = chaptersOf;
  if (!bad.length) return null;
  const chs = (newPlan.chapters ?? []).length ? newPlan.chapters : [{id: 'film', title: 'Whole film', scenes: newPlan.scenes.map((s) => s.id), removable: false, repeatable: false}];
  const removable = chs.filter((c) => c.removable).map((c) => c.id), repeatable = chs.filter((c) => c.repeatable).map((c) => c.id);
  const out = [];
  for (const c of chs) {
    const hit = bad.filter((b) => c.scenes.includes(b.id));
    if (!hit.length) continue;
    const over = hit.reduce((n, b) => n + Math.max(0, b.now - b.was * STRETCH[1]), 0), under = hit.reduce((n, b) => n + Math.max(0, b.was * STRETCH[0] - b.now), 0);
    const advice = over > under
      ? `${over.toFixed(1)} s more than the scenes can hold: ${c.repeatable ? `repeat this chapter's shots (it is repeatable) or ` : repeatable.length ? `move lines into a repeatable chapter (${repeatable.join(', ')}) and add shot instances there, or ` : 'add scene instances to the plan, or '}shorten the script here`
      : `${under.toFixed(1)} s less than the scenes need: ${c.removable ? `remove it (node scripts/buyer/chapters.mjs --remove ${c.id}) or ` : removable.length ? `remove a removable chapter (${removable.join(', ')}) or ` : ''}write more for it`;
    out.push({chapter: c.id, title: c.title, scenes: hit.map((b) => `${b.id} ${b.was.toFixed(1)}→${b.now.toFixed(1)} s (${b.ratio.toFixed(2)}×)`), advice});
  }
  return out;
}

/** Cue phrases (plans with `cues`: beats start where a phrase is spoken) that the new script no longer says. */
export function staleCues(plan, lines) {
  const said = ` ${tokens(lines.join(' ')).join(' ')} `;
  return (plan.cues ?? []).filter((c) => c.phrase && !said.includes(` ${tokens(c.phrase).join(' ')} `)).map((c) => c.id);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const a = args();
  const audio = a._[0];
  if (!audio) fail('usage: node scripts/buyer/align.mjs <narration audio> [--script script.txt] [--words asr.json] [--lang en]');
  const plan = loadPlan();
  const ext = path.extname(audio) || '.wav';
  const narration = importMedia(audio, `buyer/narration${ext}`);
  const raw = a.words ? JSON.parse(readFileSync(a.words, 'utf8')) : asr(audio, {lang: typeof a.lang === 'string' ? a.lang : 'en', model: a.model});
  const words = wordsOf(raw);
  if (!words.length) fail('the ASR returned no words');
  const lines = a.script ? readScript(String(a.script)) : (raw.segments ?? []).map((s) => String(s.text).trim()).filter(Boolean);
  if (!lines.length) fail('no sentences: pass --script with one sentence per line');
  const sentences = alignLines(lines, words).map((t, i) => ({id: `n${String(i + 1).padStart(2, '0')}`, ...t}));
  const newDur = +((a.duration ? Number(a.duration) : duration(path.join('public', narration))) + 0.4).toFixed(2);
  const before = structuredClone(plan);
  const {retime: how, W} = retime(plan, sentences, words, newDur, {keepTakeMap: Boolean(a['keep-take-map'])});
  const over = stretchReport(before, W);
  if (over && !a.force) {
    console.error(`stopped: scenes would stretch beyond ${STRETCH[0]}–${STRETCH[1]}× (the film is ${before.clock.duration.toFixed(1)} s, your narration ${newDur.toFixed(1)} s). Nothing was saved.`);
    for (const c of over) console.error(`- ${c.chapter} ${c.title}: ${c.advice}\n    ${c.scenes.slice(0, 6).join('\n    ')}${c.scenes.length > 6 ? `\n    … ${c.scenes.length - 6} more` : ''}`);
    console.error('Fix the plan or the script and run align.mjs again, or pass --force to accept the stretch.');
    process.exit(2);
  }
  plan.audio = {...(plan.audio ?? {}), narration};
  writeData('data/buyer/words.json', words);
  plan.narration = {...(plan.narration ?? {}), words: 'data/buyer/words.json', sentences};
  savePlan(plan);
  const captions = plan.captions && (plan.captions.lines || plan.captions.style?.burn !== false) && !a['no-captions'];
  if (captions) buildCaptions(plan, {save: true});
  const stale = staleCues(plan, lines);
  if (stale.length) console.error(`cues whose phrase your script no longer says (edit plan cues[].phrase): ${stale.join(', ')}`);
  console.log(JSON.stringify({narration, duration: newDur, sentences: sentences.length, words: words.length, scenes: plan.scenes.length, retime: how, captions: Boolean(captions)}, null, 2));
}
