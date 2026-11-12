// Shared helpers of the buyer scripts: the active plan (film.plan.json in the project root; every save is mirrored into its
// source plan.<variant>.json), media probing, word timings, script-to-words alignment. One copy serves every pack.
import {execFileSync, spawnSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();
export const PLAN_FILE = path.join(ROOT, 'film.plan.json');
export const PUBLIC = path.join(ROOT, 'public');

export function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}
export const loadPlan = () => {
  if (!existsSync(PLAN_FILE)) fail('film.plan.json not found: run the buyer scripts from the project root (fork.mjs made it)');
  return JSON.parse(readFileSync(PLAN_FILE, 'utf8'));
};
/** Save the plan to film.plan.json and its source plan.<variant>.json, so switching plans never loses an edit. */
export const savePlan = (plan) => {
  const text = JSON.stringify(plan, null, 2) + '\n';
  const written = [PLAN_FILE];
  writeFileSync(PLAN_FILE, text);
  const source = path.join(ROOT, `plan.${plan.variant}.json`);
  if (/^[\w-]+$/.test(String(plan.variant ?? '')) && existsSync(source)) {
    writeFileSync(source, text);
    written.push(source);
  }
  return written;
};
export const readData = (rel) => JSON.parse(readFileSync(path.join(PUBLIC, rel), 'utf8'));
export const writeData = (rel, value) => {
  mkdirSync(path.dirname(path.join(PUBLIC, rel)), {recursive: true});
  writeFileSync(path.join(PUBLIC, rel), JSON.stringify(value, null, 1) + '\n');
};
/** Copy a buyer file under public/ and return its plan path (relative to public/). */
export const importMedia = (file, rel) => {
  if (!existsSync(file)) fail(`${file} not found`);
  const dest = path.join(PUBLIC, rel);
  mkdirSync(path.dirname(dest), {recursive: true});
  if (path.resolve(file) !== dest) copyFileSync(file, dest);
  return rel;
};
export const has = (cmd) => spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], {stdio: 'ignore'}).status === 0;
/** Media length in seconds (ffprobe). */
export const duration = (file) => {
  if (!has('ffprobe')) fail('ffprobe not found: install ffmpeg, or pass --duration <seconds>');
  return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], {encoding: 'utf8'}).trim());
};
export const args = (argv = process.argv.slice(2)) => {
  const out = {_: []};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else {
        out[key] = next;
        i++;
      }
    } else out._.push(a);
  }
  return out;
};

/** Words [{w, s, e}] from any common ASR JSON: whisper / mlx-whisper / faster-whisper (segments[].words), flat items[] or words[]. */
export const wordsOf = (json) => {
  const rows = Array.isArray(json) ? json : json.items ?? (Array.isArray(json.words) ? json.words : null) ?? (json.segments ?? []).flatMap((s) => s.words ?? []);
  return rows
    .map((w) => ({w: String(w.w ?? w.word ?? w.text ?? '').trim(), s: Number(w.s ?? w.start), e: Number(w.e ?? w.end)}))
    .filter((w) => w.w && Number.isFinite(w.s) && Number.isFinite(w.e));
};

/** Comparable form of a text: no spaces or punctuation, lower case. */
export const norm = (t) => String(t).toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
/**
 * Comparable tokens of a text: one per Han / kana character (those scripts write no spaces), one per run of letters or
 * digits elsewhere (English words, numbers); apostrophes stay inside a word ("don't" = "dont").
 */
export const tokens = (t) =>
  Array.from(String(t).normalize('NFKC').toLowerCase().matchAll(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]|[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu), (m) => m[0].replace(/['’]/g, ''));

/** Word timings as timed tokens: an ASR "word" that holds several tokens shares its span evenly. */
export function timedTokens(words) {
  const out = [];
  for (const w of words) {
    const ts = tokens(w.w);
    ts.forEach((t, i) => out.push({t, s: w.s + ((w.e - w.s) * i) / ts.length, e: w.s + ((w.e - w.s) * (i + 1)) / ts.length}));
  }
  return out;
}

/** Index pairs [i, j] of a longest common subsequence of a and b (equal tokens). Greedy look-ahead above ~12M cells. */
export function matchTokens(a, b) {
  const n = a.length, m = b.length;
  if (!n || !m) return [];
  if (n * m > 12e6) {
    const pairs = [];
    let j = 0;
    for (let i = 0; i < n && j < m; i++) {
      for (let k = j; k < Math.min(m, j + 8); k++) if (b[k] === a[i]) { pairs.push([i, k]); j = k + 1; break; }
    }
    return pairs;
  }
  const w = m + 1;
  const L = new Uint32Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    L[i * w + j] = a[i] === b[j] ? L[(i + 1) * w + j + 1] + 1 : Math.max(L[(i + 1) * w + j], L[i * w + j + 1]);
  const pairs = [];
  for (let i = 0, j = 0; i < n && j < m; ) {
    if (a[i] === b[j]) { pairs.push([i, j]); i++; j++; }
    else if (L[(i + 1) * w + j] >= L[i * w + j + 1]) i++;
    else j++;
  }
  return pairs;
}

/**
 * Time every script line against the words (any language): script tokens are matched to the ASR tokens (longest common
 * subsequence, so dropped, added and misheard words cost nothing more than themselves). A line spans its first to last
 * matched token; lines with no match share the stretch between their timed neighbours evenly. Returns [{text, s, e}].
 */
export function alignLines(lines, words) {
  const heard = timedTokens(words);
  const perLine = lines.map((l) => tokens(l));
  const flat = perLine.flat();
  const at = new Array(flat.length).fill(null);
  for (const [i, j] of matchTokens(flat, heard.map((h) => h.t))) at[i] = heard[j];
  const out = [];
  let idx = 0;
  for (const [n, line] of lines.entries()) {
    const span = at.slice(idx, idx + perLine[n].length).filter(Boolean);
    out.push({text: line, s: span.length ? span[0].s : null, e: span.length ? span[span.length - 1].e : null});
    idx += perLine[n].length;
  }
  for (let i = 0; i < out.length; ) {
    if (out[i].s !== null) { i++; continue; }
    let end = i;
    while (end < out.length && out[end].s === null) end++;
    const a = i > 0 ? out[i - 1].e : 0;
    const b = end < out.length ? out[end].s : Math.max(a + 1, words.at(-1)?.e ?? a + 1);
    const m = end - i;
    for (let r = 0; r < m; r++) {
      out[i + r].s = a + ((b - a) * r) / m;
      out[i + r].e = a + ((b - a) * (r + 1)) / m;
    }
    i = end;
  }
  return out.map((o) => ({...o, s: +o.s.toFixed(2), e: +o.e.toFixed(2)}));
}

/** First time near `t` (within `within` s) where the first tokens of `text` are spoken, else null. */
export function spokenAt(text, heard, t, within = 3) {
  const want = tokens(text).slice(0, 2);
  if (!want.length || (want.length === 1 && want[0].length < 2)) return null;
  let best = null;
  for (let i = 0; i + want.length <= heard.length; i++) {
    if (want.every((x, k) => heard[i + k].t === x) && (best === null || Math.abs(heard[i].s - t) < Math.abs(best - t))) best = heard[i].s;
  }
  return best !== null && Math.abs(best - t) < within ? +best.toFixed(2) : null;
}

/** Piecewise-linear map through knots [[old, new], ...] (sorted by old), extrapolating with the end slopes. */
export const warp = (knots) => (t) => {
  if (knots.length < 2) return t;
  let i = knots.findIndex((k) => k[0] > t);
  if (i <= 0) i = i === 0 ? 1 : knots.length - 1;
  const [a0, a1] = knots[i - 1];
  const [b0, b1] = knots[i];
  return b0 === a0 ? a1 : a1 + ((t - a0) * (b1 - a1)) / (b0 - a0);
};

/** Media files the plan names (paths relative to public/), with where each is named. */
export function namedMedia(plan) {
  const out = [];
  const add = (where, file) => { if (typeof file === 'string' && file) out.push({where, file}); };
  for (const [k, v] of Object.entries(plan.audio ?? {})) add(`audio.${k}`, v);
  const P = plan.presenter ?? {};
  for (const k of ['take', 'person', 'plate']) add(`presenter.${k}`, P[k]);
  if (P.pip && typeof P.pip === 'object') add('presenter.pip', P.pip.src);
  for (const [kind, slots] of Object.entries(plan.slots ?? {})) for (const [name, s] of Object.entries(slots ?? {})) add(`${kind}.${name}`, s?.file);
  for (const [i, s] of (plan.sfx ?? []).entries()) add(`sfx.${i}`, s?.file);
  return out;
}

/** Script lines from a file: a .tsv with a `text` column (header may start with #; empty texts are skipped), else one per line. */
export function readScript(file) {
  const raw = readFileSync(file, 'utf8').split(/\r?\n/);
  if (/\.tsv$/i.test(file)) {
    const rows = raw.filter((l) => l.trim());
    const head = rows.shift().replace(/^#\s*/, '').split('\t').map((h) => h.trim().toLowerCase());
    const col = head.indexOf('text');
    if (col < 0) fail(`${file}: no "text" column in the header (${head.join(', ')})`);
    return rows.filter((l) => !l.startsWith('#')).map((l) => (l.split('\t')[col] ?? '').trim()).filter(Boolean);
  }
  return raw.map((l) => l.trim()).filter(Boolean);
}

/** Placeholder text of a template plan: only filler words (CUE, Cue line, Text, Word 3, ____ …). */
export const isPlaceholder = (t) => {
  const s = String(t ?? '').trim();
  if (!s || /^_{2,}$/.test(s)) return Boolean(s);
  const ws = s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return ws.length > 0 && ws.every((w) => /^(?:c|cu|cue|l|li|lin|line|text|word|\d+)$/.test(w)) && ws.some((w) => /^(?:cue|text|word|line)$/.test(w));
};
/** Data files the plan names for on-screen content (chat windows, page cards …): [{key, rel}], not narration or captions. */
export function dataFiles(plan) {
  const out = [];
  const skip = new Set([plan.narration?.words, plan.captions?.lines].filter(Boolean));
  const visit = (v, key) => {
    if (typeof v === 'string') { if (/^data\/.+\.json$/.test(v) && !skip.has(v)) out.push({key, rel: v}); }
    else if (v && typeof v === 'object' && !Array.isArray(v)) for (const [k, x] of Object.entries(v)) visit(x, key ? `${key}.${k}` : k);
  };
  for (const [k, v] of Object.entries(plan)) if (!['narration', 'captions', 'slots', 'presenter', 'audio', 'scenes', 'anchors', 'sfx', 'chapters'].includes(k)) visit(v, k);
  return out;
}
const pointer = (parts) => '/' + parts.map((p) => String(p).replace(/~/g, '~0').replace(/\//g, '~1')).join('/');
const unpointer = (p) => p.split('/').slice(1).map((x) => x.replace(/~1/g, '/').replace(/~0/g, '~'));
/** Texts in a data file worth editing: string leaves with letters, not colours, media paths or lower-case identifiers. */
export function dataTexts(json) {
  const out = [];
  const walk = (v, parts) => {
    if (typeof v === 'string') {
      if (/\p{L}/u.test(v) && !/^#[0-9a-f]{3,8}$/i.test(v) && !/^[a-z][a-z0-9_-]*$/.test(v) && !/\.(?:png|jpe?g|mp4|webm|svg|wav|mp3)$/i.test(v)) out.push({path: pointer(parts), text: v});
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, [...parts, i]));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, [...parts, k]);
  };
  walk(json, []);
  return out;
}
export function setAt(json, path, value) {
  const parts = unpointer(path);
  let o = json;
  for (const p of parts.slice(0, -1)) { if (o === null || typeof o !== 'object' || !(p in o)) return false; o = o[p]; }
  const last = parts.at(-1);
  if (o === null || typeof o !== 'object' || typeof o[last] !== 'string') return false;
  o[last] = value;
  return true;
}
/** Every on-screen text of the plan: anchors and data-file strings, as [{id, text}] (id `anchor:<id>` or `<key>:<pointer>`). */
export function allTexts(plan) {
  const rows = (plan.anchors ?? []).map((a) => ({id: `anchor:${a.id}`, text: a.word ?? ''}));
  for (const {key, rel} of dataFiles(plan)) {
    let json;
    try { json = readData(rel); } catch { continue; }
    for (const t of dataTexts(json)) rows.push({id: `${key}:${t.path}`, text: t.text});
  }
  return rows;
}
