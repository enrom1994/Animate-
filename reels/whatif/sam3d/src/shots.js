// Model sheet for 3D Sam: a turnaround (front, three-quarter, side, back) and five expressions.
import * as THREE from 'three';
import { makeSam3D } from './sam3d.js';
import { place } from './anim.js';
export const DURATION = 3, CAPTIONS = [], FADES = [];
const STAND = { lSh: [0, 0, .14], rSh: [0, 0, -.14], lEl: [-.2, 0, 0], rEl: [-.2, 0, 0] };
function floor(scene) { const f = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({ color: 0xf3ead8, roughness: .9 })); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; scene.add(f); }
function turnaround({ makeStage }) { const scene = makeStage({ shadowSize: 3, sunDir: [-3, 6, 5] }); floor(scene); const c = new THREE.PerspectiveCamera(16, 720 / 1280, .1, 100);
  const sams = [0, -.75, -Math.PI / 2, Math.PI].map((ry, i) => { const s = makeSam3D(); s.root.position.set(0, 0, 0); s.root.rotation.y = ry; scene.add(s.root); return s; });
  return { scene, camera: c, update(t) { const k = Math.floor(t * 4) % 4; sams.forEach((s, i) => { s.root.visible = i === k; s.setPose(STAND); s.setFace({ mouth: 'smile', eyes: [i === 1 ? .3 : 0, 0], blush: .5 }); });
    place(c, [0, 1.0, 10], [0, .9, 0]); return { bloom: .2 }; } }; }
function faces({ makeStage }) { const scene = makeStage({ shadowSize: 2, sunDir: [-2, 5, 5] }); const s = makeSam3D(); scene.add(s.root); const c = new THREE.PerspectiveCamera(14, 720 / 1280, .1, 100);
  const F = [{ mouth: 'smile', brow: 0, eyes: [0, 0] }, { mouth: 'o', brow: -.8, eyes: [0, .4], sweat: 1 }, { mouth: 'shout', brow: -.9, eyes: [0, 0], sweat: 1 }, { mouth: 'grit', brow: .8, eyes: [.6, 0] }, { mouth: 'sad', brow: -.6, eyes: [0, -.6], blink: .35 }];
  return { scene, camera: c, update(t) { const k = Math.min(4, Math.floor(t * 5)); s.setPose({ ...STAND, neck: [0, 0, 0] }); s.setFace({ blush: .5, ...F[k] }); s.root.updateMatrixWorld(true); const hp = s.j.head.getWorldPosition(new THREE.Vector3()); place(c, [0, hp.y + .25, 4.4], [0, hp.y + .2, 0]); return { bloom: .2 }; } }; }
export const SHOTS = [{ start: 0, end: 1, build: turnaround }, { start: 1, end: 3, build: faces }];
