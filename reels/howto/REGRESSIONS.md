# Standing checks

Every fault reported on a film stays here and is checked on every later one (`STYLE.md` rule 14). Add a row; never remove one.

| # | Reported on | The fault | The check on every film |
|---|---|---|---|
| 1 | ripcurrent | The video was too short (30 s). | 35 to 45 s; if the voiced script is shorter, add sourced content. |
| 2 | ripcurrent | Effects as loud as the voice. | Measure both stems: effects about 10 dB under the voice. |
| 3 | ripcurrent | Motion between shots and camera movement lacking. | A transition on every cut, camera travel in every shot; `look.py` movement score inside its human band. |
| 4 | ripcurrent | Captions under the Shorts player's own text. | Captions end by 78% of the frame height; faces clear of them. |
| 5 | greasefire | An arm with no body in the close shots. | No limb without its character in frame. |
| 6 | greasefire | The character ran through a closed door. | Nobody passes through anything solid; doors are real openings, worked by a hand. |
| 7 | greasefire | (found in review) The jug and the extinguisher moved with nobody holding them. | Every moving prop has a visible owner. |
| 8 | greasefire | The character faced the camera while working at the stove. | Side view for working at something, three-quarter for reacting, front for speaking to the viewer. |
| 9 | greasefire | The vertical-smear transition broke the picture into bars. | No vertical whips. On every cut, the review strips show picture content in every frame: no bars, combs or streaked lettering. |
| 10 | greasefire | (found in review) The fire burned in silence. | Everything on screen that would make a sound has a real recording of that thing: check the cue list against the shot list before mixing. |
| 11 | thunderstorm | (found in review) Sam popped into the car through a closed door. | Entering anything is shown: a hand on the handle, then a cut inside. |
| 12 | thunderstorm | The lying pose, the car interior, the house interior, the clock and the thunderbolt all needed more work. | Interiors are built, poses are drawn, facts sit on objects, effects have a life (`STYLE.md` rules 18 to 21). |
| 13 | thunderstorm | The last sentence, "Call for help", had no breathing room and could barely be heard. | The closing line has a pause before it and at least 1.3 s after it; no long sound tail or whoosh runs under it; its level is measured against the rest of the voice. |
| 14 | thunderstorm | (found while building gasleak) An edit to the character code commented out the reach code, so two cuts went out with hands that did not reach. | After any change to `engine/`, render one still of each pose type (reach, lie, kneel, sit, every view) on the model sheet and in each film that uses them, and look at them full size before rendering a film. Never put a `//` comment in the middle of a line of code. |
