// The world of "Caught in a thunderstorm": the storm park, Sam and a friend, and the props a shot can switch on.
import * as THREE from 'three';
import { stage, box, board, clamp } from '../../engine/toon.js';
import { worldKit, decal, card, arrowDraw, INK } from '../../engine/film.js';
import { makeChar } from '../../engine/char.js';
import { park, bolt, TREE, HOUSE, CAR, hillY } from './set.js';
export { TREE, HOUSE, CAR, hillY };
// places the shots use (x, z)
export const SPOT = { tree: [TREE[0] - .5, TREE[2] + 1.7], field: [-1, -4.6], door: [9.36, 1.15], win: [7.62, .88], car: [CAR[0], CAR[2]], tent: [-14, .9], picnic: [-3.2, 3.2], pond: [4.2, -6.6], fence: [5, -2.4] };
export function makeWorld() {
  const scene = stage({ sky: 0x7d8aa3, sun: [-3, 8, 6], shadow: 12, hemi: 1.25, key: 1.2, ground: 0x4a6a55 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .1, 400), P = park(); scene.add(P);
  const X = new THREE.Group(); for (const r of [.78, -.78]) { const b = box(1.5, .3, .22, 0xe6232e); b.rotation.z = r; X.add(b); } scene.add(X);
  const strike = bolt(), far = bolt(24, 3.4), jump = bolt(2.2, 1.0), icon = bolt(1.1, .5); scene.add(strike, far, jump, icon);
  const rings = decal(9, 9, (g, w, h) => { g.strokeStyle = '#ffe14d'; g.lineCap = 'round'; for (const [r, lw] of [[.14, 16], [.27, 13], [.4, 10]]) { g.lineWidth = lw; g.setLineDash([lw * 3, lw * 2.4]); g.beginPath(); g.arc(w / 2, h / 2, w * r, 0, 7); g.stroke(); } }, 60); scene.add(rings);
  const arrow = decal(1.6, 2.6, arrowDraw('#ffd23f')), arrow2 = decal(1.6, 2.6, arrowDraw('#ffd23f')); scene.add(arrow, arrow2);
  // a clock that fills to thirty minutes
  const clock = new THREE.Group(); { const f = board(1.5, 1.5, (g, w, h) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, h / 2, w * .45, 0, 7); g.fill(); g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(w / 2, h / 2); g.arc(w / 2, h / 2, w * .4, -Math.PI / 2, Math.PI / 2); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = w * .06; g.beginPath(); g.arc(w / 2, h / 2, w * .45, 0, 7); g.stroke(); g.fillStyle = INK; g.textAlign = 'center'; g.font = `800 ${w * .2}px Cap, sans-serif`; g.fillText('30', w * .69, h * .5); g.font = `800 ${w * .09}px Cap, sans-serif`; g.fillText('MIN', w * .69, h * .61); }, 260); f.material.transparent = true; f.material.alphaTest = .5; f.userData.nmat = new THREE.MeshBasicMaterial({ map: f.material.map, alphaTest: .5, color: 0x8080ff });
    const piv = new THREE.Group(); piv.add(box(.05, .58, .02, 0xe6232e, [0, .27, .02])); piv.position.z = .01; clock.add(f, piv); clock.userData.hand = piv; } scene.add(clock);
  const sam = makeChar('sam'), friend = makeChar('friend'); sam.tint(0xc8cfe0); friend.tint(0xc8cfe0);
  const glass = P.userData.glass, props = { X, strike, far, jump, icon, rings, arrow, arrow2, clock };
  const W = worldKit(scene, camera, { sam, friend }, props, () => glass.forEach(g => g.scale.y = 1));
  const face = o => { o.quaternion.copy(camera.quaternion); };
  return { ...W, glass,
    // lightning down to a point; u runs 0..1 through the strike. Returns the flash for that moment.
    bolt(to, u, which = strike, s = 1) { which.visible = u > 0 && u < 1; which.position.set(...to); which.scale.setScalar(s); face(which); return u > 0 && u < 1 ? Math.pow(1 - u, 2) : 0; },
    // the side flash: a short bolt from one point to another (tree trunk to a person)
    leap(from, to, u) { jump.visible = u > 0 && u < 1; camera.updateMatrixWorld(); const a = new THREE.Vector3(...to).project(camera), b = new THREE.Vector3(...from).project(camera), len = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
      jump.position.set(...to); face(jump); jump.rotateZ(-Math.atan2((b.x - a.x) * camera.aspect, b.y - a.y)); jump.scale.set(1, len / 2.2, 1); },
    ground(at, u, s = 1) { rings.visible = u > 0 && u < 1; rings.position.set(at[0], hillY(at[0], at[1]) + .12, at[1]); rings.scale.setScalar(s * (.3 + u * 1.5)); rings.material.opacity = clamp(1.4 - u * 1.4); },
    point(a, x, z, ry, u) { a.position.set(x, hillY(x, z) + .1, z); a.rotation.z = ry; W.pop(a, u); a.rotation.x = -Math.PI / 2; },   // an arrow on the ground, turned ry about the vertical
    cross(pos, u, s = .3) { X.position.set(...pos); W.pop(X, u, s); face(X); },
    timer(pos, frac, s = 1) { clock.visible = true; clock.position.set(...pos); clock.scale.setScalar(s); face(clock); clock.userData.hand.rotation.z = -frac * Math.PI; } };
}
