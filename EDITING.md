# Editing rulebook

House rules for every video made in this repo, whatever the channel or style. They come from two references studied
in November 2026 (a walkthrough of a code-made 3D Short that copies a viral format, and a "sneaky editing tricks"
breakdown of large YouTube channels) and from our own review of the first Overpass film. Each rule has a number you
can measure, so a film can be audited before it is rendered in full.

## 1. Process

1. **Study, then write it down.** For a new style or channel, collect 5–10 reference videos, go through them from
   stills (camera, cuts, colour, light, type, script pattern) and save the findings as a rulebook next to the style.
   Never guess a style from its name.
2. **One still first.** Rebuild one reference frame side by side until composition, outline, shading and palette match.
3. **Then five seconds.** A 5 s moving test at low resolution, checked against the rules below, before any full build.
4. **Then the hook.** Build and review the first 30–45 s on its own. If the hook is weak the rest is not worth rendering.
5. **Say the look in full.** List every property (3D or 2D, outlines, camera, depth layers, focus). Anything left
   unsaid comes back generic.
6. **Stills of every shot before a full render.** A full render is the last step, not a way to look at the work.
7. **Rendering.** Cloud sessions have no GPU; long 3D renders belong on a local machine with one when available.

## 2. Script

- **Open on the impossible-sounding fact**, in the first sentence, then explain why it is true. No scene-setting first.
- State the stakes (who loses what) inside the first 15 s, and the question the video answers inside 30 s.
- One idea per sentence. A new picture for every sentence.
- Every number is sourced; both sides of a dispute are stated in their own terms.

## 3. Picture

| Rule | Target |
|---|---|
| Shot length | 3–5 s average; 7 s is the ceiling unless something inside the shot changes (a count, a fill, a reveal) |
| Camera | never static: every shot travels (push, crane, orbit, track). A hold is a choice, used once or twice a film |
| Depth | three layers in frame where the shot type allows: something in front, the subject, a background; background softer than the subject |
| Subject position | the thing to look at sits within about 10% of where the last shot's subject was. Centre-frame through the first 30 s; break it on purpose afterwards |
| Labels | live in the scene where possible (on the terrain, on the map, on the object), not floating over it. Overlay text stays near the subject, never at the far side of the frame |
| Emphasis | one word or number per beat gets the accent: colour change, underline stroke or highlight bar. Never the whole line |
| One look | one palette, one light direction, one type system per film |
| Comparisons | slide the second picture in from the side while the first shifts over; do not cut to a split screen |
| Titles | arrive with a move (slide down, push), eased, not a fade on a dark card |

## 4. Sound

- **Creative sound design is planned, not sprinkled.** Risers lead up to a reveal, whooshes ride camera moves and
  transitions, hits land after the important sentence, drones hold tension under a problem.
- Target: 8–13 cues in the first 20 s, then at least one cue per cut or reveal. Every cut that moves gets a whoosh;
  every number that lands gets a hit.
- Real recorded sounds only (see the `real-sfx` skill). The cue list is written with the shot list.
- Narration: trim silences; let the next line's sound start under the end of the previous picture (J-cut) and the
  picture change before the line ends (L-cut) so cuts never sit on dead air. No gap over 0.6 s inside the hook.

## 5. Audit before render

Measure and write down, per chapter: number of shots and average length; longest static stretch; cues in the first
20 s; largest jump of the subject between neighbouring shots; seconds until the hook fact is spoken. A film that
misses the targets in §3 and §4 goes back to the edit, not to the renderer.

## 6. What transfers to a new channel

The rules above are style-free. A new channel ("how to", "what if this happened to you", "did you know") needs its own
style rulebook (§1.1) on top: character design, set-building, palette, script pattern. The repo already has the parts:
`zach-d-films` (three.js 3D sets, depth of field, bloom, camera moves), `stick-figure` (2D characters, word-timed
captions), `real-sfx` (sound design), `lemo-opuscar` (data and archive films). Flat 2D characters standing in a toon-shaded
3D set with ink outlines is those first two combined plus an outline pass; design our own characters, never copy a
channel's.
