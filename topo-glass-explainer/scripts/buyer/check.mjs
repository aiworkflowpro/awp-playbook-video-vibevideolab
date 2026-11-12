#!/usr/bin/env node
// Frame self-check before the full render: static checks of the plan, then 3 frames per chapter rendered one at a time, and a
// checklist (check/CHECK.md) for the agent to look at every frame against.
//   node scripts/buyer/check.mjs [--static] [--per-chapter 3] [--out check] [--strict]
// Static checks: plan files that are missing (the render would fail), required slots still empty or on the placeholder,
// template filler left in on-screen texts, on-screen words and media still the pack's samples. --strict exits 1 on any of them.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {allTexts, args, isPlaceholder, loadPlan, namedMedia, PUBLIC, ROOT} from './lib.mjs';

const a = args();
const plan = loadPlan();
const out = path.resolve(String(a.out ?? 'check'));
const per = Math.max(1, Number(a['per-chapter'] ?? 3));
const baseline = existsSync(path.join(ROOT, '.vvl/baseline.plan.json')) ? JSON.parse(readFileSync(path.join(ROOT, '.vvl/baseline.plan.json'), 'utf8')) : null;
const slots = existsSync(path.join(ROOT, 'docs/slots.json')) ? JSON.parse(readFileSync(path.join(ROOT, 'docs/slots.json'), 'utf8')).slots : [];

const missing = namedMedia(plan).filter((m) => !existsSync(path.join(PUBLIC, m.file)));
const fileOf = (id) => namedMedia(plan).find((m) => m.where === id)?.file ?? null;
const requiredEmpty = slots.filter((s) => s.required).filter((s) => !fileOf(s.id) || (s.id === 'presenter.take' && plan.presenter?.placeholder)).map((s) => s.id);
const filler = allTexts(plan).filter((r) => isPlaceholder(r.text));
const sampleWords = baseline ? (plan.anchors ?? []).filter((x) => (baseline.anchors ?? []).find((b) => b.id === x.id && b.word === x.word && !isPlaceholder(b.word) && b.word)).map((x) => x.id) : [];
const sampleMedia = namedMedia(plan).filter((m) => m.file.startsWith('sample/')).map((m) => m.where);

const fps = plan.clock.fps, last = Math.floor(plan.clock.duration * fps) - 1;
const chs = (plan.chapters ?? []).length ? plan.chapters : [{id: 'film', title: 'Whole film', scenes: (plan.scenes ?? []).map((s) => s.id)}];
const by = new Map((plan.scenes ?? []).map((s) => [s.id, s]));
const picks = chs.map((c) => {
  const ss = c.scenes.map((x) => by.get(x)).filter(Boolean);
  if (!ss.length) return {c, frames: []};
  const A = Math.min(...ss.map((s) => s.a)), B = Math.max(...ss.map((s) => s.b));
  const frames = [...new Set(Array.from({length: per}, (_, i) => Math.min(last, Math.round((A + ((B - A) * (i + 0.5)) / per) * fps))))];
  return {c, frames};
});

let rendered = [];
if (!a.static && !missing.length) {
  const frames = picks.flatMap((p) => p.frames);
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/buyer/render.mjs'), '--frames', frames.join(','), '--out', path.join(out, 'frames')], {stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8'});
  if (r.status !== 0) { console.error('render failed; fix it before the checklist'); process.exit(1); }
  rendered = frames;
}
const md = ['# Frame check', '',
  `Film ${plan.clock.duration.toFixed(1)} s · ${chs.length} chapters · frames in \`${path.relative(ROOT, path.join(out, 'frames')) || 'frames'}/\`.`, '',
  '## Static', '',
  `- [${missing.length ? ' ' : 'x'}] plan files present${missing.length ? `: missing ${missing.map((m) => `${m.where} (${m.file})`).join(', ')}` : ''}`,
  `- [${requiredEmpty.length ? ' ' : 'x'}] required slots filled${requiredEmpty.length ? `: ${requiredEmpty.join(', ')}` : ''}`,
  `- [${filler.length ? ' ' : 'x'}] no template filler in on-screen text${filler.length ? `: ${filler.length} left (node scripts/buyer/text.mjs --placeholders)` : ''}`,
  `- [${sampleWords.length ? ' ' : 'x'}] no sample on-screen words left${sampleWords.length ? `: ${sampleWords.length} (${sampleWords.slice(0, 8).join(', ')}${sampleWords.length > 8 ? ' …' : ''})` : ''}`,
  `- [${sampleMedia.length ? ' ' : 'x'}] no sample media left${sampleMedia.length ? `: ${sampleMedia.join(', ')}` : ''}`, '',
  '## Look at every frame', '',
  'For each frame tick only what you saw: text fits its box and is not cut; nothing covers the presenter\'s face; no placeholder box where you meant media; no sample brand, name or word; colours and fonts are the ones you chose.', '',
  ...picks.flatMap(({c, frames}) => [`### ${c.id} ${c.title ?? ''}`, '', ...frames.map((f) => `- [ ] frame ${f} (${(f / fps).toFixed(1)} s): \`f${String(f).padStart(6, '0')}.png\`${rendered.includes(f) ? '' : ' (not rendered)'}`), '']),
];
mkdirSync(out, {recursive: true});
writeFileSync(path.join(out, 'CHECK.md'), md.join('\n') + '\n');
const problems = missing.length + requiredEmpty.length + filler.length + sampleWords.length + sampleMedia.length;
console.log(JSON.stringify({checklist: path.join(out, 'CHECK.md'), frames: rendered.length, missing: missing.length, required_empty: requiredEmpty, filler: filler.length, sample_words: sampleWords.length, sample_media: sampleMedia}, null, 1));
if (missing.length || (a.strict && problems)) process.exit(1);
