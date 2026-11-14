// The edit: "Caught in a thunderstorm? Do NOT shelter under a tree". 24 shots over 40.4 s, cut on the voice (seconds of the reference take).
import { makeWorld, TREE, HOUSE, CAR, ROOM, hillY, SPOT } from './world.js';
import { director } from '../../engine/film.js';
import { pr, lerp, ease, clamp } from '../../engine/toon.js';
export { CAPTIONS, DURATION, WARP } from './captions.js';
const STRIKES = [[.55, .02], [2.4, .03], [4.05, .07], [5.35, .04], [7.55, .03], [9.7, .06], [13.85, .03], [17.35, .06], [23.2, .02], [23.7, .02], [24.35, .02], [25.1, .07], [29.5, .03], [35.32, .06]];
const D = director(makeWorld, STRIKES), shot = D.shot, io = ease.io, out = ease.out, anti = ease.anti;
const RAIN = 1, blinkAt = t => (t % 2.9) > 2.8 ? 1 : 0;
const runTo = (t, toward, o = {}) => ({ toward, legL: .7 * Math.sin(t * 22), legR: -.7 * Math.sin(t * 22), armL: [-.2 - .8 * Math.sin(t * 22), -.9], armR: [.2 - .8 * Math.sin(t * 22), .9], lean: .1, bob: 16 * Math.abs(Math.sin(t * 22)), mouth: 'grit', brow: .5, sweat: 1, ...o });
const scared = (t, o = {}) => ({ view: 'q', face: 1, armL: [-2.0 + Math.sin(t * 18) * .2, -.4], armR: [2.0 + Math.sin(t * 18 + 1) * .2, .4], mouth: 'shout', brow: .9, sweat: 1, ...o });
const huddle = (t, o = {}) => ({ armL: [-2.3, -1.9], armR: [2.3, 1.9], squash: .9, mouth: 'grit', brow: .8, sweat: 1, bob: 3 * Math.sin(t * 9), ...o });
const at = (w, name, x, z, pose, full = false) => w.act(name, x, z, pose, full, hillY(x, z));
const treeTop = [TREE[0] + .2, TREE[1] + 6.3, TREE[2] + .3];

// 1  "If a thunderstorm catches you outside," : Sam runs through the rain as the sky flickers
shot(0, 2.1, (lt, t, u, w) => { const x = lerp(1.6, -3.2, u), fl = pr(lt, .55, .9);
  w.cam([lerp(.8, -1.6, u), lerp(1.5, 1.7, u), lerp(1.6, 2.0, u)], [x - .5, 1.3, -3.4], 46);
  at(w, 'sam', x, -3.0, runTo(t, [-9, -3.0], { eyes: [0, -.6] }));
  const f = w.bolt([14, 0, -44], fl, w.props.far, 1.1); return { focus: 6, blur: .4, rain: RAIN, flash: f * .35 }; });
// 2  "do not shelter under a tree." : into the one place that looks like cover
shot(2.1, 3.95, (lt, t, u, w) => { const a = out(pr(lt, 0, .3)), [sx, sz] = SPOT.tree;
  w.cam([lerp(-9.4, -8.6, io(u)), lerp(1.1, 1.3, u), lerp(5.6, 4.6, io(u))], [TREE[0] + .1, lerp(3.2, 3.6, u), TREE[2]], 54);
  at(w, 'sam', lerp(sx - 2.2, sx, a), lerp(sz + 1.6, sz, a), a < 1 ? runTo(t, [TREE[0], TREE[2]]) : huddle(t, { view: 'q', face: 1, eyes: [.2, -.8] }));
  w.cross([TREE[0] - 1.7, 3.5, TREE[2] + 1.6], pr(lt, .3, .5), .42); return { focus: 9, blur: .4, rain: RAIN }; });
// 3  "Lightning hits the tree," : the tallest thing on the hill
shot(3.95, 5.28, (lt, t, u, w) => { const su = pr(lt, .1, .5), [sx, sz] = SPOT.tree;
  w.cam([lerp(-8.4, -8.9, out(u)), lerp(1.0, 1.2, u), lerp(6.6, 7.8, out(u))], [TREE[0] + .1, lerp(5.2, 5.6, u), TREE[2]], 58);
  at(w, 'sam', sx, sz, su > 0 ? scared(t, { eyes: [.2, -.9], bob: 20 * Math.sin(Math.PI * clamp(su * 2)) }) : huddle(t, { view: 'q', face: 1 }));
  const f = w.bolt(treeTop, su); w.ground([TREE[0], TREE[2]], pr(lt, .14, 1.2), .8); return { focus: 11, blur: .3, rain: RAIN, flash: f }; });
// 4  "and part of the current jumps to you." : from the trunk, sideways, into the person beside it
shot(5.28, 7.08, (lt, t, u, w) => { const ju = pr(lt, .1, .55), [sx, sz] = SPOT.tree, y = hillY(sx, sz);
  w.cam([lerp(-9.0, -8.2, io(u)), lerp(2.2, 2.0, u), lerp(1.4, .6, io(u))], [TREE[0] - .1, y + 1.5, TREE[2] + .9], 44);
  at(w, 'sam', sx, sz, ju > 0 && ju < 1 ? { armL: [-1.7, -.2], armR: [1.7, .2], legL: -.4, legR: .4, mouth: 'shout', brow: .9, eyes: [0, 0], bob: 30 * Math.sin(lt * 60) * .15 + 12, sweat: 1 } : ju >= 1 ? { armL: [-.6, .3], armR: [.6, -.3], mouth: 'o', brow: .9, blink: .5, lean: .12 * pr(lt, .55, 1.2), sweat: 1 } : huddle(t));
  w.leap([TREE[0], TREE[1] + 1.5, TREE[2]], [sx, y + 1.1, sz], ju); w.ground([TREE[0], TREE[2]], pr(lt, 0, .9), .7);
  return { focus: 4.2, blur: .5, rain: RAIN, flash: ju > 0 && ju < 1 ? .45 * (1 - ju) : 0 }; });
// 5  "Do not lie flat on the ground." : it feels low and safe
shot(7.08, 9.15, (lt, t, u, w) => { const d = io(pr(lt, .08, .5)), [fx, fz] = SPOT.field;
  w.cam([lerp(fx + 2.6, fx + 1.4, io(u)), lerp(2.4, 2.9, u), lerp(fz + 4.8, fz + 4.2, u)], [fx + .2, .5, fz], 44);
  at(w, 'sam', fx + .85 * d, fz, d <= 0 ? huddle(t) : { lie: 1, lieK: d, armL: [-.25, .15], armR: [.3, .2], legL: -.05, legR: .08, mouth: 'grit', brow: .8, blink: d > .9 ? .7 : 0, eyes: [.2, -.4], sweat: 1 });
  w.cross([fx + .1, 1.75, fz + .3], pr(lt, .5, .7), .26); return { focus: 4.8, blur: .4, rain: RAIN }; });
// 6  "That only puts more of you in the path of the current running through it." : the strike is over there; the ground carries it here
shot(9.15, 12.68, (lt, t, u, w) => { const su = pr(lt, .5, 1.0), ru = pr(lt, .6, 2.9), [fx, fz] = SPOT.field, hit = [fx + 2.6, fz - 2.2], jolt = ru > .42 && ru < .8;
  w.cam([lerp(fx - 1.6, fx + .2, io(u)), lerp(6.4, 5.0, io(u)), lerp(fz + 5.6, fz + 4.4, io(u))], [lerp(fx + 1.6, fx + .9, io(u)), 0, lerp(fz - 1.2, fz - .5, io(u))], 46);
  at(w, 'sam', fx + .85, fz, { lie: 1, armL: jolt ? [-1.0, -.3] : [-.25, .15], armR: jolt ? [1.3, .5] : [.3, .2], legL: jolt ? -.45 : -.05, legR: jolt ? .5 : .08, mouth: jolt ? 'shout' : 'grit', brow: .9, eyes: [.2, -.4], blink: jolt ? 0 : .6, sweat: 1, bob: jolt ? 6 * Math.sin(lt * 60) : 0 });
  const f = w.bolt([hit[0], 0, hit[1]], su); w.ground(hit, ru, 1.5); return { focus: 8, blur: .25, rain: RAIN, flash: f + (jolt ? .12 : 0) }; });
// 7  "And crouching down does not make you any safer." : the old advice, crossed out
shot(12.68, 15.12, (lt, t, u, w) => { const c = anti(pr(lt, .05, .5)), [fx, fz] = SPOT.field;
  w.cam([lerp(fx - 2.6, fx + 1.8, io(u)), lerp(1.2, 1.5, u), lerp(fz + 4.4, fz + 3.6, u)], [fx, .8, fz], 42);
  at(w, 'sam', fx, fz, huddle(t, { squash: lerp(1, .66, clamp(c)), eyes: [0, .6], blink: lt > .6 ? .7 : 0 }));
  w.cross([fx + .05, 1.75, fz + .3], pr(lt, 1.1, 1.3), .26); w.ground([fx - 3.5, fz - 2.5], pr(lt, 1.5, 2.44), 1.8); return { focus: 4, blur: .5, rain: RAIN }; });
// 8  "If you can hear thunder," : a hand to the ear, a rumble a long way off
shot(15.12, 16.38, (lt, t, u, w) => { const h = out(pr(lt, .1, .4)), [fx, fz] = SPOT.field, fl = pr(lt, .35, .7);
  w.cam([lerp(fx + .5, fx - .3, io(u)), 1.5, lerp(fz + 3.2, fz + 2.7, u)], [fx + .1, 1.25, fz], 40);
  at(w, 'sam', fx, fz, { view: 'q', face: 1, armL: [-.3, .2], armR: [lerp(.3, 2.0, h), lerp(-.2, 1.1, h)], mouth: 'o', brow: .6, eyes: [.7, -.4], sweat: 1 });
  const f = w.bolt([26, 0, -46], fl, w.props.far, 1.0); return { focus: 3, blur: .6, rain: RAIN, flash: f * .25 }; });
// 9  "the lightning is close enough to strike you." : and the next one is not far off at all
shot(16.38, 18.58, (lt, t, u, w) => { const su = pr(lt, .95, 1.35), [fx, fz] = SPOT.field, hit = [fx + 2.4, fz - 2.6];
  w.cam([lerp(fx - 2.4, fx - 3.6, out(u)), lerp(1.3, 1.6, u), lerp(fz + 4.6, fz + 6.4, out(u))], [fx + 1.3, lerp(2.4, 3.2, u), fz - 1], 54);
  at(w, 'sam', fx, fz, su > 0 ? scared(t, { eyes: [.8, -.2], bob: 26 * Math.sin(Math.PI * clamp(su * 1.5)) }) : { view: 'q', face: 1, armL: [-.3, .2], armR: [2.0, 1.1], mouth: 'o', brow: .6, eyes: [.7, -.4], sweat: 1 });
  const f = w.bolt([hit[0], 0, hit[1]], su); w.ground(hit, pr(lt, 1.0, 2.1), 1.6); return { focus: 6, blur: .35, rain: RAIN, flash: f }; });
// 10 "So run for a real building," : lit windows, walls, a roof; a hand on the door
shot(18.58, 20.28, (lt, t, u, w) => { const k = io(pr(lt, 0, 1.25)), x = lerp(3.4, 8.85, k), z = lerp(-2.4, .55, k), there = k >= 1;
  w.cam([lerp(1.2, 5.6, io(u)), lerp(1.5, 1.7, u), lerp(-6.6, -4.2, io(u))], [lerp(5.4, 9.1, io(u)), lerp(1.4, 1.5, u), lerp(0, 1.6, io(u))], 46);
  w.act('sam', x, z, there ? { view: 'side', face: -1, reach: SPOT.knob, reachWith: 'L', armR: [.4, .3], lean: -.05, mouth: 'grit', brow: .4, eyes: [-.6, 0], sweat: 1 } : runTo(t, SPOT.door, { eyes: [0, -.2] }), false, there ? .1 : hillY(x, z)); return { focus: 7, blur: .35, rain: RAIN }; });
// 11 "or a car with a metal roof" : to the door, a hand on the handle; the cut takes Sam inside
shot(20.28, 21.9, (lt, t, u, w) => { const k = out(pr(lt, 0, .62)), there = k >= 1, h = [3.17, .97, 4.9];
  w.cam([lerp(5.2, 4.2, io(u)), lerp(1.5, 2.0, io(u)), lerp(10.2, 9.6, io(u))], [CAR[0] + .9, lerp(1.1, 1.4, io(u)), CAR[2]], 44);
  w.glass.forEach(g => g.scale.y = .25);
  at(w, 'sam', lerp(7.0, 3.95, k), lerp(6.8, 5.2, k), there ? { view: 'side', face: -1, reach: h, reachWith: 'L', armR: [.4, .3], lean: -.06, mouth: 'grit', brow: .5, eyes: [-.6, -.5], sweat: 1 } : runTo(t, [CAR[0], CAR[2]]));
  return { focus: 4.8, blur: .5, rain: RAIN }; });
// 12 "and the windows up." : in the seat, hands on the wheel, glass up, weather out
shot(21.9, 22.9, (lt, t, u, w) => { const up = anti(pr(lt, .15, .75)), ok = lt > .72;
  w.cam([lerp(4.6, 4.2, u), lerp(2.0, 1.95, u), lerp(8.6, 8.1, u)], [CAR[0] - .25, 1.75, CAR[2]], 40);
  w.glass.forEach(g => g.scale.y = lerp(.12, 1, clamp(up)));
  w.act('sam', ...SPOT.seat, { toward: [CAR[0] + 4.4, CAR[2] - 2.4], legL: 1.4, legR: 1.4, kneeL: -1.4, kneeR: -1.4, reach: SPOT.wheel, armL: [.9, .6], mouth: ok ? 'smile' : 'grit', brow: ok ? 0 : .4, eyes: [.6, ok ? 0 : -.5], blink: blinkAt(t), sweat: ok ? 0 : 1 }, false, .8); return { focus: 3.8, blur: .5, rain: RAIN }; });
// 13 "A tent," 14 "a porch" 15 "or a picnic shelter" : three covers that are not shelter
shot(22.9, 23.55, (lt, t, u, w) => { const [x, z] = SPOT.tent;
  w.cam([lerp(-12.4, -12.0, u), 1.4, lerp(6.6, 6.2, u)], [-13.8, 1.0, 2.0], 44);
  at(w, 'sam', x + 1.0, z + 2.3, huddle(t, { view: 'q', face: -1, eyes: [-.5, -.5] })); w.cross([-14, 2.5, 2.7], pr(lt, .18, .38), .3); return { focus: 4.4, blur: .5, rain: RAIN }; });
shot(23.55, 24.2, (lt, t, u, w) => { const [x, z] = SPOT.door;
  w.cam([lerp(8.0, 8.3, u), 1.5, lerp(-3.8, -3.4, u)], [x - .1, 1.3, z + .6], 44);
  w.act('sam', x, z - .1, huddle(t, { eyes: [0, -.6] }), false, .12); w.cross([x + .1, 2.55, z - .3], pr(lt, .12, .32), .28); return { focus: 4.8, blur: .5, rain: RAIN }; });
shot(24.2, 25.02, (lt, t, u, w) => { const [x, z] = SPOT.picnic;
  w.cam([lerp(-5.6, -5.2, u), 1.5, lerp(8.2, 7.8, u)], [x, 1.35, z], 46);
  at(w, 'sam', x - .2, z + 1.25, huddle(t, { view: 'q', face: 1, eyes: [.4, -.7] })); w.cross([x, 2.95, z + 1.4], pr(lt, .12, .32), .32); return { focus: 5, blur: .5, rain: RAIN }; });
// 16 "will not protect you." : the roof takes the strike and it does not stop there
shot(25.02, 26.12, (lt, t, u, w) => { const su = pr(lt, .06, .46), [x, z] = SPOT.picnic;
  w.cam([lerp(-6.2, -7.0, out(u)), lerp(1.4, 1.6, u), lerp(8.6, 9.6, out(u))], [x, lerp(2.0, 2.6, u), z], 52);
  at(w, 'sam', x - .2, z + 1.25, su > 0 ? scared(t, { eyes: [.2, -.8], bob: 22 * Math.sin(Math.PI * clamp(su * 1.6)) }) : huddle(t, { view: 'q', face: 1 }));
  const f = w.bolt([x + .2, 2.45, z + .2], su); w.ground([x, z], pr(lt, .1, 1.0), 1.2); return { focus: 6.4, blur: .4, rain: RAIN, flash: f }; });
// 17 "Nothing in reach?" : a long way from any roof
shot(26.12, 27.12, (lt, t, u, w) => { const [hx, hz] = [TREE[0] + 2.2, TREE[2] + 2.6], look = lt > .45 ? -1 : 1;
  w.cam([lerp(hx + 4.6, hx + 3.6, io(u)), lerp(3.6, 4.8, u), lerp(hz + 4.6, hz + 6.0, io(u))], [hx - .4, 1.6, hz - 1.5], 50);
  at(w, 'sam', hx, hz, { view: 'q', face: look, armL: [-1.3, -1.1], armR: [1.3, 1.1], mouth: 'o', brow: .8, eyes: [.7, -.2], sweat: 1 }); return { focus: 10, blur: .3, rain: RAIN }; });
// 18 "Get off the hill," : down, off the high ground
shot(27.12, 28.02, (lt, t, u, w) => { const k = io(u), x = lerp(TREE[0] + 2.2, TREE[0] + 5.6, k), z = lerp(TREE[2] + 2.6, TREE[2] + 4.8, k);
  w.cam([lerp(-1.6, .2, k), lerp(2.4, 1.9, k), lerp(1.6, 1.0, k)], [x - .2, hillY(x, z) + 1.0, z], 46);
  at(w, 'sam', x, z, runTo(t, [x + 3, z + 2])); w.point(w.props.arrow, TREE[0] + 3.4, TREE[2] + 2.4, -2.2, pr(lt, .1, .3)); w.props.arrow.scale.multiplyScalar(.6); return { focus: 6, blur: .4, rain: RAIN }; });
// 19 "get away from water," : the pond is no place to stand
shot(28.02, 29.12, (lt, t, u, w) => { const k = io(u), [px, pz] = SPOT.pond, x = lerp(px, px - 3.0, k), z = lerp(pz, pz + 2.4, k);
  w.cam([lerp(px - 4.6, px - 5.4, u), lerp(2.6, 2.2, u), lerp(pz + 6.6, pz + 6.0, u)], [px - .6, .8, pz - .4], 48);
  at(w, 'sam', x, z, runTo(t, [x - 3, z + 2.4])); w.point(w.props.arrow, px - 2.4, pz + .6, 2.25, pr(lt, .12, .32)); w.props.arrow.scale.multiplyScalar(.6); w.cross([px + 2.6, 1.3, pz - 1.6], pr(lt, .3, .5), .34); return { focus: 7, blur: .35, rain: RAIN }; });
// 20 "and stay clear of fences." : wire carries it a long way
shot(29.12, 30.42, (lt, t, u, w) => { const k = out(pr(lt, .25, 1.0)), [fx, fz] = SPOT.fence, sp = pr(lt, .3, .7);
  w.cam([lerp(fx - 2.8, fx - 3.6, u), lerp(1.5, 1.7, u), lerp(fz + 4.4, fz + 5.2, u)], [fx - .2, 1.0, fz - .3], 46);
  at(w, 'sam', lerp(fx, fx - 1.6, k), lerp(fz + .25, fz + 1.5, k), k > 0 && k < 1 ? scared(t, { face: 1, eyes: [.7, 0] }) : k >= 1 ? { view: 'q', face: 1, armL: [-.6, .3], armR: [.6, -.3], mouth: 'o', brow: .7, eyes: [.7, 0], sweat: 1 } : { view: 'side', face: 1, reach: [fx + .3, 1.0, fz - .75], reachWith: 'R', armL: [-.4, .3], mouth: 'o', brow: .4 });
  w.leap([fx + 3.4, 1.0, -3.2], [fx + .9, 1.0, -3.2], sp); w.cross([fx + 1.4, 1.75, -3.0], pr(lt, .38, .58), .26); return { focus: 4.6, blur: .5, rain: RAIN, flash: sp > 0 && sp < 1 ? .3 * (1 - sp) : 0 }; });
// 21 "With other people? Spread out." : apart, so one strike cannot run through everyone
shot(30.42, 31.98, (lt, t, u, w) => { const k = anti(pr(lt, .78, 1.3)), [fx, fz] = [SPOT.field[0] + .5, SPOT.field[1]], d = lerp(.42, 1.15, clamp(k)), moving = k > .02 && k < .98;
  w.cam([lerp(fx - .8, fx + .6, io(u)), lerp(3.4, 4.2, u), lerp(fz + 6.0, fz + 7.0, u)], [fx, .9, fz], 50);
  at(w, 'sam', fx - d, fz, moving ? runTo(t, [fx - 9, fz]) : huddle(t, { eyes: [.5, 0] })); at(w, 'friend', fx + d, fz + .1, moving ? runTo(t, [fx + 9, fz]) : huddle(t, { eyes: [-.5, 0] }));
  w.point(w.props.arrow, fx - 1.1, fz - 1.3, Math.PI / 2, pr(lt, .82, 1.0)); w.props.arrow.scale.multiplyScalar(.5); w.point(w.props.arrow2, fx + 1.1, fz - 1.3, -Math.PI / 2, pr(lt, .82, 1.0)); w.props.arrow2.scale.multiplyScalar(.5); return { focus: 8, blur: .3, rain: RAIN }; });
// 22 "Then stay inside" : in the room, watching the storm through the window
shot(31.98, 33.42, (lt, t, u, w) => { const [rx, rz] = SPOT.room, fl = pr(lt, .55, .95), turn = lt > 1.05;
  w.cam([lerp(ROOM[0] + .5, ROOM[0] - .3, io(u)), lerp(1.7, 1.85, u), lerp(ROOM[2] + 5.0, ROOM[2] + 4.2, io(u))], [ROOM[0] - 1.1, 1.55, ROOM[2] - 2], 44);
  const f = fl > 0 && fl < 1 ? Math.pow(1 - fl, 1.5) : 0; w.indoors(0, f);
  w.act('sam', rx, rz, turn ? { view: 'q', face: 1, armL: [-.3, .2], armR: [.3, -.2], mouth: 'o', brow: .4, eyes: [.5, -.3], blink: blinkAt(t) } : { view: 'back', armL: [-.3, .2], armR: [.3, -.2], bob: f > .5 ? 14 : 0 }); return { focus: 4.6, blur: .4, rain: 0, flash: f * .18 }; });
// 22b "until thirty minutes after the last thunder." : the clock on the wall fills its half hour
shot(33.42, 35.22, (lt, t, u, w) => { const [rx, rz] = SPOT.room, fr = io(pr(lt, .15, 1.45));
  w.cam([lerp(ROOM[0] + .9, ROOM[0] + 1.4, io(u)), lerp(1.85, 1.95, u), lerp(ROOM[2] + 4.4, ROOM[2] + 3.8, io(u))], [ROOM[0] + 1.35, 1.95, ROOM[2] - 2], 42);
  w.indoors(fr, 0);
  w.act('sam', ROOM[0] + .75, ROOM[2] - .5, { view: 'q', face: 1, armL: [-.3, .2], armR: [lerp(.3, 2.2, out(pr(lt, .2, .5))), .5], mouth: fr > .9 ? 'smile' : 'o', brow: 0, eyes: [.7, -.6], blink: blinkAt(t) }); return { focus: 3.6, blur: .4, rain: 0 }; });
// 23 "And if someone is hit, you can touch them." : to the friend on the ground, straight away
shot(35.22, 37.26, (lt, t, u, w) => { const su = pr(lt, .06, .5), [fx, fz] = [SPOT.field[0] + 1.2, SPOT.field[1] + .2], fall = io(pr(lt, .22, .55)), k = out(pr(lt, .6, 1.3)), sx = lerp(fx - 4.4, fx - 1.95, k), kneel = k >= 1;
  w.cam([lerp(fx - 1.5, fx - .7, io(u)), lerp(2.6, 2.1, io(u)), lerp(fz + 7.4, fz + 6.8, io(u))], [fx - .55, .7, fz], 46);
  at(w, 'friend', fx + .9 * fall, fz, fall <= 0 ? scared(t, { face: -1 }) : { lie: 1, lieK: fall, armL: [-.25, .15], armR: [.3, .2], mouth: 'sad', brow: .6, blink: .8 });
  if (lt > .55) at(w, 'sam', sx, fz + .15, kneel ? { view: 'side', face: 1, squash: .8, legL: .5, legR: 1.3, kneeL: -1.6, kneeR: -1.3, reach: [fx - .75, .5, fz + .05], reachWith: 'R', armL: [-.4, .3], mouth: 'o', brow: .8, eyes: [.6, .5], sweat: 1 } : runTo(t, [fx, fz]));
  const f = w.bolt([fx + .5, 0, fz - .8], su, w.strike2); return { focus: 5.6, blur: .4, rain: .8, flash: f }; });
// 24 "They hold no charge." : a hand on the shoulder, and nothing jumps
shot(37.26, 38.52, (lt, t, u, w) => { const [fx, fz] = [SPOT.field[0] + 1.2, SPOT.field[1] + .2], ok = lt > .7;
  w.cam([lerp(fx - .9, fx - .5, u), lerp(2.0, 1.8, u), lerp(fz + 6.6, fz + 6.2, u)], [fx - .55, .8, fz], 44);
  at(w, 'friend', fx + .9, fz, { lie: 1, armL: [-.25, .15], armR: [.3, .2], mouth: ok ? 'smile' : 'sad', brow: .3, blink: ok ? 0 : .7, eyes: [-.3, 0] });
  at(w, 'sam', fx - 1.95, fz + .15, { view: 'side', face: 1, squash: .8, legL: .5, legR: 1.3, kneeL: -1.6, kneeR: -1.3, reach: [fx - .75, .5, fz + .05], reachWith: 'R', armL: [-.4, .3], mouth: ok ? 'smile' : 'o', brow: ok ? 0 : .6, eyes: [.6, .5] });
  if (lt > .12) w.sign([fx - .75, 1.45, fz + .3], 1); w.cross([fx - .75, 2.05, fz + .32], pr(lt, .3, .5), .22); return { focus: 4.6, blur: .5, rain: .7 }; });
// 25 "Call for help." : phone out; the storm is still overhead, which is where the film began
shot(38.52, 40.36, (lt, t, u, w) => { const [fx, fz] = [SPOT.field[0] + 1.2, SPOT.field[1] + .2], fl = pr(lt, 1.2, 1.7);
  w.cam([lerp(fx - .5, fx - 1.0, io(u)), lerp(1.9, 3.4, io(u)), lerp(fz + 6.0, fz + 7.2, io(u))], [fx - .55, lerp(1.0, 1.5, u), fz], 46);
  at(w, 'friend', fx + .9, fz, { lie: 1, armL: [-.25, .15], armR: [.3, .2], mouth: 'smile', brow: .2, eyes: [-.3, 0] });
  at(w, 'sam', fx - 1.95, fz + .15, { armL: [-.3, .2], armR: [1.9, 1.2], hold: 'phone', mouth: lt % .5 < .25 ? 'o' : 'shout', brow: .6, eyes: [.3, -.3], sweat: 1 });
  const f = w.bolt([-24, 0, -46], fl, w.props.far, 1.1); return { focus: 5, blur: .4, rain: .9, flash: f * .3 }; });
export const SHOTS = D.SHOTS();
