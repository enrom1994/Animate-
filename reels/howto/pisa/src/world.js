import * as THREE from 'three';
import { stage, box } from '../../engine/toon.js';
import { worldKit } from '../../engine/film.js';
import { makeChar, LOOKS } from '../../engine/char.js';
import { piazza, tower, LEAN } from './set.js';
LOOKS.tourist1 = { skin: '#c98a5e', hair: '#1d1a26', top: '#ffd23f', bottom: '#2bb673', hairStyle: 'swoop' };
LOOKS.tourist2 = { skin: '#f0c49a', hair: '#b5532a', top: '#7b4bd6', bottom: '#27304a', hairStyle: 'cap' };
const CROWD = [['#8d5a3b', '#1d1a26', '#2bb673', '#27304a', 'swoop'], ['#f6b98c', '#e8c35a', '#e23d3d', '#5a4636', 'swoop'], ['#c98a5e', '#1d1a26', '#ffffff', '#2f6fd6', 'cap'], ['#f0c49a', '#8a8f99', '#3a7bd5', '#c9a074', 'swoop'], ['#e8b48a', '#3a2a26', '#ff8ac0', '#2a2733', 'swoop'], ['#a8714a', '#1d1a26', '#ffd23f', '#3f8a5a', 'cap'], ['#f6b98c', '#b5532a', '#5ad1c8', '#27304a', 'swoop'], ['#8d5a3b', '#3a2a26', '#ff8a1f', '#5a4636', 'swoop']];
CROWD.forEach(([skin, hair, top, bottom, hairStyle], i) => LOOKS['c' + i] = { skin, hair, top, bottom, hairStyle });
// where the crowd stands, and what each does: x, z, pose
const SPOTS = [[24, -8, { view: 'side', face: -1, armL: [-1.85, -.15], armR: [-1.65, -.25], mouth: 'grit', lean: -.12 }], [27, -4, { view: 'q', face: -1, armR: [2.0, 1.2], hold: 'phone' }], [20, 6, { view: 'back' }], [33, 2, { view: 'front', armR: [2.6, .3] }],
  [16, -12, { view: 'q', face: 1 }], [38, -9, { view: 'side', face: -1 }], [30, 9, { view: 'q', face: -1, armR: [1.9, 1.2], hold: 'phone' }], [14, 10, { view: 'back' }]];
export function makeWorld() {
  const scene = stage({ sky: 0x8fd0f5, sun: [-30, 60, 40], shadow: 45 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .1, 600); scene.add(piazza()); const T = tower(); scene.add(T);
  const k = scene.userData.key; k.shadow.mapSize.set(4096, 4096); k.shadow.camera.far = 200; k.shadow.camera.updateProjectionMatrix();
  const actors = { sam: makeChar('sam'), t1: makeChar('tourist1'), t2: makeChar('tourist2') }; CROWD.forEach((_, i) => actors['c' + i] = makeChar('c' + i));
  const birds = []; scene.traverse(o => { if (o.name === 'pigeon') birds.push(o); });
  const W = worldKit(scene, camera, actors, {}, t => { for (const b of birds) { const k = Math.max(0, Math.sin(t * 5 + b.userData.peck * 1.3)); b.rotation.z = -k * .5; } });
  // the crowd: everyone in SPOTS, idling (a slow bob and a blink now and then); skip = names to leave out
  const crowd = (t, skip = []) => SPOTS.forEach(([x, z, p], i) => { if (skip.includes(i)) return; W.act('c' + i, x, z, { mouth: 'smile', ...p, bob: 3 * Math.sin(t * 2 + i), blink: (t * .7 + i * .37) % 3 < .08 ? 1 : 0 }); });
  return { ...W, T, LEAN, crowd };
}
