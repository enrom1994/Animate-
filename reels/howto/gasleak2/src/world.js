// The world of "Smell gas at home": kitchen, hallway and street, Sam, the friend and a gas worker, and the props a shot can switch on.
import * as THREE from 'three';
import { stage, box, cyl, ball, toon, clamp, lerp } from '../../engine/toon.js';
import { worldKit } from '../../engine/film.js';
import { makeChar, LOOKS } from '../../engine/char.js';
import { richStage, skyTex, windowUnit, woodTex, brickTex, plasterTex, tileTex, paintTex, stoneTex, mat } from '../../engine/rich.js';
import { reskin, tex, lit, metreUV } from '../../engine/reskin.js';
// the storybook finish on everyone: a warm medium line, a light and a shadow side, a fine grain
for (const k of ['sam', 'friend', 'gasworker', 'neighbour']) Object.assign(LOOKS[k], { ink: '#2e1d1c', lw: .8, finish: true });
const METAL = lit(0xb8bcc4, { roughness: .35, metalness: .7 }), IRON = lit(0x2d2a2e, { roughness: .5, metalness: .5 }), BRASS = lit(0xc9a24a, { roughness: .35, metalness: .8 }), ENAMEL = lit(0xf0e6cf, { roughness: .3 });
// the old flat colours, and what each becomes
const MAP = {
  0xfbdca4: tex(plasterTex('#ead9b4', { seed: 4 }), .4), 0xcdbfe8: tex(plasterTex('#e3d6b0', { seed: 6 }), .4), 0xb9a8dc: tex(plasterTex('#e3d6b0', { seed: 7 }), .4), 0xfff3dc: tex(plasterTex('#efe4cc', { seed: 3, grime: .3 }), .3),
  0x2bb6a8: tex(paintTex('#6f8f6a', { seed: 2 }), 1), 0x35c9ba: tex(paintTex('#86a67e', { seed: 3 }), 1.5),
  0xf4f1ea: o => (o.geometry.parameters?.height ?? 1) < .1 ? tex(woodTex('#b07a48', { planks: 4, seed: 8 }), 1)(o) : ENAMEL(), 0xfff7e8: ENAMEL, 0xdedad0: ENAMEL, 0xd8d2c4: o => o.parent && o.parent.position.x > 60 || (o.geometry.parameters?.width ?? 0) > 20 ? tex(stoneTex('#c4b79e', { n: 4, seed: 2 }), .7)(o) : ENAMEL(),
  0x8a5a2e: tex(woodTex('#6e4326', { planks: 3, seed: 5 }), 1), 0xb07a45: tex(woodTex('#9a6a3f', { planks: 3, seed: 7 }), 1),
  0xc9ccd4: METAL, 0x55525f: IRON, 0x2a2733: IRON, 0x1d1a26: IRON, 0xffd23f: BRASS, 0x3f86c9: tex(paintTex('#2f5a6e', { seed: 4 }), 1),
  0x6cbf62: tex(paintTex('#6e9a50', { seed: 9 }), .3), 0x6b6f7d: tex(stoneTex('#5d5a58', { n: 12, seed: 4, cobble: true }), 1.2), 0xd8c79a: tex(stoneTex('#cdbf9c', { n: 6, seed: 3, cobble: true }), 1.2),
  0xf2e3c4: tex(brickTex('#a8543a', { seed: 5 }), .5), 0xbfe3d8: tex(plasterTex('#d7c9a0', { seed: 2, grime: .7 }), .4), 0xf3c9b5: tex(brickTex('#8a4a36', { seed: 11 }), .5), 0xe6dcc0: tex(plasterTex('#e2b97a', { seed: 8, grime: .7 }), .4),
  0xc9523f: lit(0xa8483a), 0x5a6f8a: lit(0x4f5f6e), 0x7a5a9a: lit(0x6a4a3e), 0x7a5230: lit(0x5a4030, { roughness: .9 }), 0x3f9a58: lit(0x5f8a48, { roughness: .9 }),
};
// surfaces picked out by size: the kitchen floor (a checker before, warm tiles now) and the painted back wall of the kitchen
const FLOOR = mat(tileTex('#c98a5e', '#e8d6b0', { n: 8, seed: 4, grout: '#6d5a48' }), [1, 1]), BACK = plasterTex('#ead9b4', { seed: 5 });
const special = o => { const p = o.geometry.parameters || {}; if (o.geometry.type !== 'PlaneGeometry') return null;
  if (p.width === 18 && p.height === 10) { metreUV(o, .55); return FLOOR; }
  if (p.width === 12 && p.height === 3.4 && Math.abs(o.position.z + 1.6) < .01) { metreUV(o, .4); return mat(BACK, [1, 1]); } return null; };
import { kitchen, hall, street, smellLine, spark, gasVan, SWITCH, FRONT, OUT } from './set.js';
export { SWITCH, FRONT, OUT };
export const STOVE = [-.22, .98, -1.02];
export function makeWorld() {
  const scene = richStage({ sky: skyTex('#8fb8d6', '#f6dcb0'), sun: [2.5, 7, 5], shadow: 9 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .1, 300), K = kitchen(), H = hall(), S = street(); scene.add(K, H, S);
  K.userData.door.rotation.y = 1.45;                                                              // the kitchen door stands open onto the hall
  const X = new THREE.Group(); for (const r of [.78, -.78]) { const b = box(1.5, .3, .22, 0xe6232e); b.rotation.z = r; X.add(b); } scene.add(X);
  const lines = Array.from({ length: 10 }, () => { const l = smellLine(); scene.add(l); return l; }), sp = spark(); scene.add(sp);
  // things Sam reaches for and does not use: a matchbox and a candle, a kettle, a phone held low
  const candle = new THREE.Group(); candle.add(cyl(.06, .06, .3, 0xfff7e8, [0, .15, 0], 12), cyl(.01, .01, .05, 0x1d1a26, [0, .32, 0], 6), cyl(.12, .12, .03, 0xc9ccd4, [0, .015, 0], 16)); scene.add(candle);
  const matches = box(.16, .03, .1, 0xe6232e); scene.add(matches);
  const kettle = new THREE.Group(); kettle.add(cyl(.13, .15, .26, 0xc9ccd4, [0, .13, 0], 16), cyl(.03, .03, .14, 0x1d1a26, [0, .3, 0], 8)); kettle.position.set(1.2, .94, -1.25); scene.add(kettle);
  const van = gasVan(); scene.add(van);
  const sam = makeChar('sam'), friend = makeChar('friend'), worker = makeChar('gasworker'), neighbour = makeChar('neighbour');
  reskin(scene, MAP, { special });
  // the houses' windows: the flat painted cards become real windows, frame, sill, glass and shutters
  { const cards = []; S.traverse(o => { const p = o.geometry && o.geometry.parameters; if (o.isMesh && o.material.map && p && p.width === 1.0 && p.height === .9) cards.push(o); });
    const frame = paintTex('#efe6d2', { seed: 1 }); cards.forEach((c, i) => { const u = windowUnit(.78, .78, frame, ['#3f6b55', '#2f5a6e', '#7a3a32'][i % 3]); u.position.copy(c.position); u.position.z += .03; u.rotation.copy(c.rotation); c.parent.add(u); c.parent.remove(c); }); }
  const props = { X, sp, candle, matches, van }; lines.forEach((l, i) => props['line' + i] = l);
  // the sun follows the camera: its shadow box is centred where the shot looks, indoors or out
  const key = scene.userData.key, SUN = [3, 7, 4.5];
  const W = worldKit(scene, camera, { sam, friend, worker, neighbour }, props, () => { H.userData.door.rotation.y = 0; S.userData.door.rotation.y = 0; H.userData.rocker.rotation.z = 0; });
  { const cam0 = W.cam; W.cam = (pos, look, fov) => { cam0(pos, look, fov); key.target.position.set(...look); key.position.set(look[0] + SUN[0], look[1] + SUN[1], look[2] + SUN[2]); }; }
  const face = o => o.quaternion.copy(camera.quaternion);
  return { ...W, hallDoor: H.userData.door, outDoor: S.userData.door, rocker: H.userData.rocker,
    // gas you can see: lines drifting up from a point and spreading, amount 0..1 (how many, how big)
    smell(t, from, amount, spread = 1.4, rise = 1.6, size = 1) { lines.forEach((l, i) => { const on = i < Math.round(amount * lines.length); l.visible = on; if (!on) return; const u = (t * .22 + i * .137) % 1, a = i * 2.39;
      l.position.set(from[0] + Math.cos(a) * spread * (.2 + u), from[1] + rise * u, from[2] + Math.sin(a) * spread * .6 * (.2 + u)); face(l); l.rotateZ(Math.sin(t * 1.5 + i) * .15); l.scale.setScalar(size * (.6 + .5 * amount) * (.6 + .4 * Math.sin(Math.PI * u))); l.material.opacity = Math.sin(Math.PI * u); }); },
    spark(pos, u, s = 1) { sp.visible = u > 0 && u < 1; sp.position.set(...pos); face(sp); sp.rotateZ(u * 7); sp.scale.setScalar(s * (.4 + .9 * Math.sin(Math.PI * u))); },
    cross(pos, u, s = .3) { X.position.set(...pos); W.pop(X, u, s); face(X); },
    burner(on) { const r = K.userData.ring; if (r) r.material.color.set(on ? 0xff5a1f : 0x55525f); }, flame() {} };
}
