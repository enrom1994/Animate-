// The edit. For now one test shot: the still that proves the look.
import * as THREE from 'three';
import { stage, pr, lerp, ease } from './toon.js';
import { beach, animate } from './set.js';
import { makeChar } from './char.js';
export const DURATION = 5;
export const CAPTIONS = [[0, 'caught in a <b>rip?</b>']];
function shotBeach() {
  const scene = stage(), camera = new THREE.PerspectiveCamera(38, 9 / 16, .1, 400), set = beach(); scene.add(set);
  const sam = makeChar('sam'); sam.group.position.set(-.6, 0, 2.3); scene.add(sam.group);
  const swimmer = makeChar('guard'); swimmer.group.position.set(.45, 0, -5.5); scene.add(swimmer.group);
  return { scene, camera, update(t) {
    const u = ease.io(pr(t, 0, 5));
    camera.fov = 46; camera.position.set(lerp(.9, .3, u), lerp(2.5, 2.1, u), lerp(8.0, 6.9, u)); camera.lookAt(0, lerp(1.2, 1.1, u), 0);
    animate(set, t);
    const drift = pr(t, .4, 5), b = Math.abs(Math.sin(t * 3.2)) * 8, blink = (t % 2.6) > 2.5 ? 1 : 0, jump = Math.sin(Math.PI * pr(t, .9, 1.25));
    swimmer.group.position.set(.3 + Math.sin(t * 1.3) * .12, 0, lerp(-2.2, -7, drift));
    sam.set({ armL: [lerp(-.3, -.5, jump), -.5 * jump], armR: [lerp(.3, .5, jump), .5 * jump], eyes: [.7, -.5], brow: .9, mouth: t > .9 ? 'o' : 'smile', sweat: pr(t, 1.1, 1.5), bob: b + jump * 34, squash: 1 + jump * .06, blink }, camera);
    swimmer.set({ armL: [-2.5 - Math.sin(t * 11) * .3, -.3], armR: [2.5 + Math.sin(t * 11) * .3, .3], mouth: 'shout', brow: .9, sink: .44, bob: Math.sin(t * 2.4) * 12, head: Math.sin(t * 2.4) * .08 }, camera);
    return { focus: 5.5, blur: 1 };
  } };
}
export const SHOTS = [{ start: 0, end: 5, build: shotBeach }];
