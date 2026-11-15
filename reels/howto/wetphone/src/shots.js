// The edit: "Phone fell in water? Do NOT put it in rice". 17 shots over 39.65 s, cut on the voice (seconds of the reference take).
import { makeWorld, SINK, TABLE } from './world.js';
import { director } from '../../engine/film.js';
import { pr, lerp, ease, clamp } from '../../engine/toon.js';
export { CAPTIONS, DURATION, WARP } from './captions.js';
const D = director(makeWorld, [[.95, .03], [2.4, .02], [5.0, .02], [7.5, .02], [12.55, .02], [13.4, .02], [14.35, .02], [15.85, .02], [35.9, .03]]), shot = D.shot, io = ease.io, out = ease.out, anti = ease.anti;
const blinkAt = t => (t % 2.9) > 2.8 ? 1 : 0;
const PS = 1.4, P0 = [TABLE[0], .947, TABLE[2]], PORT = [TABLE[0], .95, TABLE[2] + .078 * PS];   // the phone is drawn 1.4 times life size so it reads
const flat = [-Math.PI / 2, 0, 0];   // the phone lying on its back, port toward the camera side (+z)
const atCounter = (o = {}) => ({ view: 'side', face: -1, mouth: 'o', brow: .4, eyes: [-.7, .5], ...o });

// 1  "Dropped your phone in water?" : at the sink, it slips
shot(0, 1.38, (lt, t, u, w) => { const f = pr(lt, .45, .72), sp = pr(lt, .72, 1.3), hp = [1.95, 1.18, -.95];
  w.cam([lerp(.3, 1.0, io(u)), lerp(1.75, 1.6, u), lerp(2.2, 1.8, io(u))], [1.95, 1.15, -.95], 46);
  const pp = f <= 0 ? hp : [lerp(hp[0], SINK[0] + .1, f), lerp(hp[1], SINK[1] + .01, f * f), lerp(hp[2], SINK[2], f)];
  if (sp < .3) w.phone(pp, [f * 1.4, 0, f * 2], PS);
  w.act('sam', 2.35, -.45, atCounter({ reach: f > 0 ? [hp[0] + .03, hp[1] + .02 * f, hp[2]] : hp, reachWith: 'L', armR: [.4, .3], mouth: f > 0 ? 'o' : 'smile', brow: f > 0 ? .8 : 0, eyes: [-.7, f > 0 ? .7 : .3] }));
  w.splash([SINK[0] + .1, SINK[1], SINK[2]], sp, 1); return { focus: 2.2, blur: .5 }; });
// 2  "Do not put it in a bag of rice." : phone out and dripping, a hand on the rice, the cross
shot(1.38, 3.1, (lt, t, u, w) => { const hp = [1.9, 1.2, -.92], rb = [1.08, .93, -1.15], r = out(pr(lt, .25, .7));
  w.cam([lerp(.2, .9, io(u)), lerp(1.75, 1.65, u), lerp(2.3, 1.9, io(u))], [1.7, 1.12, -.95], 46);
  w.phone(hp, [0, .4, 0], PS); w.drip([hp[0], hp[1] - .08, hp[2]], t);
  w.props.rice.visible = true; w.props.rice.position.set(...rb);
  w.act('sam', 2.3, -.45, atCounter({ reach: hp, reachWith: 'L', reach2: [lerp(1.9, rb[0] + .12, r), lerp(1.0, rb[1] + .2, r), rb[2] + .1], mouth: 'o', brow: .6 }));
  w.cross([rb[0], 1.48, rb[2] + .1], pr(lt, .7, .9), .14); return { focus: 2.4, blur: .5 }; });
// 3  "Small bits of rice can get inside and damage it." : close on the port; grains slip in
shot(3.1, 5.66, (lt, t, u, w) => {
  w.cam([lerp(TABLE[0] - .12, TABLE[0] + .1, io(u)), lerp(1.08, 1.02, u), lerp(TABLE[2] + .45, TABLE[2] + .36, u)], [PORT[0], PORT[1], PORT[2]], 34);
  w.phone(P0, flat, PS); w.grains([PORT[0] + .02, PORT[1] + .09, PORT[2] + .06], PORT, pr(lt, .2, 1.8));
  w.cross([PORT[0] + .02, PORT[1] + .07, PORT[2] + .03], pr(lt, 1.9, 2.1), .012); return { focus: .3, blur: .9 }; });
// 4  "Do not plug it in to charge while it is wet, either." : the plug comes toward the port and stops
shot(5.66, 8.3, (lt, t, u, w) => { const r = anti(pr(lt, .2, .9)), plug = [lerp(TABLE[0] + .5, PORT[0], clamp(r) * .85), PORT[1] + .015, lerp(TABLE[2] + .45, PORT[2] + .02, clamp(r) * .85)];
  w.cam([lerp(TABLE[0] + .05, TABLE[0] + .55, io(u)), lerp(1.35, 1.28, u), lerp(TABLE[2] + 2.0, TABLE[2] + 1.85, io(u))], [lerp(TABLE[0] + .25, TABLE[0] + .4, io(u)), 1.12, TABLE[2]], 46);   // square on to the counter and drifting along it: the phone at left, Sam side-on at right, neither in front of the other
  w.phone(P0, flat, PS); w.drip([PORT[0], PORT[1], PORT[2] + .01], t);
  w.props.cable.visible = true; w.props.cable.position.set(...plug); w.props.cable.rotation.set(Math.PI / 2, 0, 0);
  w.act('sam', TABLE[0] + .72, TABLE[2] + .5, atCounter({ reach: [plug[0] + .02, plug[1] + .02, plug[2] + .03], reachWith: 'L', armR: [.4, .3] }));
  w.cross([PORT[0] + .05, PORT[1] + .22, PORT[2]], pr(lt, 1.6, 1.8), .07); return { focus: 1.6, blur: .6 }; });
// 5  "Wet pins in the port can corrode, and that damage can be permanent." : the pins go green
shot(8.3, 12.0, (lt, t, u, w) => {
  w.cam([lerp(PORT[0] + .07, PORT[0] - .03, io(u)), lerp(PORT[1] + .05, PORT[1] + .028, u), lerp(PORT[2] + .13, PORT[2] + .085, u)], PORT, 32);
  w.phone(P0, flat, PS); w.corrode(io(pr(lt, .4, 2.8)));
  return { focus: .15, blur: 1 }; });
// 6  "And no hair dryer," 7 "no heater," 8 "no compressed air." : three ways to make it worse
shot(12.0, 12.95, (lt, t, u, w) => { const d = [TABLE[0] + .35, 1.12, TABLE[2] + .15];
  w.cam([lerp(TABLE[0] + .05, TABLE[0] + .55, io(u)), lerp(1.35, 1.28, u), lerp(TABLE[2] + 2.0, TABLE[2] + 1.85, io(u))], [lerp(TABLE[0] + .25, TABLE[0] + .4, io(u)), 1.12, TABLE[2]], 46);   // square on to the counter and drifting along it: the phone at left, Sam side-on at right, neither in front of the other
  w.phone(P0, flat, PS); w.props.dryer.visible = true; w.props.dryer.position.set(...d); w.props.dryer.rotation.set(0, Math.PI, -.5);
  w.act('sam', TABLE[0] + .72, TABLE[2] + .5, atCounter({ reach: [d[0] + .02, d[1] - .12, d[2] + .02], reachWith: 'L', armR: [.4, .3], mouth: 'grit', brow: -.3 }));
  w.air([d[0] - .1, d[1] - .05, d[2]], t * 2, 1); w.cross([d[0] - .1, d[1] + .25, d[2]], pr(lt, .4, .6), .08); return { focus: 1.4, blur: .6 }; });
shot(12.95, 13.7, (lt, t, u, w) => {
  w.cam([lerp(2.5, 2.45, u), 1.0, lerp(-.5, -.6, u)], [2.9, .62, -1.5], 42);
  w.phone([2.9, .565, -1.48], flat); w.cross([2.9, .9, -1.45], pr(lt, .25, .45), .1); return { focus: 1.1, blur: .6 }; });
shot(13.7, 14.7, (lt, t, u, w) => { const c = [TABLE[0] + .25, 1.0, TABLE[2] + .25];
  w.cam([lerp(TABLE[0] + .05, TABLE[0] + .55, io(u)), lerp(1.35, 1.28, u), lerp(TABLE[2] + 2.0, TABLE[2] + 1.85, io(u))], [lerp(TABLE[0] + .25, TABLE[0] + .4, io(u)), 1.12, TABLE[2]], 46);   // square on to the counter and drifting along it: the phone at left, Sam side-on at right, neither in front of the other
  w.phone(P0, flat, PS); w.props.can.visible = true; w.props.can.position.set(...c); w.props.can.rotation.set(0, Math.PI, 0);
  w.act('sam', TABLE[0] + .72, TABLE[2] + .5, atCounter({ reach: [c[0] + .02, c[1], c[2] + .02], reachWith: 'L', armR: [.4, .3], mouth: 'grit', brow: -.3 }));
  w.air([c[0] - .08, c[1] + .1, c[2]], t * 3, 1); w.cross([c[0] - .05, c[1] + .25, c[2]], pr(lt, .35, .55), .07); return { focus: 1.2, blur: .6 }; });
// 9  "Do not poke a cotton bud or a paper towel into the port." : each one stops at the port
shot(14.7, 17.95, (lt, t, u, w) => { const towel = lt > 1.75, r = anti(pr(lt, towel ? 1.8 : .2, towel ? 2.4 : .8)), tip = [lerp(PORT[0] + .02, PORT[0], clamp(r)), PORT[1] + .004, lerp(PORT[2] + .25, PORT[2] + .045, clamp(r))];
  w.cam([lerp(TABLE[0] + .05, TABLE[0] + .55, io(u)), lerp(1.35, 1.28, u), lerp(TABLE[2] + 2.0, TABLE[2] + 1.85, io(u))], [lerp(TABLE[0] + .25, TABLE[0] + .4, io(u)), 1.12, TABLE[2]], 46);   // square on to the counter and drifting along it: the phone at left, Sam side-on at right, neither in front of the other
  w.phone(P0, flat, PS); const o = towel ? w.props.towel : w.props.bud; o.visible = true; o.position.set(tip[0], tip[1], tip[2] + .04); o.rotation.set(Math.PI / 2, 0, 0);
  w.act('sam', TABLE[0] + .72, TABLE[2] + .5, atCounter({ reach: [tip[0] + .01, tip[1] + .01, tip[2] + .09], reachWith: 'L', armR: [.4, .3], mouth: 'grit', brow: -.3, eyes: [-.7, .7] }));
  w.cross([PORT[0] + .01, PORT[1] + .12, PORT[2] + .05], pr(lt, towel ? 2.4 : .85, towel ? 2.55 : 1.05), .05); return { focus: .9, blur: .7 }; });
// 10 "Instead, unplug any cables," : the cable comes out
shot(17.95, 19.55, (lt, t, u, w) => { const k = io(pr(lt, .35, .9)), plug = [PORT[0] + .3 * k, PORT[1] + .015 + .1 * k, PORT[2] + .03 + .25 * k];
  w.cam([lerp(TABLE[0] + .05, TABLE[0] + .55, io(u)), lerp(1.35, 1.28, u), lerp(TABLE[2] + 2.0, TABLE[2] + 1.85, io(u))], [lerp(TABLE[0] + .25, TABLE[0] + .4, io(u)), 1.12, TABLE[2]], 46);   // square on to the counter and drifting along it: the phone at left, Sam side-on at right, neither in front of the other
  w.phone(P0, flat, PS); w.props.cable.visible = true; w.props.cable.position.set(...plug); w.props.cable.rotation.set(Math.PI / 2, 0, 0);
  w.act('sam', TABLE[0] + .72, TABLE[2] + .5, atCounter({ reach: [plug[0] + .02, plug[1] + .02, plug[2] + .03], reachWith: 'L', armR: [.4, .3], mouth: 'smile', brow: 0 })); return { focus: 1.6, blur: .6 }; });
// 11 "and wipe it dry with a soft cloth." : phone in one hand, cloth in the other
shot(19.55, 21.6, (lt, t, u, w) => { const hp = [TABLE[0] + .12, 1.0, TABLE[2] + .5], rub = Math.sin(lt * 14) * .04;
  w.cam([lerp(TABLE[0] + .05, TABLE[0] + .55, io(u)), lerp(1.35, 1.28, u), lerp(TABLE[2] + 2.0, TABLE[2] + 1.85, io(u))], [lerp(TABLE[0] + .25, TABLE[0] + .4, io(u)), 1.12, TABLE[2]], 46);   // square on to the counter and drifting along it: the phone at left, Sam side-on at right, neither in front of the other
  w.phone(hp, [0, .5, 0], PS); w.props.cloth.visible = true; w.props.cloth.position.set(hp[0] + .02, hp[1] + rub, hp[2] + .03); w.props.cloth.rotation.set(0, .5, 0);
  w.act('sam', TABLE[0] + .72, TABLE[2] + .5, atCounter({ reach: [hp[0], hp[1] - .06, hp[2]], reachWith: 'L', reach2: [hp[0] + .04, hp[1] + rub, hp[2] + .04], mouth: 'smile', brow: 0, eyes: [-.6, .5] })); return { focus: 1.8, blur: .6 }; });
// 12 "Tap it gently against your hand, port facing down, to shake the water out." : port down, tap, drops fall
shot(21.6, 25.9, (lt, t, u, w) => { const tap = Math.max(0, Math.sin(lt * 9)), hp = [TABLE[0] + .12, 1.02 + .05 * tap, TABLE[2] + .5], palm = [TABLE[0] + .12, .91, TABLE[2] + .53];
  w.cam([lerp(TABLE[0] + .05, TABLE[0] + .55, io(u)), lerp(1.35, 1.28, u), lerp(TABLE[2] + 2.0, TABLE[2] + 1.85, io(u))], [lerp(TABLE[0] + .25, TABLE[0] + .4, io(u)), 1.12, TABLE[2]], 46);   // square on to the counter and drifting along it: the phone at left, Sam side-on at right, neither in front of the other
  w.phone(hp, [0, .5, 0], PS); w.drip([hp[0], hp[1] - .1, hp[2]], t * 1.3, lt > .4 ? 1 : 0);
  w.act('sam', TABLE[0] + .72, TABLE[2] + .5, atCounter({ reach: [hp[0], hp[1] + .03, hp[2]], reachWith: 'L', reach2: palm, mouth: 'smile', brow: 0, eyes: [-.6, .7] })); return { focus: 1.7, blur: .6 }; });
// 13 "Then leave it somewhere dry, with a little air moving around it." : set down by the fan
shot(25.9, 29.2, (lt, t, u, w) => { const down = io(pr(lt, .1, .7)), away = pr(lt, .8, 1.3), hp = [lerp(TABLE[0] + .35, P0[0], down), lerp(1.15, P0[1] + .03, down), lerp(TABLE[2] + .5, P0[2], down)], f = [TABLE[0] + .55, .93, TABLE[2] - .1];
  w.cam([lerp(TABLE[0] + .05, TABLE[0] + .55, io(u)), lerp(1.35, 1.28, u), lerp(TABLE[2] + 2.0, TABLE[2] + 1.85, io(u))], [lerp(TABLE[0] + .25, TABLE[0] + .4, io(u)), 1.12, TABLE[2]], 46);   // square on to the counter and drifting along it: the phone at left, Sam side-on at right, neither in front of the other
  w.phone(down < 1 ? hp : P0, down < 1 ? [-Math.PI / 2 * down, 0, 0] : flat); w.props.fan.visible = true; w.props.fan.position.set(...f); w.props.fan.rotation.y = -Math.PI / 2 - .3; w.props.fan.userData.blades.rotation.z = -t * 12;
  w.air([f[0] - .2, f[1] + .3, f[2] + .1], t, 1);
  w.act('sam', TABLE[0] + .72 + .3 * away, TABLE[2] + .5 + .2 * away, away <= 0 ? atCounter({ reach: [hp[0] + .02, hp[1] + .03, hp[2]], reachWith: 'L', armR: [.4, .3], mouth: 'smile', brow: 0 }) : { view: 'q', face: -1, armL: [-.3, .2], armR: [.3, -.2], mouth: 'smile', eyes: [-.6, .5], blink: blinkAt(t) }); return { focus: 1.9, blur: .6 }; });
// 14 "Give it at least thirty minutes before you try to charge it." : the clock goes round, Sam waits
shot(29.2, 32.2, (lt, t, u, w) => { const f = [TABLE[0] + .55, .93, TABLE[2] - .1];
  w.cam([lerp(.1, 1.2, io(u)), lerp(1.8, 2.05, u), lerp(2.8, 2.3, io(u))], [-.75, 1.55, -1.2], 46);
  w.phone(P0, flat, PS); w.props.fan.visible = true; w.props.fan.position.set(...f); w.props.fan.rotation.y = -Math.PI / 2 - .3; w.props.fan.userData.blades.rotation.z = -t * 12;
  w.hand.rotation.z = -Math.PI * io(pr(lt, .2, 2.6));
  w.act('sam', -.35, -.55, { view: 'q', face: -1, armL: [-.6, -1.5], armR: [.6, 1.5], mouth: 'smile', brow: .2, eyes: [-.4, -.9], blink: blinkAt(t), legR: .15 * Math.max(0, Math.sin(lt * 10)) }); return { focus: 2.6, blur: .5 }; });
// 15 "It can take up to a day to dry." : night falls in the window and lifts again
shot(32.2, 34.4, (lt, t, u, w) => { const n = Math.sin(Math.PI * pr(lt, .1, 2.0));
  w.cam([lerp(1.3, 1.9, io(u)), lerp(1.7, 1.75, u), lerp(2.9, 2.5, io(u))], [2.5, 1.45, -1.4], 46);
  w.night.material.opacity = .85 * n; w.props.moon.visible = n > .4;
  w.act('sam', 2.25, -.45, { view: 'q', face: 1, armL: [-.3, .2], armR: n > .5 ? [2.4, 1.5] : [.3, -.2], mouth: n > .5 ? 'o' : 'smile', eyes: [.6, -.5], blink: 0 }); return { focus: 3.4, blur: .5 }; });
// 16 "So next time your phone takes a swim," : the same slip, from another side
shot(34.4, 37.0, (lt, t, u, w) => { const f = pr(lt, .9, 1.2), sp = pr(lt, 1.2, 1.8), hp = [1.95, 1.18, -.95];
  w.cam([lerp(3.6, 3.0, io(u)), lerp(1.75, 1.65, u), lerp(2.6, 2.1, io(u))], [1.95, 1.2, -.95], 46);
  const pp = f <= 0 ? hp : [lerp(hp[0], SINK[0] + .1, f), lerp(hp[1], SINK[1] + .01, f * f), lerp(hp[2], SINK[2], f)];
  if (sp < .3) w.phone(pp, [f * 1.4, 0, f * 2], PS);
  w.act('sam', 2.35, -.45, atCounter({ reach: f > 0 ? [hp[0] + .03, hp[1], hp[2]] : hp, reachWith: 'L', armR: [.4, .3], mouth: f > 0 ? 'o' : 'smile', brow: f > 0 ? .8 : 0, eyes: [-.7, .3] }));
  w.splash([SINK[0] + .1, SINK[1], SINK[2]], sp, 1); return { focus: 2.0, blur: .5 }; });
// 17 "leave the rice in the kitchen." : the rice bag pushed back along the counter, and a grin
shot(37.0, 39.65, (lt, t, u, w) => { const k = io(pr(lt, .2, 1.0)), rb = [lerp(1.4, .75, k), .93, -1.25];
  w.cam([lerp(2.4, 3.4, io(u)), lerp(1.55, 2.2, io(u)), lerp(2.4, 3.6, io(u))], [1.45, lerp(1.1, 1.2, u), -.9], 46);
  w.props.rice.visible = true; w.props.rice.position.set(...rb);
  w.act('sam', 2.0, -.45, k < 1 ? atCounter({ reach: [rb[0] + .13, rb[1] + .17, rb[2] + .08], reachWith: 'L', armR: [.4, .3], mouth: 'smile', brow: 0 }) : { view: 'q', face: 1, armL: [-.3, .2], armR: [2.2, .6], mouth: 'smile', eyes: [.6, -.2], blink: blinkAt(t) }); return { focus: 2.4, blur: .4 }; });
export const SHOTS = D.SHOTS();
