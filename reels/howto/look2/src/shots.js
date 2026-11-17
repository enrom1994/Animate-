// Look test 2: one frame indoors, one outdoors, in the richer style (textured surfaces, warm soft light, thin ink, haze and dust).
import { makeWorld, ST } from './world.js';
import { director } from '../../engine/film.js';
export { CAPTIONS, DURATION, WARP } from './captions.js';
const D = director(makeWorld, []), shot = D.shot;
export const LOOK = { inkK: .55, normK: .3, haze: ['#f2d9ae', .3], dust: .18, warm: .6 };
shot(0, 1, (lt, t, u, w) => { w.sun([0, 0, -1], [-9, 6, -1.5], 6);
  w.cam([2.2, 1.3, 2.5], [-1.1, 1.15, -2.0], 50);
  w.act('sam', -.35, -1.7, { view: 'q', face: 1, armL: [-.3, .2], armR: [.9, 1.0], mouth: 'smile', eyes: [.5, -.2] });
  return { focus: 3.4, blur: .5, look: { ...LOOK, haze: ['#f2d9ae', .05] } }; });
shot(1, 2, (lt, t, u, w) => { w.sun([ST[0] - 4, 0, 2], [-14, 10, 9], 16);
  w.cam([ST[0] + 3.8, 1.15, ST[2] + 6.2], [ST[0] - 6, 2.4, ST[2] + 1], 44);
  w.act('sam', ST[0] - .6, ST[2] + 3.1, { view: 'q', face: -1, armL: [-.3, .2], armR: [.3, -.2], mouth: 'smile', eyes: [-.5, -.2] });
  return { focus: 4, blur: .6, look: { ...LOOK, haze: ['#f2d9ae', .45] } }; });
export const SHOTS = D.SHOTS();
