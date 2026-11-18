// The edit: "Smell gas at home? Do NOT flip a light switch". 19 shots over 35.8 s, cut on the voice (seconds of the reference take).
import { makeWorld, SWITCH, FRONT, OUT, STOVE } from './world.js';
import { director } from '../../engine/film.js';
import { pr, lerp, ease, clamp } from '../../engine/toon.js';
export { CAPTIONS, DURATION, WARP } from './captions.js';
// the storybook look on every shot: medium ink, light creases, a little haze, dust in the light, warm, saturated
const LOOK = { inkK: .8, normK: .5, haze: ['#f2d9ae', .08], dust: .12, warm: .45, sat: 1.25 };
const D = director(makeWorld, [[2.6, .03], [7.25, .05], [11.3, .025], [12.15, .025], [13.15, .025], [14.55, .025], [16.75, .025], [21.9, .025]]), shot = (a, b, fn) => D.shot(a, b, (...x) => { const r = fn(...x) || {}; return { ...r, look: { ...LOOK, ...(r.look || {}) } }; }), io = ease.io, out = ease.out, anti = ease.anti;
const OX = OUT[0], blinkAt = t => (t % 2.9) > 2.8 ? 1 : 0;
const DOOR_IN = [3.6, 1.0, 1.4], HANDLE = [8.37, 1.0, 1.76], LAMP_SW = [7.46, 1.1, .13], KETTLE = [1.2, 1.12, -1.25], BELL = [OX + .95, 1.12, .1];
const runTo = (t, toward, o = {}) => ({ toward, legL: .7 * Math.sin(t * 22), legR: -.7 * Math.sin(t * 22), armL: [-.2 - .8 * Math.sin(t * 22), -.9], armR: [.2 - .8 * Math.sin(t * 22), .9], lean: .1, bob: 16 * Math.abs(Math.sin(t * 22)), mouth: 'grit', brow: .5, ...o });
const walkTo = (t, toward, o = {}) => ({ toward, legL: .35 * Math.sin(t * 9), legR: -.35 * Math.sin(t * 9), armL: [-.15 - .35 * Math.sin(t * 9), -.3], armR: [.15 - .35 * Math.sin(t * 9), .3], bob: 6 * Math.abs(Math.sin(t * 9)), ...o });
const nose = (o = {}) => ({ reachR: null, armL: [-.3, .2], armR: [2.55, 1.55], mouth: 'grit', brow: .7, eyes: [0, .4], sweat: 1, ...o });   // a hand pinching the nose
const stairY = x => clamp((x - 4.19) * .524, 0, 1.98);
// the height of the street's surfaces, so feet stand on them and not inside them: path, pavements, road
const streetY = (x, z) => (Math.abs(x - OX) < .65 && z > 0 && z < 3.3) ? .055 : (z > 3.3 && z < 4.5) || (z > 9.1 && z < 10.3) ? .065 : (z >= 4.5 && z <= 9.1) ? .045 : 0;
const out_ = (w, name, x, z, pose) => w.act(name, x, z, pose, false, streetY(x, z));

// 1  "If your home smells like rotten eggs," : in the hall, the smell drifting out of the kitchen
shot(0, 1.95, (lt, t, u, w) => { const k = io(u), x = lerp(5.75, 5.2, k), pinch = pr(lt, .7, 1.0), sniff = pr(lt, 0, .7);
  w.cam([lerp(6.4, 5.8, k), lerp(1.6, 1.55, k), lerp(5.4, 4.8, k)], [x - .35, 1.25, lerp(1.9, 1.7, k)], 44);
  w.act('sam', x, 1.95, pinch > 0 ? nose({ view: 'q', face: -1, eyes: [-.6, .2] }) : walkTo(t, [2, 1.95], { view: 'q', face: -1, mouth: 'o', brow: .4 + .2 * Math.sin(sniff * 9), eyes: [-.6, -.3], blink: blinkAt(t) }));   // in frame from the first frame, already sniffing
  w.smell(t, DOOR_IN, .7, 1.4, 1.5); return { focus: 3.6, blur: .5 }; });
// 2  "do not flip a light switch." : a hand on its way to the switch, and the cross
shot(1.95, 3.7, (lt, t, u, w) => { const r = anti(pr(lt, .05, .55));
  w.cam([lerp(5.4, 4.9, io(u)), lerp(1.6, 1.5, u), lerp(5.4, 4.9, io(u))], [3.95, 1.3, 1.9], 46);
  w.act('sam', 4.22, 2.12, { view: 'side', face: -1, reach: [SWITCH[0] + .02, 1.3, lerp(2.55, SWITCH[2], clamp(r))], reachWith: 'L', armR: [.4, .3], mouth: 'grit', brow: .5, eyes: [-.7, 0] });
  w.smell(t, DOOR_IN, .8, 1.6, 1.4); w.cross([SWITCH[0] + .06, 1.72, SWITCH[2] + .25], pr(lt, .6, .8), .2); return { focus: 3.0, blur: .5 }; });
// 3  "That smell is added to gas" : at the stove, where it comes from
shot(3.7, 5.32, (lt, t, u, w) => {
  w.cam([lerp(.9, .3, io(u)), lerp(1.6, 1.4, u), lerp(.9, .5, u)], [STOVE[0] + .15, 1.05, STOVE[2]], 40);
  w.burner(0); w.flame(t, 0); w.smell(t, [STOVE[0], STOVE[1] + .1, STOVE[2] + .1], .55, .5, 1.0); return { focus: 1.5, blur: .7 }; });
// 4  "so you notice a leak," : Sam in the kitchen doorway, nose pinched
shot(5.32, 7.1, (lt, t, u, w) => { const pinch = pr(lt, .15, .4);
  w.cam([lerp(1.0, 1.4, io(u)), lerp(1.55, 1.65, u), lerp(4.4, 3.9, io(u))], [2.9, 1.3, 1.3], 44);
  w.act('sam', 3.2, 1.4, pinch > 0 ? nose({ view: 'q', face: -1, eyes: [-.7, -.2] }) : { view: 'q', face: -1, armL: [-.3, .2], armR: [.3, -.2], mouth: 'o', brow: .5, eyes: [-.7, -.2] });
  w.smell(t, [1.8, 1.0, .6], .85, 1.5, 1.4); return { focus: 2.8, blur: .5 }; });
// 5  "and one small spark can set it off." : the inside of a switch is a spark
shot(7.1, 8.6, (lt, t, u, w) => { const sp = pr(lt, .12, .5);
  w.cam([lerp(4.6, 4.35, u), lerp(1.4, 1.35, u), lerp(2.75, 2.6, u)], [SWITCH[0], SWITCH[1], SWITCH[2]], 38);
  w.rocker.rotation.z = sp > 0 ? .35 : 0; w.spark([SWITCH[0] + .1, SWITCH[1], SWITCH[2] + .02], sp, .55); w.smell(t, [SWITCH[0] + .25, 1.05, SWITCH[2] - .2], .4, .35, .6, .3);
  return { focus: .9, blur: .7, flash: sp > 0 && sp < 1 ? .25 * Math.sin(Math.PI * sp) : 0 }; });
// 6  "So do not turn anything on or off." : the hand stops short and comes back
shot(8.6, 11.05, (lt, t, u, w) => { const r = out(pr(lt, .1, .6)), back = io(pr(lt, 1.15, 1.6));
  w.cam([lerp(5.3, 5.7, io(u)), lerp(1.6, 1.7, u), lerp(5.0, 5.6, io(u))], [3.95, 1.3, 1.9], 46);
  w.act('sam', 4.22, 2.12, back < 1 ? { view: 'side', face: -1, reach: [SWITCH[0] + .02, lerp(.95, 1.16, r) - .25 * back, SWITCH[2] + .06], reachWith: 'L', armR: [.4, .3], mouth: 'grit', brow: .5, eyes: [-.7, 0] } : { view: 'q', face: -1, armL: [-1.2, -1.4], armR: [.4, .3], mouth: 'o', brow: .6, eyes: [-.6, 0] });
  w.smell(t, DOOR_IN, .8, 1.6, 1.4); return { focus: 3.0, blur: .5 }; });
// 7  "No lights," : the lamp in the hall
shot(11.05, 11.95, (lt, t, u, w) => { const r = out(pr(lt, 0, .3));
  w.cam([lerp(6.0, 6.2, u), 1.55, lerp(2.8, 2.6, u)], [7.6, 1.2, .2], 44);
  w.act('sam', 8.05, .45, { view: 'side', face: -1, reach: [LAMP_SW[0], LAMP_SW[1], lerp(.6, LAMP_SW[2], r)], reachWith: 'L', armR: [.4, .3], mouth: 'grit', brow: .5, eyes: [-.7, .3] });
  w.cross([LAMP_SW[0] - .05, 1.6, LAMP_SW[2] + .2], pr(lt, .22, .4), .17); return { focus: 1.8, blur: .5 }; });
// 8  "no appliances," : the kettle
shot(11.95, 12.75, (lt, t, u, w) => { const r = out(pr(lt, 0, .3));
  w.cam([lerp(.2, .45, u), 1.6, lerp(1.6, 1.4, u)], [1.35, 1.1, -1.0], 44);
  w.act('sam', 1.75, -.45, { view: 'side', face: -1, reach: [KETTLE[0] + .14, KETTLE[1], lerp(-.7, KETTLE[2] + .1, r)], reachWith: 'L', armR: [.4, .3], mouth: 'grit', brow: .5, eyes: [-.7, .4] });
  w.cross([KETTLE[0], 1.55, KETTLE[2] + .3], pr(lt, .22, .4), .15); return { focus: 1.6, blur: .5 }; });
// 9  "not even the doorbell." : outside, a neighbour's finger stops short of the button
shot(12.75, 13.85, (lt, t, u, w) => { const r = out(pr(lt, 0, .4));
  w.cam([lerp(OX + 1.9, OX + 1.6, u), 1.55, lerp(4.4, 4.0, u)], [OX + 1.25, 1.15, .2], 40);
  out_(w, 'neighbour', OX + 1.95, .5, { view: 'side', face: -1, reach: [BELL[0] + .06, BELL[1], lerp(.55, BELL[2] + .08, r)], reachWith: 'L', armR: [.4, .3], mouth: 'smile', eyes: [-.7, .2] });
  w.cross([BELL[0], 1.65, BELL[2] + .25], pr(lt, .4, .6), .15); return { focus: 1.9, blur: .5 }; });
// 10 "Do not strike a match or light a candle." : the matches stay in the box
shot(13.85, 15.85, (lt, t, u, w) => { const r = out(pr(lt, .1, .55));
  w.cam([lerp(-2.6, -2.2, io(u)), lerp(1.7, 1.6, u), lerp(2.2, 1.8, u)], [-1.15, 1.0, -.9], 44);
  w.props.candle.visible = true; w.props.candle.position.set(-1.15, .935, -1.15); w.props.matches.visible = true; w.props.matches.position.set(-1.5, .95, -1.05);
  w.act('sam', -.75, -.45, { view: 'side', face: -1, reach: [-1.5, 1.0, lerp(-.6, -1.02, r)], reachWith: 'L', armR: [.4, .3], mouth: 'grit', brow: .5, eyes: [-.7, .5] });
  w.cross([-1.35, 1.5, -.95], pr(lt, .6, .8), .17); w.smell(t, [-.2, 1.0, -.9], .4, .8, 1.0); return { focus: 1.7, blur: .5 }; });
// 11 "And do not go hunting for the leak yourself." : sniffing along the stove
shot(15.85, 18.0, (lt, t, u, w) => { const x = lerp(1.3, .45, io(pr(lt, 0, 1.6)));
  w.cam([lerp(2.6, 2.0, io(u)), lerp(1.6, 1.5, u), lerp(2.9, 2.6, u)], [.5, 1.0, -.8], 44);
  w.act('sam', x, -.4, { view: 'side', face: -1, lean: -.18, squash: .92, armL: [-.6, -.4], armR: [.6, .3], mouth: 'o', brow: .6, eyes: [-.8, .5], bob: 4 * Math.sin(t * 6) });
  w.cross([.6, 1.75, -.35], pr(lt, .9, 1.1), .2); w.smell(t, [STOVE[0], STOVE[1] + .1, STOVE[2] + .1], .7, .7, 1.2); return { focus: 2.0, blur: .5 }; });
// 12 "Get everyone out of the house, right away." : up the stairs, and down they come
shot(18.0, 19.95, (lt, t, u, w) => { const d = io(pr(lt, .4, 1.85)), fx = lerp(7.5, 4.3, d);
  w.cam([lerp(4.4, 4.8, io(u)), lerp(1.9, 1.7, u), lerp(5.4, 5.0, io(u))], [lerp(5.9, 4.9, io(u)), lerp(1.7, 1.1, io(u)), -.4], 48);
  w.act('sam', 4.9, 1.5, { view: 'q', face: 1, armL: [-.3, .2], armR: [2.6 + .3 * Math.sin(t * 12), .4], mouth: 'shout', brow: .7, eyes: [.6, -.7] });
  w.act('friend', fx, -1.0, d > 0 && d < 1 ? walkTo(t, [3, -.42], { mouth: 'o', brow: .6, eyes: [-.3, .2] }) : { view: 'q', face: -1, armL: [-.3, .2], armR: [.3, -.2], mouth: 'o', brow: .6 }, false, stairY(fx));
  w.smell(t, DOOR_IN, .7, 1.6, 1.4); return { focus: 3.6, blur: .4 }; });
// 13 out of the front door : it swings open and they run down the path
shot(19.95, 21.3, (lt, t, u, w) => { const op = out(pr(lt, 0, .3)), k = pr(lt, .15, 1.35);
  w.cam([lerp(OX + 2.6, OX + 2.0, u), lerp(1.7, 1.8, u), lerp(7.2, 7.8, u)], [OX + .2, 1.2, 1.2], 46);
  w.outDoor.rotation.y = -1.4 * op;
  if (k > 0) { w.act('sam', OX + lerp(0, .3, k), lerp(.4, 3.6, k), runTo(t, [OX + .5, 12])); w.act('friend', OX + lerp(-.2, -.4, clamp(k - .25)), lerp(.4, 3.0, clamp(k - .25)), runTo(t + .2, [OX, 12])); }
  return { focus: 6, blur: .3 }; });
// 14 "Do not use your phone until you are well away from the building." : not here, not yet
shot(21.3, 23.3, (lt, t, u, w) => { const out1 = pr(lt, .1, .45), go = pr(lt, 1.05, 2.0);
  w.cam([lerp(OX + 1.6, OX + 3.4, io(u)), lerp(1.6, 1.8, u), lerp(6.4, 9.0, io(u))], [OX + .6, 1.2, lerp(3.4, 5.2, io(u))], 44);
  out_(w, 'sam', OX + .5, lerp(3.7, 9.4, go), go > 0 ? runTo(t, [OX + .5, 14], { armR: [.9, 1.0], hold: 'phone' }) : { view: 'q', face: 1, armL: [-.3, .2], armR: [lerp(.3, .9, out1), lerp(-.2, 1.0, out1)], hold: out1 > .3 ? 'phone' : '', mouth: 'o', brow: .4, eyes: [.6, .7] });
  out_(w, 'friend', OX - .6, lerp(3.4, 8.8, go), go > 0 ? runTo(t + .2, [OX - .6, 14]) : { view: 'q', face: 1, armL: [-.3, .2], armR: [.3, -.2], mouth: 'o', brow: .4 });
  w.cross([OX + .75, 1.75, 3.9], pr(lt, .45, .65), .17); return { focus: 4.8, blur: .4 }; });
// 15 "Then call your gas company or your emergency services." : across the street, the house well behind them
shot(23.3, 26.55, (lt, t, u, w) => { const k = io(u);
  w.cam([lerp(OX + .6, OX + 1.2, k), lerp(1.6, 1.9, k), lerp(14.6, 15.6, k)], [OX + 1.95, lerp(1.5, 1.8, k), 6], 46);
  out_(w, 'sam', OX + 1.2, 10.4, { view: 'q', face: 1, armL: [-.3, .2], armR: [1.9, 1.2], hold: 'phone', mouth: (t % .5) < .25 ? 'o' : 'smile', brow: .3, eyes: [.4, -.2] });
  out_(w, 'friend', OX + 2.4, 10.2, { view: 'q', face: -1, armL: [-.3, .2], armR: [.3, -.2], mouth: 'o', brow: .3, eyes: [-.5, 0], blink: blinkAt(t) }); return { focus: 4.4, blur: .4 }; });
// 16 "Stay out until they tell you it is safe to go back in." : the gas company arrives; the worker holds them back
shot(26.55, 29.6, (lt, t, u, w) => { const v = out(pr(lt, 0, 1.0)), wk = pr(lt, 1.1, 1.9), wx = OX + lerp(4.6, 3.5, wk), wz = lerp(7.6, 9.4, wk);
  w.cam([lerp(OX - .6, OX - .2, io(u)), lerp(2.6, 2.3, u), lerp(18.0, 17.2, io(u))], [OX + 3.2, 1.2, 7.8], 50);
  w.props.van.visible = true; w.props.van.position.set(OX + lerp(20, 5.2, v), 0, 6.8);
  out_(w, 'sam', OX + 1.2, 10.4, { view: 'q', face: 1, armL: [-.3, .2], armR: [.3, -.2], mouth: wk >= 1 ? 'smile' : 'o', brow: .2, eyes: [.6, 0], blink: blinkAt(t) });
  out_(w, 'friend', OX + 2.0, 10.6, { view: 'q', face: 1, armL: [-.3, .2], armR: [.3, -.2], mouth: 'smile', brow: .2, eyes: [.6, 0] });
  if (wk > 0) out_(w, 'worker', wx, wz, wk < 1 ? walkTo(t, [OX + 1.2, 10.4], { mouth: 'smile' }) : { view: 'q', face: -1, armL: [-2.0, -1.6], armR: [.3, -.2], mouth: 'smile', brow: 0, eyes: [-.6, 0] }); return { focus: 4.6, blur: .4 }; });
// 17 "And if the smell is ever strong, or you are not sure," : back in the hall, as at the start
shot(29.6, 32.3, (lt, t, u, w) => { const shrug = pr(lt, 1.6, 1.9);
  w.cam([lerp(6.2, 5.8, io(u)), lerp(1.7, 1.6, u), lerp(5.4, 4.9, io(u))], [5.0, 1.3, 1.4], 44);
  w.act('sam', 5.4, 1.85, shrug > 0 ? { view: 'q', face: -1, armL: [-1.3, -1.2], armR: [1.3, 1.2], mouth: 'o', brow: .6, eyes: [-.5, -.3] } : nose({ view: 'q', face: -1, eyes: [-.6, .2] }));
  w.smell(t, DOOR_IN, lerp(.6, 1, pr(lt, 0, 1.5)), 2.0, 1.7); return { focus: 3.6, blur: .5 }; });
// 18 "leave first" : straight to the front door, a hand on it
shot(32.3, 33.5, (lt, t, u, w) => { const k = out(pr(lt, 0, .8)), x = lerp(5.6, 7.95, k);
  w.cam([lerp(6.2, 6.6, u), 1.65, lerp(5.2, 4.8, u)], [7.6, 1.2, 1.5], 44);
  w.act('sam', x, lerp(1.9, 1.65, k), k < 1 ? runTo(t, [10, 1.65]) : { view: 'side', face: 1, reach: HANDLE, reachWith: 'R', armL: [-.4, .3], lean: .05, mouth: 'grit', brow: .5, eyes: [.7, 0] });
  w.smell(t, DOOR_IN, 1, 2.0, 1.7); return { focus: 3.4, blur: .4 }; });
// 19 "and call second." : out, phone in hand, and away; the camera rises over the street
shot(33.5, 35.83, (lt, t, u, w) => { const op = out(pr(lt, 0, .3)), k = pr(lt, .12, 2.33);
  w.cam([lerp(OX + 2.4, OX + 3.0, io(u)), lerp(1.8, 5.2, io(u)), lerp(7.2, 12.5, io(u))], [OX + .3, lerp(1.2, .8, u), lerp(1.2, 3.0, u)], 46);
  w.outDoor.rotation.y = -1.4 * op;
  if (k > 0) out_(w, 'sam', OX + .15, lerp(.4, 5.0, k), runTo(t, [OX + .3, 12], { armR: [.9, 1.0], hold: 'phone' }));
  return { focus: 6, blur: .3 }; });
export const SHOTS = D.SHOTS();
