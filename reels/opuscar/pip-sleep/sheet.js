// Model sheet: ?test=model — every character and pose at film scale, on one page
import { CAM, layer, clear, text } from './crayon.js';
import { group, clearGroup } from './rig.js';
import { cat, mouse, pip } from './chars.js';
const G = group(), TX = layer();
export function sheet(comp, t, Q) {
  CAM.x = 540; CAM.y = 960; CAM.s = 1;
  clearGroup(G); clear(TX);
  cat(G, { x: 300, y: 420, s: 0.9, pose: 'curl', eyes: 'closed' });
  cat(G, { x: 800, y: 420, s: 0.9, pose: 'curl', eyes: 'closed', ear: 1, seed: 140 });
  cat(G, { x: 270, y: 900, s: 0.8, pose: 'sit', eyes: 'open', seed: 160 });
  cat(G, { x: 760, y: 860, s: 0.7, pose: 'run', eyes: 'wide', step: Math.floor(t * 12), seed: 180 });
  cat(G, { x: 360, y: 1260, s: 0.75, pose: 'crouch', eyes: 'open', coat: 'wild', seed: 200 });
  mouse(G, { x: 860, y: 1230, s: 1 });
  pip(G, { x: 180, y: 1800, s: 0.8, pose: 'stand' });
  pip(G, { x: 440, y: 1800, s: 0.8, pose: 'point', seed: 430 });
  pip(G, { x: 700, y: 1800, s: 0.8, pose: 'shh', eyes: 'closed', seed: 460 });
  pip(G, { x: 940, y: 1800, s: 0.8, pose: 'jump', eyes: 'wide', mouth: 'o', seed: 490 });
  text(TX, 'Pip & Biscuit: model sheet', 540, 110, { size: 64, font: 'Gaegu', weight: 700, col: '#3b2a4f' });
  comp.paperCam(CAM.x * 0.6, CAM.y * 0.6, CAM.s / 0.6);
  comp.begin(); comp.group(G); comp.crayon(TX.c); comp.finish({ vig: 0.3 });
}
