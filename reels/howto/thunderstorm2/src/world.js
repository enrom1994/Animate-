// The world of "Caught in a thunderstorm": the storm park, the room in the house, Sam and a friend, and the props a shot can switch on.
import * as THREE from 'three';
import { stage, box, clamp } from '../../engine/toon.js';
import { worldKit, decal, arrowDraw } from '../../engine/film.js';
import { makeChar } from '../../engine/char.js';
import { richStage, skyTex, finish, restyle, cross, sunFollow, houseWindows, leafyTrees, byGeo, pathFromDecal, pondFromDecal } from '../../engine/storybook.js';
import { slab, part, woodTex, plasterTex, wallpaperTex, tileTex, paintTex, stoneTex, mat } from '../../engine/rich.js';
import { lit } from '../../engine/reskin.js';
finish();
import { park, room, bolt, burst, TREE, HOUSE, CAR, ROOM, hillY } from './set.js';
export { TREE, HOUSE, CAR, ROOM, hillY };
// places the shots use (x, z)
export const SPOT = { tree: [TREE[0] - .5, TREE[2] + 1.7], field: [-1, -4.6], door: [9.36, 1.15], knob: [9.52, 1.0, 1.62], car: [CAR[0], CAR[2]], seat: [2.3, 4.36], wheel: [3.18, 1.66, 3.88], handle: [3.2, 1.0, 4.9],
  tent: [-14, .9], picnic: [-3.2, 3.2], pond: [4.2, -6.6], fence: [5, -2.4], room: [ROOM[0] - .95, ROOM[2] - .7] };
export function makeWorld() {
  const scene = richStage({ sky: skyTex('#4f5a70', '#9aa3b4'), sun: [-3, 8, 6], shadow: 12, key: 1.4, fill: 1.3, keyCol: 0xdfe6f2 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .1, 400), P = park(), R = room(); scene.add(P, R);
  const X = cross(); scene.add(X);
  const strike = bolt(24, 8, 1), strike2 = bolt(24, 8, 4), far = bolt(24, 7, 7), jump = bolt(2.2, 1.6, 3), icon = bolt(1.2, .9, 5), star = burst(); scene.add(strike, strike2, far, jump, icon, star);
  const rings = decal(9, 9, (g, w, h) => { g.strokeStyle = '#ffe14d'; g.lineCap = 'round'; for (const [r, lw] of [[.14, 16], [.27, 13], [.4, 10]]) { g.lineWidth = lw; g.setLineDash([lw * 3, lw * 2.4]); g.beginPath(); g.arc(w / 2, h / 2, w * r, 0, 7); g.stroke(); } }, 60); scene.add(rings);
  const arrow = decal(1.6, 2.6, arrowDraw('#ffd23f')), arrow2 = decal(1.6, 2.6, arrowDraw('#ffd23f')); scene.add(arrow, arrow2);
  // ---- the storybook pass ----
  { const keep = o => { o.userData.keepFlat = true; }; byGeo(R, 'PlaneGeometry', p => p.width === 2.0 && p.height === 1.6).forEach(keep);   // the storm seen through the room's window stays bright
    leafyTrees(P, 1.1);
    // the hill's triangles were wound face-down: it was lit from below and rays from above passed through it. Turn them over.
    P.traverse(o => { if (o.isMesh && o.geometry.type === 'BufferGeometry' && o.geometry.index) { const ix = o.geometry.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } o.geometry.index.needsUpdate = true; o.geometry.computeVertexNormals(); } });
    const fabric = (c, o = {}) => () => new THREE.MeshStandardMaterial({ color: c, roughness: .95, ...o });
    restyle(scene, {
      0x5aa35c: () => mat(paintTex('#4f7a45', { seed: 11 }), [60, 40]), 0x66b064: () => mat(paintTex('#5a8a4c', { seed: 12 }), [4, 4]),
      0x8f8f9a: lit(0x8d939e, { metalness: .6, roughness: .4 }), 0xb9bcc6: lit(0xa9adb6, { metalness: .6, roughness: .4 }),
      0xe6232e: lit(0xb8302a, { metalness: .35, roughness: .35 }), 0x1d1a26: lit(0x1f1d22, { roughness: .9 }), 0x3a3f55: fabric(0x3f4a5c), 0xcfc4a8: lit(0xbdb39a),
      0xff9a3d: fabric(0xd9783a), 0x9a6b3c: lit(0x7a5030), 0x2a6a40: lit(0x2f4f3a, { roughness: .95 }), 0x56607a: () => new THREE.MeshBasicMaterial({ color: 0x56607a }),
      0xc98f58: o => { const m = mat(woodTex('#8a5a34', { planks: 7, seed: 3 }), [4, 3]); return m; }, 0xf6dba6: () => mat(wallpaperTex('#efe2c2', '#ddd0aa'), [8, 3]), 0xedcf96: () => mat(plasterTex('#e6d2a8', { seed: 4 }), [3, 1.5]),
      0x24a094: fabric(0x4f6f7a), 0x2bb6a8: fabric(0x5a7f8a), 0xe6634a: fabric(0xa8483a), 0xffd23f: o => o.geometry.type === 'BoxGeometry' ? fabric(0xd9a83a)() : lit(0xc9a24a, { metalness: .8, roughness: .35 })(),
    });
    houseWindows(P, .9, .9);
    pathFromDecal(P, 3, 40); pondFromDecal(P, 9, 5.5);
    // the front door sits in a frame (check 22): cream posts and a head round the slab
    byGeo(P, 'BoxGeometry', p => p.width === 1.0 && p.height === 2.0 && p.depth === .08).forEach(d => { const H = d.parent, fr = paintTex('#efe6d2', { seed: 1 }); for (const [w, h, x, y] of [[.12, 2.14, -.56, 1.07], [.12, 2.14, .56, 1.07], [1.24, .12, 0, 2.08]]) H.add(slab(w, h, .16, fr, 1, [d.position.x + x, y, d.position.z - .02])); });
    // the room: a patterned rug instead of a painted ellipse, a fabric lamp shade, a wooden rim round the clock
    byGeo(R, 'PlaneGeometry', (p, o) => o.userData.noInk && p.width === 3.6 && p.height === 2.2).forEach(o => { R.add(slab(3.2, .02, 2.0, tileTex('#a8493a', '#d9b16a', { n: 8, seed: 3, grout: '#5a2d22' }), 1, [o.position.x, .07, o.position.z])); o.parent.remove(o); });
    byGeo(R, 'ConeGeometry', p => p.radius === .42).forEach(o => { const g = new THREE.CylinderGeometry(.24, .4, .46, 24, 1, true); o.geometry = g; o.material = new THREE.MeshStandardMaterial({ color: 0xf2e2c0, emissive: 0xffc98a, emissiveIntensity: .35, roughness: .9, side: THREE.DoubleSide }); const gl = new THREE.PointLight(0xffc98a, 1.4, 4, 1.6); gl.position.copy(o.position); R.add(gl); });
    { const rim = part(new THREE.TorusGeometry(.58, .05, 10, 40), mat(woodTex('#6e4326', { planks: 2, seed: 9 }), [1, 1]), [1.9, 2.55, -1.98]); R.add(rim); } }
  const sam = makeChar('sam'), friend = makeChar('friend');
  const glass = P.userData.glass, props = { X, strike, strike2, far, jump, icon, star, rings, arrow, arrow2 };
  const W = worldKit(scene, camera, { sam, friend }, props, () => { glass.forEach(g => g.scale.y = 1); sam.tint(0xc8cfe0); friend.tint(0xc8cfe0); R.userData.pane.material.opacity = 0; });
  sunFollow(W, scene, [-3, 8, 6]);
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
