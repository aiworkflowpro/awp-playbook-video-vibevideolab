#!/usr/bin/env node
// Render check frames or the whole film of the active plan with the Remotion CLI.
//   node scripts/buyer/render.mjs --frames 0,600,1200 [--out check]     # stills (PNG), one Remotion process at a time
//   node scripts/buyer/render.mjs --seconds 5,30 [--out check]           # the same, by time
//   node scripts/buyer/render.mjs --full [--out out/film.mp4]            # the whole film (H.264)
//   [--composition Film] [--entry src/index.tsx]
// Before rendering it lists plan files that are missing (they would fail the render) and slots left empty (placeholders).
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {args, fail, loadPlan, namedMedia, PUBLIC} from './lib.mjs';

const a = args();
const plan = loadPlan();
const missing = namedMedia(plan).filter((m) => !existsSync(path.join(PUBLIC, m.file)));
const empty = Object.entries(plan.slots ?? {}).flatMap(([k, s]) => Object.entries(s ?? {}).filter(([, x]) => !x?.file).map(([n]) => `${k}.${n}`));
if (missing.length) fail(`missing files (fill them or clear the slot with fill.mjs <slot> --empty):\n  ${missing.map((m) => `${m.where}: ${m.file}`).join('\n  ')}`);
if (empty.length) console.error(`empty slots (placeholders on screen): ${empty.join(', ')}`);

const pack = existsSync('pack.json') ? JSON.parse(readFileSync('pack.json', 'utf8')) : {};
const entry = String(a.entry ?? pack.entry ?? ['src/index.tsx', 'src/index.ts'].find((f) => existsSync(f)) ?? 'src/index.tsx');
const composition = String(a.composition ?? pack.composition ?? 'Film');
const bin = path.join('node_modules', '.bin', process.platform === 'win32' ? 'remotion.cmd' : 'remotion');
const remotion = (argv) => (existsSync(bin) ? execFileSync(bin, argv, {stdio: 'inherit'}) : execFileSync('npx', ['remotion', ...argv], {stdio: 'inherit'}));
if (a.full) {
  const out = path.resolve(String(a.out ?? 'out/film.mp4'));
  mkdirSync(path.dirname(out), {recursive: true});
  remotion(['render', entry, composition, out]);
  console.log(out);
} else {
  const fps = plan.clock.fps;
  const last = Math.floor(plan.clock.duration * fps) - 1;
  const frames = a.seconds
    ? String(a.seconds).split(',').map((s) => Math.round(Number(s) * fps))
    : String(a.frames ?? '0').split(',').map((f) => Number(f.trim()));
  const ok = frames.filter((f) => Number.isInteger(f) && f >= 0 && f <= last);
  if (!ok.length) fail(`--frames 0,600,1200 (0–${last}) or --seconds 1,20`);
  const out = path.resolve(String(a.out ?? 'check'));
  mkdirSync(out, {recursive: true});
  const files = ok.map((f) => path.join(out, `f${String(f).padStart(6, '0')}.png`));
  ok.forEach((f, i) => remotion(['still', entry, composition, files[i], `--frame=${f}`]));
  console.log(JSON.stringify({stills: files}, null, 2));
}
