// The world of "Caught in a thunderstorm": the storm park, the room in the house, Sam and a friend, and the props a shot can switch on.
import * as THREE from 'three';
import { stage, box, clamp } from '../../engine/toon.js';
import { worldKit, decal, arrowDraw } from '../../engine/film.js';
import { makeChar } from '../../engine/char.js';
import { park, room, bolt, burst, TREE, HOUSE, CAR, ROOM, hillY } from './set.js';
export { TREE, HOUSE, CAR, ROOM, hillY };
// places the shots use (x, z)
export const SPOT = { tree: [TREE[0] - .5, TREE[2] + 1.7], field: [-1, -4.6], door: [9.36, 1.15], knob: [9.52, 1.0, 1.62], car: [CAR[0], CAR[2]], seat: [2.3, 4.36], wheel: [3.18, 1.66, 3.88], handle: [3.2, 1.0, 4.9],
  tent: [-14, .9], picnic: [-3.2, 3.2], pond: [4.2, -6.6], fence: [5, -2.4], room: [ROOM[0] - .95, ROOM[2] - .7] };
export function makeWorld() {
  const scene = stage({ sky: 0x7d8aa3, sun: [-3, 8, 6], shadow: 12, hemi: 1.25, key: 1.2, ground: 0x4a6a55 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .1, 400), P = park(), R = room(); scene.add(P, R);
  const X = new THREE.Group(); for (const r of [.78, -.78]) { const b = box(1.5, .3, .22, 0xe6232e); b.rotation.z = r; X.add(b); } scene.add(X);
  const strike = bolt(24, 8, 1), strike2 = bolt(24, 8, 4), far = bolt(24, 7, 7), jump = bolt(2.2, 1.6, 3), icon = bolt(1.2, .9, 5), star = burst(); scene.add(strike, strike2, far, jump, icon, star);
  const rings = decal(9, 9, (g, w, h) => { g.strokeStyle = '#ffe14d'; g.lineCap = 'round'; for (const [r, lw] of [[.14, 16], [.27, 13], [.4, 10]]) { g.lineWidth = lw; g.setLineDash([lw * 3, lw * 2.4]); g.beginPath(); g.arc(w / 2, h / 2, w * r, 0, 7); g.stroke(); } }, 60); scene.add(rings);
  const arrow = decal(1.6, 2.6, arrowDraw('#ffd23f')), arrow2 = decal(1.6, 2.6, arrowDraw('#ffd23f')); scene.add(arrow, arrow2);
  const sam = makeChar('sam'), friend = makeChar('friend');
  const glass = P.userData.glass, props = { X, strike, strike2, far, jump, icon, star, rings, arrow, arrow2 };
  const W = worldKit(scene, camera, { sam, friend }, props, () => { glass.forEach(g => g.scale.y = 1); sam.tint(0xc8cfe0); friend.tint(0xc8cfe0); R.userData.pane.material.opacity = 0; });
  const face = o => o.quaternion.copy(camera.quaternion);
  return { ...W, glass, strike2,
    // lightning down to a point; u runs 0..1 through the strike: it travels down, holds, blinks off once, comes back thinner and dies. Returns the flash for that moment.
    bolt(to, u, which = strike, s = 1) { const on = u > 0 && u < 1 && !(u > .36 && u < .44); which.visible = on; if (!on) { if (which !== far) star.visible = false; return u > .36 && u < .44 ? .12 : 0; }
      const H = which.userData.h, k = clamp(u / .1), thick = u < .62 ? 1 : 1 - .7 * (u - .62) / .38; which.position.set(to[0], to[1] + H * s * (1 - k), to[2]); which.scale.set(s * thick, s * k, 1); face(which);
      for (const m of [which.userData.glow, which.userData.core]) { m.material.map.repeat.set(1, k); m.material.map.offset.set(0, 1 - k); } which.userData.glow.material.opacity = thick;
      if (which === strike || which === strike2) { const b = clamp((u - .1) / .3); star.visible = u > .1 && u < .62; star.position.set(to[0], to[1] + .25, to[2]); face(star); star.rotateZ(u * 9); star.scale.setScalar(s * (.5 + .9 * b) * (u < .44 ? 1 : .7)); }
      return u < .36 ? 1 - .45 * u / .36 : .7 * Math.pow(1 - (u - .44) / .56, 2); },
    // the side flash: a short bolt from one point to another (tree trunk to a person, along a fence)
    leap(from, to, u) { const on = u > 0 && u < 1 && !(u > .4 && u < .5); jump.visible = on; if (!on) return; camera.updateMatrixWorld(); const a = new THREE.Vector3(...to).project(camera), b = new THREE.Vector3(...from).project(camera), len = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
      for (const m of [jump.userData.glow, jump.userData.core]) { m.material.map.repeat.set(1, 1); m.material.map.offset.set(0, 0); } jump.position.set(...to); face(jump); jump.rotateZ(-Math.atan2((b.x - a.x) * camera.aspect, b.y - a.y)); jump.scale.set(1, len / 2.2, 1); },
    sign(pos, s = 1) { icon.visible = true; for (const m of [icon.userData.glow, icon.userData.core]) { m.material.map.repeat.set(1, 1); m.material.map.offset.set(0, 0); } icon.position.set(...pos); icon.scale.setScalar(s); face(icon); },   // a small bolt as a symbol
    ground(at, u, s = 1) { rings.visible = u > 0 && u < 1; rings.position.set(at[0], hillY(at[0], at[1]) + .12, at[1]); rings.scale.setScalar(s * (.3 + u * 1.5)); rings.material.opacity = clamp(1.4 - u * 1.4); },
    point(a, x, z, ry, u, s = 1) { a.position.set(x, hillY(x, z) + .1, z); W.pop(a, u, s); a.rotation.set(-Math.PI / 2, 0, ry); },   // an arrow on the ground, turned ry about the vertical
    cross(pos, u, s = .3) { X.position.set(...pos); W.pop(X, u, s); face(X); },
    indoors(frac, flash = 0) { sam.tint(0xffffff); friend.tint(0xffffff); R.userData.drawClock(frac); R.userData.pane.material.opacity = flash * .8; } };
}
