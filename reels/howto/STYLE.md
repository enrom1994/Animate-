# Now What, Sam? — style rulebook

The channel's own rules, on top of `EDITING.md` (which applies to every video in the repo). Written from the first two
films, `ripcurrent` and `greasefire`, and from the notes given on them.

## The look
- **World:** a real 3D set with flat three-step shading, one ink-outline pass over everything, soft blur on what is far or very near.
- **People:** flat 2D characters drawn in code (`engine/char.js`) on cards that face the camera: a soft-square head with a
  hair swoop or cap, big eyes, a bean body, thick ink limbs. Sam wears an orange top and blue shorts in every film.
- **Palette:** sun yellow `#ffd23f`, ink `#1d1a26`, alarm red `#e6232e`, sea blue `#1b8fd0`, teal `#2bb6a8`, cream. One accent word per caption in yellow.
- **Marks:** the red cross for "do not", yellow arrows and dashed paths for "do this", painted on a surface in the scene where possible.

## Views
Every character has four views, each usable facing left or right: front, three-quarter, side and rear
(`view: 'front' | 'q' | 'side' | 'back'`, `face: 1 | -1` in the pose, or `toward: [x, z]` to let the camera position pick).
The model sheet is `engine/sheet/turnaround.png` (`node engine/sheet/make.mjs` redraws it).
- Working at something (a stove, a door, a tap): side view, facing it.
- Reacting to something beside them: three-quarter, turned toward it.
- Speaking to the viewer, or the reaction is the point of the shot: front.
- Walking or looking away from the camera: rear.

## Rules that came from review
1. **A hand always has a body.** Never show an arm or hand on its own. A character reaches with its own arm
   (`reach: [x, y, z]` in the pose) and the whole character is in the frame.
2. **Nobody passes through anything solid.** Doors are real openings in real walls; a character goes through the
   opening and the door is opened or closed by a hand on its knob. The same holds for furniture, water lines and props.
3. **The character never hides the subject.** If Sam stands between the camera and the thing being shown, move the camera to the side and back.
4. **Motion between shots:** every cut has a sideways whip or a zoom burst (never a vertical whip: on a tall frame it turns lettering and faces into streaks); every shot arcs or cranes, lands with a short push-in, and carries a slight handheld drift; hits shake the frame.
5. **Sound:** the voice is Fenrir (Kokoro, speed about 1.06 to 1.1). Effects sit about 10 dB under the voice (`"sfx"` in `cues.json`). Real recordings only.
6. **Captions:** one to three words, lower case, ending at 78% of the frame height; the picture sits slightly high so faces stay clear of them.
7. **Length:** 35 to 45 seconds. If the voiced script comes in under 35, add sourced content, never padding.

## Acting, review and sound rules adopted from `kaomei/stickman-video-director` (MIT)
Read in November 2026. That project directs stick-figure films through paid image and video generators, so its pipeline,
artwork and characters are not used here. These rules transfer:
8. **Every prop has an owner.** A thing that moves is held, pushed, thrown or dropped by a character we can see doing it. Held things sit at chest height, beside the body: an arm raised above the shoulder disappears behind the head.
9. **An action has phases:** a small wind-up, the move, the contact, a release, a recovery (`ease.anti` gives the wind-up and settle). The body and the eyes go first; a hand sliding to a target on its own is not acting.
10. **A move must mean something.** If deleting an animated mark, arrow or gesture would lose nothing the voice says, delete it.
11. **Screen direction holds across cuts.** A character facing left at the stove faces left in the next shot of the same action.
12. **A plan is not evidence.** A shot's name or description does not show the effect exists; only rendered frames do. A contact sheet finds problems but cannot show movement.
13. **Three separate decisions, never merged:** the technical checks (file, loudness, `look.py` gates), the motion review (`engine/review.py`: both sides of every cut, every contact frame by frame, the opening at phone size), and the user's own decision. Nothing the first two say counts as the third.
14. **A rejection becomes a standing check.** Every fault the user reports goes into `REGRESSIONS.md` and is checked on every later film.
15. **What was not watched is reported as not watched.** Stills and measurements are named as such; a playback or listening claim is made only if it happened.
16. **Sound has three layers:** a bed for the place that changes when the place does; contact sounds matched to the material (metal, wood, water, fire are not interchangeable); and a few emotional accents. Speech, then action sounds, then music. If an effect is weak, look at its source, timing and what masks it before raising its level.
17. **The loudest instant of a sound sits on the contact,** not the start of the clip (`engine/mix.py` does this).

## Publishing kit (same source)
Each finished film gets, in `UPLOAD.md`: five distinct accurate titles (search intent, curiosity, broad appeal), a description with verified source links only, tags, one pinned question, and a pre-publish checklist where every line is marked checked, pending or not applicable. A cover frame is checked at phone size. No promise about views, and no claim that rights or monetisation are cleared beyond the licences recorded.

## Script pattern
1. The trouble and the wrong instinct in the first sentence ("If X happens, do not Y").
2. Why the instinct fails, shown happening.
3. One or two more wrong moves, each stopped by the cross.
4. "Instead": the steps, one per shot, in order.
5. The limit: when to stop trying and get help.
6. Prevention, ending on an image that loops back to the first line.

Every line is checked against an official source and quoted in the film's `SOURCES.md`. Anything no source supports is left out and listed there.

## Building a film
`engine/` holds the renderer, characters, film helpers, re-timing and the sound mixer. A film is a folder with
`script.json`, `captions.json` (accent words), `cues.json` (sound), and `src/set.js`, `src/world.js`, `src/shots.js`.

    python3 engine/retime.py <film>                      # after a voice take: captions and timing
    node engine/render.mjs <film> stills 1.5,4 <dir>     # look at every shot before a full render
    node engine/render.mjs <film> video <film>/silent.mp4 30
    python3 engine/mix.py <film>                         # then join picture and sound with ffmpeg

Before sending: the `motionmaxxing` `look.py` gates pass, the movement score is inside its human band, and a contact
sheet has been checked against rules 1 to 3 above.
