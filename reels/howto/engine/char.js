// Our own flat 2D people: a soft-square head with a hair swoop, big eyes, a bean body, thick ink limbs.
// Drawn on a canvas every frame from a pose, shown on a card that turns to face the camera.
import * as THREE from 'three';
const INK = '#1d1a26', CW = 640, CH = 960, TAU = Math.PI * 2;
export const LOOKS = {
  sam: { skin: '#f6b98c', hair: '#3a2a26', top: '#ff6a3d', bottom: '#2f6fd6', hairStyle: 'swoop' },
  guard: { skin: '#c98a5e', hair: '#1d1a26', top: '#ffd23f', bottom: '#e23d3d', hairStyle: 'cap' },
};
export const POSE = { armL: [-.35, .25], armR: [.35, -.25], legL: -.06, legR: .06, lean: 0, head: 0, bob: 0, eyes: [0, 0], brow: 0, mouth: 'smile', blink: 0, squash: 1, sink: 0, sweat: 0, hold: '' };
function limb(g, x, y, a1, l1, a2, l2, w, col, hand) {   // two-bone limb: angles from straight down, clockwise
  const ex = x + Math.sin(a1) * l1, ey = y + Math.cos(a1) * l1, hx = ex + Math.sin(a1 + a2) * l2, hy = ey + Math.cos(a1 + a2) * l2;
  g.lineCap = g.lineJoin = 'round';
  g.strokeStyle = INK; g.lineWidth = w + 14; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke();
  g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke();
  if (hand) { g.fillStyle = hand; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.arc(hx, hy, w * .78, 0, TAU); g.fill(); g.stroke(); }
  return [hx, hy];
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
export function drawChar(g, look, p) {
  g.clearRect(0, 0, CW, CH); g.save();
  const fy = CH - 40, cx = CW / 2, sq = p.squash;
  g.translate(cx, fy); g.scale(1 / Math.sqrt(sq), sq); g.translate(-cx, -fy); g.translate(0, -p.bob);
  const hipY = fy - 250, shY = hipY - 190, lx = Math.sin(p.lean) * 190;
  // legs
  for (const [s, a] of [[-1, p.legL], [1, p.legR]]) { const [hx, hy] = limb(g, cx + s * 34, hipY, a, 125, -a * .5, 120, 30, look.skin); g.fillStyle = look.skin; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.ellipse(hx + s * 14, hy + 6, 34, 20, 0, 0, TAU); g.fill(); g.stroke(); }
  // back arm (left on screen) behind the body
  limb(g, cx - 62 + lx, shY + 34, p.armL[0], 105, p.armL[1], 100, 28, look.skin, look.skin);
  // body: a bean, top colour over shorts
  g.save(); g.translate(cx, hipY); g.rotate(p.lean * .6); g.translate(-cx, -hipY);
  g.lineWidth = 8; g.strokeStyle = INK;
  rr(g, cx - 82, shY, 164, 250, 70); g.save(); g.clip(); g.fillStyle = look.top; g.fillRect(cx - 100, shY - 10, 200, 170); g.fillStyle = look.bottom; g.fillRect(cx - 100, shY + 150, 200, 130); g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(cx + 34, shY - 10, 80, 300); g.restore();
  rr(g, cx - 82, shY, 164, 250, 70); g.stroke(); g.beginPath(); g.moveTo(cx - 80, shY + 150); g.lineTo(cx + 80, shY + 150); g.lineWidth = 6; g.stroke();
  g.restore();
  // front arm
  const hand = limb(g, cx + 62 + lx, shY + 34, p.armR[0], 105, p.armR[1], 100, 28, look.skin, look.skin);
  if (p.hold === 'phone') { g.save(); g.translate(hand[0], hand[1] - 20); g.rotate(-.25); g.fillStyle = '#2a2733'; g.strokeStyle = INK; g.lineWidth = 7; rr(g, -26, -52, 52, 96, 12); g.fill(); g.stroke(); g.fillStyle = '#8fd8ff'; g.fillRect(-18, -42, 36, 62); g.restore(); }
  // head
  const hx = cx + lx * 1.25, hy = shY - 150 + Math.abs(lx) * .08, HW = 330, HH = 300;
  g.save(); g.translate(hx, hy + 120); g.rotate(p.head); g.translate(-hx, -(hy + 120));
  g.fillStyle = look.skin; g.strokeStyle = INK; g.lineWidth = 9;
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(hx + s * (HW / 2 - 4), hy + 20, 26, 34, 0, 0, TAU); g.fill(); g.stroke(); }
  rr(g, hx - HW / 2, hy - HH / 2, HW, HH, 120); g.fill(); g.save(); g.clip(); g.fillStyle = 'rgba(0,0,0,.10)'; g.fillRect(hx + HW * .22, hy - HH, HW, HH * 2); g.restore(); rr(g, hx - HW / 2, hy - HH / 2, HW, HH, 120); g.stroke();
  // hair
  g.fillStyle = look.hair; g.lineWidth = 8;
  if (look.hairStyle === 'cap') { g.beginPath(); g.moveTo(hx - HW / 2 - 4, hy - 60); g.bezierCurveTo(hx - HW / 2, hy - HH / 2 - 70, hx + HW / 2, hy - HH / 2 - 70, hx + HW / 2 + 4, hy - 60); g.closePath(); g.fillStyle = look.bottom; g.fill(); g.stroke(); rr(g, hx - 40, hy - 78, HW / 2 + 90, 30, 15); g.fill(); g.stroke(); }
  else { g.beginPath(); g.moveTo(hx - HW / 2 + 6, hy - 50); g.bezierCurveTo(hx - HW / 2 - 10, hy - HH / 2 - 60, hx + 40, hy - HH / 2 - 80, hx + HW / 2 - 4, hy - 70); g.bezierCurveTo(hx + 90, hy - 80, hx + 10, hy - 118, hx - 50, hy - 62); g.bezierCurveTo(hx - 80, hy - 84, hx - 120, hy - 74, hx - HW / 2 + 6, hy - 50); g.fill(); g.stroke(); }
  // face
  const ex = p.eyes[0] * 14, ey = p.eyes[1] * 12, open = 1 - p.blink;
  for (const s of [-1, 1]) {
    const x = hx + s * 68, y = hy + 22;
    g.fillStyle = '#fff'; g.lineWidth = 7; g.beginPath(); g.ellipse(x, y, 44, Math.max(4, 52 * open), 0, 0, TAU); g.fill(); g.stroke();
    if (open > .3) { g.fillStyle = INK; g.beginPath(); g.arc(x + ex, y + ey, 19, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + ex - 6, y + ey - 7, 6, 0, TAU); g.fill(); }
    g.strokeStyle = INK; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - s * 30, y - 74 - p.brow * 24); g.lineTo(x + s * 44, y - 74 + p.brow * 12); g.stroke();
  }
  g.strokeStyle = INK; g.lineWidth = 8; const my = hy + 104;
  if (p.mouth === 'smile') { g.beginPath(); g.arc(hx, my - 22, 46, .2 * Math.PI, .8 * Math.PI); g.stroke(); }
  else if (p.mouth === 'o') { g.fillStyle = '#5a1f2a'; g.beginPath(); g.ellipse(hx, my, 24, 30, 0, 0, TAU); g.fill(); g.stroke(); }
  else if (p.mouth === 'shout') { g.fillStyle = '#5a1f2a'; rr(g, hx - 52, my - 28, 104, 62, 26); g.fill(); g.stroke(); g.fillStyle = '#ff8fa0'; g.beginPath(); g.ellipse(hx, my + 24, 30, 14, 0, Math.PI, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(hx - 40, my - 24, 80, 13); }
  else if (p.mouth === 'grit') { g.fillStyle = '#fff'; rr(g, hx - 50, my - 16, 100, 34, 12); g.fill(); g.stroke(); g.lineWidth = 4; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(hx + i * 25, my - 16); g.lineTo(hx + i * 25, my + 18); g.stroke(); } }
  else { g.beginPath(); g.arc(hx, my + 40, 46, 1.2 * Math.PI, 1.8 * Math.PI); g.stroke(); }
  if (p.sweat > 0) { g.fillStyle = '#8fd8ff'; g.lineWidth = 6; g.globalAlpha = p.sweat; g.beginPath(); g.moveTo(hx + HW / 2 - 30, hy - 110); g.quadraticCurveTo(hx + HW / 2 + 4, hy - 60, hx + HW / 2 - 30, hy - 50); g.quadraticCurveTo(hx + HW / 2 - 62, hy - 60, hx + HW / 2 - 30, hy - 110); g.fill(); g.stroke(); g.globalAlpha = 1; }
  g.restore(); g.restore();
  if (p.sink > 0) g.clearRect(0, CH - p.sink * CH, CW, CH);   // in the water: everything below the surface is cut away
}
export function makeChar(lookName = 'sam', height = 1.75) {
  const look = LOOKS[lookName], c = document.createElement('canvas'); c.width = CW; c.height = CH; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const hW = height * 1.12 * CW / CH, hH = height * 1.12, geo = new THREE.PlaneGeometry(hW, hH); geo.translate(0, hH / 2 - hH * 40 / CH, 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: .5 }));
  mesh.userData.nmat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: .5, color: 0x8080ff });
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: .5 }); mesh.castShadow = true;
  const blob = new THREE.Mesh(new THREE.CircleGeometry(.42, 24), new THREE.MeshBasicMaterial({ color: 0x7a5a2a, transparent: true, opacity: .45, depthWrite: false })); blob.rotation.x = -Math.PI / 2; blob.position.y = .02; blob.scale.y = .55; blob.userData.noInk = true;
  const group = new THREE.Group(); group.add(mesh, blob);
  return { group, set(p, camera) { drawChar(g, look, { ...POSE, ...p }); tex.needsUpdate = true; mesh.position.y = p.sink ? -(p.sink * CH - 40) / CH * hH : 0; blob.visible = !p.sink; if (camera) group.rotation.y = Math.atan2(camera.position.x - group.position.x, camera.position.z - group.position.z); } };
}
