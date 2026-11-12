# Buyer scripts

Run from the project root. Every change is written to `film.plan.json` (what renders) and to `plan.clean.json`. Node 22+; ffmpeg for media lengths and the PiP cut.

| Script | Does |
|---|---|
| `align.mjs <narration> --script script.txt\|lines.tsv [--words asr.json] [--lang en] [--force]` | Narration timing; re-times scenes, presenter, on-screen words, captions. Stops when a scene would stretch beyond 0.7–1.3× and says which chapter to remove or extend |
| `text.mjs --export words.tsv` · `--import words.tsv` · `--placeholders` · `--narration <file>` | Every on-screen text (anchors and data files such as chat windows) in one table; narration lines from a file |
| `fill.mjs --list` · `<kind>.<name> <file> --license …` · `anchor.<id> "…"` | Media slots and single words |
| `chapters.mjs --list` · `--remove <id>` | The chapter layer |
| `check.mjs [--static]` | Static checks, 3 frames per chapter, `check/CHECK.md` |
| `render.mjs --frames … \| --seconds … \| --full` | Stills or the whole film |
