# Animate

Before planning, editing or rendering any video in this repo, read `EDITING.md` (the house editing rulebook) and audit
the film against its section 5 before a full render.

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
