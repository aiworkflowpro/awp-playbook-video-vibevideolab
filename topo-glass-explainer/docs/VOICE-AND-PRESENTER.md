# Topo Glass Explainer (free first chapter): your own voice and presenter

The sample narration and presenter in `public/sample/` are AI-generated and non-exclusive: you may keep them, but most buyers replace them with their own. These steps make an equivalent in your own accounts, so the result is yours.

## Voice

- Character: a clear, warm explainer voice at about 150 words a minute
- Voice design prompt (any text-to-speech service with voice design): "A friendly, articulate narrator in their thirties, neutral accent, close-mic studio sound, calm confident pace, light warmth, no vocal fry."
- Settings that worked for the sample: stability medium-high, similarity high, no style exaggeration; one paragraph per request
- Generate the whole script in one or a few long requests (fewer joins), export WAV, then `node scripts/buyer/align.mjs narration.wav --script script.txt`.

## Presenter

- Look: a presenter framed from the chest up, facing the camera, plain background matching the film
- Portrait prompt (an image generator you have rights to): "Photorealistic portrait of a friendly presenter, chest-up, facing camera, soft key light, plain light background, 16:9, natural skin, no text, no logos."
- Animate it with a talking-avatar service on your own account, driven by your narration file, at the frame size in `docs/SLOTS.md` (`presenter.take`); or film yourself.
- `node scripts/buyer/fill.mjs presenter.take take.mp4 --license "<service, your account, date>"`; add `presenter.pip --from-take x:y:size` if the film uses a window.

## Disclosure

When a published film carries a realistic synthetic voice or person, disclose it as the platform (for example YouTube's altered or synthetic content setting) and local law require.
