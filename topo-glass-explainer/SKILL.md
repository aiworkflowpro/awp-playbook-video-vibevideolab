---
name: film-pack-topo-glass-explainer
description: Turn the "Topo Glass Explainer" film pack (a complete 49 s Remotion film, 2 chapters, without a presenter) into the user's own film. Use when the user wants to make a video with this pack, swap in their script, narration, presenter, on-screen text or media, check frames or render.
compatibility: Node 22+, pnpm, ffmpeg; Remotion 4 (installed with the project). General Remotion rules come from Remotion's official Skill; this Skill covers only this pack.
---

# Topo Glass Explainer

> **Free first chapter.** This is the first 49 seconds of the full pack, complete and renderable, so you can run the whole workflow on your own script. The other chapters, their structure notes and outline come with the full "Topo Glass Explainer" pack (all 11 chapters, 8 min 54 s): [vibevideolab.com/packs/topo-glass-explainer](https://vibevideolab.com/packs/topo-glass-explainer/)

## 1. What this pack is

A complete, renderable film (49 s, 2 chapters, without a presenter) driven by one plan file, `film.plan.json`: chapters, scenes, sentences, on-screen words, presenter spans and media slots. The code holds layout and motion only. Out of the box it renders the sample film with the sample media in `public/sample/`. Demo: (demo link to be added)

## 2. Before you start

Ask the user for: the script or the topic; the voice (their recording, a text-to-speech voice they have rights to, or keep the sample voice); presenter or not (their footage, an avatar of their own, the sample presenter, or none); media for the slots; brand colours and fonts; frame size. Then `pnpm install` (or `node fork.mjs <empty folder>` to copy first) and `node scripts/buyer/render.mjs --seconds 5` to prove the setup.

## 3. Read the structure

Read `docs/STRUCTURE.md`: chapter map (role, length, target words, removable, repeatable), shot types and what each suits. Map the user's points onto the chapters before writing a word.

## 4. Write or import the script

- Fill `docs/NARRATION-OUTLINE.md` per chapter (purpose, beats, target_words, must_have, on_screen), then write `script.txt`, one sentence per line (or a `.tsv` with a `text` column).
- `docs/NARRATION.md` is the sample narration: copy its pace and sentence length, not its words. Write for the ear: one idea per sentence, 9–15 words on average, few commas.
- Stay inside each chapter's target_words. Too long for a chapter means more scenes, not slower ones (step 5).

## 5. Voice and align

`node scripts/buyer/align.mjs narration.wav --script script.txt`. Word timings come from `--words asr.json` (any ASR's JSON) or a local ASR (`mlx_whisper`, `whisper`, `whisper-ctranslate2`); `--lang` defaults to `en`. Each scene may stretch 0.7–1.3×; beyond that align.mjs stops, saves nothing and lists per chapter what to do: `node scripts/buyer/chapters.mjs --remove <id>` for a removable chapter, more scenes in a repeatable one, or a shorter / longer script. `docs/VOICE-AND-PRESENTER.md` shows how to make an equivalent voice and presenter in the user's own accounts.

## 6. Fill slots and on-screen text

- All on-screen text in one table: `node scripts/buyer/text.mjs --export words.tsv`, edit the second column, `text.mjs --import words.tsv`. It covers titles, labels and numbers (`anchor:` ids) and the texts of data files such as chat windows. Keep data texts about as long as the line they replace. `text.mjs --placeholders` lists template filler still left.
- Media: `node scripts/buyer/fill.mjs <kind>.<name> <file> --license "<source, licence, date>"` (`fill.mjs --list`, `docs/SLOTS.md`). Presenter: `fill.mjs presenter.take take.mp4` (and `presenter.pip --from-take x:y:size` when the film uses a window). Empty slots draw a placeholder and do not fail.
- Use only media the user owns or has licensed.

## 7. Restyle

Colours: `theme.palette` in the plan (and the tokens in `src/theme.ts`). Fonts: only OFL fonts or fonts the user has licensed, with the licence file beside the font in `public/fonts/`. Presenter on or off and its window position live in `presenter`. Frame size: `clock.width/height`, only the sizes this pack was made for.

## 8. Check frames, then render

`node scripts/buyer/check.mjs` renders 3 frames per chapter (one process at a time) and writes `check/CHECK.md`. Open every frame and tick the list: text fits and is not cut, nothing covers the presenter's face, no placeholder box left where media was meant, no sample words, names or brands left, colours and fonts as chosen; the static part must show no missing files and no template filler. Then `node scripts/buyer/render.mjs --full`; the film must last as long as the narration.

## 9. Do not

- Edit `vendor/core/` or `.vvl/`; delete `plan.clean.json`.
- Treat the sample voice and presenter as the user's exclusive assets: they are AI-generated and non-exclusive (`LICENSE.md`).
- Publish without disclosing a realistic synthetic voice or person where the platform (YouTube's altered or synthetic content setting) or local law requires it.
- Run several renders at once.
