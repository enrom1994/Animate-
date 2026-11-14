// The edit: "Grease fire in the pan? Do NOT use water". 19 shots over 38.8 s, cut on the voice (seconds of the reference take).
import { makeWorld, PAN } from './world.js';
import { director } from '../../engine/film.js';
import { pr, lerp, ease, clamp } from '../../engine/toon.js';
export { CAPTIONS, DURATION, WARP } from './captions.js';
const D = director(makeWorld, [[.9, .03], [1.95, .035], [3.75, .06], [7.45, .03], [8.9, .03], [12.1, .045], [21.35, .04], [24.45, .03], [36.95, .035]]), shot = D.shot, io = ease.io, out = ease.out;
const [PX, PY, PZ] = PAN, SAM = [.78, -.45], blinkAt = t => (t % 2.9) > 2.8 ? 1 : 0;
const scared = (t, o = {}) => ({ view: 'q', face: -1, armL: [-2.1 + Math.sin(t * 18) * .2, -.4], armR: [2.1 + Math.sin(t * 18 + 1) * .2, .4], mouth: 'shout', brow: .9, sweat: 1, eyes: [-.8, 0], ...o });
const cross = (w, pos, u, s = .3) => { w.props.X.position.set(...pos); w.pop(w.props.X, u, s); w.props.X.quaternion.copy(w.camera.quaternion); };

// 1  "If a pan of oil catches fire," : dinner, then it goes up
shot(0, 1.72, (lt, t, u, w) => { const lit = pr(lt, .86, 1.1);
  w.cam([lerp(-.5, -.9, io(u)), lerp(1.75, 1.85, u), lerp(.6, 2.6, io(u))], [lerp(PX, .4, io(u)), lerp(1.1, 1.3, u), -1], 44);
  w.flame(t, lit * (1.05 + .25 * Math.sin(Math.PI * lit)));
  w.act('sam', ...SAM, lit > 0 ? scared(t, { bob: 34 * Math.sin(Math.PI * pr(lt, .9, 1.2)) }) : { view: 'q', face: -1, armL: [-.3, .2], armR: [.9, 1.0], mouth: 'smile', eyes: [-.7, .3], blink: blinkAt(t), bob: 4 * Math.sin(t * 4) }); return { focus: 2.6, blur: .5 }; });
// 2  "do not throw water on it." : Sam lifts the jug, the cross lands on it
shot(1.72, 3.3, (lt, t, u, w) => { const up = ease.anti(pr(lt, 0, .34)), j = [.16, lerp(.98, 1.08, up), -.6];
  w.cam([lerp(-1.7, -1.1, io(u)), lerp(1.55, 1.7, u), lerp(2.7, 2.3, u)], [.25, 1.3, -.8], 42);
  w.flame(t, 1.1); w.props.jug.visible = true; w.props.jug.position.set(...j); w.props.jug.rotation.z = .5 * up;
  w.act('sam', ...SAM, { view: 'side', face: -1, reach: [j[0] + .13, j[1] + .13, j[2]], reachWith: 'L', armR: [.4, .4], mouth: 'grit', brow: -.5, sweat: 1, eyes: [-.8, 0] });
  cross(w, [.16, 1.5, -.5], pr(lt, .24, .44), .16); return { focus: 2.8, blur: .5 }; });
// 3  "Water makes the fire bigger," : what happens if you do
shot(3.3, 4.9, (lt, t, u, w) => { const pour = pr(lt, .15, .45), boom = out(pr(lt, .42, .8)), sx = lerp(.66, .98, boom), j = [lerp(.12, .5, boom), lerp(1.1, 1.0, boom), -.62];
  w.cam([lerp(-1.1, -1.9, out(pr(lt, .42, 1.6))), lerp(1.6, 2.0, boom), lerp(2.4, 3.9, out(pr(lt, .42, 1.6)))], [.4, lerp(1.3, 1.7, boom), -1], 46);
  w.flame(t, 1.1 + 2.3 * boom); w.props.jug.visible = true; w.props.jug.position.set(...j); w.props.jug.rotation.z = .5 + 1.1 * pour - 1.2 * boom;
  w.props.water.visible = pour > 0 && boom < .5; w.props.water.position.set(-.04, 1.06, -.8); w.props.water.rotation.z = -1.1; w.props.water.scale.set(1, pour, 1);
  w.act('sam', sx, lerp(-.45, -.1, boom), { view: boom > .2 ? 'q' : 'side', face: -1, reach: [j[0] + .13, j[1] + .13, j[2]], reachWith: 'L', armR: boom > .2 ? [2.1, .4] : [.4, .4], lean: .1 * boom, mouth: boom > .2 ? 'shout' : 'grit', brow: boom > .2 ? .9 : -.5, sweat: 1, eyes: [-.8, -.4 * boom] }); return { focus: 3.2, blur: .4 }; });
// 4  "and throws burning oil across your kitchen." : it lands everywhere
shot(4.9, 7.2, (lt, t, u, w) => { const f = out(pr(lt, 0, 1.3));
  w.cam([lerp(1.9, .2, io(u)), lerp(2.3, 1.9, u), lerp(3.9, 3.2, u)], [lerp(.2, .5, u), lerp(1.3, 1.0, u), -.6], 48);
  w.flame(t, lerp(3.2, 2.2, u)); w.fling(t, f); w.spread(t, [.9 * pr(lt, .8, 1.3), 0, .7 * pr(lt, 1.0, 1.5)]);
  w.act('sam', 1.5, .5, scared(t, { lean: .12, squash: .94, eyes: [-.6, -.5] })); return { focus: 4.5, blur: .3 }; });
// 5  "Do not pick up the pan." : Sam goes for the handle, and is stopped
shot(7.2, 8.52, (lt, t, u, w) => { const r = out(pr(lt, 0, .25)), back = io(pr(lt, .5, .8));
  w.cam([lerp(-1.0, -1.6, io(u)), lerp(1.75, 1.6, u), lerp(3.0, 2.6, u)], [.3, 1.1, -.6], 42);
  w.flame(t, 1.15); const tip = [PX + .02, 1.07, PZ + .64];
  w.act('sam', .38, -.05, back < .5 ? { view: 'side', face: -1, reach: [lerp(.35, tip[0], r), lerp(.9, tip[1], r), lerp(-.1, tip[2], r)], reachWith: 'L', armR: [.5, .5], lean: -.08, mouth: 'grit', brow: -.5, sweat: 1, eyes: [-.8, .3] } : { armL: [-2.0, -.5], armR: [2.0, .5], mouth: 'o', brow: .8, sweat: 1, eyes: [-.6, -.5], lean: .06 });
  cross(w, [PX + .28, 1.5, PZ + .66], pr(lt, .2, .4), .14); return { focus: 2.4, blur: .5 }; });
// 6  "And do not grab an ordinary fire extinguisher." : the obvious tool, the wrong one
shot(8.52, 11.7, (lt, t, u, w) => { const up = ease.anti(pr(lt, .05, .42)), e = [.32, lerp(.2, .78, up), -.5];
  w.cam([lerp(-1.9, -1.0, io(u)), lerp(1.5, 1.7, u), lerp(2.0, 2.8, io(u))], [lerp(.45, .3, u), 1.25, -.8], 44);
  w.flame(t, 1.15); w.props.ext.visible = true; w.props.ext.position.set(...e); w.props.ext.rotation.z = .1 * Math.sin(t * 3);
  w.act('sam', ...SAM, { view: 'side', face: -1, reach: [e[0] + .11, e[1] + .22, e[2]], reachWith: 'L', armR: [.4, .4], lean: -.05, mouth: lt > .8 ? 'o' : 'grit', brow: lt > .8 ? .8 : -.5, sweat: 1, eyes: [-.7, lt > .8 ? -.6 : .3] });
  cross(w, [.32, 1.55, -.4], pr(lt, .4, .6), .15); return { focus: 2.8, blur: .5 }; });
// 7  "It can blast burning oil around the room." : the jet lifts the oil out of the pan
shot(11.7, 14.1, (lt, t, u, w) => { const go = pr(lt, .3, .5), f = out(pr(lt, .45, 1.7)), e = [.5, .82, -.6];
  w.cam([lerp(-.6, -2.0, io(u)), lerp(1.45, 2.1, io(u)), lerp(2.2, 3.6, io(u))], [lerp(.35, .2, u), 1.25, -.9], 46);
  w.flame(t, lerp(1.15, 1.9, f)); w.props.ext.visible = true; w.props.ext.position.set(...e); w.props.ext.rotation.z = .5;
  w.props.spray.userData.set(t, go, [.34, 1.26, -.7], [PX - .1, 1.12, PZ], w.camera, 2.2, .7); w.fling(t, f, -1); w.spread(t, [0, .8 * pr(lt, 1.1, 1.6), 0]);
  w.act('sam', .88, SAM[1], { view: f > .3 ? 'q' : 'side', face: -1, reach: [e[0] + .1, e[1] + .2, e[2]], reachWith: 'L', armR: f > .3 ? [2.1, .4] : [.4, .4], mouth: f > .3 ? 'shout' : 'grit', brow: f > .3 ? .9 : -.5, sweat: 1, eyes: [-.8, -.2], lean: .08 * f }); return { focus: 3.4, blur: .4 }; });
// 8  "Instead, turn off the burner." : one knob, a quarter turn
shot(14.1, 15.55, (lt, t, u, w) => { const turn = ease.anti(pr(lt, .42, .8)), r = out(pr(lt, 0, .35));
  w.cam([lerp(-1.9, -1.4, io(u)), lerp(1.5, 1.35, u), lerp(2.5, 2.1, u)], [.0, 1.0, -.7], 40);
  w.flame(t, 1.1); w.burner(clamp(1 - turn));
  w.act('sam', .3, -.42, { view: 'side', face: -1, reach: [lerp(.1, -.33, r), lerp(.7, .86, r), lerp(-.5, -.82, r)], reachWith: 'L', armR: [.4, .3], lean: -.1, mouth: 'grit', brow: -.4, sweat: 1, eyes: [-.8, .5] }); return { focus: 2, blur: .6 }; });
// 9  "Slide a lid over the pan." : the flames have nowhere to go
shot(15.55, 16.85, (lt, t, u, w) => { const s = ease.anti(pr(lt, .1, .75)), lx = lerp(PX + .75, PX, s);
  w.cam([lerp(-1.9, -1.4, io(u)), lerp(1.6, 1.7, u), lerp(2.2, 2.6, u)], [.25, 1.15, -.8], 40);
  w.burner(0); w.flame(t, 1.1 * Math.pow(clamp(1 - s), 2)); w.props.lid.visible = true; w.props.lid.position.set(lx, PY + .11, PZ); w.props.lid.rotation.z = .2 * (1 - s);
  w.act('sam', .5, -.42, { view: 'side', face: -1, reach: [lx + .02, PY + .18, PZ + .04], reachWith: 'L', armR: [.4, .3], lean: -.06 - .06 * s, mouth: 'grit', brow: -.5, eyes: [-.8, .2] }); return { focus: 2.2, blur: .6 }; });
// 10 "No lid? Use a baking sheet." : the same move with what is to hand
shot(16.85, 18.7, (lt, t, u, w) => { const ask = lt < .62, s = ease.anti(pr(lt, .72, 1.3)), sx = lerp(PX + .85, PX, s);
  w.cam([lerp(-1.1, -1.8, io(u)), lerp(2.1, 1.85, u), lerp(2.7, 2.4, u)], [.25, 1.1, -.8], 42);
  w.burner(0); w.flame(t, ask ? 1.0 : Math.pow(clamp(1 - s), 2));
  w.props.sheet.visible = !ask; w.props.sheet.position.set(sx, PY + .11, PZ); w.props.sheet.rotation.y = .25 * (1 - s);
  w.act('sam', .55, -.42, ask ? { armL: [-1.5, -1.2], armR: [1.5, 1.2], mouth: 'o', brow: .7, eyes: [-.6, -.3], sweat: 1 } : { view: 'side', face: -1, reach: [sx + .3, PY + .14, PZ + .12], reachWith: 'L', armR: [.4, .3], lean: -.06 - .05 * s, mouth: 'grit', brow: -.5, eyes: [-.8, .2] }); return { focus: 2.2, blur: .6 }; });
// 11 "Then leave it covered until the pan is cool," : time passes, hands off
shot(18.7, 20.9, (lt, t, u, w) => {
  w.cam([lerp(-.6, .9, io(u)), lerp(1.5, 1.35, u), lerp(.4, .3, u)], [PX + .15, 1.2, PZ], 42);
  w.burner(0); w.props.lid.visible = true; w.props.lid.position.set(PX, PY + .11, PZ); w.smokeUp(t, .55 * (1 - u));
  w.props.timer.visible = true; w.props.timer.scale.setScalar(.6); w.props.timer.position.set(PX + .28, 1.45, PZ - .1); w.props.timer.quaternion.copy(w.camera.quaternion); w.props.timer.userData.hand.rotation.z = -lt * 5.5; return { focus: 1.6, blur: .6 }; });
// 12 "or the fire can start again." : lift it early and the air gets back in
shot(20.9, 22.5, (lt, t, u, w) => { const lift = out(pr(lt, .25, .5)), back = out(pr(lt, .45, .7)), lp = [PX + .12 * lift, PY + .11 + .45 * lift, PZ];
  w.cam([lerp(-1.6, -1.2, u), lerp(1.6, 1.8, back), lerp(2.3, 3.2, out(pr(lt, .45, 1.4)))], [.25, 1.25, -.8], 44);
  w.burner(0); w.props.lid.visible = true; w.props.lid.position.set(...lp); w.props.lid.rotation.z = -.4 * lift; w.flame(t, 1.25 * back);
  w.act('sam', .5, -.42, { view: 'side', face: -1, reach: [lp[0] + .02, lp[1] + .07, lp[2] + .04], reachWith: 'L', armR: back > .3 ? [2.0, .5] : [.4, .3], mouth: back > .3 ? 'shout' : 'smile', brow: back > .3 ? .9 : 0, sweat: back, eyes: [-.8, back > .3 ? -.3 : .2], lean: .08 * back }); return { focus: 2.4, blur: .6 }; });
// 13 "Fire in the oven? Turn it off, and keep the door shut." : behind the glass it starves
shot(22.5, 25.3, (lt, t, u, w) => { const turn = io(pr(lt, 1.15, 1.5)), r = out(pr(lt, .75, 1.1)), grab = out(pr(lt, 1.75, 2.0)), stop = pr(lt, 2.15, 2.4);
  w.cam([lerp(-.6, -1.6, io(u)), lerp(1.3, 1.15, u), lerp(3.0, 2.5, io(u))], [.15, .85, -.8], 44);
  w.flame(t, 0); w.props.extra0.visible = true; w.props.extra0.position.set(0, .2, -.885); w.props.extra0.userData.set(t, lerp(.62, .3, pr(lt, 1.5, 2.8)), w.camera);
  w.burner(1 - turn);
  const pose = lt < .75 ? { armL: [-2.0, -.4], armR: [2.0, .4], mouth: 'shout', brow: .9, sweat: 1, eyes: [-.5, .7] }
    : lt < 1.7 ? { view: 'side', face: -1, reach: [lerp(.2, -.33, r), lerp(.7, .86, r), lerp(-.5, -.82, r)], reachWith: 'L', armR: [.4, .3], lean: -.1, mouth: 'grit', brow: -.4, sweat: 1, eyes: [-.8, .6] }
    : stop < .5 ? { view: 'side', face: -1, reach: [lerp(-.2, .0, grab), lerp(.86, .7, grab), lerp(-.7, -.84, grab)], reachWith: 'L', armR: [.4, .3], lean: -.1, mouth: 'grit', brow: -.4, sweat: 1, eyes: [-.6, .8] }
    : { armL: [-1.6, -1.3], armR: [1.6, 1.3], mouth: 'o', brow: .6, sweat: 1, eyes: [-.5, .7] };
  w.act('sam', .45, -.4, pose); cross(w, [.02, .98, -.7], pr(lt, 1.9, 2.1), .13); return { focus: 2.3, blur: .5 }; });
// 14 "Flames out of the pan?" : it has reached the hood and the cupboards
shot(25.3, 26.6, (lt, t, u, w) => { const g = out(u);
  w.cam([lerp(-.3, -1.0, u), lerp(1.5, 1.9, u), lerp(1.6, 3.5, out(u))], [.1, lerp(1.4, 1.6, u), -1], 46);
  w.flame(t, 1.5 + g); w.spread(t, [1.3 * g, 1.0 * pr(lt, .3, .9), .8 * pr(lt, .5, 1.1)]);
  w.act('sam', 1.2, -.1, scared(t, { eyes: [-.8, -.5] })); return { focus: 3.4, blur: .3 }; });
// 15 "Get out, close the door behind you," : out through the doorway toward us, then pull it shut
shot(26.6, 28.12, (lt, t, u, w) => { const r = io(pr(lt, 0, .72)), shut = io(pr(lt, .86, 1.3)), a = 1.45 * (1 - shut), k = w.doorKnob(a);
  w.cam([lerp(6.6, 6.1, u), lerp(1.7, 1.6, u), lerp(3.3, 3.0, u)], [3.9, 1.1, 1.45], 44);
  w.flame(t, 2.6); w.spread(t, [1.4, 1.1, .9]); w.door.rotation.y = a;
  const x = r < 1 ? lerp(1.6, 4.55, r) : lerp(4.55, 4.25, shut), z = r < 1 ? lerp(.9, 1.75, Math.min(1, r * 1.6)) : 1.75;
  w.act('sam', x, z, r < 1 ? { legL: .7 * Math.sin(t * 24), legR: -.7 * Math.sin(t * 24), armL: [-.2 - .8 * Math.sin(t * 24), -.9], armR: [.2 - .8 * Math.sin(t * 24), .9], lean: .12, bob: 16 * Math.abs(Math.sin(t * 24)), mouth: 'grit', brow: .6, sweat: 1, eyes: [0, 0] }
    : { view: 'side', face: -1, reach: k, reachWith: 'L', armR: [.4, .3], lean: -.1, mouth: 'grit', brow: -.4, sweat: 1, eyes: [-.8, .2] }); return { focus: 2.6, blur: .4 }; });
// 16 "and call the fire service." : from the far side of the door
shot(28.12, 29.9, (lt, t, u, w) => {
  w.cam([lerp(6.1, 5.7, u), lerp(1.6, 1.7, u), lerp(3.0, 3.4, u)], [4.2, 1.15, 1.6], 44);
  w.flame(t, 0); w.props.glow.visible = true; w.props.glow.material.opacity = .75 + .25 * Math.sin(t * 17);
  w.act('sam', 4.5, 1.85, { armL: [-.3, .2], armR: [1.9, 1.2], hold: 'phone', mouth: lt % .5 < .25 ? 'o' : 'shout', brow: .7, sweat: 1, eyes: [-.5, -.2], bob: 5 * Math.abs(Math.sin(t * 7)) }); return { focus: 2.6, blur: .5 }; });
// 17 "And next time, stay by the pan." : the same dinner, with the cook in the room
shot(29.9, 31.8, (lt, t, u, w) => {
  w.cam([lerp(-1.6, -.4, io(u)), lerp(1.55, 1.7, u), lerp(2.2, 2.9, u)], [.45, 1.25, -.9], 42);
  w.flame(t, 0); w.act('sam', ...SAM, { view: 'q', face: -1, armL: [-.3, .2], armR: [.9 + .12 * Math.sin(t * 9), 1.0], mouth: 'smile', eyes: [-.7, .3], blink: blinkAt(t), bob: 4 * Math.sin(t * 4) }); return { focus: 2.5, blur: .5 }; });
// 18 "If the oil starts to smoke, turn the burner off." : the warning comes before the fire
shot(31.8, 34.5, (lt, t, u, w) => { const sm = pr(lt, .15, 1.0), turn = io(pr(lt, 1.75, 2.1)), go = io(pr(lt, 1.1, 1.5)), r = out(pr(lt, 1.35, 1.7));
  w.cam([lerp(.2, -1.6, io(u)), lerp(1.8, 1.5, io(u)), lerp(3.0, 2.4, io(u))], [lerp(.3, .05, io(u)), lerp(1.3, 1.05, io(u)), -.8], 42);
  w.flame(t, 0); w.smokeUp(t, sm * (1 - .8 * pr(lt, 2.1, 2.7))); w.burner(1 - turn);
  w.act('sam', lerp(SAM[0], .3, go), lerp(SAM[1], -.42, go), lt < 1.35 ? { view: 'q', face: -1, armL: [-.3, .2], armR: [.4, .3], mouth: lt > .7 ? 'o' : 'smile', brow: lt > .7 ? .7 : 0, eyes: [-.8, .1] }
    : { view: 'side', face: -1, reach: [lerp(.1, -.33, r), lerp(.7, .86, r), lerp(-.5, -.82, r)], reachWith: 'L', armR: [.4, .3], lean: -.1, mouth: turn > .9 ? 'smile' : 'grit', brow: turn > .9 ? 0 : -.3, eyes: [-.8, .5] }); return { focus: 2.4, blur: .6 }; });
// 19 "Cooking left alone starts more of these fires than anything else." : nobody home; it ends where the film began
shot(34.5, 38.84, (lt, t, u, w) => { const lit = pr(lt, 2.42, 2.7);
  w.cam([lerp(1.6, -.3, io(u)), lerp(2.0, 1.45, io(u)), lerp(3.8, .5, io(u))], [lerp(.3, PX, io(u)), lerp(1.2, 1.12, u), -1], 44);
  w.smokeUp(t, pr(lt, .3, 1.8) * (1 + .5 * lit)); w.flame(t, lit * (1 + .4 * pr(lt, 2.7, 4.3))); return { focus: lerp(4, 1.2, io(u)), blur: .6 }; });
export const SHOTS = D.SHOTS();
