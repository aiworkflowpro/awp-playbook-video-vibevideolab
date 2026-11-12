# Topo Glass Explainer (topo-glass-explainer): notes for coding agents

Read `SKILL.md` before changing anything; it is the workflow. `docs/STRUCTURE.md` maps the film.

## Commands

| Command | Does |
|---|---|
| `node scripts/buyer/align.mjs <audio> --script <file>` | time the narration and re-time the plan |
| `node scripts/buyer/text.mjs --export words.tsv` / `--import words.tsv` | every on-screen text in one table |
| `node scripts/buyer/fill.mjs --list` / `<slot> <file> --license …` | media slots |
| `node scripts/buyer/chapters.mjs --list` / `--remove <id>` | chapter layer |
| `node scripts/buyer/check.mjs` | frames per chapter and the self-check list |
| `node scripts/buyer/render.mjs --full` | the whole film |

## Do not touch

- `vendor/core/` (shared core).
- `plan.clean.json` by hand while `film.plan.json` differs (the scripts keep both in step).
- `.vvl/` (the shipped baseline the check compares against).

Render one process at a time; check stills before a full render.
