// The edit: "Grease fire in the pan? Do NOT use water". 19 shots over 38.8 s, cut on the voice (seconds of the reference take).
import { makeWorld, PAN } from './world.js';
import { director } from '../../engine/film.js';
import { pr, lerp, ease, clamp } from '../../engine/toon.js';
export { CAPTIONS, DURATION, WARP } from './captions.js';
const D = director(makeWorld, [[.9, .03], [1.95, .035], [3.75, .06], [7.45, .03], [8.9, .03], [12.1, .045], [21.35, .04], [24.45, .03], [36.95, .035]]), shot = D.shot, io = ease.io, out = ease.out;
const [PX, PY, PZ] = PAN, SAM = [.78, -.45], blinkAt = t => (t % 2.9) > 2.8 ? 1 : 0;
const scared = (t, o = {}) => ({ armL: [-2.1 + Math.sin(t * 18) * .2, -.4], armR: [2.1 + Math.sin(t * 18 + 1) * .2, .4], mouth: 'shout', brow: .9, sweat: 1, eyes: [-.8, 0], ...o });
const cross = (w, pos, u, s = .3) => { w.props.X.position.set(...pos); w.pop(w.props.X, u, s); w.props.X.quaternion.copy(w.camera.quaternion); };

// 1  "If a pan of oil catches fire," : dinner, then it goes up
shot(0, 1.72, (lt, t, u, w) => { const lit = pr(lt, .86, 1.1);
  w.cam([lerp(-.5, -.9, io(u)), lerp(1.75, 1.85, u), lerp(.6, 2.6, io(u))], [lerp(PX, .15, io(u)), lerp(1.1, 1.3, u), -1], 44);
  w.flame(t, lit * (1.05 + .25 * Math.sin(Math.PI * lit)));
  w.act('sam', ...SAM, lit > 0 ? scared(t, { bob: 34 * Math.sin(Math.PI * pr(lt, .9, 1.2)) }) : { armL: [-.3, .2], armR: [.9, 1.0], mouth: 'smile', eyes: [-.7, .3], blink: blinkAt(t), bob: 4 * Math.sin(t * 4) }); return { focus: 2.6, blur: .5 }; });
// 2  "do not throw water on it." : the jug comes up, the cross lands on it
shot(1.72, 3.3, (lt, t, u, w) => { const up = out(pr(lt, 0, .25));
  w.cam([lerp(1.4, .5, io(u)), lerp(1.55, 1.7, u), lerp(1.5, 1.9, u)], [.05, 1.35, -1], 42);
  w.flame(t, 1.1); w.props.jug.visible = true; w.props.jug.position.set(.36, lerp(1.0, 1.52, up), -.72); w.props.jug.rotation.z = .5 * up;
  w.act('sam', ...SAM, { armL: [-1.75, -.5], armR: [.4, .4], mouth: 'grit', brow: -.5, sweat: 1, eyes: [-.8, 0] });
  cross(w, [.36, 1.66, -.5], pr(lt, .2, .4), .2); return { focus: 2.4, blur: .5 }; });
// 3  "Water makes the fire bigger," : what happens if you do
shot(3.3, 4.9, (lt, t, u, w) => { const pour = pr(lt, .15, .45), boom = out(pr(lt, .42, .8));
  w.cam([lerp(-.4, -1.1, out(pr(lt, .42, 1.6))), lerp(1.6, 2.0, boom), lerp(1.7, 3.6, out(pr(lt, .42, 1.6)))], [0, lerp(1.35, 1.75, boom), -1], 46);
  w.flame(t, 1.1 + 2.3 * boom); w.props.jug.visible = true; w.props.jug.position.set(.3, 1.6, -.78); w.props.jug.rotation.z = .5 + 1.1 * pour;
  w.props.water.visible = pour > 0 && boom < .5; w.props.water.position.set(.02, 1.35, -.9); w.props.water.rotation.z = -.5; w.props.water.scale.set(1, pour, 1);
  w.act('sam', lerp(SAM[0], 1.25, boom), lerp(SAM[1], -.1, boom), scared(t, { lean: .1 * boom, eyes: [-.8, -.4] })); return { focus: 3, blur: .4 }; });
// 4  "and throws burning oil across your kitchen." : it lands everywhere
shot(4.9, 7.2, (lt, t, u, w) => { const f = out(pr(lt, 0, 1.3));
  w.cam([lerp(1.9, .2, io(u)), lerp(2.3, 1.9, u), lerp(3.9, 3.2, u)], [lerp(.2, .5, u), lerp(1.3, 1.0, u), -.6], 48);
  w.flame(t, lerp(3.2, 2.2, u)); w.fling(t, f); w.spread(t, [.9 * pr(lt, .8, 1.3), 0, .7 * pr(lt, 1.0, 1.5)]);
  w.act('sam', 1.5, .5, scared(t, { lean: .12, squash: .94, eyes: [-.6, -.5] })); return { focus: 4.5, blur: .3 }; });
// 5  "Do not pick up the pan." : a hand on the handle, stopped
shot(7.2, 8.52, (lt, t, u, w) => { const r = out(pr(lt, 0, .25)), back = pr(lt, .5, .8);
  w.cam([lerp(1.5, 1.0, io(u)), lerp(1.85, 1.65, u), lerp(.9, .6, u)], [PX + .1, 1.05, PZ + .3], 42);
  w.flame(t, 1.15); const hz = lerp(.1, PZ + .62, r) + .3 * back; w.reach([1.2, 1.2, .2], [PX + .02, 1.07, hz]);
  cross(w, [PX + .4, 1.38, PZ + .7], pr(lt, .2, .4), .13); return { focus: 1.5, blur: .7 }; });
// 6  "And do not grab an ordinary fire extinguisher." : the obvious tool, the wrong one
shot(8.52, 11.7, (lt, t, u, w) => { const up = out(pr(lt, .05, .35));
  w.cam([lerp(-1.5, -.2, io(u)), lerp(1.5, 1.7, u), lerp(1.2, 2.4, io(u))], [lerp(.5, .35, u), 1.3, -.8], 44);
  w.flame(t, 1.15); w.props.ext.visible = true; w.props.ext.position.set(.3, lerp(.2, .96, up), -.5); w.props.ext.rotation.z = .15 * Math.sin(t * 3);
  w.act('sam', ...SAM, { armL: [-1.1 * up - .3, -.6 * up], armR: [.4, .4], mouth: lt > .7 ? 'o' : 'grit', brow: lt > .7 ? .8 : -.5, sweat: 1, eyes: [-.7, lt > .7 ? -.6 : .1] });
  cross(w, [.3, 1.62, -.4], pr(lt, .36, .56), .17); return { focus: 2.6, blur: .5 }; });
// 7  "It can blast burning oil around the room." : the jet lifts the oil out of the pan
shot(11.7, 14.1, (lt, t, u, w) => { const go = pr(lt, .3, .5), f = out(pr(lt, .45, 1.7));
  w.cam([lerp(.9, -1.6, io(u)), lerp(1.45, 2.1, io(u)), lerp(1.4, 3.3, io(u))], [lerp(-.2, -.6, u), 1.25, -.9], 46);
  w.flame(t, lerp(1.15, 1.9, f)); w.props.ext.visible = true; w.props.ext.position.set(.55, 1.02, -.6); w.props.ext.rotation.z = .5;
  w.props.spray.userData.set(t, go, [.42, 1.45, -.7], [PX - .1, 1.12, PZ], w.camera, 2.2, .7); w.fling(t, f, -1); w.spread(t, [0, .8 * pr(lt, 1.1, 1.6), 0]);
  w.act('sam', SAM[0] + .15, SAM[1], scared(t, { armL: [-1.4, -.6], eyes: [-.8, -.2] })); return { focus: 3.4, blur: .4 }; });
// 8  "Instead, turn off the burner." : one knob, a quarter turn
shot(14.1, 15.55, (lt, t, u, w) => { const turn = io(pr(lt, .42, .8));
  w.cam([lerp(-.9, -.55, io(u)), lerp(1.25, 1.1, u), lerp(.5, .25, u)], [-.3, .92, -.9], 38);
  w.flame(t, 1.1); w.burner(1 - turn); w.reach([1.0, .95, -.2], [-.33 + .04, .86, -.76 + .16 * (1 - out(pr(lt, 0, .35)))]); return { focus: 1.4, blur: .8 }; });
// 9  "Slide a lid over the pan." : the flames have nowhere to go
shot(15.55, 16.85, (lt, t, u, w) => { const s = io(pr(lt, .1, .75));
  w.cam([lerp(-1.3, -.9, io(u)), lerp(1.3, 1.45, u), lerp(.2, .5, u)], [PX + .1, 1.08, PZ], 40);
  w.burner(0); w.flame(t, 1.1 * (1 - s) * (1 - s)); w.props.lid.visible = true; w.props.lid.position.set(lerp(PX + .9, PX, s), PY + .11, PZ); w.props.lid.rotation.z = .25 * (1 - s);
  w.reach([1.6, 1.5, .6], [lerp(PX + .9, PX, s) + .06, PY + .2, PZ + .06]); return { focus: 1.7, blur: .7 }; });
// 10 "No lid? Use a baking sheet." : the same move with what is to hand
shot(16.85, 18.7, (lt, t, u, w) => { const ask = lt < .62, s = io(pr(lt, .72, 1.3));
  w.cam([lerp(.5, -.2, io(u)), lerp(2.4, 2.15, u), lerp(.1, -.1, u)], [PX, 1.0, PZ - .05], 42);
  w.burner(0); w.flame(t, ask ? 1.0 : 1.0 * (1 - s) * (1 - s));
  w.props.sheet.visible = !ask; w.props.sheet.position.set(lerp(PX + 1.0, PX, s), PY + .11, PZ); w.props.sheet.rotation.y = .3 * (1 - s);
  if (!ask) w.reach([1.8, 1.6, .8], [lerp(PX + 1.0, PX, s) + .3, PY + .16, PZ + .12]); return { focus: 1.5, blur: .6 }; });
// 11 "Then leave it covered until the pan is cool," : time passes, hands off
shot(18.7, 20.9, (lt, t, u, w) => {
  w.cam([lerp(-.6, .9, io(u)), lerp(1.5, 1.35, u), lerp(.4, .3, u)], [PX + .15, 1.2, PZ], 42);
  w.burner(0); w.props.lid.visible = true; w.props.lid.position.set(PX, PY + .11, PZ); w.smokeUp(t, .55 * (1 - u));
  w.props.timer.visible = true; w.props.timer.scale.setScalar(.6); w.props.timer.position.set(PX + .28, 1.45, PZ - .1); w.props.timer.quaternion.copy(w.camera.quaternion); w.props.timer.userData.hand.rotation.z = -lt * 5.5; return { focus: 1.6, blur: .6 }; });
// 12 "or the fire can start again." : lift it early and the air gets back in
shot(20.9, 22.5, (lt, t, u, w) => { const lift = out(pr(lt, .25, .5)), back = out(pr(lt, .45, .7));
  w.cam([lerp(.9, 1.3, u), lerp(1.4, 1.6, back), lerp(.4, 1.3, out(pr(lt, .45, 1.4)))], [PX + .2, 1.25, PZ], 44);
  w.burner(0); w.props.lid.visible = true; w.props.lid.position.set(PX + .1 * lift, PY + .11 + .5 * lift, PZ); w.props.lid.rotation.z = -.5 * lift;
  w.reach([1.6, 1.9, .9], [PX + .1 * lift + .04, PY + .2 + .5 * lift, PZ + .05]); w.flame(t, 1.25 * back); return { focus: 1.9, blur: .6 }; });
// 13 "Fire in the oven? Turn it off, and keep the door shut." : behind the glass it starves
shot(22.5, 25.3, (lt, t, u, w) => { const turn = io(pr(lt, 1.15, 1.5)), grab = out(pr(lt, 1.75, 2.0));
  w.cam([lerp(.9, -.3, io(u)), lerp(.75, .95, u), lerp(1.1, .7, io(u))], [0, .6, -.9], 44);
  w.flame(t, 0); w.props.extra0.visible = true; w.props.extra0.position.set(0, .2, -.885); w.props.extra0.userData.set(t, lerp(.62, .3, pr(lt, 1.5, 2.8)), w.camera);
  w.burner(1 - turn); if (lt < 1.7) w.reach([1.0, .95, -.2], [-.29, .86, -.74 + .2 * (1 - out(pr(lt, .8, 1.1)))]); else w.reach([.8, 1.2, .9], [.1, .72, lerp(-.3, -.78, grab)]);
  cross(w, [.32, .8, -.62], pr(lt, 1.9, 2.1), .13); return { focus: 1.9, blur: .6 }; });
// 14 "Flames out of the pan?" : it has reached the hood and the cupboards
shot(25.3, 26.6, (lt, t, u, w) => { const g = out(u);
  w.cam([lerp(-.3, -1.0, u), lerp(1.5, 1.9, u), lerp(1.6, 3.5, out(u))], [.1, lerp(1.4, 1.6, u), -1], 46);
  w.flame(t, 1.5 + g); w.spread(t, [1.3 * g, 1.0 * pr(lt, .3, .9), .8 * pr(lt, .5, 1.1)]);
  w.act('sam', 1.2, -.1, scared(t, { eyes: [-.8, -.5] })); return { focus: 3.4, blur: .3 }; });
// 15 "Get out, close the door behind you," : run, and shut it
shot(26.6, 28.12, (lt, t, u, w) => { const r = pr(lt, 0, .95), shut = io(pr(lt, .95, 1.3));
  w.cam([lerp(.6, 1.5, io(u)), lerp(1.7, 1.5, u), lerp(4.6, 4.2, u)], [lerp(2.0, 3.2, io(u)), 1.1, lerp(.4, 1.3, io(u))], 46);
  w.flame(t, 2.6); w.spread(t, [1.4, 1.1, .9]); w.door.rotation.y = -1.45 * (1 - shut);
  if (r < 1) w.act('sam', lerp(1.2, 3.25, r), lerp(-.1, 1.45, r), { legL: .7 * Math.sin(t * 24), legR: -.7 * Math.sin(t * 24), armL: [-.2 - .8 * Math.sin(t * 24), -.9], armR: [.2 - .8 * Math.sin(t * 24), .9], lean: .12, bob: 16 * Math.abs(Math.sin(t * 24)), mouth: 'grit', brow: .6, sweat: 1, eyes: [.8, 0] }); return { focus: 3.6, blur: .3 }; });
// 16 "and call the fire service." : from the far side of the door
shot(28.12, 29.9, (lt, t, u, w) => {
  w.cam([lerp(6.4, 5.9, u), lerp(1.75, 1.6, u), lerp(3.9, 3.3, u)], [4.2, 1.15, 1.5], 44);
  w.flame(t, 0); w.props.glow.visible = true; w.props.glow.material.opacity = .75 + .25 * Math.sin(t * 17);
  w.act('sam', 4.7, 1.9, { armL: [-.3, .2], armR: [2.45, .75], hold: 'phone', mouth: lt % .5 < .25 ? 'o' : 'shout', brow: .7, sweat: 1, eyes: [-.5, -.2], bob: 5 * Math.abs(Math.sin(t * 7)) }); return { focus: 2.6, blur: .5 }; });
// 17 "And next time, stay by the pan." : the same dinner, with the cook in the room
shot(29.9, 31.8, (lt, t, u, w) => {
  w.cam([lerp(-1.5, .1, io(u)), lerp(1.55, 1.7, u), lerp(1.6, 2.3, u)], [.3, 1.25, -.9], 42);
  w.flame(t, 0); w.act('sam', ...SAM, { armL: [-.3, .2], armR: [.9 + .12 * Math.sin(t * 9), 1.0], mouth: 'smile', eyes: [-.7, .3], blink: blinkAt(t), bob: 4 * Math.sin(t * 4) }); return { focus: 2.5, blur: .5 }; });
// 18 "If the oil starts to smoke, turn the burner off." : the warning comes before the fire
shot(31.8, 34.5, (lt, t, u, w) => { const sm = pr(lt, .15, 1.0), turn = io(pr(lt, 1.75, 2.1));
  w.cam([lerp(.6, -.7, io(u)), lerp(1.75, 1.35, io(u)), lerp(1.3, .5, io(u))], [lerp(.1, -.28, io(u)), lerp(1.3, 1.0, io(u)), -.9], 42);
  w.flame(t, 0); w.smokeUp(t, sm * (1 - .8 * pr(lt, 2.1, 2.7))); w.burner(1 - turn);
  w.act('sam', ...SAM, { armL: [-.3, .2], armR: [.4, .3], mouth: lt > .7 ? 'o' : 'smile', brow: lt > .7 ? .7 : 0, eyes: [-.8, .1] });
  if (lt > 1.3) w.reach([1.0, .95, -.2], [-.29, .86, -.74 + .2 * (1 - out(pr(lt, 1.3, 1.7)))]); return { focus: 2, blur: .6 }; });
// 19 "Cooking left alone starts more of these fires than anything else." : nobody home; it ends where the film began
shot(34.5, 38.84, (lt, t, u, w) => { const lit = pr(lt, 2.42, 2.7);
  w.cam([lerp(1.6, -.3, io(u)), lerp(2.0, 1.45, io(u)), lerp(3.8, .5, io(u))], [lerp(.3, PX, io(u)), lerp(1.2, 1.12, u), -1], 44);
  w.smokeUp(t, pr(lt, .3, 1.8) * (1 + .5 * lit)); w.flame(t, lit * (1 + .4 * pr(lt, 2.7, 4.3))); return { focus: lerp(4, 1.2, io(u)), blur: .6 }; });
export const SHOTS = D.SHOTS();
