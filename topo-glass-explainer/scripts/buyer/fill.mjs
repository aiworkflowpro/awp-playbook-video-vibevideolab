#!/usr/bin/env node
// Slot filling: put your own media and words into the plan.
//   node scripts/buyer/fill.mjs --list [--json]                          # every slot, presenter file and anchor, filled or empty
//   node scripts/buyer/fill.mjs <kind>.<name> <file> [--in 2.5] [--license "<where it came from>"]
//   node scripts/buyer/fill.mjs presenter.take take.mp4                  # presenter.take | person | plate | pip
//   node scripts/buyer/fill.mjs presenter.pip --from-take 968:352:660    # cut the PiP (centre x:y, side or WxH) out of the take
//   node scripts/buyer/fill.mjs anchor.<id> "New words"                  # an on-screen word
//   node scripts/buyer/fill.mjs <kind>.<name> --empty                    # clear a slot (the film shows a placeholder)
// Slot kinds and names are the plan's (docs/SLOTS.md lists them with size, duration, sample and licence). Emptying
// presenter.take on a film that needs one puts the shipped placeholder back. Files are copied to
// public/buyer/<kind>/<name><ext>; the plan names them relative to public/.
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {args, fail, has, importMedia, loadPlan, PUBLIC, savePlan} from './lib.mjs';

const a = args();
const plan = loadPlan();
const P = plan.presenter && typeof plan.presenter === 'object' ? plan.presenter : null;
const state = (rel) => (rel ? (existsSync(path.join(PUBLIC, rel)) ? 'ok' : 'MISSING') : 'empty');

if (a.list) {
  const rows = [];
  if (P) {
    for (const k of ['take', 'person', 'plate']) if (k in P) rows.push({id: `presenter.${k}`, value: P[k], state: state(P[k])});
    if (P.pip && typeof P.pip === 'object') rows.push({id: 'presenter.pip', value: P.pip.src, state: state(P.pip.src)});
  }
  if (plan.audio) rows.push({id: 'audio.narration', value: plan.audio.narration, state: state(plan.audio.narration)});
  for (const [kind, slots] of Object.entries(plan.slots ?? {})) for (const [name, s] of Object.entries(slots ?? {})) rows.push({id: `${kind}.${name}`, value: s?.file ?? null, state: state(s?.file)});
  for (const x of plan.anchors ?? []) rows.push({id: `anchor.${x.id}`, value: x.word, state: `${x.t ?? 0}s`});
  if (a.json) console.log(JSON.stringify(rows, null, 1));
  else for (const r of rows) console.log(`${r.id.padEnd(32)} ${String(r.state).padEnd(8)} ${r.value ?? ''}`);
  process.exit(0);
}

const [target, value] = a._;
if (!target) fail('usage: node scripts/buyer/fill.mjs <kind>.<name> <file> | anchor.<id> "<word>" | --list');
const dot = target.indexOf('.');
const kind = target.slice(0, dot);
const name = target.slice(dot + 1);
if (dot < 1 || !name) fail(`${target}: use <kind>.<name>`);

if (kind === 'anchor') {
  const x = (plan.anchors ?? []).find((y) => y.id === name);
  if (!x) fail(`no anchor ${name} (fill.mjs --list shows them)`);
  if (value === undefined) fail('give the new word');
  x.word = value;
  savePlan(plan);
  console.log(`anchor.${name} = ${value}`);
  process.exit(0);
}

let rel = null;
if (a['from-take'] && kind === 'presenter' && name === 'pip') {
  if (!P?.take || !existsSync(path.join(PUBLIC, P.take))) fail('fill presenter.take first');
  if (!has('ffmpeg')) fail('ffmpeg not found: install it, or cut the PiP yourself and fill presenter.pip <file>');
  const [cx, cy, size] = String(a['from-take']).split(':');
  const [w, h] = String(size).split('x').map(Number);
  const W = w, H = Number.isFinite(h) ? h : w;
  rel = 'buyer/presenter/presenter-pip.mp4';
  mkdirSync(path.join(PUBLIC, 'buyer/presenter'), {recursive: true});
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(PUBLIC, P.take), '-an', '-vf', `crop=${W}:${H}:${Number(cx) - W / 2}:${Number(cy) - H / 2}`,
    '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', path.join(PUBLIC, rel)], {stdio: 'inherit'});
} else if (!a.empty) {
  if (!value) fail('give a file (or --empty)');
  rel = importMedia(value, `buyer/${kind}/${name}${path.extname(value).toLowerCase()}`);
}

if (kind === 'presenter') {
  if (!P) fail('this film has no presenter');
  if (name === 'take' && !rel && existsSync(path.join(PUBLIC, 'sample/presenter/placeholder.mp4'))) { rel = 'sample/presenter/placeholder.mp4'; P.placeholder = true; }
  else if (name === 'take') delete P.placeholder;
  if (name === 'pip') {
    if (!P.pip || typeof P.pip !== 'object') fail('this film has no picture-in-picture presenter');
    P.pip.src = rel;
  } else if (['take', 'person', 'plate'].includes(name) && name in P) P[name] = rel;
  else fail(`presenter.${name}: this film uses ${['take', 'person', 'plate'].filter((k) => k in P).concat(P.pip ? ['pip'] : []).join(' | ')}`);
} else if (kind === 'audio') {
  if (!plan.audio || !(name in plan.audio)) fail(`no audio.${name} in this plan`);
  plan.audio[name] = rel;
} else {
  if (!plan.slots?.[kind]?.[name]) fail(`no slot ${kind}.${name} in this plan (fill.mjs --list shows them)`);
  const slot = plan.slots[kind][name];
  slot.file = rel;
  if (a.in !== undefined) slot.in = Number(a.in);
  if (a.license) slot.license = String(a.license);
  delete slot.note;
}
savePlan(plan);
console.log(`${target} = ${rel ?? '(empty)'}`);
