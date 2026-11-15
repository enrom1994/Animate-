// The world of "Smell gas at home": kitchen, hallway and street, Sam, the friend and a gas worker, and the props a shot can switch on.
import * as THREE from 'three';
import { stage, box, cyl, ball, toon, clamp, lerp } from '../../engine/toon.js';
import { worldKit } from '../../engine/film.js';
import { makeChar } from '../../engine/char.js';
import { kitchen, hall, street, smellLine, spark, gasVan, SWITCH, FRONT, OUT } from './set.js';
export { SWITCH, FRONT, OUT };
export const STOVE = [-.22, .98, -1.02];
export function makeWorld() {
  const scene = stage({ sky: 0x9fd8ff, sun: [2.5, 7, 5], shadow: 14 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .1, 300), K = kitchen(), H = hall(), S = street(); scene.add(K, H, S);
  K.userData.door.rotation.y = 1.45;                                                              // the kitchen door stands open onto the hall
  const X = new THREE.Group(); for (const r of [.78, -.78]) { const b = box(1.5, .3, .22, 0xe6232e); b.rotation.z = r; X.add(b); } scene.add(X);
  const lines = Array.from({ length: 10 }, () => { const l = smellLine(); scene.add(l); return l; }), sp = spark(); scene.add(sp);
  // things Sam reaches for and does not use: a matchbox and a candle, a kettle, a phone held low
  const candle = new THREE.Group(); candle.add(cyl(.06, .06, .3, 0xfff7e8, [0, .15, 0], 12), cyl(.01, .01, .05, 0x1d1a26, [0, .32, 0], 6), cyl(.12, .12, .03, 0xc9ccd4, [0, .015, 0], 16)); scene.add(candle);
  const matches = box(.16, .03, .1, 0xe6232e); scene.add(matches);
  const kettle = new THREE.Group(); kettle.add(cyl(.13, .15, .26, 0xc9ccd4, [0, .13, 0], 16), cyl(.03, .03, .14, 0x1d1a26, [0, .3, 0], 8)); kettle.position.set(1.2, .94, -1.25); scene.add(kettle);
  const van = gasVan(); scene.add(van);
  const sam = makeChar('sam'), friend = makeChar('friend'), worker = makeChar('gasworker'), neighbour = makeChar('neighbour');
  const props = { X, sp, candle, matches, van }; lines.forEach((l, i) => props['line' + i] = l);
  const W = worldKit(scene, camera, { sam, friend, worker, neighbour }, props, () => { H.userData.door.rotation.y = 0; S.userData.door.rotation.y = 0; H.userData.rocker.rotation.z = 0; });
  const face = o => o.quaternion.copy(camera.quaternion);
  return { ...W, hallDoor: H.userData.door, outDoor: S.userData.door, rocker: H.userData.rocker,
    // gas you can see: lines drifting up from a point and spreading, amount 0..1 (how many, how big)
    smell(t, from, amount, spread = 1.4, rise = 1.6, size = 1) { lines.forEach((l, i) => { const on = i < Math.round(amount * lines.length); l.visible = on; if (!on) return; const u = (t * .22 + i * .137) % 1, a = i * 2.39;
      l.position.set(from[0] + Math.cos(a) * spread * (.2 + u), from[1] + rise * u, from[2] + Math.sin(a) * spread * .6 * (.2 + u)); face(l); l.rotateZ(Math.sin(t * 1.5 + i) * .15); l.scale.setScalar(size * (.6 + .5 * amount) * (.6 + .4 * Math.sin(Math.PI * u))); l.material.opacity = Math.sin(Math.PI * u); }); },
    spark(pos, u, s = 1) { sp.visible = u > 0 && u < 1; sp.position.set(...pos); face(sp); sp.rotateZ(u * 7); sp.scale.setScalar(s * (.4 + .9 * Math.sin(Math.PI * u))); },
    cross(pos, u, s = .3) { X.position.set(...pos); W.pop(X, u, s); face(X); },
    burner(on) { const r = K.userData.ring; if (r) r.material.color.set(on ? 0xff5a1f : 0x55525f); }, flame() {} };
}
