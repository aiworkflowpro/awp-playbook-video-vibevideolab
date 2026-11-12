#!/usr/bin/env node
// Pick the plan the engine renders: node scripts/plan.mjs original|clean|<file.json>  (copies it to film.plan.json).
// Edits made by scripts/buyer/ are already mirrored into plan.<variant>.json; hand edits of film.plan.json are not, so
// switching refuses when film.plan.json differs from its source (pass --force to drop them).
import {copyFileSync, existsSync, readFileSync} from 'node:fs';

const arg = process.argv[2];
if (!arg) {
  const cur = existsSync('film.plan.json') ? JSON.parse(readFileSync('film.plan.json', 'utf8')) : null;
  console.log(cur ? `film.plan.json: ${cur.id} (${cur.variant})` : 'no film.plan.json');
  process.exit(0);
}
const file = arg.endsWith('.json') ? arg : `plan.${arg}.json`;
if (!existsSync(file)) {
  console.error(`${file} not found`);
  process.exit(1);
}
if (existsSync('film.plan.json') && !process.argv.includes('--force')) {
  const cur = JSON.parse(readFileSync('film.plan.json', 'utf8'));
  const src = `plan.${cur.variant}.json`;
  if (existsSync(src) && readFileSync(src, 'utf8') !== readFileSync('film.plan.json', 'utf8')) {
    console.error(`film.plan.json has edits not in ${src}: copy it there first (cp film.plan.json ${src}) or pass --force`);
    process.exit(1);
  }
}
copyFileSync(file, 'film.plan.json');
const plan = JSON.parse(readFileSync(file, 'utf8'));
console.log(`film.plan.json <- ${file}: ${plan.id} (${plan.variant}), ${plan.scenes.length} scenes, ${plan.clock.duration} s`);
