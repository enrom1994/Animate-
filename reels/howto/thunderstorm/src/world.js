// The world of "Caught in a thunderstorm": the storm park, Sam and a friend, and the props a shot can switch on.
import * as THREE from 'three';
import { stage, box } from '../../engine/toon.js';
import { worldKit, decal, INK } from '../../engine/film.js';
import { makeChar } from '../../engine/char.js';
import { park, bolt, TREE, HOUSE, CAR, hillY } from './set.js';
export { TREE, HOUSE, CAR, hillY };
export function makeWorld() {
  const scene = stage({ sky: 0x7d8aa3, sun: [-3, 8, 6], shadow: 12, hemi: 1.25, key: 1.2, ground: 0x4a6a55 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .1, 400); scene.add(park());
  const X = new THREE.Group(); for (const r of [.78, -.78]) { const b = box(1.5, .3, .22, 0xe6232e); b.rotation.z = r; X.add(b); } scene.add(X);
  const strike = bolt(); scene.add(strike);
  // current in the ground: rings spreading from where the bolt lands
  const rings = decal(9, 9, (g, w, h) => { g.strokeStyle = '#ffe14d'; g.lineCap = 'round'; for (const [r, lw] of [[.14, 16], [.27, 13], [.4, 10]]) { g.lineWidth = lw; g.setLineDash([lw * 3, lw * 2.4]); g.beginPath(); g.arc(w / 2, h / 2, w * r, 0, 7); g.stroke(); } }, 60); scene.add(rings);
  // the jump from the tree to a person standing under it
  const arc = decal(1, 1, () => {}); arc.visible = false;
  const sam = makeChar('sam'), friend = makeChar('friend'); sam.tint(0xc8cfe0); friend.tint(0xc8cfe0);
  const W = worldKit(scene, camera, { sam, friend }, { X, strike, rings }, () => {});
  return { ...W,
    // lightning to a point on the ground or the tree top; u runs 0..1 through the strike (a few frames)
    bolt(to, u) { strike.visible = u > 0 && u < 1; strike.position.set(to[0], to[1], to[2]); strike.scale.set(2.6, (30 - to[1]) / 10, 1); strike.quaternion.copy(camera.quaternion); strike.rotation.z = 0; return u > 0 ? Math.pow(1 - Math.min(1, u), 2) : 0; },
    ground(at, u) { rings.visible = u > 0 && u < 1; rings.position.set(at[0], hillY(at[0], at[1]) + .12, at[1]); rings.scale.setScalar(.4 + u * 1.3); rings.material.opacity = 1 - u; } };
}
