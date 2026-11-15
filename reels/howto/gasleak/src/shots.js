// The edit: "Smell gas at home? Do NOT flip a light switch". For now the look test: the hallway, the switch, the smell.
import { makeWorld, SWITCH, FRONT, STOVE } from './world.js';
import { director } from '../../engine/film.js';
import { pr, lerp, ease } from '../../engine/toon.js';
export { CAPTIONS, DURATION, WARP } from './captions.js';
const D = director(makeWorld, []), shot = D.shot, io = ease.io, out = ease.out;
shot(0, 36, (lt, t, u, w) => { const r = out(pr(lt, .3, .9)), k = pr(lt, 0, 3);
  w.cam([lerp(5.6, 5.1, io(k)), lerp(1.65, 1.55, k), lerp(5.4, 4.8, io(k))], [4.2, 1.25, 1.6], 44);
  w.act('sam', 4.55, 2.05, { view: 'side', face: -1, reach: [SWITCH[0] + .02, SWITCH[1], lerp(2.5, SWITCH[2], r)], reachWith: 'L', armR: [.4, .3], mouth: 'grit', brow: .5, eyes: [-.7, 0] });
  w.smell(t, [2.6, .9, .6], .8, 1.8, 1.4); w.cross([SWITCH[0] + .05, 1.78, SWITCH[2] + .05], pr(lt, 1.2, 1.4), .18);
  return { focus: 3.4, blur: .5 }; });
export const SHOTS = D.SHOTS();
