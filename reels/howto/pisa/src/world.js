import * as THREE from 'three';
import { stage } from '../../engine/toon.js';
import { worldKit, card, arrowDraw } from '../../engine/film.js';
import { makeChar, LOOKS } from '../../engine/char.js';
import { piazza, tower } from './set.js';
import { barrier, section, cables, lead, plumb, scaffold, ribbon } from './props.js';
// the lean in 1838 and in 1990: 0.0109 rad apart is 45 cm at the plumb line's height (41 m)
export const L1838 = .07, L1990 = .0809;
export const SEC = [0, 0, 600];
LOOKS.tourist1 = { skin: '#c98a5e', hair: '#1d1a26', top: '#ffd23f', bottom: '#2bb673', hairStyle: 'swoop' };
LOOKS.tourist2 = { skin: '#f0c49a', hair: '#b5532a', top: '#7b4bd6', bottom: '#27304a', hairStyle: 'cap' };
LOOKS.eng1 = { skin: '#c98a5e', hair: '#ffd23f', top: '#ff8a1f', bottom: '#27304a', hairStyle: 'cap' };
LOOKS.eng2 = { skin: '#f6b98c', hair: '#ffffff', top: '#ffd23f', bottom: '#2a2733', hairStyle: 'cap' };
LOOKS.mason1 = { skin: '#e8b48a', hair: '#5a4636', top: '#a0764a', bottom: '#6b5a48', hairStyle: 'swoop' };
LOOKS.mason2 = { skin: '#c98a5e', hair: '#1d1a26', top: '#8a6a4a', bottom: '#5a4636', hairStyle: 'swoop' };
const CROWD = [['#8d5a3b', '#1d1a26', '#2bb673', '#27304a', 'swoop'], ['#f6b98c', '#e8c35a', '#e23d3d', '#5a4636', 'swoop'], ['#c98a5e', '#1d1a26', '#ffffff', '#2f6fd6', 'cap'], ['#f0c49a', '#8a8f99', '#3a7bd5', '#c9a074', 'swoop'], ['#e8b48a', '#3a2a26', '#ff8ac0', '#2a2733', 'swoop'], ['#a8714a', '#1d1a26', '#ffd23f', '#3f8a5a', 'cap'], ['#f6b98c', '#b5532a', '#5ad1c8', '#27304a', 'swoop'], ['#8d5a3b', '#3a2a26', '#ff8a1f', '#5a4636', 'swoop']];
CROWD.forEach(([skin, hair, top, bottom, hairStyle], i) => LOOKS['c' + i] = { skin, hair, top, bottom, hairStyle });
// where the crowd stands outside the barrier, and what each does: x, z, pose
export const SPOTS = [[24, -8, { view: 'side', face: -1, armL: [-1.85, -.15], armR: [-1.65, -.25], mouth: 'grit', lean: -.12 }], [27, -4, { view: 'q', face: -1, armR: [2.0, 1.2], hold: 'phone' }], [20, 6, { view: 'back' }], [33, 2, { view: 'front', armR: [2.6, .3] }],
  [16, -12, { view: 'q', face: 1 }], [38, -9, { view: 'side', face: -1 }], [30, 9, { view: 'q', face: -1, armR: [1.9, 1.2], hold: 'phone' }], [14, 10, { view: 'back' }]];
const SKY = 0x8fd0f5, OLD = 0xf2d9a6;
export function makeWorld() {
  const scene = stage({ sky: SKY, sun: [30, 60, 40], shadow: 45 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .1, 900);
  const P = piazza(), T = tower(); scene.add(P, T); const MOD = P.getObjectByName('modern');
  const k = scene.userData.key; k.shadow.mapSize.set(4096, 4096); k.shadow.camera.far = 200; k.shadow.camera.updateProjectionMatrix();
  const S = section(); S.position.set(...SEC); scene.add(S);
  const pull = card(5, 5, arrowDraw('#ffd23f'), 160); pull.position.set(1, 36, 6); pull.rotation.set(0, Math.PI / 2, Math.PI / 2 - .25);
  const props = { pull, barrier: barrier(), cables: cables(T), lead: lead(), plumb: plumb(T, [L1838, L1990]), scaffold: scaffold(), ribbon: ribbon() };
  for (const n in props) scene.add(props[n]);
  const actors = { sam: makeChar('sam'), t1: makeChar('tourist1'), t2: makeChar('tourist2'), e1: makeChar('eng1'), e2: makeChar('eng2'), m1: makeChar('mason1'), m2: makeChar('mason2') }; CROWD.forEach((_, i) => actors['c' + i] = makeChar('c' + i));
  const birds = []; P.traverse(o => { if (o.name === 'pigeon') birds.push(o); });
  // every frame starts from the present-day tower at its 1838 lean, nothing built, the sky blue
  const W = worldKit(scene, camera, actors, props, t => { for (const b of birds) { const kk = Math.max(0, Math.sin(t * 5 + b.userData.peck * 1.3)); b.rotation.z = -kk * .5; }
    T.userData.lean.rotation.x = -L1838; T.position.y = 0; T.userData.tiers.forEach(s => s.visible = true); scene.background.setHex(SKY); MOD.visible = true; props.cables.userData.set(0); props.plumb.userData.arm.visible = false; S.userData.set({}); });
  const crowd = (t, skip = []) => SPOTS.forEach(([x, z, p], i) => { if (skip.includes(i)) return; W.act('c' + i, x, z, { mouth: 'smile', ...p, bob: 3 * Math.sin(t * 2 + i), blink: (t * .7 + i * .37) % 3 < .08 ? 1 : 0 }); });
  // the main tower: lean (radians), storeys standing (7 = all, with the belfry), sink (metres), old = the 1170s (warm sky, no modern street furniture)
  const tower_ = ({ lean = L1838, storeys = 7, sink = 0, old = false } = {}) => { T.userData.lean.rotation.x = -lean; T.position.y = -sink; T.userData.tiers.forEach((s, i) => s.visible = i < storeys - 1); if (old) { scene.background.setHex(OLD); MOD.visible = false; } };
  const show = (name, on = true) => { props[name].visible = on; return props[name].userData; };
  return { ...W, T, S, crowd, tower: tower_, show };
}
