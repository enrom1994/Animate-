// Look test: the piazza, the tower, tourists doing the famous "holding it up" pose.
import { makeWorld } from './world.js';
import { director } from '../../engine/film.js';
import { pr, lerp, ease } from '../../engine/toon.js';
export { CAPTIONS, DURATION, WARP } from './captions.js';
const D = director(makeWorld, []), shot = D.shot, io = ease.io;
shot(0, 2, (lt, t, u, w) => { w.cam([52, 1.2, 4], [45, 1.2, 3.6], 40); w.act('t1', 45, 3.6, { view: 'side', face: -1, armL: [-1.85, -.15], armR: [-1.65, -.25], mouth: 'grit', brow: -.4, lean: -.15 }); return { focus: 7, blur: 0 }; });
shot(2, 4, (lt, t, u, w) => { const k = io(u); w.crowd(t);
  w.cam([lerp(60, 57, k), 1.4, lerp(6.4, 6, k)], [0, 18, 0], 50);
  w.crowd(t);
  w.act('t1', 45, 3.6, { view: 'side', face: -1, armL: [-1.85, -.15], armR: [-1.65, -.25], mouth: 'grit', brow: -.4, lean: -.15 });
  w.act('sam', 46.4, 7.4, { view: 'q', face: 1, armL: [-.3, .2], armR: [2.6, .6], mouth: 'smile', eyes: [.6, -.3] });
  w.act('t2', 45.6, 9.0, { view: 'q', face: 1, armL: [.3, .2], armR: [2.0, 1.2], hold: 'phone', mouth: 'smile', eyes: [.6, -.2] });
  return { focus: 13, blur: .4 }; });
export const SHOTS = D.SHOTS();
