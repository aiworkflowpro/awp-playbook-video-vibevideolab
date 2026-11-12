#!/usr/bin/env node
// node fork.mjs <target dir>: copy this pack into a new project folder and install the dependencies (core from vendor/core).
// Same as `vibevideolab fork <pack> --to <dir>`.
import {cp, copyFile, mkdir, readdir, readFile, access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const target=process.argv[2];
if(!target){console.error('usage: node fork.mjs <target dir>');process.exit(2);}
await mkdir(target,{recursive:true});
if((await readdir(target)).length){console.error('target must be empty');process.exit(2);}
const here=path.dirname(fileURLToPath(import.meta.url));
await cp(here,target,{recursive:true,filter:(src)=>!src.split(path.sep).includes('node_modules')});
try{await access(path.join(target,'film.plan.json'));}catch{await copyFile(path.join(target,'plan.clean.json'),path.join(target,'film.plan.json'));}
const pkg=JSON.parse(await readFile(path.join(target,'package.json'),'utf8'));
execFileSync('pnpm',['install'],{cwd:target,stdio:'inherit'});
if(!Object.values(pkg.dependencies??{}).includes('file:./vendor/core'))execFileSync('pnpm',['add','file:./vendor/core'],{cwd:target,stdio:'inherit'});
console.log('forked into',target,'\nnext: read SKILL.md, then node scripts/buyer/render.mjs --seconds 5');
