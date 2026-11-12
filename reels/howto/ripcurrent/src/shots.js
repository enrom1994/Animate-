// The edit. For now one test shot: the still that proves the look.
import * as THREE from 'three';
import { stage, pr, lerp, ease } from './toon.js';
import { beach } from './set.js';
import { makeChar } from './char.js';
export const DURATION = 5;
export const CAPTIONS = [[0, 'caught in a <b>rip?</b>']];
function shotBeach() {
  const scene = stage(), camera = new THREE.PerspectiveCamera(38, 9 / 16, .1, 400), set = beach(); scene.add(set);
  const sam = makeChar('sam'); sam.group.position.set(-.25, 0, 2.3); scene.add(sam.group);
  const swimmer = makeChar('guard'); swimmer.group.position.set(.45, 0, -5.5); scene.add(swimmer.group);
  return { scene, camera, update(t) {
    const u = ease.io(pr(t, 0, 5));
    camera.fov = 46; camera.position.set(lerp(.9, .3, u), lerp(2.5, 2.1, u), lerp(8.0, 6.9, u)); camera.lookAt(0, lerp(1.2, 1.1, u), 0);
    set.userData.flag.rotation.y = Math.sin(t * 5) * .12;
    const b = Math.abs(Math.sin(t * 3.2)) * 8, blink = (t % 2.6) > 2.5 ? 1 : 0;
    sam.set({ armL: [-.5, -.5], armR: [.5, .5], eyes: [.6, -.5], brow: .9, mouth: 'o', sweat: 1, bob: b, lean: .03, blink }, camera);
    swimmer.set({ armL: [-2.5, -.3], armR: [2.5 + Math.sin(t * 9) * .3, .3], mouth: 'shout', brow: .9, sink: .42, bob: Math.sin(t * 2) * 10 }, camera);
    return { focus: 5.5, blur: 1 };
  } };
}
export const SHOTS = [{ start: 0, end: 5, build: shotBeach }];
