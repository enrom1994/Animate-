// The world of "Grease fire in the pan": the kitchen, Sam, and the props a shot can switch on.
import * as THREE from 'three';
import { stage, toon, box, cyl, ball } from '../../engine/toon.js';
import { worldKit } from '../../engine/film.js';
import { makeChar } from '../../engine/char.js';
import { kitchen, pan, flames, PAN } from './set.js';
export { PAN };
export function makeWorld() {
  const scene = stage({ sky: 0xffe7b8, sun: [2.5, 6, 5], shadow: 6 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .1, 100); scene.add(kitchen());
  const P = pan(); P.position.set(...PAN); scene.add(P);
  const fire = flames(); fire.position.set(PAN[0], PAN[1] + .05, PAN[2]); scene.add(fire);
  const X = new THREE.Group(); for (const r of [.78, -.78]) { const b = box(1.5, .3, .22, 0xe6232e); b.rotation.z = r; X.add(b); } scene.add(X);
  // a jug of water, a pan lid, a baking sheet
  const jug = new THREE.Group(); jug.add(cyl(.11, .09, .26, 0x8fd8ff, [0, .13, 0], 16), cyl(.115, .115, .02, 0xffffff, [0, .27, 0], 16)); { const h = new THREE.Mesh(new THREE.TorusGeometry(.07, .018, 8, 16, Math.PI), toon(0x8fd8ff)); h.rotation.z = -Math.PI / 2; h.position.set(.11, .14, 0); jug.add(h); } scene.add(jug);
  const lid = new THREE.Group(); lid.add(cyl(.29, .29, .025, 0xc9ccd4, [0, 0, 0], 24), ball(.045, 0x1d1a26, [0, .05, 0])); scene.add(lid);
  const sheet = box(.62, .025, .42, 0xc9ccd4); scene.add(sheet);
  const W = worldKit(scene, camera, { sam: makeChar('sam') }, { X, jug, lid, sheet, fire }, () => {});
  return { ...W, pan: P, flame(t, size) { fire.userData.set(t, size, camera); } };
}
