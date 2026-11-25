# Animate

Before planning, editing or rendering any video in this repo, read `EDITING.md` (the house editing rulebook) and audit
the film against its section 5 before a full render.

**The hook gate, for every new Short, video or script, on every channel.** Before any voice is recorded, write at least five
candidate hooks against the 21 formulas in `.claude/skills/yt-script/hooks.json` into `<film>/hooks.txt`, put the chosen one as
line 1 of `<film>/script.json`, and run `python3 reels/hookgate.py <film>`. It must pass (5.5 s or less spoken, score 60 or more, the top scorer or
within 5 points of it) and its `hooks_report.txt` stays with the film. Write the hook and the title as a pair: line 1 confirms
what the title promises. Finished films are not reopened for their hooks; the gate exists so they never need to be.

## "Now What, Sam?" films (`reels/howto/`)

- **The gate.** Before any full render, run `GL=swiftshader node reels/howto/engine/check.mjs <film>` from the repo root. It
  must report **0 errors**; open the still of every warning and judge it. It catches the faults we have shipped: camera inside a
  solid, feet floating or sunk, a body inside an object, walks stepped by the clock, code commented out by a mid-line `//`,
  faces cut off or under the captions.
- **Build on the shared code, never copies of it.** `engine/walk.js` (walks and runs stepped by distance), `engine/storybook.js`
  (the look, the cast finish, the palette, the painted cross drawn on top, real windows, trees, paths, ponds, the sun that follows
  the camera). A fix belongs there, so every film gets it.
- **Then the standing checks** in `reels/howto/REGRESSIONS.md`, and a still of every shot looked at full size before the render.
  Clear the stills folder before each contact sheet.

## "Ten Years On" money films (`reels/money/`)

- **Props come from the prop library** (`reels/money/look2/props/`): 3D models in real metres, drawn from the scene's camera, so size
  and angle are right by construction. A new object is added there first and checked on `props/sheet.html` (three angles beside a
  1.75 m person) before it appears in a film. Sizes for anything else come from `look2/scale.js`. Never size a prop by eye.
- **The gate:** `node reels/howto/moneylook/check2d.mjs /money/<scene>.html` must report 0 errors before a render: no label covered
  or cut off by the frame, no character (while he is the shot's subject) too small or cut off.
