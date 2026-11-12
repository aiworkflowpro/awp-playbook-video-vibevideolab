import path from 'node:path';
import {Config} from '@remotion/cli/config';
import {copyFileSync, existsSync, readFileSync, readdirSync} from 'node:fs';

// The plan the engine reads (docs/film-plan.md): FILM_PLAN=<file> picks one, refused over hand edits; otherwise an existing film.plan.json stays.
const pick = process.env.FILM_PLAN;
if (pick && existsSync('film.plan.json')) {
  const cur = JSON.parse(readFileSync('film.plan.json', 'utf8'));
  const src = `plan.${cur.variant}.json`;
  if (src !== pick && existsSync(src) && readFileSync(src, 'utf8') !== readFileSync('film.plan.json', 'utf8')) throw new Error(`film.plan.json has edits not in ${src}`);
}
if (pick) copyFileSync(pick, 'film.plan.json');
else if (!existsSync('film.plan.json')) {
  const plans = readdirSync('.').filter((f) => /^plan\.[\w-]+\.json$/.test(f));
  const first = plans.find((p) => p !== 'plan.clean.json') ?? plans[0];
  if (first) copyFileSync(first, 'film.plan.json');
}
Config.setChromiumOpenGlRenderer('angle');
Config.setDelayRenderTimeoutInMilliseconds(180000);
Config.setConcurrency(3);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(18);
Config.setOverwriteOutput(true);

// core: vendor/core (vibevideolab-core)
const ROOT = process.cwd();
Config.overrideWebpackConfig((c) => ({...c, resolve: {...c.resolve, modules: [path.join(ROOT, 'node_modules'), 'node_modules'], alias: {...(c.resolve?.alias ?? {}), '@core': path.join(ROOT, 'node_modules/vibevideolab-core/src')}}}));
