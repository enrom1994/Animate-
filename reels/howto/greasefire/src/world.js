// The world of "Grease fire in the pan": the kitchen, Sam, and the props a shot can switch on.
import * as THREE from 'three';
import { stage, toon, flat, box, cyl, ball, board, lerp } from '../../engine/toon.js';
import { worldKit, decal, INK } from '../../engine/film.js';
import { makeChar } from '../../engine/char.js';
import { kitchen, pan, flames, puffs, PAN } from './set.js';
export { PAN };
export function makeWorld() {
  const scene = stage({ sky: 0xffe7b8, sun: [2.5, 6, 5], shadow: 6 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .1, 100), K = kitchen(); scene.add(K);
  const P = pan(); P.position.set(...PAN); scene.add(P);
  const fire = flames(); scene.add(fire);
  const extra = [flames(), flames(), flames()]; extra.forEach(f => scene.add(f));          // where a fire that left the pan has got to
  const bits = Array.from({ length: 7 }, () => { const f = flames(1); scene.add(f); return f; });   // burning oil in the air
  const smoke = puffs('#b9b5c2'), spray = puffs('#ffffff', 6); scene.add(smoke, spray);
  const X = new THREE.Group(); for (const r of [.78, -.78]) { const b = box(1.5, .3, .22, 0xe6232e); b.rotation.z = r; X.add(b); } scene.add(X);
  const jug = new THREE.Group(); jug.add(cyl(.11, .09, .26, 0x8fd8ff, [0, .13, 0], 16), cyl(.115, .115, .02, 0xffffff, [0, .27, 0], 16)); { const h = new THREE.Mesh(new THREE.TorusGeometry(.07, .018, 8, 16, Math.PI), toon(0x8fd8ff)); h.rotation.z = -Math.PI / 2; h.position.set(.11, .14, 0); jug.add(h); } scene.add(jug);
  const water = cyl(.05, .09, .5, 0x8fd8ff, [0, 0, 0], 10); scene.add(water);
  const lid = new THREE.Group(); lid.add(cyl(.29, .29, .025, 0xc9ccd4, [0, 0, 0], 24), ball(.045, 0x1d1a26, [0, .05, 0])); scene.add(lid);
  const sheet = box(.66, .025, .46, 0xc9ccd4); scene.add(sheet);
  // a mitten on a forearm, for the close shots of a hand at work
  const hand = new THREE.Group(); { const arm = cyl(.05, .05, .6, 0xf6b98c, [0, 0, .36], 10); arm.rotation.x = Math.PI / 2; hand.add(arm, ball(.085, 0xf6b98c, [0, 0, 0])); hand.scale.setScalar(.8); } scene.add(hand);
  const ext = new THREE.Group(); ext.add(cyl(.1, .1, .42, 0xe6232e, [0, .21, 0], 16), cyl(.05, .07, .08, 0x1d1a26, [0, .46, 0], 12), box(.16, .03, .04, 0x1d1a26, [.06, .52, 0]), cyl(.02, .03, .2, 0x1d1a26, [-.13, .42, 0], 8).rotateZ(1.2)); scene.add(ext);
  const timer = new THREE.Group(); { const f = board(.5, .5, (g, w, h) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, h / 2, w * .45, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = w * .07; g.stroke(); g.lineWidth = w * .03; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * w * .36, h / 2 + Math.sin(a) * w * .36); g.lineTo(w / 2 + Math.cos(a) * w * .41, h / 2 + Math.sin(a) * w * .41); g.stroke(); } }, 400); f.material.transparent = true; f.material.alphaTest = .5; f.userData.nmat = new THREE.MeshBasicMaterial({ map: f.material.map, alphaTest: .5, color: 0x8080ff }); const hd = box(.03, .2, .01, 0xe6232e, [0, .09, .01]), piv = new THREE.Group(); piv.add(hd); piv.position.z = .01; timer.add(f, piv); timer.userData.hand = piv; } scene.add(timer);
  const glow = decal(1.3, .8, (g, w, h) => { const r = g.createRadialGradient(w * .1, h / 2, 0, w * .1, h / 2, w * .9); r.addColorStop(0, 'rgba(255,140,30,.95)'); r.addColorStop(1, 'rgba(255,140,30,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }); glow.position.set(4.2, .03, 1.4); scene.add(glow);
  const props = { X, jug, water, lid, sheet, fire, smoke, spray, hand, ext, timer, glow, extra0: extra[0], extra1: extra[1], extra2: extra[2] }; bits.forEach((b, i) => props['bit' + i] = b);
  const ring = K.userData.ring, knob = K.userData.knob, door = K.userData.door, cold = new THREE.Color(0x55525f), hot = new THREE.Color(0xff5a1f);
  const W = worldKit(scene, camera, { sam: makeChar('sam') }, props, () => { ring.material.color.copy(hot); knob.rotation.z = 0; door.rotation.y = 0; P.visible = true; P.position.set(...PAN); P.rotation.set(0, 0, 0); });
  const at = (f, x, y, z, t, size) => { f.position.set(x, y, z); f.userData.set(t, size, camera); };
  return { ...W, pan: P, door,
    flame(t, size) { at(fire, PAN[0], PAN[1] + .05, PAN[2] + (size > 1.4 ? .12 : 0), t, size); },
    spread(t, sizes) { [[-.1, 1.94, -.92], [-1.3, 1.75, -1.1], [.9, .93, -1.2]].forEach((p, i) => at(extra[i], ...p, t, sizes[i] || 0)); },
    // burning oil thrown from the pan: u 0..1 through the throw, toward +x when dir > 0
    fling(t, u, dir = 0) { bits.forEach((b, i) => { const a = dir ? dir * (.2 + i * .12) : (i / bits.length) * Math.PI * 2 + .4, r = (dir ? 2.4 : 1.7) * (.55 + (i * 37 % 10) / 22) * u, x = PAN[0] + (dir ? dir * r : Math.cos(a) * r), z = PAN[2] + (dir ? Math.sin(i * 1.7) * .5 * u : Math.sin(a) * r * .8 + .5 * u), land = [.93, .02, .93, .02, 1.75, .02, .93][i], y = Math.max(land, PAN[1] + .3 + 2.6 * u * (1 - u) * (1.2 + (i % 3) * .4) - (PAN[1] + .3 - land) * u * u); at(b, x, y, Math.min(z, 2.2), t, u > 0 ? .34 + .1 * (i % 3) : 0); }); },
    smokeUp(t, amount) { smoke.userData.set(t, amount, [PAN[0], PAN[1] + .1, PAN[2]], [PAN[0] + .15, PAN[1] + 1.2, PAN[2]], camera, .45, .9); },
    burner(on) { ring.material.color.copy(cold).lerp(hot, on); knob.rotation.z = -1.5 * (1 - on); },
    reach(from, to) { hand.visible = true; hand.position.set(...to); hand.lookAt(...from); } };   // the forearm runs back from the hand toward where it came from
}
