---
name: paper-trail
description: Makes a 30 to 60 s vertical (9:16) organized-crime history Short told through the original paper trail - real period front pages from the Library of Congress, slow push-ins and pans (a front page shown whole, then a push into the headline), red ink marks, typed date stamps, a dark low narration and burned-in captions. Use when the user runs /paper-trail or asks for a mob / organized-crime / true-crime history Short, a "One front page, one crime" episode, or a newspaper-archive documentary reel.
---

# /paper-trail

```
┌──────────────────────┐
│  KANSAS CITY · JUNE 17, 1933   typed stamp
│ ┌──────────────────┐ │
│ │ GUNMEN KILL [4 OFFICERS] │  real scan, slow push, red ink box
│ └──────────────────┘ │
│     FOUR LAWMEN      │  1-3 word captions, red on key words
└──────────────────────┘
```

A finished example lives in the repo at `reels/kc-massacre/` (reel.json is the whole spec). Channel-wide defaults (series label, voice, end card, mid-video prompt) live in `reels/channel.json`; a reel's own keys override them.

## Content rules (the channel's, not optional)
- Historical or closed cases only. Nothing about active cases or real, named **living** people.
- One story per Short. The hook is the first sentence.
- Mix media, but the paper trail leads: newspaper pages for the spine, plus period photos (`loc.py search ... --photos`), typed cards, ink-drawn maps/diagrams and archive film where it helps. Keep everything in the same monochrome-and-red look; bright cartoon or stick-figure art breaks the tone and the trust.
- Real material first. Never fabricate a front page, headline or quote. At most one or two AI images, only for atmosphere (an empty platform, rain), never depicting the event or real people; if used, tick YouTube's altered/synthetic content disclosure.
- Copyright: US works published 1930 or earlier are public domain. 1931 to 1963 newspapers are usually public domain (copyright not renewed) and Chronicling America believes its pages are public domain, but wire photos inside them can still be protected. Post-1963 material needs licensing; avoid it.
- Fact-check every claim (FBI history pages, Wikipedia and its sources, the period papers themselves). Hedge contested theories ("investigators said", "many historians").

## First use
```bash
SKILL_DIR="<base directory of this skill>"
KIT=$(python3 -c 'import os,sys;print(os.path.realpath(os.path.join(sys.argv[1],"..","..","kit")))' "$SKILL_DIR")
[ -x "$KIT/.venv/bin/python" ] && [ -d "$KIT/models" ] || bash "$KIT/setup.sh" --voice   # ~1 GB voice models, once
PY="$KIT/.venv/bin/python"
```
Needs ffmpeg, Node 18+, Python 3.9+. In a cloud container with a preinstalled Chromium, set `CHROME=/opt/pw-browsers/chromium` (render.mjs uses it instead of Playwright's own download).

## Steps
1. **Script.** 90 to 120 words, 35 to 50 s at the dark pace. Sentence 1 is the hook. Then place and date, the setup, the turn, the cost, the twist, the consequence. One idea per sentence. Show it to the user before building. Write numbers as digits in `script` and how to say them in `say` (`{"1933": "nineteen thirty-three"}`), so captions show `1933`.
2. **Sources.** From the reel folder:
   `python3 "$SKILL_DIR/tools/loc.py" search "nash kansas city" --from 1933-06-17 --to 1933-06-19 --front`
   then `python3 "$SKILL_DIR/tools/loc.py" fetch <loc.gov resource or item url> <name>` (newspaper page, or a Prints & Photographs item) (saves `assets/<name>.jpg`, its OCR `.xml`, and source/rights `.json`). Look at the pages (downscale with ffmpeg and view) and pick the strongest headline for the hook. Record every page in `reel.json` `assets` so the reel can be refetched.
3. **Frame.** `python3 "$SKILL_DIR/tools/loc.py" find <name> "GUNMEN KILL 4 OFFICERS"` prints the phrase's box. Shots can use `{"find": "..."}` directly; the planner resolves them.
4. **Spec.** Write `reel.json` (format below), one shot per sentence or half-sentence, 2.5 to 5 s each. Open with a headline already moving; use the signature move (`"from": "page"` to a headline) at least once; end by pulling back to the hook page.
5. **Stills.** `bash "$SKILL_DIR/make.sh" <reel> stills 0.5,4.5,9,15` makes the voice, word timings and plan, then writes `build/stills/`. Check: headlines readable, ink marks on the right words, captions (y about 1330) clear of faces, the series label not covering text.
6. **Build.** `bash "$SKILL_DIR/make.sh" <reel>` (about 3 minutes on 4 cores for 45 s; `WORKERS=8` on bigger machines). Writes `<reel>/<folder name>.mp4`. Remake the voice with `VOICE=1`; use your own narration by putting it at `audio/vo.wav` (44.1 kHz mono).
7. **Hand over** the mp4, plus `build/description.txt` (sources with loc.gov links, and an AI disclosure note if any shot used `"ai": true`) for the video description.

## reel.json
```json
{
  "series": "One front page, one crime",
  "voice": {"name": "am_onyx", "speed": 0.9, "pitch": -1.0, "gap": 0.32},
  "script": ["Four lawmen died at a train station, trying to move one prisoner.", "..."],
  "say": {"1933": "nineteen thirty-three"},
  "emph": ["four", "dead"],                 // caption words drawn in red
  "bed_db": -14,                            // music + SFX level under the voice
  "assets": {"wt0617": "https://www.loc.gov/resource/sn84026749/1933-06-17/ed-1/?sp=1"},
  "shots": [
    {"line": 0, "img": "wt0617", "in": "cut", "sfx": ["hit"],
     "from": {"find": "GUNMEN KILL 4", "pad": 0.04}, "to": {"find": "AND PRISONER", "pad": 0.06},
     "marks": [{"find": "4 OFFICERS", "style": "box", "at": 1.6}]},
    {"line": 1, "img": "es0617", "in": "flash", "stamp": "KANSAS CITY · JUNE 17, 1933", "sfx": ["flash", "type"],
     "from": "page", "to": {"find": "GANG GUNS SLAY FOUR OFFICERS", "pad": 0.25}},
    {"line": 2, "img": "es0617", "layout": "clip", "rot": -2, "clip": {"box": [0.148, 0.268, 0.262, 0.402]}}
  ]
}
```
- Shot timing: `line` (sentence index) and optional `word` (index inside it) and `offset`; a shot runs until the next one starts, so timing follows the voice automatically.
- Views (`from`, `to`, `clip`): `"page"`, `{"find": "...", "pad", "nth", "grow": [l,t,r,b], "zoom"}` or `{"box": [x0,y0,x1,y1]}` (normalized). The camera fits the view into the frame; `zoom` > 1 pushes in.
- `layout: "clip"` cuts the region out as a clipping on the dark blurred page (portraits, small items); it sits high so captions stay clear.
- `in`: `cut`, `fade` (default), `flash`, `black`. `marks`: `box` or `underline` in red ink, `at` seconds into the shot. Newspaper lines are tight: prefer `box` over `underline`, and keep a mark to one line of text.
- Other shot kinds (`"kind"`):
  - `photo`: any still that fills the frame (`img` in assets/, `from`/`to` boxes). Small or landscape photos look better as `"layout": "clip"` (a print on the dark page) than stretched to fill. Add `"label": "UNION STATION · c. 1910-30"` when the picture isn't of the event itself.
  - `card`: `{"kind": "card", "text": "30 seconds", "style": "number|quote|title", "sub": "..."}` stamped on aged paper.
  - map `drawings` (preferred over boxes; boxes read as abstract): `{"type": "car", "x", "y", "w", "face": "right|left", "occupants": [{"seat": "front-left|front-right|rear-left|rear-mid|rear-right", "label", "line", "word", "dx", "side"}], "driver": {"label", "line", "x_line", "x_word"}}` draws a top-down 1930s sedan with people placed in its seats and a red X on cue; `{"type": "station", "x", "y", "w", "label"}` draws Union Station's front (three arches, wings). Add new drawing types to `engine/main.js` next to `drawCar` when a story needs another object; draw the real thing, not a labelled rectangle.
  - `map`: an ink diagram drawn in code, auto-labelled ILLUSTRATION. `blocks` `[x0,y0,x1,y1,"LABEL"]`, `points` `{x,y,label,align,dy}`, `route` `[[x,y],...]` (red, draws itself), `xs` `{x,y,label,at}` (red X), `title`. Coordinates 0..1 inside the map area. Keep it schematic; don't invent precise positions.
  - `footage`: an archive film clip at `assets/<img>.mp4` (`from_s` = start second in the clip); frames are pre-extracted and graded like the pages. Public-domain sources only (e.g. US government newsreels, Prelinger, LoC); most newsreels after 1930 are not.
  - AI images: `"ai": true` on the shot adds an "AI ILLUSTRATION" tag and a disclosure note in `build/description.txt`.
- End card (every reel, from channel.json `outro`): a case-file checklist, LIKE / FOLLOW / SUBSCRIBE, each box ticked in red as the narrator says the word, then FOR MORE. The narrator says `outro.say` (default "Like, follow, and subscribe for more.") after a `pause` of 1.3 s; the card appears `lead` 0.7 s before the voice and holds `hold` 1.4 s after. `"outro": false` in a reel drops it.
- Mid-video prompt (off by default): `"cta_mid": {"line": 6, "text": "Follow for part 2", "dur": 2.6}` shows a small pill under the captions.
- `sfx`: `stamp`, `hit` (low boom), `flash` (camera flash), `paper`, `type` (with a stamp), `burst` (distant muffled gunfire, use once), `drop` (the score cuts out for a beat; use on the deaths).

## Style
- No series label on screen (`series_label` stays false unless the user asks for it).
- Monochrome sepia grade, grain, flicker, vignette. Red (#c4161c) is the only colour: ink marks and emphasised caption words.
- Captions: Inter Tight 800, uppercase, 1 to 3 words, never ending on "the/a/to/of"; safe area x 100 to 980, y 220 to 1500.
- Narration: Kokoro `am_onyx` (the lowest free voice, ~87 Hz) slowed and pitched down 1 semitone with a little room. For release quality, swap in a human or ElevenLabs take at `audio/vo.wav`.
- Score: low drone, a heartbeat pulse that quickens, a faint high tension tone that swells, all made in code and ducked under the voice.

## Files
`tools/loc.py` archive search/fetch/find · `tools/voice.py` Kokoro + darkening · `tools/align.py` word timings · `tools/plan.py` spec to timed plan · `tools/audio.py` score + SFX + mix · `tools/render.mjs` Playwright frames · `engine/` the canvas renderer · `make.sh` all of it.

## Long form (16:9, 5 to 10 minutes)
A film is a folder of chapter reels, built one by one and stitched frame-exact:
```
reels/<film>/film.json        {"title", "format": "16:9", "outro": false, "chapters": ["01-open", "02-trusty", ...]}
reels/<film>/01-open/reel.json     cold open: no intro card, ends on a title card shot
reels/<film>/02-trusty/reel.json   "intro": {"part": "Part one", "title": "The trusty", "sub": "Leavenworth · 1924-1930", "dur": 6}
reels/<film>/08-after/reel.json    "outro": true  (the spoken end card, only once, at the very end)
```
- Write the whole script first (`SCRIPT.md`, 750 to 1,200 words, 6 to 8 chapters of 60 to 90 s, one beat each) and get it approved. Then build chapters.
- `intro` makes the narration start after `dur` seconds of silence (5 to 10 s) while a title card plays: PART label stamped, headline typed, place/date typed, over the chapter's first page blurred. Chapters fade to black at the end and in from black at the start, so the seams read as deliberate pauses.
- List the written sources for the narration in `film.json` `"references"` (they go into the description under the archive list).
- `bash "$SKILL_DIR/film.sh" reels/<film>` builds every chapter (`NOMUX`), concatenates video and audio (each chapter's audio is cut to its exact frame count), normalises loudness once, and writes `<film>.mp4` plus `build/description.txt` with YouTube chapter timestamps and all sources. `CHAPTERS="03 05" film.sh ...` rebuilds only those chapters.
- 16:9 layout: subtitle-style captions (up to 6 words) at the bottom, wider map area, clippings framed in the centre. `"format": "9:16"` (or `FORMAT=9:16` in the environment) renders the same chapter vertically, which is how a Short is cut from a chapter.
- Render time is about 3.5 minutes per minute of video on 4 cores; run long builds in the background.

## Voices
- `kokoro` (default): free, fast, robotic over long durations. `am_onyx` is the deepest.
- `chatterbox`: Resemble AI's open model (MIT licence, free, commercial use OK). Much more natural; about 5x slower than real time on CPU (an 8 minute film takes about 40 minutes of voice generation; the per-line cache in `audio/cb_lines/` means a rerun only redoes changed lines). Set `"voice": {"engine": "chatterbox", "ref": "../../voices/ref_onyx.wav", "exaggeration": 0.35, "cfg": 0.35}`; `ref` is a 5 to 10 s sample whose voice it imitates (use only a voice you own or have permission for; `reels/voices/ref_onyx.wav` is the synthetic Kokoro onyx voice). Lower `cfg` means slower, more deliberate delivery. Outputs carry Resemble's inaudible watermark. Install once: `python3 -m venv kit/.venv-cb && kit/.venv-cb/bin/pip install torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cpu && kit/.venv-cb/bin/pip install chatterbox-tts`.
- Your own recording: put it at `audio/vo.wav` (44.1 kHz mono) and the pipeline times everything to it.

## Sound effects: real recordings (real-sfx)
With `"sfx": "real"` (the channel default in `reels/channel.json`), the effects are real recordings placed by the
`real-sfx` skill instead of being synthesized:
- `audio.py` still builds voice + score, but leaves the synthesized effects out and writes `build/cues.json`, a typed
  event list on the exact frames: `paper` (page cuts), `camera` (flash cuts), `hit`, `thump` (stamps, end-card ticks),
  `key` (typed stamps and titles: cut into real typewriter keystrokes), `gunshot` (a burst of real single shots).
- `make.sh` (Shorts) and `film.sh` (long form, over the whole stitched film) then run `tools/real_sfx.sh`:
  `from_cues.py` -> `mix.py --voice-safe` -> `critique.py`. Output: the final mp4, `build/rsfx/critique.md` (scoreboard)
  and `build/rsfx/listen.wav` (the moments to check by ear: Claude cannot hear, the person should).
- Tuning lives in `channel.json` `"real_sfx"`: `map` (per kind: ids or a pick, and `gain_db`), `keys_db`, `voice_depth`.
  The current values came from five critique rounds on the Kansas City Short: impacts and paper low (they land on cuts
  in mid-sentence), keystrokes +4 dB, light ducking. `ids` refer to `real-sfx/library_index.json`; after rebuilding the
  index, check them with `python3 ../real-sfx/scripts/search.py --role hit`.
- The library: `.claude/kit/sfx/mixkit.csv` lists 38 Mixkit recordings (typewriter, vintage camera shutter, reporters'
  flashes, newspaper pages, impacts, a distant gunshot, projector hum, train station). Mixkit's licence allows use in
  videos but not redistributing the files, so they are not in git: `python3 .claude/kit/sfx/fetch.py`, then
  `python3 .claude/skills/real-sfx/scripts/setup.py init --library noir=<abs path>/.claude/kit/sfx/library --index`.
  To add a sound: a row in `mixkit.csv` (type = whoosh, impact, camera, paper, typing, foley, ambience, atmosphere,
  other), fetch, rebuild the index.
- Known limits: there is no real machine-gun recording in the library (the burst repeats one gunshot, so the critique's
  `variety` axis stays near 6); `"sfx": "synth"` in a reel brings back the old synthesized effects.

## Ears: earshot
earshot (github.com/Leonxlnx/earshot, MIT, pinned at 591fa3e) runs locally in `kit/.venv-earshot` with two open models
(CLAP + an AudioSet tagger, ~1.1 GB in `~/.cache/earshot`, fetched once). It turns sound into evidence:
- **Library audit** (`kit/.venv-earshot/bin/python kit/sfx/audit.py`): every file is matched against what its row in
  `mixkit.csv` says it is, and checked for being a real recording; writes `kit/sfx/audit.json`. Run it after adding
  sounds; drop or refile anything flagged. (It caught a synthesized "projector", a crowd filed as a shutter, a
  "gunshot" that is an explosion, and short paper files that are not page turns.)
- **Slicing long recordings**: `earshot find FILE "a single page being turned" --top 3` gives start/end seconds of the
  best moments; use them as `{"id": N, "slice": [a, b]}` in `real_sfx.map` (that is how paper variety went 1.0 -> 8.4).
- **After every build** `tools/real_sfx.sh` runs `earshot timeline FINAL --cues build/cues.json`: how many cue frames
  get a sound within 40 ms, and what the film sounds like section by section (`build/rsfx/earshot_timeline.txt`).
- Also useful: `earshot match FILE "description" --alts ...` before adding a sound, `earshot describe FILE`,
  `earshot realness FILE`. Each CLI call loads the models (~30 s); batch work goes through `from earshot import api`.
- Not used: `earshot forge` / the `sfx` bank (they synthesize sound; this channel uses real recordings) and the repo's
  `real-sound` skill (it duplicates real-sfx).
- Install: `python3 -m venv kit/.venv-earshot && kit/.venv-earshot/bin/pip install torch --index-url
  https://download.pytorch.org/whl/cpu && kit/.venv-earshot/bin/pip install "earshot @ git+https://github.com/Leonxlnx/earshot@591fa3e"
  && kit/.venv-earshot/bin/earshot doctor --fetch`.
