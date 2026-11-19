# Standing checks

Every fault reported on a film stays here and is checked on every later one (`STYLE.md` rule 14). Add a row; never remove one.

Checks marked **auto** are run by `engine/check.mjs` before every full render (0 errors required): 6 (passing through), 14 (commented-out code), 17 (feet on the surface), 19 (camera inside a solid), 20 (on the treads), 23 (stepped by distance). 22, 24 and 25 are built into `engine/storybook.js`, so a film that uses it cannot repeat them. The rest are judged on the stills.

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
| 15 | gasleak | The smell signs looked wrong (thick green squiggles). | A cue a viewer already knows: for a smell, thin wavy strokes in threes over a pale haze, see-through and fading. |
| 16 | gasleak | The emergency van was a plain box. | Every vehicle has its parts: glass, wheels with hubs, lights, bumpers, and its livery. |
| 17 | gasleak | Standing on the pavement hid the feet. | Characters stand on the surface height of whatever they are on (pavement, path, step, road). |
| 18 | gasleak | A reaching hand or arm was cut off. | The character card is wide enough for a full reach; check every reach shot full size for a whole hand. |
| 19 | gasleak remake | The street camera stood inside the house across the road: walls vanished (they only draw from outside) and its windows, door and roof floated round the lens. | No camera is ever inside a solid. For every shot, check the camera's path against every building's footprint, and keep it at least 2 m clear of a facade unless the shot is about that facade. |
| 20 | gasleak remake | Someone coming down the stairs walked just in front of them, outside the rail. | A character on stairs walks on the treads: inside the stair's width, behind its rail, feet at the tread height. |
| 21 | gasleak remake | An opening door showed a brown slab, not a room. | Every door that opens shows a real space behind it (a lit hall, a room, the street), built as geometry with a hole in the wall, never a painted slab. |
| 22 | gasleak remake | Windows showed brickwork through their frames: the glass sat behind the wall face. | Every window shows glass in front of the wall (a pane that reads as glass at phone size: tone, a sky streak, a curtain edge). Check one window full size in every exterior shot. A door sits in a frame with no gap showing past it when shut. |
| 23 | gasleak remake | Feet slid on walks and runs: the legs swung on the clock, not with the ground. | Step every walk and run by the distance covered (one stride cycle per 1.1 m walking, 2.2 m running), never by time. |
| 24 | gasleak remake | The red ✕ marks cut through the objects they crossed out. | A mark that comments on the picture is drawn on top of it (no depth test), placed beside its object, never standing inside the set. |
| 25 | gasleak remake | Replacing "big balls" with trees also swapped the house roofs for tree tops; a handrail ran through the middle of its spindles. | When a pass picks objects by size, match the shape type too, and look at every building after it runs. A handrail sits on its spindle tops along the whole flight. |
| 26 | thunderstorm remake | Sam lying flat at the edge of the hill: the grass covered his head. | Every point of a lying body, feet to head, sits above the ground under it (auto). Lay people down on flat ground, clear of slopes. |
