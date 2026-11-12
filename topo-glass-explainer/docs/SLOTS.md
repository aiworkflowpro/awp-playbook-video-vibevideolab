# Topo Glass Explainer (free first chapter): asset slots

Fill with `node scripts/buyer/fill.mjs <slot> <file> --license "<source, licence, date>"`. Empty slots draw a placeholder; `required` slots must be yours before you publish.

| Slot | Kind | Chapter | Size | Duration | Required | Sample | Licence | Hint |
|---|---|---|---|---|---|---|---|---|
| audio.narration | audio | — | — | — | yes | sample/audio/narration.mp3 | own · Vibe Video Lab sample narration, voice "VVL Guide" (our ElevenLabs Voice Design voice, paid plan with commercial use), paced to 0.93 with natural pauses · ElevenLabs Eleven v4 web app; ffmpeg · 2026-11-11 | your narration; align.mjs re-times the film to it |
| audio.bgm | audio | — | — | — | no | sample/audio/bgm.mp3 | own · Vibe Video Lab ambient bed: synthesised sine pads (no third-party material), trimmed and faded · numpy synthesis (make_bed.py), ffmpeg · 2026-11-11 | a music bed under the narration |
| presenter.take | presenter | — | 1920x1080 | 48.62 s | no | — | — | you on camera for the whole narration, framed like the sample |
| presenter.person | presenter | — | 1920x1080 | 48.62 s | no | — | — | a cut-out of the take (VP9 WebM with alpha), same length |
| presenter.plate | presenter | — | 1920x1080 | — | no | — | — | the empty room behind you, same framing as the take |
| footage.clip09 | footage | c01 | 1920x1080 | 0.86 s | no | sample/footage/clip09.mp4 | own · Vibe Video Lab sample clip: generated still (stills/hook2.png) with a slow ffmpeg zoompan · Codex ImageGen (still), Real-ESRGAN upscale, ffmpeg zoompan · 2026-11-11 | A laptop on a desk at night with a blurred map on screen. |
| footage.clip10 | footage | c01 | 1920x1080 | 0.86 s | no | sample/footage/clip10.mp4 | own · Vibe Video Lab sample clip: generated still (stills/hook3.png) with a slow ffmpeg zoompan · Codex ImageGen (still), Real-ESRGAN upscale, ffmpeg zoompan · 2026-11-11 | A paper calendar with a hand circling a date (title BOOK IT mid-frame). |
| footage.clip11 | footage | c01 | 1920x1080 | 0.54 s | no | sample/footage/clip11.mp4 | own · Vibe Video Lab sample clip: generated still (stills/hook4.png) with a slow ffmpeg zoompan · Codex ImageGen (still), Real-ESRGAN upscale, ffmpeg zoompan · 2026-11-11 | Two printed quotes side by side under a desk lamp (title COMPARE IT mid-frame). |
| footage.clip12 | footage | c01 | 1920x1080 | 0.76 s | no | sample/footage/clip12.mp4 | own · Vibe Video Lab sample clip: generated still (stills/hook1.png) with a slow ffmpeg zoompan · Codex ImageGen (still), Real-ESRGAN upscale, ffmpeg zoompan · 2026-11-11 | Hands placing a printed itinerary into a folder on a wooden desk (title DRAFT IT mid-frame). |
| footage.clip13 | footage | c01 | 1920x1080 | 1.18 s | no | sample/footage/clip13.mp4 | own · Vibe Video Lab sample clip: generated still (stills/hook5.png) with a slow ffmpeg zoompan · Codex ImageGen (still), Real-ESRGAN upscale, ffmpeg zoompan · 2026-11-11 | A hand sealing an envelope (title SEND IT mid-frame). |
| footage.clip14 | footage | c01 | 1920x1080 | 0.65 s | no | sample/footage/clip14.mp4 | own · Vibe Video Lab sample clip: generated still (stills/hook6.png) with a slow ffmpeg zoompan · Codex ImageGen (still), Real-ESRGAN upscale, ffmpeg zoompan · 2026-11-11 | A phone face down next to a coffee cup at dawn. |
| footage.clip15 | footage | c01 | 1920x1080 | 0.62 s | no | sample/footage/clip15.mp4 | own · Vibe Video Lab sample clip: generated still (stills/hook7.png) with a slow ffmpeg zoompan · Codex ImageGen (still), Real-ESRGAN upscale, ffmpeg zoompan · 2026-11-11 | A laptop on a desk at dawn, lid half open, trail map printout beside it (second framing of the desk set). |
| footage.clip16 | footage | c01 | 1920x1080 | 0.67 s | no | sample/footage/clip16.mp4 | own · Vibe Video Lab sample clip: generated still (stills/hook8.png) with a slow ffmpeg zoompan · Codex ImageGen (still), Real-ESRGAN upscale, ffmpeg zoompan · 2026-11-11 | A trail map and a pencil checklist on a table, overhead (second framing of the map set). |
| footage.clip38 | footage | c01 | 1920x1080 | 1.36 s | no | sample/footage/clip38.mp4 | own · Vibe Video Lab sample clip: generated still (stills/hook2.png) with a slow ffmpeg zoompan · Codex ImageGen (still), Real-ESRGAN upscale, ffmpeg zoompan · 2026-11-11 | A laptop on a desk at night with a blurred trail map on screen (covers S38-S41; slow push). |
| footage.clip42 | footage | c01 | 1920x1080 | 3.51 s | no | sample/footage/clip42.mp4 | own · Vibe Video Lab sample clip: generated still (stills/hook8.png) with a slow ffmpeg zoompan · Codex ImageGen (still), Real-ESRGAN upscale, ffmpeg zoompan · 2026-11-11 | A trail map spread on a table with a compass (title "many steps" sits mid-frame; keep the centre calm). |
| footage.clip168 | footage | — | 1920x1080 | — | no | — | — | A worn hiking logbook open on a rock with pencil notes, close-up (covers S168-S169). |
| footage.clip170 | footage | — | 1920x1080 | — | no | — | — | A hand writing in a small notebook by headlamp light. |
| footage.clip173 | footage | — | 1920x1080 | — | no | — | — | Rain on a tent wall. |
| footage.clip174 | footage | — | 1920x1080 | — | no | — | — | A cairn half hidden in fog. |
| footage.clip180 | footage | — | 1920x1080 | — | no | — | — | A coiled climbing rope on granite (title Read mid-frame). |
| footage.clip181 | footage | — | 1920x1080 | — | no | — | — | A carabiner clipped to a bolt, macro. |
| footage.clip182 | footage | — | 1920x1080 | — | no | — | — | Two hands tying a figure-eight knot (titles Draft, Send mid-frame). |
| footage.clip183 | footage | — | 1920x1080 | — | no | — | — | A rope running up a steep rock face into mist (title Pay mid-frame). |
| footage.clip185 | footage | — | 1920x1080 | — | no | — | — | Clouds rolling over a ridge. |
| footage.clip186 | footage | — | 1920x1080 | — | no | — | — | Fog swallowing a trail. |
| footage.clip196 | footage | — | 1920x1080 | — | no | — | — | Index cards sorted into two piles on a desk, overhead view. |
| footage.clip227 | footage | — | 1920x1080 | — | no | — | — | A trail sign leaning in wind, no readable text (covers S227-S229; caption at the bottom). |
| footage.clip315 | footage | — | 1920x1080 | — | no | — | — | Sunrise over a summit ridge. |
| footage.clip316 | footage | — | 1920x1080 | — | no | — | — | A lone cairn on a saddle at dawn. |
| footage.clip317 | footage | — | 1920x1080 | — | no | — | — | Boots on a rocky trail. |
| footage.clip321 | footage | — | 1920x1080 | — | no | — | — | A mountain hut with warm windows at dusk. |
| footage.clip322 | footage | — | 1920x1080 | — | no | — | — | A valley path seen from above. |
| footage.clip326 | footage | — | 1920x1080 | — | no | — | — | An old style black and white photograph of a mountain camp, generated, no real people (covers S326-S327). |
| footage.clip328 | footage | — | 1920x1080 | — | no | — | — | A black and white glacier panorama. |
| footage.clip330 | footage | — | 1920x1080 | — | no | — | — | First light on a lake below peaks. |
| footage.clip333 | footage | — | 1920x1080 | — | no | — | — | A slow pan across a sea of clouds below a summit. |
| still.valley | still | c02 | 2560x1440 | — | no | sample/still/valley.jpg | own · Vibe Video Lab sample still (stills/valley.png, resized) · Codex ImageGen, Real-ESRGAN upscale · 2026-11-11 | Valley backdrop: a wide alpine valley at blue hour seen from a high trail, mist on the valley floor, distant ridgelines, soft amber light on one slope; no people, no text. |
| still.cairn | still | c02 | 1170x1600 | — | no | sample/still/cairn.png | own · Vibe Video Lab sample still (stills/cairn.png, keyed and trimmed) · Codex ImageGen, Real-ESRGAN upscale · 2026-11-11 | Cairn cut-out: one tall cairn of flat grey stones, straight on, keyed to a transparent PNG (stones fill the height, base at the bottom edge). |
