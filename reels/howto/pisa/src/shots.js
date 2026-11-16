// The edit: "Saving the Leaning Tower". 15 shots over 46.2 s, cut on the voice (seconds of the reference take).
// Seen from the lawn (+x) the tower leans to screen right (-z); its high side, where the cables, the lead and the drilling go, is screen left (+z).
import { makeWorld, L1838, L1990, SEC } from './world.js';
import { director } from '../../engine/film.js';
import { pr, lerp, ease, clamp } from '../../engine/toon.js';
export { CAPTIONS, DURATION, WARP } from './captions.js';
const D = director(makeWorld, [[3.62, .03], [23.05, .02], [29.6, .012]]), shot = D.shot, io = ease.io, out = ease.out, anti = ease.anti;
const blinkAt = t => (t % 2.9) > 2.8 ? 1 : 0;
const walkTo = (t, toward, o = {}) => ({ toward, legL: .35 * Math.sin(t * 9), legR: -.35 * Math.sin(t * 9), armL: [-.15 - .35 * Math.sin(t * 9), -.3], armR: [.15 - .35 * Math.sin(t * 9), .3], bob: 6 * Math.abs(Math.sin(t * 9)), ...o });
const push = (o = {}) => ({ view: 'side', face: -1, armL: [-1.85, -.15], armR: [-1.65, -.25], mouth: 'grit', brow: -.4, lean: -.13, ...o });
const sec = (x, y, z) => [SEC[0] + x, SEC[1] + y, SEC[2] + z];
// a cutaway diagram: the lean is drawn larger there than in the piazza, so the move reads (SOURCES.md says so)
const DIAG90 = .1, DIAG38 = .07;

// 1  "In 1990, the most famous tower in Italy" : down the tower from the sky into the busy piazza
shot(0, 3.25, (lt, t, u, w) => { const k = io(u);
  w.tower({ lean: L1990 }); w.crowd(t);
  w.cam([lerp(44, 40, k), lerp(40, 3, k), lerp(26, 13, k)], [0, lerp(38, 12, k), lerp(-3, 0, k)], 48);
  w.act('sam', lerp(30, 27.5, u), 9.5, walkTo(t, [0, 0], { mouth: 'smile', blink: blinkAt(t) }));
  return { focus: 30, blur: .3 }; });
// 2  "was closed, because it was falling over." : a guard pulls the gate shut on Sam; the tower above creaks
shot(3.25, 5.49, (lt, t, u, w) => { const shut = out(pr(lt, .05, .4)), creak = pr(lt, 1.3, 2.2);
  w.tower({ lean: L1990 + .004 * Math.sin(creak * Math.PI * 3) * (1 - creak) }); w.crowd(t, [2, 3]);
  w.show('barrier').open(1 - shut);
  w.cam([lerp(18.5, 17.5, io(u)), lerp(1.5, 1.7, u), lerp(-4.5, -4, u)], [lerp(10, 4, io(pr(lt, .9, 1.8))), lerp(1.7, 16, io(pr(lt, .9, 1.8))), lerp(.3, -1, io(pr(lt, .9, 1.8)))], 50);
  w.act('e2', 9.3, -.7, { view: 'q', face: -1, armL: [-1.4, -.3], armR: [-.3, .2], mouth: 'grit', brow: -.3 });
  w.act('sam', lerp(13.6, 12.4, out(pr(lt, 0, .35))), 1.0, lt < .35 ? walkTo(t, [10, 1]) : { toward: [10, 1], armL: [-.3, .2], armR: [.3, -.2], mouth: 'o', brow: .6, eyes: [-.4, -.5], sweat: creak > 0 ? 1 : 0 });
  return { focus: 6, blur: .5 }; });
// 3  "The Leaning Tower of Pisa had been tilting" : round the tower, the lean in full
shot(5.49, 7.89, (lt, t, u, w) => { const a = lerp(.55, .12, io(u));
  w.tower({ lean: L1990 }); w.crowd(t); w.show('barrier').open(0);
  w.cam([72 * Math.cos(a), lerp(6, 9, u), 72 * Math.sin(a)], [0, 21, -1.5], 46);
  return { focus: 60, blur: .2 }; });
// 4  "since the 1170s," : three storeys, a wooden scaffold, masons at work
shot(7.89, 9.41, (lt, t, u, w) => { const k = io(u);
  w.tower({ lean: lerp(0, .01, u), storeys: 3, old: true }); w.show('scaffold');
  w.cam([lerp(30, 26, k), lerp(2.5, 4, k), lerp(12, 9, k)], [0, 9, 0], 46);
  w.act('m1', 8.2, 3.4, { view: 'q', face: -1, armL: [-1.2, -.6], armR: [1.2, .6], mouth: 'grit', bob: 3 * Math.sin(t * 6) });
  w.act('m2', 9.6, .2, walkTo(t, [0, 0], { mouth: 'smile' }));
  return { focus: 20, blur: .4 }; });
// 5  "when it began to sink into the soft ground under it." : the ground cut open, the stump sinking and tipping into the clay
shot(9.41, 12.21, (lt, t, u, w) => { const s = io(pr(lt, .3, 2.6));
  w.tower({ old: true }); w.S.userData.set({ lean: lerp(.01, .045, s), sink: lerp(0, 1.1, s), storeys: 3 });
  w.cam(sec(lerp(40, 36, io(u)), lerp(3, 1, u), lerp(1, -1, u)), sec(0, lerp(2, 0, u), -1), 50);
  return { focus: 36, blur: .2 }; });
// 6  "By 1990 it leaned further than ever," : a plumb line from the top; its bob swings out over the lawn
shot(12.21, 14.53, (lt, t, u, w) => { const k = io(u), lean = lerp(L1838, L1990, io(pr(lt, .2, 1.8)));
  w.tower({ lean }); w.show('barrier').open(0); const bot = w.show('plumb').set(t);
  w.cam([lerp(17, 15, k), lerp(5, 3.5, k), lerp(-1, -3, k)], [0, lerp(30, 1.5, k), lerp(-5, bot.z, k)], 48);
  return { focus: 14, blur: .4 }; });
// 7  "so the engineers had to act." : two engineers in hard hats through the gate
shot(14.53, 16.93, (lt, t, u, w) => { const k = io(u), g = io(pr(lt, 0, .5)), x1 = lerp(13.5, 7.5, pr(lt, .2, 2.3)), x2 = lerp(14.6, 8.6, pr(lt, .35, 2.4));
  w.tower({ lean: L1990 }); w.crowd(t, [2]); w.show('barrier').open(g);
  w.cam([lerp(19, 18, k), 1.6, lerp(4.5, 3.5, k)], [lerp(10.5, 9, k), 4.6, 0], 46);
  w.act('e1', x1, -.5, lt > 1.6 ? { toward: [0, 0], armL: [-.3, .2], armR: [2.4, .3], mouth: 'o', brow: .3, eyes: [-.5, -.6] } : walkTo(t, [0, -.5], { mouth: 'grit', brow: -.3 }));
  w.act('e2', x2, .6, walkTo(t + .3, [0, .6], { mouth: 'grit', brow: -.3, hold: 'phone' }));
  w.act('sam', 12.8, 3.1, { toward: [8, 0], armL: [-.3, .2], armR: [.3, -.2], mouth: 'smile', eyes: [-.5, -.2], blink: blinkAt(t) });
  return { focus: 7, blur: .5 }; });
// 8  "First, cables were tied around the tower, and anchored far across the square." : the ring at the third storey, the cables run out to the anchors
shot(16.93, 21.09, (lt, t, u, w) => { const k = io(u), run = io(pr(lt, .5, 3.3));
  w.tower({ lean: L1990 }); w.crowd(t); w.show('barrier').open(0); w.show('cables').set(clamp(lt / .2) * .001 + run);
  w.cam([lerp(24, 25, k), lerp(25, 2.6, k), lerp(-1, 11, k)], [lerp(0, 9, k), lerp(20, 3.2, io(pr(lt, .4, 3.4))), lerp(2, 20, k)], 48);
  const hit = Math.max(0, Math.sin(t * 9));
  w.act('e1', 11.2, 20.6, { toward: [9, 21.5], armL: [-.3, .2], armR: [lerp(2.4, 1.2, hit), lerp(.4, 1.0, hit)], mouth: 'grit', brow: -.4 });
  return { focus: lerp(30, 14, k), blur: .4 }; });
// 9  "Then they stacked 870 tonnes of" : the crane lowers lead onto the high side
shot(21.09, 23.33, (lt, t, u, w) => { const k = io(u), drop = io(pr(lt, .1, 1.95));
  w.tower({ lean: L1990 }); w.crowd(t); w.show('barrier').open(0); w.show('cables').set(1); w.show('lead').set(lerp(.3, .45, pr(lt, 1.95, 2)), drop);
  w.cam([lerp(32, 30, k), lerp(5, 4, k), lerp(7, 6, k)], [0, lerp(20, 6, k), 10], 50);
  w.act('e2', 6.2, 8.8, { toward: [0, 5], armL: [-.3, .2], armR: [2.3, .6], mouth: 'o', eyes: [-.4, -.6] });
  return { focus: 18, blur: .4 }; });
// 10 "lead weights on its high side, to pull it back." : the stack grows to 870 t; an arrow pulls the top back toward it
shot(23.33, 26.13, (lt, t, u, w) => { const k = io(u);
  w.tower({ lean: L1990 }); w.crowd(t); w.show('barrier').open(0); w.show('cables').set(1); w.show('lead').set(lerp(.45, 1, io(pr(lt, 0, 1.4))), 1);
  w.pop(w.props.pull, pr(lt, 1.6, 2.1), 1);
  w.cam([lerp(48, 56, k), lerp(4, 7, k), lerp(16, 12, k)], [0, lerp(8, 20, k), lerp(5, 2, k)], 50);
  return { focus: 50, blur: .2 }; });
// 11 "But the real trick was underground." : down past the lawn into the ground
shot(26.13, 27.97, (lt, t, u, w) => { const k = io(u);
  w.S.userData.set({ lean: DIAG90 });
  w.cam(sec(lerp(26, 17, k), lerp(14, -4.5, k), lerp(4, 5, k)), sec(lerp(0, 3.7, k), lerp(8, -4, k), lerp(1, 3, k)), 50);
  return { focus: 16, blur: .3 }; });
// 12 "They drilled beneath the high side, and drew the soil out, a little at a time." : three tubes in under the footing, soil up into the skip
shot(27.97, 31.89, (lt, t, u, w) => { const k = io(u), drill = io(pr(lt, .1, 1.6)), dug = pr(lt, 1.5, 3.9);
  w.S.userData.set({ lean: DIAG90, drill, dug, t });
  w.cam(sec(lerp(22, 20, k), lerp(-.5, -1.5, k), lerp(9, 8, k)), sec(3.7, -2.4, 8), 52);
  w.act('e1', SEC[0] + 2.2, SEC[2] + 17.5, { toward: [SEC[0], SEC[2] + 15], armL: [-1.3, -.4], armR: [-.3, .2], mouth: 'grit', brow: -.3 }, false, SEC[1]);
  return { focus: 18, blur: .4 }; });
// 13 "With the ground gone, the high side slowly settled, and the whole tower leaned back." : the voids close, the tower comes back
shot(31.89, 36.53, (lt, t, u, w) => { const k = io(u), close = io(pr(lt, .3, 2.0)), back = io(pr(lt, 1.4, 4.3));
  w.S.userData.set({ lean: lerp(DIAG90, DIAG38, back), dug: 1, drill: 1, close, t, arrowK: out(pr(lt, 2.3, 2.7)) });
  w.cam(sec(lerp(46, 43, k), lerp(3, 6, k), lerp(4, 2, k)), sec(0, 11, 0), 56);
  return { focus: 44, blur: .2 }; });
// 14 "About 45 centimetres, back to where it stood in 1838." : the bob crosses the board from 1990 to 1838
shot(36.53, 40.93, (lt, t, u, w) => { const k = io(u), back = io(pr(lt, .5, 2.6));
  w.tower({ lean: lerp(L1990, L1838, back) }); w.show('barrier').open(0); const bot = w.show('plumb').set(t * .3);
  w.cam([lerp(3.6, 2.7, k), lerp(3.0, 2.4, k), lerp(-7.3, -7.6, k)], [0, 0, -7.75], 46);
  return { focus: 2.8, blur: .5 }; });
// 15 "In 2001, the tower opened again, still leaning, on purpose." : the ribbon is cut, the gate swings open, then everyone holds it up
shot(40.93, 42.9, (lt, t, u, w) => { const cut = io(pr(lt, .35, .7)), g = io(pr(lt, .6, 1.5));
  w.tower({ lean: L1838 }); w.show('barrier').open(g, false); w.show('ribbon').cut(cut);
  w.cam([lerp(17, 16, io(u)), 1.6, lerp(3.8, 3.2, io(u))], [10.2, 2.2, 0], 40);
  return { focus: 4, blur: .5 }; });
shot(42.9, 46.2, (lt, t, u, w) => { const k = io(u), wink = lt > 1.2 && lt < 1.6 ? 1 : 0;
  w.tower({ lean: L1838 });
  w.cam([lerp(60, 56, k), 1.4, lerp(6.6, 6, k)], [0, 18, 0], 50);
  SPOTS_IN.forEach(([x, z, p], i) => w.act('c' + i, x, z, { mouth: 'smile', ...p, bob: 3 * Math.sin(t * 2 + i) }));
  w.act('t1', 45, 3.6, push());
  w.act('sam', 46.4, 7.4, lt > 1.1 ? { view: 'front', armL: [-.3, .2], armR: [2.0, 1.2], mouth: 'smile', eyes: [0, 0], blink: wink } : push({ view: 'q', face: -1 }));
  w.act('t2', 45.6, 9.0, { view: 'q', face: 1, armL: [.3, .2], armR: [2.0, 1.2], hold: 'phone', mouth: 'smile', eyes: [.6, -.2] });
  return { focus: 13, blur: .4 }; });
// the crowd, back inside the barrier line in 2001
const SPOTS_IN = [[16, -6, push()], [18, -2, { view: 'q', face: -1, armR: [2.0, 1.2], hold: 'phone' }], [9, 5, { view: 'back' }], [22, 3, { view: 'front', armR: [2.6, .3] }], [12, -9, push({ face: 1 })], [26, -7, { view: 'side', face: -1 }], [20, 8, { view: 'q', face: -1, armR: [1.9, 1.2], hold: 'phone' }], [7, -6, { view: 'back' }]];
export const SHOTS = D.SHOTS();
