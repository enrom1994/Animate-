// Our own flat 2D people: a soft-square head with a hair swoop, big eyes, a bean body, thick ink limbs.
// Drawn on a canvas every frame from a pose, shown on a card that turns to face the camera.
import * as THREE from 'three';
const INK = '#1d1a26', CW = 640, CH = 960, TAU = Math.PI * 2;
export const LOOKS = {
  sam: { skin: '#f6b98c', hair: '#3a2a26', top: '#ff6a3d', bottom: '#2f6fd6', hairStyle: 'swoop' },
  guard: { skin: '#c98a5e', hair: '#1d1a26', top: '#ffd23f', bottom: '#e23d3d', hairStyle: 'cap' },
};
export const POSE = { armL: [-.35, .25], armR: [.35, -.25], legL: -.06, legR: .06, lean: 0, head: 0, bob: 0, eyes: [0, 0], brow: 0, mouth: 'smile', blink: 0, squash: 1, sink: 0, sweat: 0, hold: '', reachL: null, reachR: null, view: 'front', face: 1 };
// two-bone reach: the angles that put the hand on (tx, ty); the arm stretches a little, cartoon-fashion, when the point is far
function ik(x, y, tx, ty, l1, l2, side) { let d = Math.hypot(tx - x, ty - y); const k = Math.min(1.75, Math.max(1, d / (l1 + l2 - 2))); l1 *= k; l2 *= k; d = Math.min(d, l1 + l2 - 1);
  const th = Math.atan2(tx - x, ty - y), A = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))), a1 = th + side * A, ex = x + Math.sin(a1) * l1, ey = y + Math.cos(a1) * l1;
  return [a1, Math.atan2(tx - ex, ty - ey) - a1, l1, l2]; }
function limb(g, x, y, a1, l1, a2, l2, w, col, hand) {   // two-bone limb: angles from straight down, clockwise
  const ex = x + Math.sin(a1) * l1, ey = y + Math.cos(a1) * l1, hx = ex + Math.sin(a1 + a2) * l2, hy = ey + Math.cos(a1 + a2) * l2;
  g.lineCap = g.lineJoin = 'round';
  g.strokeStyle = INK; g.lineWidth = w + 14; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke();
  g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke();
  if (hand) { g.fillStyle = hand; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.arc(hx, hy, w * .78, 0, TAU); g.fill(); g.stroke(); }
  return [hx, hy];
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
// the face: both eyes for the front and three-quarter views (the far eye narrower), one eye and a mouth at the edge in profile
function face(g, p, hx, hy, HW, view) {
  const ex = p.eyes[0] * 14, ey = p.eyes[1] * 12, open = 1 - p.blink, side = view === 'side', fx = view === 'q' ? 46 : 0;
  const eye = (x, y, rx, bs) => { g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.ellipse(x, y, rx, Math.max(4, 52 * open), 0, 0, TAU); g.fill(); g.stroke();
    if (open > .3) { const k = rx / 44; g.fillStyle = INK; g.beginPath(); g.arc(x + ex * k + (side ? 8 : 0), y + ey, 19 * Math.min(1, k + .12), 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + ex * k + (side ? 8 : 0) - 6, y + ey - 7, 6, 0, TAU); g.fill(); }
    g.strokeStyle = INK; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - bs * 30 * (rx / 44), y - 74 - p.brow * 24); g.lineTo(x + bs * 44 * (rx / 44), y - 74 + p.brow * 12); g.stroke(); };
  if (side) eye(hx + 84, hy + 22, 36, -1); else { eye(hx + fx - 66, hy + 22, 44, -1); eye(hx + fx + (fx ? 58 : 66), hy + 22, fx ? 31 : 44, 1); }
  if (view === 'q') { g.strokeStyle = INK; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx + fx + 2, hy + 58); g.quadraticCurveTo(hx + fx + 22, hy + 70, hx + fx + 4, hy + 78); g.stroke(); }
  g.strokeStyle = INK; g.lineWidth = 8; const my = hy + 104, mx = side ? hx + HW / 2 - 74 : hx + fx * .85, w = side ? .6 : fx ? .86 : 1;
  if (p.mouth === 'smile') { g.beginPath(); g.arc(mx, my - 22, 46 * w, (side ? .12 : .2) * Math.PI, (side ? .7 : .8) * Math.PI); g.stroke(); }
  else if (p.mouth === 'o') { g.fillStyle = '#5a1f2a'; g.beginPath(); g.ellipse(mx, my, 24 * w, 30, 0, 0, TAU); g.fill(); g.stroke(); }
  else if (p.mouth === 'shout') { g.fillStyle = '#5a1f2a'; rr(g, mx - 52 * w, my - 28, 104 * w, 62, 26 * w); g.fill(); g.stroke(); g.fillStyle = '#ff8fa0'; g.beginPath(); g.ellipse(mx, my + 24, 30 * w, 14, 0, Math.PI, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(mx - 40 * w, my - 24, 80 * w, 13); }
  else if (p.mouth === 'grit') { g.fillStyle = '#fff'; rr(g, mx - 50 * w, my - 16, 100 * w, 34, 12); g.fill(); g.stroke(); g.lineWidth = 4; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(mx + i * 25 * w, my - 16); g.lineTo(mx + i * 25 * w, my + 18); g.stroke(); } }
  else { g.beginPath(); g.arc(mx, my + 40, 46 * w, 1.2 * Math.PI, 1.8 * Math.PI); g.stroke(); }
}
// view: 'front', 'q' (three-quarter), 'side' or 'back'; face: 1 turns the character toward screen right, -1 toward screen left.
// Poses stay in screen terms whatever the view: armL and reachL are the arm on the left of the picture.
export function drawChar(g, look, p0) {
  let p = p0; const view = p.view || 'front', flip = p.face < 0 && (view === 'q' || view === 'side');
  g.clearRect(0, 0, CW, CH); g.save();
  const fy = CH - 40, cx = CW / 2, sq = p.squash, mir = v => v && [2 * cx - v[0], v[1]], neg = a => [-a[0], -a[1]];
  if (flip) { p = { ...p, armL: neg(p.armR), armR: neg(p.armL), legL: -p.legR, legR: -p.legL, reachL: mir(p.reachR), reachR: mir(p.reachL), lean: -p.lean, head: -p.head, eyes: [-p.eyes[0], p.eyes[1]] }; g.translate(2 * cx, 0); g.scale(-1, 1); }
  g.translate(cx, fy); g.scale(1 / Math.sqrt(sq), sq); g.translate(-cx, -fy); g.translate(0, -p.bob);
  const side = view === 'side', back = view === 'back', q = view === 'q';
  const hipY = fy - 250, shY = hipY - 190, lx = Math.sin(p.lean) * 190, bw = side ? 62 : 82, sL = side ? 10 : q ? -56 : -62, sR = side ? -6 : q ? 52 : 62, far = 'rgba(0,0,0,.16)';
  // legs: in profile they stand one behind the other and the feet point the way the character faces
  for (const [s, a] of [[-1, p.legL], [1, p.legR]]) { const [hx, hy] = limb(g, cx + s * (side ? 10 : 34), hipY, a, 125, -a * .5, 120, 30, look.skin); g.fillStyle = look.skin; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.ellipse(hx + (side ? 20 : q ? s * 14 + 8 : s * 14), hy + 6, 34, 20, 0, 0, TAU); g.fill(); g.stroke(); }
  // the arm on the far side, behind the body
  const RL = p.reachL && ik(cx + sL + lx, shY + 34, p.reachL[0], p.reachL[1] + p.bob, 105, 100, 1), RR = p.reachR && ik(cx + sR + lx, shY + 34, p.reachR[0], p.reachR[1] + p.bob, 105, 100, -1);
  if (RL) limb(g, cx + sL + lx, shY + 34, RL[0], RL[2], RL[1], RL[3], 28, look.skin, look.skin); else limb(g, cx + sL + lx, shY + 34, p.armL[0], 105, p.armL[1], 100, 28, look.skin, look.skin);
  // body: a bean, top colour over shorts; narrower in profile
  g.save(); g.translate(cx, hipY); g.rotate(p.lean * .6); g.translate(-cx, -hipY);
  g.lineWidth = 8; g.strokeStyle = INK;
  rr(g, cx - bw, shY, bw * 2, 250, side ? 58 : 70); g.save(); g.clip(); g.fillStyle = look.top; g.fillRect(cx - 100, shY - 10, 200, 170); g.fillStyle = look.bottom; g.fillRect(cx - 100, shY + 150, 200, 130); g.fillStyle = 'rgba(0,0,0,.14)'; if (back) g.fillRect(cx - 114, shY - 10, 80, 300); else g.fillRect(cx + (side ? 18 : 34), shY - 10, 80, 300); g.restore();
  rr(g, cx - bw, shY, bw * 2, 250, side ? 58 : 70); g.stroke(); g.beginPath(); g.moveTo(cx - bw + 2, shY + 150); g.lineTo(cx + bw - 2, shY + 150); g.lineWidth = 6; g.stroke();
  g.restore();
  // the near arm, in front
  const hand = RR ? limb(g, cx + sR + lx, shY + 34, RR[0], RR[2], RR[1], RR[3], 28, look.skin, look.skin) : limb(g, cx + sR + lx, shY + 34, p.armR[0], 105, p.armR[1], 100, 28, look.skin, look.skin);
  if (p.hold === 'phone') { g.save(); g.translate(hand[0], hand[1] - 20); g.rotate(-.25); g.fillStyle = '#2a2733'; g.strokeStyle = INK; g.lineWidth = 7; rr(g, -26, -52, 52, 96, 12); g.fill(); g.stroke(); g.fillStyle = '#8fd8ff'; g.fillRect(-18, -42, 36, 62); g.restore(); }
  // head
  const hx = cx + lx * 1.25 + (side ? 18 : q ? 8 : 0), hy = shY - 150 + Math.abs(lx) * .08, HW = 330, HH = 300, cap = look.hairStyle === 'cap';
  g.save(); g.translate(hx, hy + 120); g.rotate(p.head); g.translate(-hx, -(hy + 120));
  g.fillStyle = look.skin; g.strokeStyle = INK; g.lineWidth = 9;
  if (!side) for (const s of q ? [-1] : [-1, 1]) { g.beginPath(); g.ellipse(hx + s * (HW / 2 - 4), hy + 20, 26, 34, 0, 0, TAU); g.fill(); g.stroke(); }
  const skull = () => rr(g, hx - HW / 2, hy - HH / 2, HW, HH, 120);
  skull(); g.fill(); g.save(); g.clip(); g.fillStyle = 'rgba(0,0,0,.10)'; if (back) g.fillRect(hx - HW * 1.22, hy - HH, HW, HH * 2); else g.fillRect(hx + HW * .22, hy - HH, HW, HH * 2); g.restore(); skull(); g.stroke();
  if (side) { g.beginPath(); g.ellipse(hx + HW / 2 - 2, hy + 52, 24, 17, 0, 0, TAU); g.save(); g.beginPath(); g.rect(hx + HW / 2 - 3, hy, 60, 110); g.clip(); g.beginPath(); g.ellipse(hx + HW / 2 - 2, hy + 52, 24, 17, 0, 0, TAU); g.stroke(); g.restore(); g.beginPath(); g.ellipse(hx + HW / 2 - 6, hy + 52, 20, 12, 0, 0, TAU); g.fill(); }   // the nose breaks the outline
  // hair
  g.fillStyle = look.hair; g.strokeStyle = INK; g.lineWidth = 8; const fo = q ? 28 : 0;
  if (back) { g.save(); skull(); g.clip(); g.fillStyle = cap ? look.bottom : look.hair; g.beginPath(); g.moveTo(hx - HW, hy - HH); g.lineTo(hx + HW, hy - HH); g.lineTo(hx + HW, hy + 44); g.bezierCurveTo(hx + 90, hy + (cap ? 30 : 96), hx - 90, hy + (cap ? 30 : 96), hx - HW, hy + 44); g.closePath(); g.fill(); g.stroke(); if (cap) { g.fillStyle = look.hair; g.beginPath(); g.moveTo(hx - HW, hy + 44); g.bezierCurveTo(hx - 90, hy + 30, hx + 90, hy + 30, hx + HW, hy + 44); g.lineTo(hx + HW, hy + 70); g.bezierCurveTo(hx + 90, hy + 110, hx - 90, hy + 110, hx - HW, hy + 70); g.closePath(); g.fill(); g.stroke(); } g.restore(); skull(); g.lineWidth = 9; g.stroke(); }
  else if (side) { if (cap) { g.fillStyle = look.bottom; g.beginPath(); g.moveTo(hx - HW / 2 - 4, hy - 40); g.bezierCurveTo(hx - HW / 2 - 6, hy - HH / 2 - 76, hx + HW / 2, hy - HH / 2 - 70, hx + HW / 2 + 4, hy - 60); g.closePath(); g.fill(); g.stroke(); rr(g, hx + HW / 2 - 70, hy - 78, 170, 30, 15); g.fill(); g.stroke(); g.fillStyle = look.hair; g.beginPath(); g.moveTo(hx - HW / 2 - 2, hy - 40); g.lineTo(hx - HW / 2 + 2, hy + 40); g.bezierCurveTo(hx - HW / 2 + 50, hy + 30, hx - 80, hy - 10, hx - 70, hy - 44); g.closePath(); g.fill(); g.stroke(); }
    else { g.beginPath(); g.moveTo(hx + HW / 2 - 14, hy - 58); g.bezierCurveTo(hx + HW / 2 - 6, hy - HH / 2 - 74, hx - HW / 2 - 22, hy - HH / 2 - 72, hx - HW / 2 - 4, hy - 20); g.lineTo(hx - HW / 2 + 2, hy + 46); g.bezierCurveTo(hx - HW / 2 + 64, hy + 34, hx - 74, hy - 6, hx - 52, hy - 48); g.bezierCurveTo(hx + 6, hy - 96, hx + 84, hy - 96, hx + HW / 2 - 14, hy - 58); g.fill(); g.stroke(); }
    g.fillStyle = look.skin; g.lineWidth = 9; g.beginPath(); g.ellipse(hx - 46, hy + 26, 24, 32, 0, 0, TAU); g.fill(); g.stroke(); }
  else if (cap) { g.beginPath(); g.moveTo(hx - HW / 2 - 4, hy - 60); g.bezierCurveTo(hx - HW / 2, hy - HH / 2 - 70, hx + HW / 2, hy - HH / 2 - 70, hx + HW / 2 + 4, hy - 60); g.closePath(); g.fillStyle = look.bottom; g.fill(); g.stroke(); rr(g, hx - 40 + fo * 1.4, hy - 78, HW / 2 + 90, 30, 15); g.fill(); g.stroke(); }
  else { g.beginPath(); g.moveTo(hx - HW / 2 + 6, hy - 50 + fo * .9); g.bezierCurveTo(hx - HW / 2 - 10, hy - HH / 2 - 60, hx + 40, hy - HH / 2 - 80, hx + HW / 2 - 4, hy - 70); g.bezierCurveTo(hx + 90 + fo, hy - 80, hx + 10 + fo, hy - 118, hx - 50 + fo, hy - 62); g.bezierCurveTo(hx - 80 + fo, hy - 84, hx - 120 + fo * .6, hy - 74 + fo * .4, hx - HW / 2 + 6, hy - 50 + fo * .9); g.fill(); g.stroke(); }
  if (!back) face(g, p, hx, hy, HW, view);
  if (p.sweat > 0) { const dx = back ? -HW + 60 : 0; g.fillStyle = '#8fd8ff'; g.strokeStyle = INK; g.lineWidth = 6; g.globalAlpha = p.sweat; g.beginPath(); g.moveTo(hx + HW / 2 - 30 + dx, hy - 110); g.quadraticCurveTo(hx + HW / 2 + 4 + dx, hy - 60, hx + HW / 2 - 30 + dx, hy - 50); g.quadraticCurveTo(hx + HW / 2 - 62 + dx, hy - 60, hx + HW / 2 - 30 + dx, hy - 110); g.fill(); g.stroke(); g.globalAlpha = 1; }
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
  // a point in the world -> the spot on this character's card that covers it from the camera, in canvas pixels
  const toCard = (pt, camera, yaw) => { const o = camera.position, P = group.position, nx = Math.sin(yaw), nz = Math.cos(yaw), dx = pt[0] - o.x, dy = pt[1] - o.y, dz = pt[2] - o.z, den = dx * nx + dz * nz; if (Math.abs(den) < 1e-6) return null;
    const s = ((P.x - o.x) * nx + (P.z - o.z) * nz) / den, hx = o.x + dx * s, hy = o.y + dy * s, hz = o.z + dz * s, lx = (hx - P.x) * Math.cos(yaw) - (hz - P.z) * Math.sin(yaw);
    return [CW / 2 + lx / hW * CW, (CH - 40) - (hy - P.y) / hH * CH]; };
  // toward: [x, z], a point in the world the character faces. The view (front, three-quarter, side, back) and the side it turns to follow from where the camera is.
  const turned = (p, camera) => { const yc = Math.atan2(camera.position.x - group.position.x, camera.position.z - group.position.z); let r = Math.atan2(p.toward[0] - group.position.x, p.toward[1] - group.position.z) - yc; r = Math.atan2(Math.sin(r), Math.cos(r)); const a = Math.abs(r);
    return { ...p, view: a < .45 ? 'front' : a < 1.15 ? 'q' : a < 2.0 ? 'side' : 'back', face: r >= 0 ? 1 : -1 }; };
  return { group, set(p, camera) { if (camera && p.toward) p = turned(p, camera); if (camera && (p.reach || p.reachWith)) { const yaw = Math.atan2(camera.position.x - group.position.x, camera.position.z - group.position.z), c = toCard(p.reach, camera, yaw); if (c) p = { ...p, [(p.reachWith || (c[0] < CW / 2 ? 'L' : 'R')) === 'L' ? 'reachL' : 'reachR']: c }; }
    drawChar(g, look, { ...POSE, ...p }); tex.needsUpdate = true; mesh.position.y = p.sink ? -(p.sink * CH - 40) / CH * hH : 0; blob.visible = !p.sink; if (camera) group.rotation.y = Math.atan2(camera.position.x - group.position.x, camera.position.z - group.position.z); } };
}
