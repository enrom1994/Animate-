import * as THREE from 'three';
import { richStage, skyTex } from '../../engine/rich.js';
import { worldKit } from '../../engine/film.js';
import { makeChar } from '../../engine/char.js';
import { kitchen, street } from './set.js';
export const ST = [200, 0, 0];
export function makeWorld() {
  const scene = richStage({ sky: skyTex('#8fb8d6', '#f6dcb0'), sun: [-9, 6, -1], shadow: 7 }), camera = new THREE.PerspectiveCamera(40, 9 / 16, .05, 300);
  scene.add(kitchen()); const S = street(); S.position.set(...ST); scene.add(S);
  const key = scene.userData.key;
  // the sun: inside it comes low through the window; outside it rakes along the street from the left
  const sun = (target, dir, half) => { key.target.position.set(...target); key.position.set(target[0] + dir[0], target[1] + dir[1], target[2] + dir[2]); const c = key.shadow.camera; c.left = c.bottom = -half; c.right = c.top = half; c.updateProjectionMatrix(); };
  const W = worldKit(scene, camera, { sam: makeChar('sam') }, {}, () => {});
  return { ...W, sun };
}
