#!/usr/bin/env node
// Caption lines from the plan's narration (sentences + word timings).
//   node scripts/buyer/captions.mjs [--max 16] [--gap 0.25] [--keywords a,b]
// Long sentences split at punctuation / spaces into lines no wider than --max (a CJK character counts 1, a Latin letter
// 0.55, so 16 is about 29 Latin characters), each timed by its first word; a line that starts a sentence after a pause of
// --gap seconds or more pops in. Anchor words (and --keywords) found in a line are highlighted when spoken. Writes
// public/data/buyer/captions.json and points captions.lines at it.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {alignLines, args, loadPlan, readData, savePlan, timedTokens, tokens, writeData} from './lib.mjs';

const width = (t) => Array.from(t).reduce((n, c) => n + (/[\u3000-\u9fff\uff00-\uffef]/.test(c) ? 1 : 0.55), 0);

/** Pieces of a sentence at punctuation and spaces, packed greedily into lines no wider than `max`. */
export function splitLine(text, max) {
  if (width(text) <= max) return [text];
  const pieces = text.split(/(?<=[\uff0c,\u3001\uff1b;\uff1a:\u3002.!\uff01?\uff1f])|(?<=\s)(?=\S)/u).filter((p) => p.trim());
  const out = [];
  let cur = '';
  for (const p of pieces) {
    if (cur && width(cur + p) > max) {
      out.push(cur.trim());
      cur = '';
    }
    if (width(p) > max) {
      const chars = Array.from(p);
      for (let i = 0; i < chars.length; i += max) out.push(chars.slice(i, i + max).join('').trim());
      continue;
    }
    cur += p;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.map((l) => l.replace(/[\uff0c,\u3001\uff1b;\uff1a:\u3002]$/u, ''));
}
/** Whether `line` contains the whole tokens of `word` in order (so "it" is not found inside "with"). */
const contains = (line, word) => ` ${tokens(line).join(' ')} `.includes(` ${tokens(word).join(' ')} `);

export function buildCaptions(plan, {max = 16, gap = 0.25, keywords = [], save = false} = {}) {
  const words = plan.narration?.words ? readData(plan.narration.words) : [];
  const hlWords = [...new Set([...(plan.anchors ?? []).map((a) => a.word), ...keywords])].filter((w) => w && tokens(w).length && w.length >= 2 && !w.includes('{'));
  const lines = [];
  let prevEnd = -1;
  for (const s of plan.narration?.sentences ?? []) {
    const chunks = splitLine(s.text, max);
    const inside = words.filter((w) => w.s >= s.s - 0.05 && w.s < s.e + 0.05);
    const heard = timedTokens(inside);
    const timed = inside.length ? alignLines(chunks, inside) : chunks.map((c, i) => ({text: c, s: s.s + ((s.e - s.s) * i) / chunks.length}));
    timed.forEach((c, i) => {
      const t = +Math.max(c.s, s.s).toFixed(2);
      const hl = [];
      for (const w of hlWords) {
        if (!contains(c.text, w)) continue;
        const first = tokens(w)[0];
        const spoken = heard.find((x) => x.t === first && x.s >= t - 0.05);
        hl.push([w, +(spoken ? spoken.s : t + 0.3).toFixed(2)]);
      }
      lines.push({t, text: c.text, ...(i === 0 && s.s - prevEnd >= gap ? {pop: true} : {}), ...(hl.length ? {hl} : {})});
    });
    prevEnd = s.e;
  }
  if (save) {
    writeData('data/buyer/captions.json', lines);
    plan.captions = {...(plan.captions ?? {style: {}}), lines: 'data/buyer/captions.json'};
    savePlan(plan);
  }
  return lines;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const a = args();
  const lines = buildCaptions(loadPlan(), {max: Number(a.max ?? 16), gap: Number(a.gap ?? 0.25), keywords: String(a.keywords ?? '').split(',').filter(Boolean), save: true});
  console.log(JSON.stringify({captions: lines.length, file: 'public/data/buyer/captions.json', first: lines.slice(0, 3)}, null, 2));
}
