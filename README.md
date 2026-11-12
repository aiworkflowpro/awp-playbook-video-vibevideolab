# Vibe Video Lab: free first chapters

Each folder is the free first chapter of a [Vibe Video Lab](https://vibevideolab.com/) film pack: a complete, renderable Remotion and React project plus a `SKILL.md` your coding agent follows to turn it into your own film.

| Chapter | Pack | Length |
|---|---|---|
| [`topo-glass-explainer/`](topo-glass-explainer/) | [Topo Glass Explainer](https://vibevideolab.com/packs/topo-glass-explainer/): a faceless 16:9 explainer, frosted glass over a night topographic map | 49 s of 8 min 54 s |

## Try one

```sh
cd topo-glass-explainer
pnpm install
node scripts/buyer/render.mjs --seconds 5
node scripts/buyer/check.mjs
```

Then ask your agent (Claude Code, Codex or another agent that runs terminal commands) to follow `SKILL.md` with your script.

You need Node.js 22.12 or newer, pnpm and FFmpeg. Remotion is free for individuals and companies of up to three people; larger companies need a Remotion company licence.

## Licence

Each chapter carries its own `LICENSE.md`: free to use and change for your own films, including commercial ones; not to be sold or republished as a template, pack or Skill. Sample media licences are listed in each `THIRD_PARTY.md`.
