# Topo Glass Explainer (free first chapter)

A faceless 16:9 explainer about how AI agents work: frosted glass tiles over a night topographic map, a guide emblem in place of a presenter, chapter pills, an unbranded console, cairn chapter cards and slow-push b-roll. Eleven chapters you can re-time to your own narration.

A complete, renderable 49 s film (1920x1080, 23.976 fps, 2 chapters, 20 scenes) built with Remotion and React, plus a Skill that teaches your coding agent to turn it into your own film. This is the free first chapter of "Topo Glass Explainer". The full pack (all 11 chapters, 8 min 54 s) is at [vibevideolab.com/packs/topo-glass-explainer](https://vibevideolab.com/packs/topo-glass-explainer/).

## Before you start

- Node 22+, pnpm, ffmpeg.
- A coding agent (it reads `SKILL.md`).
- Remotion is free for individuals and companies of up to 3 people; larger companies need a Remotion Company License.

## Three steps

```sh
pnpm install
node scripts/buyer/render.mjs --seconds 5
node scripts/buyer/check.mjs           # frames per chapter and a checklist
```

Then ask your agent to follow `SKILL.md` with your script or topic.

## What is where

| Path | What |
|---|---|
| `SKILL.md` | the agent workflow (read first) |
| `docs/STRUCTURE.md` | chapters, shot types, what each suits |
| `docs/NARRATION.md · docs/NARRATION-OUTLINE.md` | the sample narration and a fill-in outline |
| `docs/SLOTS.md · docs/slots.json` | every media slot: size, duration, sample, licence |
| `docs/VOICE-AND-PRESENTER.md` | make your own voice and presenter |
| `plan.clean.json · film.plan.json` | the film plan (film.plan.json is the one that renders) |
| `scripts/buyer/` | align, text, fill, chapters, check, render |
| `src/` | the engine: scenes, parts, theme |
| `public/sample/` | sample media (licence records in THIRD_PARTY.md) |
| `vendor/core/` | the shared core package (do not edit) |

## Updates and licence

Versions are listed in `CHANGELOG.md`. Licence: `LICENSE.md` (films you make are yours; the pack itself is not to be redistributed). Third-party notices: `THIRD_PARTY.md`.
