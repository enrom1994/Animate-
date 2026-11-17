// Look test 2, the five-second moving test: past the table, into the kitchen; Sam (finish C) walks to the range and turns a knob off.
import { makeWorld } from './world.js';
import { director } from '../../engine/film.js';
import { pr, lerp, ease } from '../../engine/toon.js';
export { CAPTIONS, DURATION, WARP } from './captions.js';
const D = director(makeWorld, []), shot = D.shot, io = ease.io, out = ease.out;
export const LOOK = { inkK: .8, normK: .5, haze: ['#f2d9ae', .05], dust: .15, warm: .45, sat: 1.28 };
// the range's front left knob, in the world (the range stands at x .55, z -2.66; its knobs on the front face)
const KNOB = [.55 - .27, .8, -2.66 + .36];
const walk = (t, toward, o = {}) => ({ toward, legL: .35 * Math.sin(t * 9), legR: -.35 * Math.sin(t * 9), armL: [-.15 - .35 * Math.sin(t * 9), -.3], armR: [.15 - .35 * Math.sin(t * 9), .3], bob: 6 * Math.abs(Math.sin(t * 9)), mouth: 'smile', light: -1, ...o });
shot(0, 5, (lt, t, u, w) => { const k = io(u), go = pr(lt, .3, 2.1), x = lerp(-1.7, -.18, io(go)), z = lerp(-1.2, -1.95, io(go)), reach = out(pr(lt, 2.3, 2.8)), turnK = pr(lt, 2.9, 3.3), back = pr(lt, 3.9, 4.3);
  w.sun([0, 0, -1], [-9, 6, -1.5], 6);
  w.cam([lerp(2.9, 1.3, k), lerp(.98, 1.2, k), lerp(2.3, .7, k)], [lerp(-.6, .1, k), lerp(1.0, 1.05, k), lerp(-1.6, -2.2, k)], lerp(50, 44, k));
  let pose;
  if (go < 1) pose = walk(t, [.4, -2.4]);
  else if (back <= 0) pose = { view: 'q', face: 1, reach: [KNOB[0], KNOB[1] + .02 * Math.sin(turnK * 3), KNOB[2]], reachWith: 'R', armL: [-.3, .2], mouth: turnK > 0 ? 'smile' : 'o', eyes: [.6, .4], light: -1, lean: .05 * reach };
  else pose = { view: 'q', face: 1, armL: [-.3, .2], armR: [lerp(1.0, 2.2, out(back)), lerp(.9, .4, out(back))], mouth: 'smile', eyes: [0, -.1], blink: lt > 4.6 && lt < 4.7 ? 1 : 0, light: -1 };
  w.act('samC', x, z, pose);
  return { focus: lerp(4.4, 2.6, k), blur: .6, look: LOOK }; });
export const SHOTS = D.SHOTS();
