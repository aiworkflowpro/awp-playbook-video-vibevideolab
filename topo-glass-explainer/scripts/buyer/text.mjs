#!/usr/bin/env node
// Every on-screen text in one table: anchors (titles, labels, numbers) and the texts of the plan's data files (chat windows,
// page cards …), plus the narration lines.
//   node scripts/buyer/text.mjs --list [--json] [--placeholders]       # all texts, or only template filler (CUE, Cue line …)
//   node scripts/buyer/text.mjs --export words.tsv                     # id <TAB> text, edit the second column
//   node scripts/buyer/text.mjs --import words.tsv                     # apply every changed row in one go; also takes any
//                                                                      # TSV whose header has an `anchor` (or `id`) and a `text` column;
//                                                                      # --skip-unknown applies the known rows and lists the rest
//   node scripts/buyer/text.mjs --narration script.txt|lines.tsv       # narration sentences from a file (timing estimated
//                                                                      # from word counts until align.mjs times the recording)
// Ids: `anchor:<id>` or `<plan key>:<JSON pointer>` (e.g. `windows:/17/frames/0/items/2/0`). Tabs and newlines in a text are
// written as \t and \n. A data text keeps its layout box: write about as many characters as the line it replaces.
import {writeFileSync, readFileSync} from 'node:fs';
import {allTexts, args, dataFiles, fail, isPlaceholder, loadPlan, readData, readScript, savePlan, setAt, tokens, writeData} from './lib.mjs';

const a = args();
const plan = loadPlan();
const esc = (t) => String(t).replace(/\\/g, '\\\\').replace(/\t/g, '\\t').replace(/\n/g, '\\n');
const unesc = (t) => t.replace(/\\(\\|t|n)/g, (_, c) => (c === 't' ? '\t' : c === 'n' ? '\n' : '\\'));

if (a.list || a.placeholders) {
  const rows = allTexts(plan).filter((r) => !a.placeholders || isPlaceholder(r.text));
  if (a.json) console.log(JSON.stringify(rows, null, 1));
  else for (const r of rows) console.log(`${r.id}\t${esc(r.text)}`);
  if (a.placeholders) console.error(`${rows.length} placeholder texts`);
  process.exit(0);
}
if (a.export) {
  const rows = allTexts(plan);
  writeFileSync(String(a.export), ['# id\ttext', ...rows.map((r) => `${r.id}\t${esc(r.text)}`)].join('\n') + '\n');
  console.log(JSON.stringify({file: a.export, texts: rows.length, placeholders: rows.filter((r) => isPlaceholder(r.text)).length}));
  process.exit(0);
}
if (a.import) {
  const current = new Map(allTexts(plan).map((r) => [r.id, r.text]));
  const all = readFileSync(String(a.import), 'utf8').split(/\r?\n/).filter((l) => l.trim());
  const head = all[0].replace(/^#\s*/, '').split('\t').map((h) => h.trim().toLowerCase());
  const idCol = head.includes('id') ? head.indexOf('id') : head.indexOf('anchor'), textCol = head.indexOf('text');
  if (idCol < 0 || textCol < 0) fail(`${a.import}: the header needs an id (or anchor) and a text column`);
  const rows = all.slice(1).filter((l) => !l.startsWith('#')).map((l) => l.split('\t')).filter((c) => c[idCol]?.trim())
    .map((c) => { const id = c[idCol].trim(); return {id: id.includes(':') ? id : `anchor:${id}`, text: unesc(c[textCol] ?? '')}; });
  const unknown = rows.filter((r) => !current.has(r.id)).map((r) => r.id);
  if (unknown.length && !a['skip-unknown']) fail(`unknown ids (text.mjs --list shows them; --skip-unknown applies the rest): ${unknown.slice(0, 10).join(', ')}${unknown.length > 10 ? ' …' : ''}`);
  const changed = rows.filter((r) => current.has(r.id) && current.get(r.id) !== r.text);
  const files = new Map(dataFiles(plan).map((d) => [d.key, {rel: d.rel, json: null}]));
  for (const r of changed) {
    if (r.id.startsWith('anchor:')) { plan.anchors.find((x) => `anchor:${x.id}` === r.id).word = r.text; continue; }
    const i = r.id.indexOf(':'), key = r.id.slice(0, i), f = files.get(key);
    f.json ??= readData(f.rel);
    if (!setAt(f.json, r.id.slice(i + 1), r.text)) fail(`${r.id}: no text at that path`);
  }
  for (const f of files.values()) if (f.json) writeData(f.rel, f.json);
  savePlan(plan);
  const left = allTexts(plan).filter((r) => isPlaceholder(r.text)).length;
  console.log(JSON.stringify({changed: changed.length, placeholders_left: left, ...(unknown.length ? {skipped_unknown: unknown} : {})}));
  process.exit(0);
}
if (a.narration) {
  const lines = readScript(String(a.narration));
  if (!lines.length) fail('no lines');
  const D = plan.clock.duration, n = lines.map((l) => Math.max(1, tokens(l).length)), total = n.reduce((x, y) => x + y, 0);
  let t = 0;
  plan.narration = {...(plan.narration ?? {}), sentences: lines.map((text, i) => {
    const s = +t.toFixed(2); t += (D * n[i]) / total;
    return {id: `n${String(i + 1).padStart(3, '0')}`, text, s, e: +t.toFixed(2)};
  })};
  savePlan(plan);
  console.log(JSON.stringify({sentences: lines.length, timing: 'estimated from word counts; run align.mjs with the recording for real timing'}));
  process.exit(0);
}
fail('usage: text.mjs --list | --placeholders | --export <tsv> | --import <tsv> | --narration <file>');
