// The edit: "Caught in a thunderstorm? Do NOT shelter under a tree". For now one test shot that proves the storm.
import { makeWorld, TREE, hillY } from './world.js';
import { director } from '../../engine/film.js';
import { pr, lerp, ease } from '../../engine/toon.js';
export { CAPTIONS, DURATION, WARP } from './captions.js';
const D = director(makeWorld, [[2.4, .05]]), shot = D.shot, io = ease.io;
shot(0, 41, (lt, t, u, w) => { const k = pr(lt, 0, 5), su = pr(lt, 2.4, 2.75), sx = TREE[0] - .5, sz = TREE[2] + 1.7;
  w.cam([lerp(-9.6, -8.8, io(k)), lerp(1.0, 1.2, k), lerp(6.4, 5.0, io(k))], [TREE[0] + .2, lerp(4.6, 4.9, k), TREE[2]], 56);
  w.act('sam', sx, sz, { view: 'q', face: 1, armL: [-1.9, -.6], armR: [1.9, .6], mouth: lt > 2.4 ? 'shout' : 'o', brow: .9, sweat: 1, eyes: [-.3, -.8], bob: 4 * Math.sin(t * 5) }, false, hillY(sx, sz));
  const flash = w.bolt([TREE[0] + .2, TREE[1] + 6.4, TREE[2] + .4], su); w.ground([TREE[0], TREE[2]], pr(lt, 2.45, 3.3));
  return { focus: 8, blur: .5, rain: 1, flash }; });
export const SHOTS = D.SHOTS();
