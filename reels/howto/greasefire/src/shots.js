// The edit: "Grease fire in the pan? Do NOT use water". For now one test shot that proves the kitchen and the fire.
import { makeWorld, PAN } from './world.js';
import { director } from '../../engine/film.js';
import { pr, lerp, ease } from '../../engine/toon.js';
export { CAPTIONS, DURATION, WARP } from './captions.js';
const D = director(makeWorld, [[1.2, .03]]), shot = D.shot, io = ease.io;
shot(0, 5, (lt, t, u, w) => { const see = pr(lt, .5, .7), reach = pr(lt, 1.6, 2.1);
  w.cam([lerp(-1.0, -.3, io(u)), lerp(1.9, 1.7, u), lerp(3.4, 2.7, io(u))], [.2, 1.25, -1], 44);
  w.flame(t, lerp(.5, 1.25, pr(lt, 0, 1.2)));
  w.act('sam', .8, -.5, { armL: [lerp(-.3, -1.9, reach), -.3], armR: [lerp(.3, 2.1, see), .4 * see], eyes: [-.8, -.1], brow: .9 * see, mouth: see > .5 ? 'shout' : 'smile', sweat: see, bob: 30 * Math.sin(Math.PI * see) * (see < 1 ? 1 : 0) });
  w.props.jug.visible = reach > 0; w.props.jug.position.set(.22, lerp(.95, 1.55, reach), -.7); w.props.jug.rotation.z = .9 * reach;
  w.props.X.position.set(.25, 1.75, -.6); w.pop(w.props.X, pr(lt, 2.3, 2.5), .22);
  return { focus: 3, blur: .6 }; });
export const SHOTS = D.SHOTS();
