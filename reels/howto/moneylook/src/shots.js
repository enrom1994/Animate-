// Style test for the money channel: two neighbours, same street, same paycheck, different choices. The 3D storybook version.
import * as THREE from 'three';
import { worldKit, director } from '../../engine/film.js';
import { makeChar, LOOKS } from '../../engine/char.js';
import { richStage, skyTex, finish, LOOK, sunFollow } from '../../engine/storybook.js';
import { slab, part, solid, mat, brickTex, plasterTex, paintTex, stoneTex, asphaltTex, woodTex, windowUnit } from '../../engine/rich.js';
import { tree, upgradeCar, grass } from '../../engine/props3d.js';
export { CAPTIONS, DURATION, WARP } from './captions.js';
export const NEIGHBOURS = { saver: { skin: '#c98a5e', hair: '#2a1d18', top: '#2f6f73', bottom: '#3a3f55', hairStyle: 'swoop' }, spender: { skin: '#f0c49a', hair: '#8a5a2e', top: '#c9783f', bottom: '#27304a', hairStyle: 'cap' } };
Object.assign(LOOKS, NEIGHBOURS); finish(['saver', 'spender']);
const tag = (w, h, lines, bg = '#f6efe0', fg = '#2e1d1c', accent = '#2f6f73') => { const c = document.createElement('canvas'); c.width = w * 400; c.height = h * 400; const g = c.getContext('2d');
  g.fillStyle = bg; g.beginPath(); g.roundRect(4, 4, c.width - 8, c.height - 8, 30); g.fill(); g.strokeStyle = fg; g.lineWidth = 10; g.stroke(); g.textAlign = 'center';
  lines.forEach(([txt, size, col], i) => { g.fillStyle = col || fg; g.font = `800 ${size}px Cap, sans-serif`; g.fillText(txt, c.width / 2, 40 + size + i * (size + 22)); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: .7 })); };
function house(x, wallTex, door, shut) { const H = new THREE.Group(); H.position.x = x; const w = 3.7;   // a terraced house: narrow, sharing a wall with next door
  H.add(slab(w, 5.6, 6, wallTex, .5, [0, 2.8, -3]));
  const roof = part(new THREE.CylinderGeometry(0, w * .76, 1.8, 4, 1), solid(0x8a3f30, { roughness: .8 }), [0, 6.5, -3]); roof.rotation.y = Math.PI / 4; roof.scale.z = 6 / w; H.add(roof);
  const frame = paintTex('#efe6d2', { seed: 1 }); for (const [wx, wy] of [[-.8, 4.2], [.8, 4.2], [-.8, 1.6]]) { const u = windowUnit(.8, 1.2, frame, shut); u.position.set(wx, wy, .1); H.add(u); }
  H.add(slab(.95, 2.1, .08, paintTex(door, { seed: 3 }), 1, [.85, 1.05, .04]), slab(1.2, .1, .8, stoneTex('#c4b79e', { n: 2 }), 1, [.85, .05, .4]));
  return H; }
function makeWorld() { const scene = richStage({ sky: skyTex('#8fb8d6', '#f6dcb0'), sun: [-5, 8, 7], shadow: 12 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .1, 200);
  scene.add(slab(60, .1, 18, mat(paintTex('#6e9a50', { seed: 9 }), [1, 1]), .3, [0, -.05, -5.6]), slab(60, .12, 2.4, stoneTex('#c4b79e', { n: 4, seed: 2 }), .7, [0, 0, 4.4]), slab(60, .1, 7, asphaltTex(), .25, [0, -.02, 9.1]));
  scene.add(house(-1.85, plasterTex('#e6d2a8', { seed: 4 }), '#2f6f73', '#3f6b55'), house(1.85, brickTex('#a8543a', { seed: 5 }), '#7a3a32', '#7a3a32'));
  for (const [x, z] of [[-1.0, 1.8], [2.7, 1.8]]) scene.add(slab(1.3, .02, 3.2, stoneTex('#cdbf9c', { n: 6, seed: 3, cobble: true }), 1.2, [x, .02, z]));
  const T = tree({ height: 3.4, spread: 1.4, greens: [0x6e9a50, 0x7aa85a, 0x5f8a48] }); T.position.set(-7.4, 0, -.6); scene.add(T);
  scene.add(grass({ area: [-12, 12, -1.5, 3.2], n: 700, avoid: [[-1.0, 1.8, .9, 2], [2.7, 1.8, .9, 2]] }));
  // the spender's new car in the drive, its price on a tag in the windscreen; the saver's jar on the step, its number on the lid
  const C = new THREE.Group(); upgradeCar(C, { paint: 0x3f5f8a }); C.scale.setScalar(.82); C.position.set(2.15, 0, 7.6); C.rotation.y = -Math.PI / 2 + .12; scene.add(C);
  const ct = tag(1.1, .62, [['$34,000', 120, '#7a3a32'], ['on finance', 64]]); ct.position.set(1.62, 1.55, 9.5); ct.scale.setScalar(.85); ct.rotation.y = .12; scene.add(ct);
  const jar = new THREE.Group(); jar.position.set(-2.2, .06, 4.8); jar.add(part(new THREE.CylinderGeometry(.22, .22, .5, 24), new THREE.MeshStandardMaterial({ color: 0xcfe6ec, transparent: true, opacity: .45, roughness: .1 }), [0, .25, 0]), part(new THREE.CylinderGeometry(.23, .23, .06, 24), solid(0xc9a24a, { metalness: .8, roughness: .35 }), [0, .53, 0]));
  for (let i = 0; i < 9; i++) jar.add(part(new THREE.CylinderGeometry(.07, .07, .02, 16), solid(0xd9a83a, { metalness: .8, roughness: .3 }), [(i % 3 - 1) * .08, .03 + Math.floor(i / 3) * .025, ((i * 7) % 3 - 1) * .06]));
  scene.add(jar); const jt = tag(.9, .5, [['$6,800', 110, '#2f6f73'], ['invested', 60]]); jt.position.set(-2.2, .95, 4.85); jt.rotation.y = 0; scene.add(jt);
  const W = worldKit(scene, camera, { saver: makeChar('saver'), spender: makeChar('spender') }, {}, () => {}); sunFollow(W, scene, [-5, 8, 7]); return W; }
const D = director(makeWorld, []);
D.shot(0, 2, (lt, t, u, w) => { w.cam([.1, 1.9, 17.5], [0, 2.6, 1.0], 44);
  w.act('saver', -1.35, 5.3, { view: 'q', face: 1, armL: [-.3, .2], armR: [.9, .9], mouth: 'smile', eyes: [.5, -.2] });
  w.act('spender', .55, 5.6, { view: 'q', face: -1, armL: [-1.2, -.9], armR: [.3, -.2], mouth: 'smile', eyes: [-.5, -.2], hold: '' });
  return { focus: 7, blur: .4, look: LOOK }; });
export const SHOTS = D.SHOTS();
