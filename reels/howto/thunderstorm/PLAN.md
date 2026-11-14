# Video 3 plan: "Caught in a thunderstorm? Do NOT shelter under a tree"

Status: script drafted and sourced; nothing built. Follows `../STYLE.md` and the standing checks in `../REGRESSIONS.md`.

## Shape
About 144 words, 38 to 40 s with the Fenrir voice, about 20 shots. Pattern: three wrong instincts stopped by the red
cross (tree, lying flat, crouching), the rule (thunder means in range), the fix (building or car), what does not count
(tent, porch, picnic shelter), the last resort (off the hill, away from water and fences, spread out), the wait, and
helping someone who was hit. The last line returns to someone caught outside, so the Short loops into its first line.

## The set: a park under a storm
- Ground: a grassy hill with one tall tree on top, a pond, a wire fence, a path.
- Shelters: a house with lit windows, a car, a tent, an open picnic shelter.
- Sky: dark storm cloud bank with a lighter horizon, so characters still read against it.
- Weather: rain streaks falling through every exterior shot, lightning bolts as flat drawn cards, a white flash on each strike, wet ground sheen.

## Characters
Sam, plus one new friend (a second look on the same rig) for "spread out" and for the person who is hit.
Views: side for running, three-quarter for reacting, front for the phone call. One new pose: lying on the ground.

## What has to be built
1. Storm lighting: a dark stage preset and a one-frame-to-white flash that decays (new, in the engine).
2. Rain: a layer of streak cards that falls with the camera (new).
3. Lightning bolt and side-flash cards; a current ripple on the ground for "ground current" (new, in this film).
4. Park props: tree, hill, pond, fence, house, car with a door that opens, tent, picnic shelter (new).
5. A lying pose for the rig, used for "do not lie flat" and for the person who is hit (new, in the engine).
6. Sounds, all real recordings: a rain bed, close and distant thunder, wind, footsteps on wet grass, a car door, a house door. The library has none of these; they must be found on Mixkit by id and added to `kit/sfx/mixkit.csv`.

## Risks
- The struck friend: shown without injury detail (a flash, the friend sitting dazed on the ground, Sam helping and phoning). Tone stays general-audience.
- Sound sourcing: if no usable thunder or rain recording can be fetched, the film must wait, because synthesised sound is not allowed and a silent storm will not work.
- "Crouching" was official advice for years; line 4 follows the current National Weather Service page, quoted in `SOURCES.md`.

## Steps and checkpoints
1. Script approved by the user (this document).
2. Voice, word timing, captions; find and fetch the sounds.
3. Look test: one still of the storm park with Sam under the tree. User check.
4. Build the shots; stills of every shot; first cut.
5. Technical checks, then `engine/review.py` strips for every cut and contact, then the standing checks.
6. User review, fixes, upload sheet and cover.
