// The edit: "How to survive a rip current". 15 shots over 34 s, cut on the voice (times are seconds of audio/vo.wav).
import { makeWorld, swim, afloat, run } from './world.js';
import { pr, lerp, ease, clamp } from './toon.js';
export { CAPTIONS, DURATION } from './captions.js';
const SHAKES = [[.82, .02], [1.76, .03], [11.3, .02], [13.3, .025], [15.5, .015], [28.92, .035], [31.18, .02], [32.5 + 5.28, .02]];   // first-take seconds
let Wd; const W = () => Wd || (Wd = makeWorld());
const SH = [];   // [start, end, fn(lt, t, u, world)] : u runs 0..1 through the shot
const shot = (a, b, fn) => SH.push([a, b, fn]);
const io = ease.io, out = ease.out, blinkAt = t => (t % 2.9) > 2.8 ? 1 : 0;

// 1  "If a rip current grabs you" : a happy swim, then the sea takes hold
shot(0, 1.62, (lt, t, u, w) => { const g = out(pr(lt, .82, 1.62)), z = lerp(-6.2, -10.5, g), grabbed = lt > .82;
  w.cam([lerp(2.2, .5, io(u)), lerp(1.6, .95, u), lerp(-2.0, -3.4, u)], [0, .6, lerp(-6.2, -8.6, g)], 42);
  w.act('sam', 0, z, grabbed ? { ...afloat(t), armL: [-2.2 + Math.sin(t * 22) * .3, -.3], armR: [2.2 + Math.sin(t * 22 + 1) * .3, .3], mouth: 'shout', brow: .9, eyes: [0, .2] } : swim(t * 5, { mouth: 'smile', blink: blinkAt(t) }));
  w.ripple(0, 0, z, t); if (grabbed) w.flowAt(t, pr(lt, .82, 1.0), z - 1.5, -30, 9); return { focus: 5 }; });
// 2  "do not swim back to shore" : flat out toward the beach, going backwards anyway
shot(1.62, 3.3, (lt, t, u, w) => { const z = lerp(-11.2, -12.6, u);
  w.cam([lerp(-1.6, .5, io(u)), lerp(1.5, 1.05, u), lerp(-6.4, -7.9, u)], [0, .95, -11.5], 40);
  w.act('sam', 0, z, swim(t * 16, { mouth: 'grit', brow: -.5, sweat: 1, eyes: [0, .3] })); w.ripple(0, 0, z, t * 2, 1.2); w.flowAt(t, 1, z - 1.5, -30, 6);
  w.props.X.position.set(0, 1.95, z + .1); w.pop(w.props.X, pr(lt, .12, .34), .55); w.props.X.rotation.z = Math.sin(t * 20) * .05 * (1 - pr(lt, .12, .6)); return { focus: 4.5 }; });
// 3  "A rip is a river of water running out to sea" : crane up over the channel
shot(3.3, 6.25, (lt, t, u, w) => { const k = io(u);
  w.cam([lerp(-4.6, 1.2, k), lerp(4, 14, k), lerp(8, -3, k)], [0, 0, lerp(-7, -22, k)], 44);
  w.act('sam', Math.sin(t * 1.4) * .3, lerp(-10, -19, u), afloat(t, { mouth: 'o', brow: .9, armL: [-2.2, -.3], armR: [2.2, .3] }), true); w.flowAt(t, 1, -2, -40, 5.5); return { focus: 14, blur: .5 }; });
// 4  "the strongest move as fast as an Olympic swimmer" : a race out to sea, seen from the water
shot(6.25, 9.45, (lt, t, u, w) => { const z = lerp(-12.5, -19.2, u);
  w.cam([lerp(.3, -.2, u), 1.5, z - lerp(5.2, 4.4, u)], [0, .85, z + 1], 46);
  w.act('pro', -.8, z, swim(t * 13, { mouth: 'grit', brow: -.6, eyes: [.8, 0] })); w.ripple(0, -.8, z, t * 2);
  w.props.duck.visible = true; w.props.duck.position.set(.85, .05 + Math.sin(t * 5) * .05, z - .25); w.props.duck.rotation.set(Math.sin(t * 4) * .1, 0, Math.sin(t * 3) * .12); w.ripple(1, .85, z, t, .8);
  w.props.buoy.visible = true; w.props.buoy.scale.setScalar(.62); w.props.buoy.position.set(0, Math.sin(t * 2.5) * .06, -10.6); w.props.buoy.rotation.z = Math.sin(t * 2) * .05; w.ripple(2, 0, -10.6, t * .7, .8);
  w.flowAt(t, 1, -2, z - 2.5, 5); return { focus: 5 }; });
// 5  "Fight it and you tire out"
shot(9.45, 11.05, (lt, t, u, w) => { const ph = 9.45 * 16 + lt * 16 - lt * lt * 4.2;
  w.cam([lerp(-1.5, .6, io(u)), lerp(1.35, .95, u), lerp(-7.6, -8.8, u)], [0, .75, -12], 38);
  w.act('sam', 0, -12, swim(ph, { mouth: 'grit', brow: .7, sweat: 1, blink: u > .7 ? .5 : 0 })); w.ripple(0, 0, -12, t * 1.5); w.flowAt(t, .8, -13.5, -30, 5); return { focus: 3.8 }; });
// 6  "That is how people drown" : low in the water, spent
shot(11.05, 12.52, (lt, t, u, w) => {
  w.cam([lerp(1.6, .2, io(u)), lerp(1.5, .7, io(u)), lerp(-8.0, -9.4, u)], [0, lerp(.7, .5, u), -12], 36);
  w.act('sam', 0, -12, { armL: [-1.2, -.2], armR: [2.2 - u * .5, .5], sink: lerp(.4, .56, io(u)), bob: 6 * Math.sin(t * 2), mouth: 'sad', brow: .9, blink: .55, sweat: 1, head: -.12 }); w.ripple(0, 0, -12, t * .6); w.flowAt(t, .6, -13.5, -30, 5); return { focus: 3.2 }; });
// 7  "But a rip will not pull you under"
shot(12.52, 14.45, (lt, t, u, w) => { const ok = lt > .9;
  w.cam([lerp(1.3, -.6, io(u)), lerp(1.1, 1.5, u), lerp(-5.6, -7.0, u)], [.1, .95, -12], 40);
  w.act('sam', -.45, -12, afloat(t, { eyes: ok ? [.6, -.2] : [0, .9], mouth: ok ? 'smile' : 'o', brow: ok ? 0 : .6, bob: 14 * Math.sin(t * 3) })); w.ripple(0, -.45, -12, t);
  w.props.down.position.set(.62, 1.2 + Math.sin(t * 3) * .05, -11.8); w.pop(w.props.down, pr(lt, .3, .5), .7); w.props.X.position.set(.62, 1.2, -11.5); w.pop(w.props.X, pr(lt, .78, .98), .5); return { focus: 3.2 }; });
// 8  "And it is usually less than a hundred yards wide" : straight down on the channel
shot(14.45, 17.65, (lt, t, u, w) => { const k = io(u);
  w.cam([lerp(1.5, 0, k), lerp(30, 16, k), lerp(-6, -9.8, k)], [0, 0, lerp(-13.4, -12.2, k)], 40);
  w.act('sam', 0, lerp(-10.2, -11.4, u), afloat(t, { mouth: 'smile', eyes: [0, .6] }), true); w.flowAt(t, 1, -1, -40, 4.5);
  w.pop(w.props.width, pr(lt, 1.05, 1.3), .8); return { focus: 20, blur: 0 }; });
// 9  "So turn sideways"
shot(17.65, 19.15, (lt, t, u, w) => { const turn = pr(lt, .2, .4);
  w.cam([lerp(-1.0, .9, io(u)), lerp(1.2, 1.6, u), lerp(-5.6, -6.6, u)], [lerp(-.1, .5, io(u)), .7, -12], 40);
  w.act('sam', -.4, -12, afloat(t, { eyes: [turn, 0], brow: -.4 * turn, mouth: 'smile', armR: [lerp(1.4, 1.57, turn), 0], lean: .12 * turn })); w.ripple(0, -.4, -12, t);
  w.props.side.position.set(.75, .09, -11.2); w.pop(w.props.side, pr(lt, .26, .48), .36); w.flowAt(t, .7, -13.5, -30, 5); return { focus: 3.4 }; });
// 10 "Swim along the beach until the pull lets go" : out of the dark channel, sideways
shot(19.15, 21.65, (lt, t, u, w) => { const x = lerp(.2, 6.6, io(u)), free = x > 3.4;
  w.cam([lerp(.2, 5.2, io(u)), lerp(10.5, 7.5, u), lerp(-.5, -2.5, u)], [lerp(.8, 5.0, io(u)), 0, -12.2], 42);
  w.act('sam', x, -12, swim(t * 11, { mouth: free ? 'smile' : 'grit', brow: free ? 0 : -.4, eyes: [.8, 0] }), true); w.ripple(0, x, -12, t * 1.5);
  w.props.pathSide.visible = true; w.flowAt(t, 1, -1, -40, 5); return { focus: 13, blur: .3 }; });
// 11 "Then swim back in at an angle"
shot(21.65, 23.5, (lt, t, u, w) => { const k = io(u), x = lerp(6.7, 9.9, k), z = lerp(-11.6, -3.0, k);
  w.cam([lerp(7.0, 10.2, k), lerp(10, 5.5, k), lerp(2.5, 6.0, k)], [lerp(7.4, 9.4, k), 0, lerp(-10, -3.5, k)], 44);
  w.act('sam', x, z, swim(t * 11, { mouth: 'smile', eyes: [0, .4] }), true); w.ripple(0, x, z, t * 1.5); w.props.pathBack.visible = true; return { focus: 11, blur: .3 }; });
// 12 "Too tired to swim? Relax," : stop fighting, lie back
shot(23.5, 25.38, (lt, t, u, w) => { const calm = lt > 1.25, c = io(pr(lt, 1.25, 1.6));
  w.cam([lerp(1.4, -.5, io(u)), lerp(.9, 1.3, u), lerp(-8.4, -9.3, u)], [0, .7, -12], 38);
  w.act('sam', 0, -12, calm ? afloat(t, { mouth: 'smile', blink: .9 * c, brow: 0, bob: 6 * Math.sin(t * 2) }) : swim(23.5 * 9 + lt * 9 - lt * lt * 3, { mouth: 'sad', brow: .9, sweat: 1, blink: .4 })); w.ripple(0, 0, -12, t * (calm ? .7 : 1.4)); w.flowAt(t, .6, -13.5, -30, 4); return { focus: 2.8 }; });
// 13 "face the shore, and wave for help" : the lifeguard sees it
shot(25.38, 27.25, (lt, t, u, w) => { const seen = pr(lt, .5, .7);
  w.cam([lerp(1.3, -.5, io(u)), lerp(2.0, 1.6, u), lerp(7.0, 5.7, u)], [-.4, .45, -3], 44);
  w.act('guard', .05, 2.6, { armL: [lerp(-.3, -2.2, seen), lerp(.2, -.2, seen)], armR: [.4, 1.6 * seen], mouth: seen > .5 ? 'shout' : 'smile', brow: .5 * seen, eyes: [-.7, -.4], bob: 26 * Math.sin(Math.PI * seen) * (seen < 1 ? 1 : 0) + 4 * Math.abs(Math.sin(t * 6)) * seen });
  w.act('sam', -1.0, -3.6, afloat(t, { armR: [2.2 + Math.sin(t * 11) * .35, .3], mouth: 'smile' })); w.ripple(0, -1.0, -3.6, t); return { focus: 4 }; });
const D1 = 5.28, C0 = 38.53, END = 41.48;   // from tools/words_ref.json: the room the bystander lines take, and where the last line starts
// 13a "See someone else caught in one?" : from the sand, someone is waving out in the rip
shot(27.25, 28.72, (lt, t, u, w) => { const see = pr(lt, .25, .45);
  w.cam([lerp(1.2, -.5, io(u)), lerp(2.2, 1.6, u), lerp(8.2, 6.4, u)], [-.5, .7, -3], 44);
  w.act('pro', .85, -4.0, afloat(t, { armL: [-2.2 - Math.sin(t * 12) * .3, -.3], armR: [2.2 + Math.sin(t * 12) * .3, .3], mouth: 'shout', brow: .9 })); w.ripple(0, .85, -4.0, t * 1.5); w.flowAt(t, .7, -5.5, -24, 5);
  w.act('sam', -.4, 3.0, { armL: [-.3 - 1.9 * see, -.3 * see], armR: [.3 + 1.9 * see, .3 * see], mouth: see > .5 ? 'shout' : 'smile', brow: .9 * see, eyes: [.5, -.5], bob: 30 * Math.sin(Math.PI * see) * (see < 1 ? 1 : 0), sweat: see }); return { focus: 5 }; });
// 13b "Do not swim out after them." : the sprint for the water, stopped dead
shot(28.72, 29.98, (lt, t, u, w) => { const stop = pr(lt, .2, .34), z = lerp(4.2, 1.5, out(pr(lt, 0, .34)));
  w.cam([lerp(.5, -.2, u), lerp(.9, 1.2, u), lerp(-2.6, -4.2, out(u))], [0, 1.0, 2], 46);
  w.act('sam', 0, z, stop < 1 ? run(t * 22, { mouth: 'grit', brow: -.5 }) : { armL: [-2.0, -.4], armR: [2.0, .4], lean: -.1, mouth: 'o', brow: .9, eyes: [0, -.3], squash: 1 - .08 * Math.sin(Math.PI * pr(lt, .34, .6)), sweat: 1 });
  w.props.X.position.set(.8, 1.5, .6); w.pop(w.props.X, pr(lt, .2, .4), .5); return { focus: 5 }; });
// 13c "Throw them something that floats," : ride behind the ring as it flies out
shot(29.98, 31.5, (lt, t, u, w) => { const f = pr(lt, .28, 1.2), k = f, x = lerp(-.3, .4, k), z = lerp(1.6, -5.0, k), y = lerp(1.5, .14, k) + 2.6 * 4 * k * (1 - k) * .5, landed = f >= 1;
  w.cam([x + lerp(.9, .3, k), y + lerp(.5, 1.1, k), z + lerp(3.2, 2.4, k)], [.4, .5, lerp(-2, -5.2, k)], 46);
  w.props.ring.visible = true; w.props.ring.position.set(x, y + (landed ? Math.sin(t * 3) * .03 : 0), z); w.props.ring.rotation.set(landed ? Math.PI / 2 : Math.PI / 2 + Math.sin(lt * 14) * .5, 0, lt * 9 * (landed ? 0 : 1));
  w.act('sam', -.5, 2.3, { armL: [-.3, .2], armR: [lerp(2.6, .9, pr(lt, .12, .3)), .3], lean: .12 * pr(lt, .12, .3), mouth: 'grit', brow: -.4 });
  w.act('pro', .4, -5.6, afloat(t, { armL: [-2.2, -.3], armR: [landed ? 1.2 : 2.2, .3], mouth: landed ? 'smile' : 'shout', brow: landed ? 0 : .9 })); w.ripple(0, .4, -5.6, t * 1.5); if (landed) w.ripple(1, x, z, t * 2, .7); return { focus: 4 }; });
// 13d "and get a lifeguard." : flat out along the sand
shot(31.5, 27.25 + D1, (lt, t, u, w) => { const z = lerp(7.5, 3.6, u);
  w.cam([lerp(-.6, .5, u), lerp(.8, 1.1, u), z - lerp(3.6, 2.9, u)], [0, 1.05, z], 46);
  w.act('guard', 0, z, run(t * 24, { mouth: 'shout', brow: -.5, eyes: [0, -.2], lean: .14 })); return { focus: 3.2 }; });
// 14 "And before you get in, look for the calm, dark gap between the breaking waves"
shot(27.25 + D1, 31.7 + D1, (lt, t, u, w) => { const k = io(pr(lt, .5, 4.45)), point = pr(lt, .9, 1.2);
  w.cam([lerp(.5, .3, k), lerp(2.0, 7.5, k), lerp(7.6, 9.5, k)], [0, lerp(1.2, 0, k), lerp(0, -9, k)], 44);
  w.act('sam', -.35, 2.4, { armL: [-.3, .2], armR: [lerp(.3, 2.0, point), .35 * point + .12 * Math.sin(t * 7) * point], lean: .05 * point, eyes: [.5, -.6], mouth: 'smile', brow: -.2, bob: 6 * Math.abs(Math.sin(t * 3)), blink: blinkAt(t) });
  const a = pr(lt, 2.15, 2.5); w.props.outline.visible = a > 0; w.props.outline.material.opacity = a; return { focus: lerp(5.5, 14, k), blur: 1 - k }; });
// 15 "That gap is the rip." : keep moving to the last frame
shot(31.7 + D1, C0, (lt, t, u, w) => {
  w.cam([lerp(.3, 0, u), lerp(8.2, 6.6, u), lerp(6.5, 3.2, u)], [0, 0, lerp(-9, -11.5, u)], 44);
  w.props.outline.visible = true; w.props.outline.material.opacity = 1; w.pop(w.props.name, pr(lt, .78, 1.05)); w.flowAt(t, pr(lt, .9, 1.3), -13, -40, 5); return { focus: 13, blur: 0 }; });

// 16 "Better still, swim where the lifeguards are." : between the red and yellow flags, and keep rising
shot(C0, END, (lt, t, u, w) => { const k = out(u), ph = t * 6;
  w.cam([lerp(-18.2, -17.2, k), lerp(1.3, 4.6, k), lerp(4.2, 8.6, k)], [-17.5, lerp(1.2, .5, k), lerp(0, -3, k)], 46);
  w.props.patrol.visible = true; w.props.patrol.position.set(-17.5, 0, .7); w.props.patrol.scale.set(.36, 1, 1);
  w.act('sam', -17.7, -2.6, swim(ph, { mouth: 'smile', eyes: [0, .2] })); w.ripple(0, -17.7, -2.6, t);
  w.act('guard', -16.75, 2.4, { armL: [-.3, .2], armR: [2.2 + Math.sin(t * 9) * .3, .3], mouth: 'smile', bob: 5 * Math.abs(Math.sin(t * 4)) }); return { focus: lerp(5, 12, k), blur: 1 - k * .6 }; });

export const SHOTS = SH.map(([start, end, fn]) => ({ start, end, build: () => { const w = W(); return { scene: w.scene, camera: w.camera, update: (lt, t) => { w.reset(t); const r = fn(lt, t, clamp(lt / (end - start)), w) || {}, c = w.camera, d = r.focus || 6;
      c.translateZ(d * .09 * Math.pow(1 - clamp(lt / .32), 3));                                        // each shot lands with a short push-in
      c.translateX(Math.sin(t * 1.7) * d * .006); c.translateY(Math.sin(t * 2.3 + 1) * d * .005); c.rotateZ(Math.sin(t * 1.3) * .007);   // handheld drift
      for (const [ts, amp] of SHAKES) { const dt = t - ts; if (dt >= 0 && dt < .4) { const a = amp * Math.pow(1 - dt / .4, 2); c.rotateZ(Math.sin(dt * 70) * a); c.rotateX(Math.sin(dt * 55 + 1) * a * .6); } }
      return r; } }; } }));
