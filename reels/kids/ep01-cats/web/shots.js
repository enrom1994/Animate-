// ---------- characters ----------
const YOU = { cols: PAL.red, hat: 'bandana', hatCol: '#d8312b', dotCol: '#fff' };
const PATCH = { cols: PAL.yellow, hat: 'bandana', hatCol: '#6c43c0', dotCol: '#fff' };
const SAILOR = { cols: PAL.blue, hat: 'sailor', belt: false };
const C = (base, extra) => Object.assign({}, base, extra);
const walkLegs = (t, sp = 9, amp = .55) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const walkArms = (t, sp = 9, amp = .6) => ({ L: [.3 - Math.sin(t * sp) * amp, -.3], R: [.3 + Math.sin(t * sp) * amp, -.3] });
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);

const ORANGE = { fur: '#f29a3a', dark: '#d97a1e', belly: '#fde4bf' };
const GREY = { fur: '#9aa3ad', dark: '#7b848e', belly: '#e6e9ec' };
const CHEETAH = { fur: '#f2c35a', dark: '#2a2026', belly: '#fbecc4', spots: true };
const TIGER = { fur: '#f28a2a', dark: '#2a2026', belly: '#fde9cf', stripes: true };
const LION = { fur: '#e9b45a', dark: '#b8641e', belly: '#f7deb0', mane: true };

function stamp(ctx, str, x, y, size, k, fill = '#e0392f', rot = -.05) {
  if (k <= 0) return; const sc = lerp(1.7, 1, backOut(clamp(k / .18))), a = clamp(k / .08);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = a;
  text(ctx, str, 0, 0, size, fill, INK, size * .16, 'Poppins', 700); text(ctx, str, 0, 0, size, fill, null, 0, 'Poppins', 700); ctx.restore();
}
// ---------- the cat ----------
function drawCat(ctx, o, t) {
  const s = o.s || 400, f = o.flip || 1, C_ = o.coat || ORANGE, lw = 6 / s * (o.lwScale || 1);
  const buzz = (o.purr || 0) * Math.sin(t * 70) * .006;
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(s * f, s); ctx.translate(buzz, 0);
  if (o.shadow !== false) { ellipse(ctx, 0, 0, .42, .06); ctx.fillStyle = 'rgba(40,20,30,.2)'; ctx.fill(); }
  const fill = (col) => fillStroke(ctx, col, lw);
  // tail
  const sw = Math.sin((o.tail ?? t) * 2.2) * .12, up = o.fluff ? 1.25 : 1;
  ctx.beginPath(); ctx.moveTo(-.28, -.1); ctx.bezierCurveTo(-.62, -.05, -.62 + sw, -.45 * up, -.48 + sw, -.7 * up);
  ctx.lineWidth = (o.fluff ? .16 : .11) + lw * 2; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = o.fluff ? .16 : .11; ctx.strokeStyle = C_.fur; ctx.stroke();
  // body
  ellipse(ctx, 0, -.32, .34, .32); fill(C_.fur);
  if (C_.stripes) { ctx.save(); ellipse(ctx, 0, -.32, .34, .32); ctx.clip(); for (const x of [-.22, -.08, .1]) { ctx.beginPath(); ctx.moveTo(x, -.66); ctx.quadraticCurveTo(x + .07, -.4, x - .02, -.12); ctx.lineWidth = .04; ctx.strokeStyle = C_.dark; ctx.stroke(); } ctx.restore(); }
  ellipse(ctx, .04, -.27, .17, .22); ctx.fillStyle = C_.belly; ctx.fill();
  if (C_.spots) { ctx.fillStyle = C_.dark; for (const [x, y] of [[-.22, -.42], [-.16, -.22], [-.26, -.28], [.2, -.45], [.24, -.25], [-.08, -.55]]) { circle(ctx, x, y, .025); ctx.fill(); } }
  for (const x of [-.08, .16]) { const up = o.knead ? Math.max(0, Math.sin(t * 6 + (x < 0 ? 0 : Math.PI))) * .07 : 0; ellipse(ctx, x, -.03 - up, .085, .05); fill(C_.fur); }
  // head
  const hx = .05, hy = -.8 + (o.headBob || 0);
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(o.headTilt || 0);
  if (C_.mane) { ctx.beginPath(); for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, r = (i % 2 ? .4 : .48); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * .95); } ctx.closePath(); fill(C_.dark); }
  for (const sx of [-1, 1]) {   // ears
    path(ctx, [[sx * .29, -.08], [sx * .25, -.36], [sx * .07, -.22]]); fill(C_.fur);
    path(ctx, [[sx * .24, -.12], [sx * .225, -.29], [sx * .12, -.2]]); ctx.fillStyle = '#f4a7b2'; ctx.fill();
  }
  ellipse(ctx, 0, 0, .32, .27); fill(C_.fur);
  if (o.fluff) { ctx.strokeStyle = INK; ctx.lineWidth = lw; for (let i = 0; i < 9; i++) { const a = Math.PI * (.95 + i * .13); line(ctx, Math.cos(a) * .32, Math.sin(a) * .27, Math.cos(a) * .4, Math.sin(a) * .34, lw, INK); } }
  if (C_.stripes) { for (const x of [-.1, 0, .1]) { ctx.beginPath(); ctx.moveTo(x, -.26); ctx.lineTo(x * .8, -.14); ctx.lineWidth = .03; ctx.strokeStyle = C_.dark; ctx.stroke(); } }
  if (C_.spots) { ctx.fillStyle = C_.dark; for (const [x, y] of [[-.17, -.12], [.18, -.1], [-.05, -.18], [.07, -.2]]) { circle(ctx, x, y, .018); ctx.fill(); } }
  ellipse(ctx, 0, .1, .15, .1); ctx.fillStyle = C_.belly; ctx.fill();   // muzzle
  // eyes
  const mood = o.mood || 'normal', blink = o.blink ? 1 : 0;
  for (const ex of [-.12, .12]) {
    if (mood === 'happy' || blink) { ctx.beginPath(); ctx.arc(ex, -.01, .055, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = lw * 1.4; ctx.strokeStyle = INK; ctx.stroke(); }
    else if (mood === 'wide') { for (const _ of [0]) { ellipse(ctx, ex, -.02, .085, .1); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); circle(ctx, ex, -.02, .03); ctx.fillStyle = INK; ctx.fill(); } }
    else if (mood === 'sleepy') { ellipse(ctx, ex, -.01, .06, .03); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); line(ctx, ex - .07, -.03, ex + .07, -.03, lw * 1.4, INK); }
    else { const big = mood === 'scared' ? 1.35 : 1; ellipse(ctx, ex, -.02, .065 * big, .08 * big); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
      const lk = o.look || [0, 0]; ellipse(ctx, ex + lk[0] * .02, -.01 + lk[1] * .02, mood === 'scared' ? .022 : .035, mood === 'scared' ? .03 : .055); ctx.fillStyle = INK; ctx.fill(); circle(ctx, ex + .015, -.04, .012); ctx.fillStyle = '#fff'; ctx.fill(); }
  }
  path(ctx, [[-.035, .055], [.035, .055], [0, .09]]); ctx.fillStyle = '#e97a8a'; ctx.fill();   // nose
  const m = o.mouth || 'w';
  ctx.lineWidth = lw; ctx.strokeStyle = INK;
  if (m === 'roar') { ellipse(ctx, 0, .16, .11, .09); fill('#7a1f2a'); path(ctx, [[-.08, .09], [-.06, .14], [-.04, .09]]); ctx.fillStyle = '#fff'; ctx.fill(); path(ctx, [[.04, .09], [.06, .14], [.08, .09]]); ctx.fill(); }
  else if (m === 'o') { ellipse(ctx, 0, .14, .03, .035); fill('#7a1f2a'); }
  else if (m === 'frown') { ctx.beginPath(); ctx.arc(0, .17, .05, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(-.03, .1, .03, .1, Math.PI * .9); ctx.stroke(); ctx.beginPath(); ctx.arc(.03, .1, .03, .1, Math.PI * .9); ctx.stroke(); }
  for (const sx of [-1, 1]) for (const k of [-1, 0, 1]) line(ctx, sx * .1, .08 + k * .02, sx * .3, .05 + k * .05, lw * .8, INK);   // whiskers
  if (o.blush) for (const sx of [-1, 1]) { ellipse(ctx, sx * .18, .08, .045, .025); ctx.fillStyle = 'rgba(240,120,140,.45)'; ctx.fill(); }
  ctx.restore();
  ctx.restore();
}
// purr: rings of buzz spreading from the throat
function purrRings(ctx, x, y, s, t, amt = 1, col = '#ffe14d') {
  if (amt <= 0) return; ctx.save();
  for (let i = 0; i < 3; i++) { const f = ((t * 1.6 + i / 3) % 1), r = s * (.15 + f * .55); ctx.globalAlpha = (1 - f) * amt; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI * .85, -Math.PI * .15); ctx.lineWidth = s * .025; ctx.strokeStyle = col; ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, r, Math.PI * .15, Math.PI * .85); ctx.stroke(); }
  ctx.restore();
}
function hearts(ctx, x, y, t, n = 3, amt = 1) {
  for (let i = 0; i < n; i++) { const f = ((t * .7 + i / n) % 1), hx = x + Math.sin(t * 2 + i * 2) * 40 + (i - 1) * 60, hy = y - f * 260; ctx.save(); ctx.globalAlpha = (1 - f) * amt; ctx.translate(hx, hy); ctx.scale(.9 + f * .4, .9 + f * .4);
    ctx.beginPath(); ctx.moveTo(0, 18); ctx.bezierCurveTo(-34, -6, -18, -30, 0, -12); ctx.bezierCurveTo(18, -30, 34, -6, 0, 18); fillStroke(ctx, '#ff5d7a', 5); ctx.restore(); }
}
function voiceBox(ctx, cx, cy, r, t, wob, pads = 0) {   // a magnified window into the throat
  ctx.save(); circle(ctx, cx, cy, r); ctx.fillStyle = '#ffd9d9'; ctx.fill(); ctx.clip();
  ctx.fillStyle = '#f6b3b8'; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); ctx.fillStyle = '#7a1f2a'; ellipse(ctx, cx, cy, r * .5, r * .82); ctx.fill();
  const g = Math.sin(t * 25 * TAU / 4) * wob;   // shown slowed down so the eye can follow it
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + sx * r * .55, cy - r * .8); ctx.quadraticCurveTo(cx + sx * r * (.08 + .12 * (1 + g)), cy, cx + sx * r * .55, cy + r * .8); ctx.lineTo(cx + sx * r, cy + r); ctx.lineTo(cx + sx * r, cy - r); ctx.closePath(); fillStroke(ctx, '#ef8f9a', 7);
    if (pads > 0) { circle(ctx, cx + sx * r * (.16 + .12 * (1 + g)), cy, r * .09 * pads); fillStroke(ctx, '#ffe14d', 6); } }
  ctx.restore(); circle(ctx, cx, cy, r); ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.stroke();
}

// ---------- Pip & Biscuit, episode 1 (16:9) ----------
// Timing by phrase, not line number: AT("righting reflex") = when that phrase starts. New lines can be added to the
// script later without breaking any shot.
const _LINES = (() => { const L = {}; WORDS.forEach((w, i) => { (L[w.line] = L[w.line] || []).push(i); }); return L; })();
const _norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
function AT(phrase, offset = 0) {
  const p = _norm(phrase).split(' ');
  for (const k of Object.keys(_LINES)) { const idx = _LINES[k], ws = idx.map(i => _norm(WORDS[i].w));
    for (let j = 0; j + p.length <= ws.length; j++) if (p.every((x, q) => ws[j + q] === x)) return WORDS[idx[Math.min(idx.length - 1, j + offset)]].s; }
  console.log('AT: phrase not found: ' + phrase); return 0;
}
function LINE_END(phrase) {   // when the line holding this phrase finishes
  const p = _norm(phrase).split(' ');
  for (const k of Object.keys(_LINES)) { const idx = _LINES[k], ws = idx.map(i => _norm(WORDS[i].w));
    for (let j = 0; j + p.length <= ws.length; j++) if (p.every((x, q) => ws[j + q] === x)) return WORDS[idx[idx.length - 1]].e; }
  console.log('LINE_END: phrase not found: ' + phrase); return 0;
}
const talking = t => WORDS.some(w => t >= w.s && t < w.e - .03);
const pipFace = (t, extra = {}) => Object.assign({ eyes: 'normal', mouth: talking(t) ? (Math.floor(t * 9) % 2 ? 'o' : 'smile') : 'smile' }, extra);
const PIP = { cols: PAL.red, hat: 'none', belt: false };
const BISCUIT = { fur: '#f29a3a', dark: '#d97a1e', belly: '#fde4bf' };
const KIT1 = { fur: '#f29a3a', dark: '#d97a1e', belly: '#fde4bf' }, KIT2 = { fur: '#9aa3ad', dark: '#7b848e', belly: '#e6e9ec' }, KIT3 = { fur: '#6b5a64', dark: '#4a3d45', belly: '#f2ece4' };
const CX = W / 2, CY = H / 2;
const camOf = (t, z0, z1, lt, dur, x = CX, y = CY) => { const hh = handheld(t, 2.5); return { x: x + hh[0], y: y + hh[1], z: lerp(z0, z1, ease(clamp(lt / dur))), r: 0 }; };

// ---------- places ----------
function room(ctx, t, o = {}) {
  ctx.fillStyle = '#f7dca8'; ctx.fillRect(-800, -800, W + 1600, H + 1600);
  for (let x = -800; x < W + 800; x += 130) { ctx.fillStyle = 'rgba(230,180,110,.33)'; ctx.fillRect(x, -800, 55, 1600 + 800); }
  rrect(ctx, 1230, 120, 420, 380, 18); fillStroke(ctx, '#bfe6f8', 10); drawCloud(ctx, 1400 + Math.sin(t * .2) * 40, 230, 60, 2); line(ctx, 1440, 120, 1440, 500, 10, INK); line(ctx, 1230, 310, 1650, 310, 10, INK);
  for (const [x0, x1, dir] of [[1190, 1230, 1], [1650, 1690, -1]]) { ctx.beginPath(); ctx.moveTo(x0, 90); ctx.quadraticCurveTo(x0 + dir * 70, 300, x0 + dir * 10, 540); ctx.lineTo(x1 - dir * 0, 540); ctx.lineTo(x1, 90); ctx.closePath(); fillStroke(ctx, '#e0503a', 7); }
  rrect(ctx, 560, 170, 230, 170, 10); fillStroke(ctx, '#fff7e6', 9); ellipse(ctx, 670, 255, 55, 30); fillStroke(ctx, '#5bb8e8', 6); path(ctx, [[725, 255], [760, 228], [760, 282]]); fillStroke(ctx, '#5bb8e8', 6);
  if (o.shelf !== false) bookshelf(ctx, 70, 760);
  ctx.fillStyle = '#c98a52'; ctx.fillRect(-800, 760, W + 1600, 900); for (let y = 760; y < H + 600; y += 90) line(ctx, -800, y, W + 800, y, 4, '#a96e3a');
  ellipse(ctx, 1080, 880, 640, 105); fillStroke(ctx, '#5d8fd8', 8); ellipse(ctx, 1080, 880, 520, 78); ctx.strokeStyle = '#fff3cc'; ctx.lineWidth = 6; ctx.stroke();
}
function bookshelf(ctx, x, y) {
  rrect(ctx, x, y - 640, 330, 640, 10); fillStroke(ctx, '#9a5a2c', 8);
  const cols = ['#e0392f', '#2f63c9', '#f2b52a', '#3fa35b', '#7a4bc4', '#f39a1e'];
  for (let r = 0; r < 3; r++) { const sy = y - 640 + 30 + r * 200; line(ctx, x + 10, sy + 160, x + 320, sy + 160, 10, '#6b3d1e');
    for (let b = 0; b < 7; b++) { const bw = 32 + (b * 7 % 11), bh = 120 + (b * 13 % 30); rrect(ctx, x + 24 + b * 40, sy + 160 - bh, bw - 6, bh, 4); fillStroke(ctx, cols[(b + r * 2) % cols.length], 5); } }
}
function sofa(ctx, x, y, w = 820) {
  rrect(ctx, x - w / 2, y - 360, w, 250, 50); fillStroke(ctx, '#e8743c', 8);
  rrect(ctx, x - w / 2 + 40, y - 170, w - 80, 140, 30); fillStroke(ctx, '#f08a4e', 8);
  rrect(ctx, x - w / 2 - 40, y - 270, 110, 260, 40); fillStroke(ctx, '#d9622a', 8); rrect(ctx, x + w / 2 - 70, y - 270, 110, 260, 40); fillStroke(ctx, '#d9622a', 8);
}
function blanket(ctx, x, y, w = 620, h = 120, dent = 0) {
  ctx.save(); ctx.beginPath(); ctx.moveTo(x - w / 2, y - h / 2); ctx.quadraticCurveTo(x, y - h / 2 + dent * 30, x + w / 2, y - h / 2); ctx.lineTo(x + w / 2 + 20, y + h / 2); ctx.lineTo(x - w / 2 - 20, y + h / 2); ctx.closePath();
  fillStroke(ctx, '#7fc8a9', 8); ctx.clip(); for (let i = -10; i < 12; i++) { line(ctx, x - w / 2 + i * 60, y - h, x - w / 2 + i * 60 + 80, y + h, 10, 'rgba(255,255,255,.35)'); } ctx.restore();
}
function savanna(ctx, t) {
  const g = ctx.createLinearGradient(0, -300, 0, 700); g.addColorStop(0, '#f9b04a'); g.addColorStop(1, '#ffe6a8'); ctx.fillStyle = g; ctx.fillRect(-800, -800, W + 1600, 1600);
  drawSun(ctx, 1500, 240, 130, t, 1);
  ctx.fillStyle = '#d6a543'; ctx.beginPath(); ctx.moveTo(-800, 640); for (let x = -800; x <= W + 800; x += 120) ctx.lineTo(x, 625 + Math.sin(x * .008) * 18); ctx.lineTo(W + 800, H + 800); ctx.lineTo(-800, H + 800); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8bd5a'; ctx.fillRect(-800, 760, W + 1600, 900);
  line(ctx, 260, 660, 280, 420, 24, '#5a3a22'); ellipse(ctx, 290, 390, 240, 55); fillStroke(ctx, '#5f8f3a', 7);
  for (let i = 0; i < 46; i++) { const R = rng(i + 4), x = R() * W, y = 780 + R() * 260; for (const d of [-8, 0, 8]) line(ctx, x + d, y, x + d * 1.8, y - 22 - Math.abs(d), 4, '#b8892e'); }
}
function nightSky(ctx, t, col = '#2b3a67') { ctx.fillStyle = col; ctx.fillRect(-800, -800, W + 1600, H + 1600); for (let i = 0; i < 60; i++) { const R = rng(i + 7); star5(ctx, R() * W, R() * H * .8, 3 + R() * 4, t * .3, 'rgba(255,255,255,.4)'); } }
function card(ctx, t, lt, big, small, col = '#e0392f') {   // chapter title card
  nightSky(ctx, t, '#f2b52a'); const k = backOut(clamp(lt / .35));
  ctx.save(); ctx.translate(CX, CY - 40); ctx.scale(k, k); ctx.rotate(-.02);
  rrect(ctx, -520, -200, 1040, 400, 60); fillStroke(ctx, '#fff7e6', 12);
  text(ctx, big, 0, -70, 84, col, null, 0); ctx.font = '700 108px Poppins'; const fs = Math.min(108, 108 * 900 / ctx.measureText(small).width); text(ctx, small, 0, 60, fs, '#2a2026', null, 0); ctx.restore();
}
function bubbleText(ctx, str, x, y, k, col = '#fff7e6', tcol = '#2a2026', size = 56) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(backOut(clamp(k)), backOut(clamp(k))); ctx.font = `700 ${size}px Poppins`; const w = ctx.measureText(str).width + 70;
  rrect(ctx, -w / 2, -size * .9, w, size * 1.8, size * .7); fillStroke(ctx, col, 7); text(ctx, str, 0, 4, size, tcol, null, 0); ctx.restore();
}
function rotCat(ctx, x, y, s, ang, o, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.translate(0, s * .45); drawCat(ctx, Object.assign({ x: 0, y: 0, s, shadow: false }, o), t); ctx.restore(); }
function bigPaw(ctx, x, y, s, t) {   // a paw seen from below: pads and toe beans
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 0, 0, 1, 1.05); fillStroke(ctx, '#f29a3a', .05);
  ellipse(ctx, 0, .22, .42, .34); fillStroke(ctx, '#f4a7b2', .04);
  for (const [px, py] of [[-.42, -.32], [-.15, -.55], [.15, -.55], [.42, -.32]]) { ellipse(ctx, px, py, .14, .17); fillStroke(ctx, '#f4a7b2', .035); }
  ctx.restore();
}

const SHOTS = [];
const shot = (at, tr, draw) => SHOTS.push({ start: at, tr, draw });

// ===== INTRO =====
shot(0, 'cut', (ctx, lt, t) => {   // Pip and Biscuit on the sofa
  applyCam(ctx, camOf(t, 1.0, 1.06, lt, 4), 1); room(ctx, t); sofa(ctx, 1080, 790);
  const wave = t < AT('this is my cat');
  drawStick(ctx, C(PIP, { x: 860, y: 770, s: 560, legs: { L: [1.45, -1.5], R: [1.45, -1.5] }, arms: { L: wave ? [2.7 + Math.sin(t * 9) * .25, .3] : [.3, -.1], R: wave ? [.3, -.1] : { ik: [.42, -.4] } }, face: pipFace(t, { eyes: 'happy' }) }));
  drawCat(ctx, { x: 1260, y: 640, s: 320, coat: BISCUIT, mood: t > AT('Biscuit') ? 'happy' : 'normal', look: [-1, 0], purr: .4, blush: true }, t);
  bubbleText(ctx, 'BISCUIT', 1270, 260, clamp((t - AT('Biscuit')) / .3), '#f2b52a', '#fff', 60);
});
shot(AT('Biscuit does four'), 'whip', (ctx, lt, t) => {   // three mysteries: question marks over Biscuit
  applyCam(ctx, camOf(t, 1.05, 1.15, lt, 3), 1); room(ctx, t, { shelf: false });
  drawCat(ctx, { x: CX, y: 860, s: 520, coat: BISCUIT, mood: 'normal', look: [Math.sin(t * 2), -.5] }, t);
  for (let i = 0; i < 4; i++) { const k = kf(t, [[AT('four things') + i * .25, 0], [AT('four things') + i * .25 + .25, 1, backOut]]); if (k > 0) text(ctx, '?', CX - 540 + i * 360, 260 + Math.sin(t * 3 + i) * 14, 170 * k, '#ffe14d', INK, 16); }
});
shot(AT('She purrs'), 'whip', (ctx, lt, t) => {   // purrs / lands on her feet / squishes her paws
  applyCam(ctx, camOf(t, 1.0, 1.0, lt, 3), 1); room(ctx, t, { shelf: false });
  const items = [[AT('She purrs'), 300, 'PURRS'], [AT('lands on her feet'), 740, 'LANDS'], [AT('squishes her paws'), 1180, 'SQUISHES'], [AT('jumps into every box'), 1620, 'BOXES']];
  for (const [at, x, name] of items) { const k = kf(t, [[at - .05, 0], [at + .25, 1, backOut]]); if (k <= 0) continue;
    ctx.save(); ctx.translate(x, 760); ctx.scale(k * .85, k * .85); ctx.translate(-x, -760);
    if (name === 'LANDS') { const ph = clamp((t - at) / .9); rotCat(ctx, x, lerp(300, 560, ph), 260, lerp(Math.PI, 0, ease(ph)), { coat: BISCUIT, mood: ph > .9 ? 'happy' : 'wide' }, t); }
    else if (name === 'BOXES') catInBox(ctx, x, 730, 300, 160, 250, { coat: BISCUIT, mood: 'happy' }, t);
    else { if (name === 'SQUISHES') blanket(ctx, x, 760, 380, 80, Math.sin(t * 6)); drawCat(ctx, { x, y: 730, s: 290, coat: BISCUIT, mood: 'happy', purr: name === 'PURRS' ? 1 : 0, knead: name === 'SQUISHES' }, t); if (name === 'PURRS') purrRings(ctx, x + 15, 510, 290, t, .9); }
    text(ctx, name, x, 120, 70, '#fff', INK, 12); ctx.restore(); }
});
shot(AT("Today we're going"), 'whip', (ctx, lt, t) => {   // ready? let's go!
  applyCam(ctx, camOf(t, 1.0, 1.08, lt, 3), 1); room(ctx, t);
  const go = t > AT("Let's go");
  drawStick(ctx, C(PIP, { x: 820, y: 790 - (go ? Math.abs(Math.sin(t * 8)) * 50 : 0), s: 560, arms: go ? POSE.handsUp.arms : { L: [.3, -.1], R: [2.2, .2] }, face: pipFace(t, { eyes: go ? 'happy' : 'wide' }) }));
  drawCat(ctx, { x: 1180, y: 790 - (go ? Math.abs(Math.sin(t * 8 + 1)) * 40 : 0), s: 330, coat: BISCUIT, mood: go ? 'happy' : 'normal', look: [-1, 0] }, t);
  if (go) stamp(ctx, "LET'S GO!", CX, 230, 130, t - AT("Let's go"), '#3fa35b', -.04);
});

// ===== MYSTERY 1: THE PURR =====
shot(AT('Mystery number one'), 'whip', (ctx, lt, t) => card(ctx, t, lt, 'MYSTERY #1', 'THE PURR'));
shot(AT('Listen Biscuit is purring'), 'whip', (ctx, lt, t) => {   // listen: a tiny motor
  applyCam(ctx, camOf(t, 1.1, 1.3, lt, 4), 1); room(ctx, t, { shelf: false });
  drawCat(ctx, { x: CX, y: 900, s: 560, coat: BISCUIT, mood: 'happy', purr: 1.4, blush: true }, t); purrRings(ctx, CX + 30, 500, 560, t, 1);
  drawStick(ctx, C(PIP, { x: 520, y: 900, s: 500, headTilt: .25, arms: { L: [.3, -.1], R: { ik: [.25, -.78] } }, face: pipFace(t, { eyes: 'happy' }) }));
  if (t > AT('tiny motor')) { ctx.save(); ctx.translate(1500, 360); ctx.rotate(t * 6); for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i / 8 * TAU); rrect(ctx, -12, -82, 24, 24, 5); fillStroke(ctx, '#9aa3ad', 5); ctx.restore(); } circle(ctx, 0, 0, 60); fillStroke(ctx, '#9aa3ad', 7); ctx.restore(); }
});
shot(AT('Most people think a purr'), 'whip', (ctx, lt, t) => {   // happy purr
  applyCam(ctx, camOf(t, 1.0, 1.1, lt, 5), 1); room(ctx, t, { shelf: false }); sofa(ctx, CX, 790, 900);
  drawCat(ctx, { x: CX, y: 640, s: 420, coat: BISCUIT, mood: 'happy', purr: 1, blush: true }, t); purrRings(ctx, CX + 20, 330, 420, t, .9);
  hearts(ctx, CX, 280, t, 3, clamp((t - AT('it does')) / .3) + .4);
});
shot(AT("But here's something surprising"), 'whip', (ctx, lt, t) => {   // scared, sick, hurt
  applyCam(ctx, camOf(t, 1.0, 1.03, lt, 5), 1); room(ctx, t, { shelf: false });
  const items = [[AT('scared'), 450, 'scared'], [AT('or sick'), CX, 'sick'], [AT('or hurt'), 1470, 'hurt']];
  for (const [at, x, kind] of items) { const k = kf(t, [[at - .05, 0], [at + .22, 1, backOut]]); if (k <= 0) continue;
    ctx.save(); ctx.translate(x, 800); ctx.scale(k, k); ctx.translate(-x, -800);
    drawCat(ctx, { x, y: 800, s: 330, coat: kind === 'sick' ? KIT2 : BISCUIT, mood: kind === 'scared' ? 'scared' : kind === 'sick' ? 'sleepy' : 'normal', fluff: kind === 'scared', mouth: kind === 'scared' ? 'o' : 'frown', purr: .6 }, t);
    if (kind === 'sick') { line(ctx, x + 20, 580, x + 120, 535, 12, INK); line(ctx, x + 20, 580, x + 120, 535, 6, '#fff'); circle(ctx, x + 120, 535, 11); ctx.fillStyle = '#e0392f'; ctx.fill(); }
    if (kind === 'hurt') { rrect(ctx, x - 44, 768, 76, 36, 10); fillStroke(ctx, '#fff7e6', 5); line(ctx, x - 6, 770, x - 6, 802, 3, '#e0392f'); line(ctx, x - 24, 786, x + 12, 786, 3, '#e0392f'); }
    text(ctx, kind.toUpperCase(), x, 150, 64, '#fff', INK, 11); purrRings(ctx, x + 15, 545, 330, t, .5); ctx.restore(); }
});
shot(AT('Scientists are still working'), 'whip', (ctx, lt, t) => {   // scientists still working it out
  applyCam(ctx, camOf(t, 1.0, 1.06, lt, 4), 1); nightSky(ctx, t);
  drawStick(ctx, C(PIP, { cols: PAL.purple, x: 640, y: 900, s: 500, arms: { L: [.3, -.1], R: { ik: [.08, -.72] } }, face: { eyes: 'squint', mouth: 'flat', look: [.6, -.4] } }));
  for (let i = 0; i < 4; i++) text(ctx, '?', 900 + i * 180, 360 + Math.sin(t * 3 + i) * 18, 120, '#ffe14d', INK, 12);
  if (t > AT('how a purr is made')) { ctx.save(); ctx.translate(1350, 640); ctx.scale(backOut(clamp((t - AT('how a purr is made')) / .3)), backOut(clamp((t - AT('how a purr is made')) / .3))); star5(ctx, 0, 0, 120, 0, '#ffe14d'); text(ctx, 'HOW!', 0, 10, 60, '#e0392f', null, 0); ctx.restore(); }
});
shot(AT("Deep in Biscuit's throat"), 'whip', (ctx, lt, t) => {   // the voice box, breathing, 25 a second
  applyCam(ctx, camOf(t, 1.0, 1.03, lt, 8), 1); nightSky(ctx, t);
  drawCat(ctx, { x: 560, y: 1180, s: 760, coat: BISCUIT, mood: 'happy', purr: .4, shadow: false }, t);
  const show = kf(t, [[AT('voice box'), 0], [AT('voice box') + .3, 1, backOut]]);
  if (show > 0) { line(ctx, 610, 760, 1150, 470, 8, '#fff'); circle(ctx, 610, 760, 16); ctx.fillStyle = '#fff'; ctx.fill(); ctx.save(); ctx.translate(1340, 440); ctx.scale(show, show); voiceBox(ctx, 0, 0, 260, t, t > AT('two little flaps') ? 1 : 0); ctx.restore(); text(ctx, 'VOICE BOX', 1340, 760, 56, '#ffe14d', INK, 10); }
  if (t > AT('breathes in and out') && t < AT('About')) { const ph = Math.sin(t * 3); text(ctx, ph > 0 ? 'BREATHE IN' : 'BREATHE OUT', 1340, 110, 60, '#7fd3e0', INK, 10); }
  const cnt = clamp((t - AT('About')) / 1.4);
  if (cnt > 0) { rrect(ctx, 1050, 70, 580, 120, 30); fillStroke(ctx, '#fff7e6', 8); text(ctx, `${Math.round(25 * cnt)} TIMES A SECOND`, 1340, 134, 52, '#e0392f', null, 0); }
});
shot(AT('That wobbling makes'), 'cut', (ctx, lt, t) => {   // PURRRR
  const sh = shake(t * 4, 10, 4); applyCam(ctx, { x: CX + sh[0], y: CY + sh[1], z: 1.1, r: 0 }, 1); room(ctx, t, { shelf: false });
  drawCat(ctx, { x: CX, y: 900, s: 600, coat: BISCUIT, mood: 'happy', purr: 2.5, blush: true }, t); purrRings(ctx, CX + 30, 490, 600, t * 1.6, 1);
  stamp(ctx, 'PURRRR', CX, 200, 150, t - AT('a purr', 0), '#ffe14d', -.04);
});
shot(AT('A few years ago'), 'whip', (ctx, lt, t) => {   // tiny soft pads
  applyCam(ctx, camOf(t, 1.0, 1.08, lt, 5), 1); nightSky(ctx, t);
  const pads = kf(t, [[AT('tiny soft pads') - .1, 0], [AT('tiny soft pads') + .3, 1, backOut]]);
  voiceBox(ctx, 760, 480, 340, t, .8, pads);
  if (pads > 0) { text(ctx, 'TINY SOFT PADS', 1400, 200, 64, '#ffe14d', INK, 10); line(ctx, 1220, 240, 770, 470, 6, '#ffe14d'); }
  drawStick(ctx, C(PIP, { cols: PAL.purple, x: 1450, y: 920, s: 520, face: { eyes: 'wide', mouth: 'o', browUp: 1, look: [-.8, -.3] }, arms: { L: [.3, -.1], R: [2.4, .3] } }));
  if (t > AT('low rumbly')) purrRings(ctx, 760, 480, 700, t, .5);
});
shot(AT('Mother cats purr'), 'whip', (ctx, lt, t) => {   // mother and kittens
  applyCam(ctx, camOf(t, 1.05, 1.12, lt, 4), 1); room(ctx, t, { shelf: false });
  ellipse(ctx, CX, 860, 620, 100); fillStroke(ctx, '#c9a07a', 8); ellipse(ctx, CX, 845, 560, 78); ctx.fillStyle = '#e8c8a0'; ctx.fill();
  drawCat(ctx, { x: 760, y: 850, s: 560, coat: BISCUIT, mood: 'happy', purr: 1, blush: true }, t); purrRings(ctx, 790, 460, 560, t, .9);
  const back = t > AT('kittens purr back');
  [[1100, 870, KIT1], [1260, 880, KIT2], [1420, 865, KIT3]].forEach(([x, y, coat], i) => { drawCat(ctx, { x, y, s: 200, coat, mood: back ? 'happy' : 'normal', look: [-1, 0], purr: back ? 1 : 0, tail: t + i, lwScale: 1.4 }, t); if (back) purrRings(ctx, x + 10, y - 160, 200, t + i * .3, .8, '#fff3a0'); });
});
shot(AT('Big cats are different'), 'whip', (ctx, lt, t) => {   // cheetah purrs, lion and tiger roar
  applyCam(ctx, camOf(t, 1.0, 1.04, lt, 6), 1); savanna(ctx, t);
  const cIn = kf(t, [[AT('Cheetahs can purr') - .1, 0], [AT('Cheetahs can purr') + .25, 1, backOut]]), lIn = kf(t, [[AT('lions and tigers') - .1, 0], [AT('lions and tigers') + .25, 1, backOut]]), roar = t > AT('They roar');
  if (cIn > 0) { ctx.save(); ctx.translate(440, 860); ctx.scale(cIn, cIn); ctx.translate(-440, -860); drawCat(ctx, { x: 440, y: 860, s: 380, coat: CHEETAH, mood: 'happy', purr: 1 }, t); purrRings(ctx, 460, 570, 380, t, .9); text(ctx, 'CHEETAH', 440, 150, 60, '#fff', INK, 10); ctx.restore(); }
  if (lIn > 0) for (const [x, coat, name, ph] of [[1080, LION, 'LION', 0], [1480, TIGER, 'TIGER', .2]]) {
    ctx.save(); ctx.translate(x, 860); ctx.scale(lIn, lIn); ctx.translate(-x, -860);
    drawCat(ctx, { x, y: 860, s: 360, coat, mouth: roar ? 'roar' : 'w', look: [0, -1], headBob: roar ? Math.sin(t * 20 + ph) * .01 : 0, flip: -1 }, t); text(ctx, name, x, 150, 60, '#fff', INK, 10);
    if (roar) { ctx.save(); ctx.translate(x, 420); ctx.scale(.6 + .05 * Math.sin(t * 20), .6 + .05 * Math.sin(t * 20)); burst(ctx, 0, 0, 170, 11, '#ffd23a', 3 + ph * 10); text(ctx, 'ROAR!', 0, 0, 80, '#e0392f', INK, 12); ctx.restore(); }
    ctx.restore(); }
  if (lIn > 0 && !roar) text(ctx, 'NO PURR', 1280, 270, 76, '#e0392f', INK, 12);
});
shot(AT('So Biscuit has a little purring engine'), 'whip', (ctx, lt, t) => {   // the engine inside
  applyCam(ctx, camOf(t, 1.0, 1.12, lt, 4), 1); room(ctx, t); sofa(ctx, 1080, 790);
  drawStick(ctx, C(PIP, { x: 900, y: 770, s: 600, legs: { L: [1.45, -1.5], R: [1.45, -1.5] }, arms: { L: { ik: [.12, -.38] }, R: { ik: [.3, -.36] } }, face: pipFace(t, { eyes: 'happy', look: [.6, .3] }) }));
  drawCat(ctx, { x: 1300, y: 620, s: 300, coat: BISCUIT, mood: 'happy', purr: 1.5, blush: true }, t);
  const eng = kf(t, [[AT('purring engine') - .1, 0], [AT('purring engine') + .3, 1, backOut]]);
  if (eng > 0) { ctx.save(); ctx.translate(1300, 560); ctx.scale(eng * .7, eng * .7); circle(ctx, 0, 0, 70); fillStroke(ctx, '#fff7e6', 7); ctx.rotate(t * 8); for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i / 8 * TAU); rrect(ctx, -10, -58, 20, 18, 4); fillStroke(ctx, '#9aa3ad', 4); ctx.restore(); } circle(ctx, 0, 0, 40); fillStroke(ctx, '#9aa3ad', 6); ctx.restore(); }
  if (t > AT('Cool right')) stamp(ctx, 'COOL!', 1500, 230, 120, t - AT('Cool right'), '#3fa35b', .05);
});

// ===== MYSTERY 2: LANDING ON HER FEET =====
shot(AT('Mystery number two'), 'whip', (ctx, lt, t) => card(ctx, t, lt, 'MYSTERY #2', 'LANDING ON HER FEET', '#2f63c9'));
shot(AT('Biscuit jumped off the bookshelf'), 'whip', (ctx, lt, t) => {   // the jump off the bookshelf, plop
  applyCam(ctx, camOf(t, 1.0, 1.05, lt, 5), 1); room(ctx, t);
  const j0 = AT('jumped off') + .2, ph = clamp((t - j0) / 1.1), land = AT('plop');
  const x = lerp(240, 760, ph), y = ph < 1 ? lerp(80, 760, ph * ph) - Math.sin(ph * Math.PI) * 120 : 760;
  if (t < j0) drawCat(ctx, { x: 240, y: 120, s: 240, coat: BISCUIT, mood: 'normal', look: [1, 1], shadow: false }, t);
  else if (ph < 1) rotCat(ctx, x, y - 110, 240, lerp(Math.PI * .9, 0, ease(ph)), { coat: BISCUIT, mood: 'wide' }, t);
  else drawCat(ctx, { x: 760, y: 760, s: 240 * (t < land + .2 ? lerp(.8, 1, clamp((t - land) / .2)) : 1), coat: BISCUIT, mood: 'happy' }, t);
  drawStick(ctx, C(PIP, { x: 1400, y: 800, s: 520, face: pipFace(t, { eyes: t > land ? 'happy' : 'wide', look: [-1, -.3] }), arms: t > land ? POSE.handsUp.arms : { L: [.3, -.1], R: [.3, -.1] } }));
  if (t > land && t < land + .8) stamp(ctx, 'PLOP!', 760, 360, 110, t - land, '#f2b52a', -.06);
  if (t > AT('all four paws')) for (let i = 0; i < 4; i++) { const k = clamp((t - AT('all four paws') - i * .15) / .2); if (k > 0) text(ctx, String(i + 1), 640 + i * 80, 820, 54 * backOut(k), '#fff', INK, 10); }
});
shot(AT('How does she do it'), 'whip', (ctx, lt, t) => {   // how does she do it?
  applyCam(ctx, camOf(t, 1.1, 1.2, lt, 2), 1); room(ctx, t, { shelf: false });
  drawStick(ctx, C(PIP, { x: 760, y: 860, s: 560, arms: { L: [.3, -.1], R: { ik: [.08, -.72] } }, face: { eyes: 'squint', mouth: 'flat', look: [.6, -.4] } }));
  drawCat(ctx, { x: 1180, y: 860, s: 360, coat: BISCUIT, mood: 'smug' === 'x' ? 'normal' : 'normal', look: [-1, 0] }, t);
  text(ctx, '?', 1160, 300 + Math.sin(t * 3) * 14, 200, '#ffe14d', INK, 18);
});
shot(AT("It's called the righting reflex"), 'whip', (ctx, lt, t) => {   // the righting reflex
  applyCam(ctx, camOf(t, 1.0, 1.05, lt, 4), 1); nightSky(ctx, t, '#2f63c9');
  stamp(ctx, 'THE RIGHTING REFLEX', CX, 240, 110, t - AT('righting reflex'), '#ffe14d', -.03);
  const turn = clamp((t - AT('turning the right way up')) / 1.2);
  rotCat(ctx, CX, 560, 320, lerp(Math.PI, 0, ease(turn)), { coat: BISCUIT, mood: turn > .9 ? 'happy' : 'normal' }, t);
  if (turn > 0 && turn < 1) { ctx.beginPath(); ctx.arc(CX, 600, 260, -Math.PI * .9, -Math.PI * .1); ctx.lineWidth = 12; ctx.strokeStyle = '#ffe14d'; ctx.setLineDash([24, 18]); ctx.stroke(); ctx.setLineDash([]); }
});
shot(AT('First a part of'), 'whip', (ctx, lt, t) => {   // inner ear knows which way is up, eyes help
  applyCam(ctx, camOf(t, 1.0, 1.05, lt, 6), 1); nightSky(ctx, t, '#2f63c9');
  drawCat(ctx, { x: 620, y: 1300, s: 900, coat: BISCUIT, mood: 'normal', look: [0, -1], shadow: false }, t);
  const ear = kf(t, [[AT('inner ear') - .1, 0], [AT('inner ear') + .3, 1, backOut]]);
  if (ear > 0) { line(ctx, 470, 420, 1060, 360, 7, '#fff'); circle(ctx, 470, 420, 14); ctx.fillStyle = '#fff'; ctx.fill(); ctx.save(); ctx.translate(1260, 380); ctx.scale(ear, ear); circle(ctx, 0, 0, 200); fillStroke(ctx, '#ffd9d9', 10);
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(i * TAU / 3 + Math.sin(t * 2) * .1); ellipse(ctx, 0, -70, 40, 90); ctx.lineWidth = 16; ctx.strokeStyle = '#ef8f9a'; ctx.stroke(); ctx.restore(); }
    circle(ctx, 0, 0, 34); fillStroke(ctx, '#f4a7b2', 6); ctx.restore(); text(ctx, 'INNER EAR', 1260, 630, 54, '#ffe14d', INK, 10); }
  if (t > AT('which way is up')) { const k = clamp((t - AT('which way is up')) / .3); ctx.save(); ctx.translate(1660, 400); ctx.scale(k, k); path(ctx, [[0, -150], [70, -40], [25, -40], [25, 120], [-25, 120], [-25, -40], [-70, -40]]); fillStroke(ctx, '#3fa35b', 8); text(ctx, 'UP', 0, 190, 60, '#fff', INK, 10); ctx.restore(); }
  if (t > AT('Her eyes help')) { ctx.save(); const k = clamp((t - AT('Her eyes help')) / .3); ctx.globalAlpha = k; ctx.beginPath(); ctx.moveTo(560, 560); ctx.lineTo(980, 520); ctx.lineTo(980, 700); ctx.closePath(); ctx.fillStyle = 'rgba(255,240,150,.3)'; ctx.fill(); text(ctx, 'EYES', 1000, 760, 54, '#ffe14d', INK, 10); ctx.restore(); }
});
shot(AT('Then she twists'), 'whip', (ctx, lt, t) => {   // four steps: upside down, front turns, back follows, feet down
  applyCam(ctx, camOf(t, 1.0, 1.0, lt, 4), 1); nightSky(ctx, t, '#2f63c9');
  const steps = [[AT('Then she twists'), 'UPSIDE DOWN', Math.PI], [AT('front half'), 'FRONT TURNS', Math.PI * .62], [AT('back half'), 'BACK FOLLOWS', Math.PI * .25], [AT('back half') + 1.1, 'FEET DOWN', 0]];
  steps.forEach(([at, name, ang], i) => { const k = kf(t, [[at - .05, 0], [at + .25, 1, backOut]]); if (k <= 0) return; const x = 300 + i * 440;
    ctx.save(); ctx.translate(x, 470); ctx.scale(k, k); circle(ctx, 0, 0, 190); fillStroke(ctx, 'rgba(255,255,255,.14)', 6); rotCat(ctx, 0, 0, 230, ang, { coat: BISCUIT, mood: i === 3 ? 'happy' : 'wide' }, t); ctx.restore();
    bubbleText(ctx, (i + 1) + '  ' + name, x, 760, k, i === 3 ? '#3fa35b' : '#fff7e6', i === 3 ? '#fff' : '#2a2026', 44);
    if (i) { path(ctx, [[x - 250, 455], [x - 210, 470], [x - 250, 485]]); fillStroke(ctx, '#ffe14d', 5); } });
});
shot(AT('She can do that because'), 'whip', (ctx, lt, t) => {   // a back that bends like a spring
  applyCam(ctx, camOf(t, 1.0, 1.05, lt, 4), 1); room(ctx, t, { shelf: false });
  const bend = Math.sin(t * 4) * .5 + .5;
  drawCat(ctx, { x: 700, y: 880, s: 520, coat: BISCUIT, mood: 'happy', headTilt: Math.sin(t * 4) * .2 }, t);
  if (t > AT('like a spring')) { ctx.beginPath(); for (let i = 0; i <= 40; i++) { const x = 1250 + i * 10, y = 660 + Math.sin(i * 1.2) * (30 + bend * 30) - Math.sin(i / 40 * Math.PI) * 80 * bend; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 7; ctx.strokeStyle = '#ffe14d'; ctx.stroke(); text(ctx, 'SPRINGY!', 1450, 830, 80, '#3fa35b', INK, 11); }
});
shot(AT("And cats don't have a stiff collarbone"), 'whip', (ctx, lt, t) => {   // collarbones: Pip vs Biscuit
  applyCam(ctx, camOf(t, 1.0, 1.02, lt, 5), 1); nightSky(ctx, t, '#2f63c9');
  drawStick(ctx, C(PIP, { x: 560, y: 900, s: 600, face: pipFace(t, { eyes: 'happy' }) }));
  const k = clamp((t - AT('stiff collarbone')) / .3); if (k > 0) { line(ctx, 470, 580, 650, 580, 14 * k, '#ffe14d'); text(ctx, 'COLLARBONE', 560, 140, 52, '#ffe14d', INK, 10); line(ctx, 560, 170, 560, 560, 4, '#ffe14d'); }
  drawCat(ctx, { x: 1360, y: 900, s: 520, coat: BISCUIT, mood: 'happy', headTilt: Math.sin(t * 5) * .15 }, t);
  if (t > AT('shoulders can move')) { for (const sx of [-1, 1]) { ctx.save(); ctx.translate(1360 + sx * 110, 620 + Math.sin(t * 6 + sx) * 20); text(ctx, sx < 0 ? '↺' : '↻', 0, 0, 90, '#ffe14d', INK, 10); ctx.restore(); } text(ctx, 'FREE SHOULDERS', 1360, 140, 52, '#ffe14d', INK, 10); }
});
shot(AT('Then she reaches her legs down'), 'whip', (ctx, lt, t) => {   // reach down, land softly
  applyCam(ctx, camOf(t, 1.0, 1.05, lt, 3), 1); room(ctx, t, { shelf: false });
  const ph = clamp(lt / 1.4), y = lerp(260, 860, ease(ph));
  drawCat(ctx, { x: CX, y, s: 380 * (ph >= 1 ? lerp(.85, 1, clamp((lt - 1.4) / .25)) : 1), coat: BISCUIT, mood: ph >= 1 ? 'happy' : 'wide', shadow: ph > .8 }, t);
  if (ph >= 1) { for (const sx of [-1, 1]) { puff(ctx, CX + sx * 180, 860, 50, lt - 1.4, '#fff7e6', 3, 1 - clamp((lt - 1.4) / .8)); } text(ctx, 'SOFT!', CX, 300, 90, '#3fa35b', INK, 12); }
});
shot(AT('Kittens start learning this'), 'whip', (ctx, lt, t) => {   // 3 weeks to 7 weeks
  applyCam(ctx, camOf(t, 1.0, 1.04, lt, 6), 1); room(ctx, t, { shelf: false });
  const a = kf(t, [[AT('three weeks') - .1, 0], [AT('three weeks') + .25, 1, backOut]]), b = kf(t, [[AT('seven weeks') - .1, 0], [AT('seven weeks') + .25, 1, backOut]]);
  if (a > 0) { ctx.save(); ctx.translate(560, 860); ctx.scale(a, a); drawCat(ctx, { x: 0, y: 0, s: 230, coat: KIT2, mood: 'normal', look: [0, 1], lwScale: 1.3 }, t); ctx.restore(); bubbleText(ctx, '3 WEEKS', 560, 300, a, '#fff7e6', '#2a2026', 60); }
  if (b > 0) { ctx.save(); ctx.translate(1360, 860); ctx.scale(b, b); drawCat(ctx, { x: 0, y: 0, s: 300, coat: KIT2, mood: 'happy', lwScale: 1.2 }, t); ctx.restore(); bubbleText(ctx, '7 WEEKS', 1360, 300, b, '#3fa35b', '#fff', 60); stamp(ctx, 'EXPERT!', 1360, 470, 80, t - AT('experts'), '#f2b52a', .05); }
  if (a > 0 && b > 0) { line(ctx, 760, 700, 1150, 700, 10, '#fff'); path(ctx, [[1150, 680], [1190, 700], [1150, 720]]); fillStroke(ctx, '#fff', 6); }
});
shot(AT("But here's the important part"), 'whip', (ctx, lt, t) => {   // safety: cats can still get hurt
  applyCam(ctx, camOf(t, 1.0, 1.05, lt, 4), 1); room(ctx, t, { shelf: false });
  drawStick(ctx, C(PIP, { x: 820, y: 860, s: 580, arms: { L: [.3, -.1], R: [2.2, .2] }, face: pipFace(t, { eyes: 'normal', browAng: .2 }) }));
  drawCat(ctx, { x: 1240, y: 860, s: 340, coat: BISCUIT, mood: 'normal', look: [-1, 0] }, t);
  if (t > AT('still get hurt')) { rrect(ctx, 1150, 832, 76, 36, 10); fillStroke(ctx, '#fff7e6', 5); line(ctx, 1188, 834, 1188, 866, 3, '#e0392f'); line(ctx, 1170, 850, 1206, 850, 3, '#e0392f'); }
  stamp(ctx, 'IMPORTANT', CX, 200, 110, t - AT('important part'), '#e0392f', -.03);
});
shot(AT('So we never drop a cat'), 'whip', (ctx, lt, t) => {   // we keep our cats safe
  applyCam(ctx, camOf(t, 1.05, 1.12, lt, 5), 1); room(ctx, t); sofa(ctx, 1080, 790);
  drawStick(ctx, C(PIP, { x: 980, y: 770, s: 580, legs: { L: [1.45, -1.5], R: [1.45, -1.5] }, arms: { L: { ik: [.16, -.36] }, R: { ik: [.32, -.42] } }, face: pipFace(t, { eyes: 'happy' }) }));
  drawCat(ctx, { x: 1150, y: 620, s: 240, coat: BISCUIT, mood: 'happy', purr: 1, blush: true }, t); hearts(ctx, 1150, 300, t, 3, .8);
  if (t > AT('never drop')) { const k = clamp((t - AT('never drop')) / .3); ctx.save(); ctx.translate(380, 360); ctx.scale(k, k); circle(ctx, 0, 0, 150); fillStroke(ctx, '#fff7e6', 10); rotCat(ctx, 0, -40, 130, 2.6, { coat: BISCUIT, mood: 'wide' }, t); circle(ctx, 0, 0, 150); ctx.lineWidth = 22; ctx.strokeStyle = '#e0392f'; ctx.stroke(); line(ctx, -105, -105, 105, 105, 22, '#e0392f'); ctx.restore(); }
  if (t > AT('keep our cats safe')) stamp(ctx, 'KEEP CATS SAFE', 1150, 140, 84, t - AT('keep our cats safe'), '#3fa35b', -.03);
});

// ===== MYSTERY 3: MAKING BISCUITS =====
shot(AT('Mystery number three'), 'whip', (ctx, lt, t) => card(ctx, t, lt, 'MYSTERY #3', 'THE SQUISHY PAWS', '#3fa35b'));
shot(AT('Look Biscuit is pressing'), 'whip', (ctx, lt, t) => {   // kneading: left, right, left, right
  applyCam(ctx, camOf(t, 1.0, 1.15, lt, 5), 1); room(ctx, t, { shelf: false });
  blanket(ctx, CX, 860, 820, 140, Math.sin(t * 6));
  drawCat(ctx, { x: CX, y: 860, s: 520, coat: BISCUIT, mood: 'happy', purr: .8, knead: true, blush: true }, t);
  if (t > AT('Left right')) { const side = Math.sin(t * 6) > 0; text(ctx, side ? 'LEFT' : 'RIGHT', side ? 700 : 1220, 760, 64, '#fff', INK, 10); }
});
shot(AT('This is called kneading'), 'whip', (ctx, lt, t) => {   // kneading = making biscuits
  applyCam(ctx, camOf(t, 1.0, 1.05, lt, 5), 1); room(ctx, t, { shelf: false });
  blanket(ctx, 760, 860, 600, 120, Math.sin(t * 6)); drawCat(ctx, { x: 760, y: 860, s: 420, coat: BISCUIT, mood: 'happy', knead: true }, t);
  stamp(ctx, 'KNEADING', 760, 220, 110, t - AT('called kneading'), '#2f63c9', -.03);
  const bk = kf(t, [[AT('making biscuits') - .1, 0], [AT('making biscuits') + .3, 1, backOut]]);
  if (bk > 0) { ctx.save(); ctx.translate(1450, 600); ctx.scale(bk, bk); for (let i = 0; i < 3; i++) { rrect(ctx, -170 + i * 40, -60 - i * 50, 220, 90, 40); fillStroke(ctx, '#e9b46a', 8); for (let d = 0; d < 4; d++) { circle(ctx, -110 + i * 40 + d * 45, -15 - i * 50, 7); ctx.fillStyle = '#b87a3a'; ctx.fill(); } } ctx.restore(); text(ctx, '"MAKING BISCUITS"', 1450, 230, 64, '#f2b52a', INK, 11); }
});
shot(AT("Hey that's your name"), 'cut', (ctx, lt, t) => {   // hey, that's your name!
  applyCam(ctx, camOf(t, 1.15, 1.25, lt, 2), 1); room(ctx, t, { shelf: false });
  drawStick(ctx, C(PIP, { x: 760, y: 900, s: 560, arms: { L: [.3, -.1], R: [1.7, .1] }, face: pipFace(t, { eyes: 'happy' }) }));
  drawCat(ctx, { x: 1180, y: 900, s: 380, coat: BISCUIT, mood: lt > .6 ? 'happy' : 'scared', look: [-1, 0], blush: lt > .6 }, t);
  if (lt > .2) bubbleText(ctx, 'BISCUIT!', 1180, 300, (lt - .2) / .3, '#f2b52a', '#fff', 70);
});
shot(AT('So why do cats knead'), 'whip', (ctx, lt, t) => {   // why?
  applyCam(ctx, camOf(t, 1.0, 1.08, lt, 2), 1); nightSky(ctx, t, '#3fa35b');
  drawCat(ctx, { x: CX, y: 880, s: 460, coat: BISCUIT, mood: 'normal', look: [0, -1], knead: true }, t);
  text(ctx, 'WHY?', CX, 230, 150, '#ffe14d', INK, 16);
});
shot(AT('It starts when'), 'whip', (ctx, lt, t) => {   // kittens and their mom: kneading helps the milk
  applyCam(ctx, camOf(t, 1.05, 1.12, lt, 6), 1); room(ctx, t, { shelf: false });
  ellipse(ctx, CX, 860, 620, 100); fillStroke(ctx, '#c9a07a', 8); ellipse(ctx, CX, 845, 560, 78); ctx.fillStyle = '#e8c8a0'; ctx.fill();
  drawCat(ctx, { x: 820, y: 850, s: 560, coat: KIT2, mood: 'happy', purr: .8, blush: true }, t);
  [[1060, 870, KIT1], [1200, 880, KIT3], [1340, 865, KIT1]].forEach(([x, y, coat], i) => drawCat(ctx, { x, y, s: 190, coat, mood: 'happy', look: [-1, 0], knead: t > AT('press their paws'), tail: t + i, lwScale: 1.4 }, t));
  if (t > AT('milk come out')) { for (let i = 0; i < 4; i++) { const f = (t * .8 + i / 4) % 1; ctx.save(); ctx.globalAlpha = 1 - f; ctx.translate(980 + i * 50, 560 - f * 160); ellipse(ctx, 0, 0, 16, 22); fillStroke(ctx, '#ffffff', 4); ctx.restore(); } text(ctx, 'MILK!', 1150, 260, 80, '#fff', INK, 12); }
});
shot(AT('When cats grow up'), 'whip', (ctx, lt, t) => {   // grown-ups knead when safe and happy
  applyCam(ctx, camOf(t, 1.0, 1.08, lt, 5), 1); room(ctx, t, { shelf: false }); sofa(ctx, CX, 790, 900);
  blanket(ctx, CX, 600, 500, 90, Math.sin(t * 6)); drawCat(ctx, { x: CX, y: 610, s: 380, coat: BISCUIT, mood: 'happy', knead: true, purr: 1, blush: true }, t);
  if (t > AT('feel safe and happy')) { hearts(ctx, CX, 240, t, 3, 1); bubbleText(ctx, 'SAFE', 520, 360, (t - AT('feel safe')) / .3, '#3fa35b', '#fff', 64); bubbleText(ctx, 'HAPPY', 1400, 360, (t - AT('and happy')) / .3, '#f2b52a', '#fff', 64); }
});
shot(AT('Cats also have scent spots'), 'whip', (ctx, lt, t) => {   // paw pads with scent spots
  applyCam(ctx, camOf(t, 1.0, 1.06, lt, 6), 1); nightSky(ctx, t, '#7a4bc4');
  bigPaw(ctx, 760, 520, 260, t);
  if (t > AT('scent spots')) { for (let i = 0; i < 5; i++) { const f = (t * .5 + i / 5) % 1; ctx.save(); ctx.globalAlpha = (1 - f) * .9; ctx.beginPath(); const x0 = 620 + i * 70; ctx.moveTo(x0, 300 - f * 200); ctx.bezierCurveTo(x0 + 30, 260 - f * 200, x0 - 30, 220 - f * 200, x0, 180 - f * 200); ctx.lineWidth = 10; ctx.strokeStyle = '#ffe9a8'; ctx.stroke(); ctx.restore(); } text(ctx, 'SCENT SPOTS', 1430, 600, 64, '#ffe14d', INK, 10); }
  if (t > AT('Scientists think')) bubbleText(ctx, 'SCIENTISTS THINK...', 1430, 420, (t - AT('Scientists think')) / .3, '#fff7e6', '#2a2026', 50);
});
shot(AT('So when Biscuit kneads my blanket'), 'whip', (ctx, lt, t) => {   // this is my cozy spot
  applyCam(ctx, camOf(t, 1.05, 1.15, lt, 4), 1); room(ctx, t); sofa(ctx, 1080, 790);
  blanket(ctx, 1080, 590, 560, 90, Math.sin(t * 6)); drawCat(ctx, { x: 1080, y: 600, s: 360, coat: BISCUIT, mood: 'happy', knead: true, purr: 1, blush: true }, t);
  if (t > AT('my cozy spot')) { stamp(ctx, 'MY COZY SPOT', 1080, 180, 100, t - AT('my cozy spot'), '#f2b52a', -.03); sparkle(ctx, 820, 420, 50, 1); sparkle(ctx, 1340, 440, 40, 1); }
});

// ===== OUTRO =====
shot(AT('So now we know'), 'whip', (ctx, lt, t) => {   // the recap: three cards
  applyCam(ctx, camOf(t, 1.0, 1.0, lt, 3), 1); nightSky(ctx, t, '#f2b52a');
  const cards = [[AT('purrs with a tiny engine'), 270, 'PURR ENGINE', '#e0392f'], [AT('lands on her feet by'), 730, 'TWIST & LAND', '#2f63c9'], [AT('makes biscuits because'), 1190, 'MAKING BISCUITS', '#3fa35b'], [AT('loves boxes because'), 1650, 'SAFE BOX', '#7a4bc4']];
  if (lt < 1.2) stamp(ctx, 'NOW WE KNOW!', CX, CY, 130, lt, '#fff', -.03);
  for (const [at, x, name, col] of cards) { const k = kf(t, [[at - .05, 0], [at + .25, 1, backOut]]); if (k <= 0) continue;
    ctx.save(); ctx.translate(x, 500); ctx.scale(k * .8, k * .8); ctx.rotate((x - CX) * .00005); rrect(ctx, -250, -330, 500, 660, 40); fillStroke(ctx, '#fff7e6', 10);
    if (name === 'PURR ENGINE') { drawCat(ctx, { x: 0, y: 160, s: 300, coat: BISCUIT, mood: 'happy', purr: 1, shadow: false }, t); purrRings(ctx, 10, -70, 300, t, .8, '#f2b52a'); }
    if (name === 'TWIST & LAND') rotCat(ctx, 0, 40, 260, Math.sin(t * 2) * .6, { coat: BISCUIT, mood: 'happy' }, t);
    if (name === 'MAKING BISCUITS') { blanket(ctx, 0, 160, 360, 70, Math.sin(t * 6)); drawCat(ctx, { x: 0, y: 160, s: 280, coat: BISCUIT, mood: 'happy', knead: true, shadow: false }, t); }
    if (name === 'SAFE BOX') catInBox(ctx, 0, 170, 280, 200, 280, { coat: BISCUIT, mood: 'happy', shadow: false }, t);
    text(ctx, name, 0, 270, 46, col, null, 0); ctx.restore(); }
});
shot(AT('Which animal should we'), 'whip', (ctx, lt, t) => {   // which animal is next?
  applyCam(ctx, camOf(t, 1.0, 1.0, lt, 3), 1); room(ctx, t);
  drawStick(ctx, C(PIP, { x: 820, y: 860, s: 560, arms: { L: [.3, -.1], R: { ik: [.1, -.75] } }, face: pipFace(t, { eyes: 'normal', look: [.4, -.6] }) }));
  drawCat(ctx, { x: 1180, y: 860, s: 330, coat: BISCUIT, mood: 'normal', look: [-1, -.3] }, t);
  for (const [i, name, at, col] of [[0, 'A DOG?', AT('A dog'), '#f2b52a'], [1, 'A BEE?', AT('A bee'), '#3fa35b'], [2, 'AN OWL?', AT('An owl'), '#7a4bc4']]) bubbleText(ctx, name, 560 + i * 400, 230 + Math.sin(t * 3 + i) * 10, (t - at) / .3, col, '#fff', 62);
});
shot(AT('Bye for now'), 'cut', (ctx, lt, t) => {   // bye!
  applyCam(ctx, camOf(t, 1.0, 1.05, lt, 3), 1); room(ctx, t); sofa(ctx, 1080, 790);
  drawStick(ctx, C(PIP, { x: 900, y: 770, s: 580, legs: { L: [1.45, -1.5], R: [1.45, -1.5] }, arms: { L: [.3, -.1], R: [2.6 + Math.sin(t * 9) * .3, .3] }, face: pipFace(t, { eyes: 'happy' }) }));
  drawCat(ctx, { x: 1260, y: 620, s: 300, coat: BISCUIT, mood: t > AT('Bye Biscuit') ? 'happy' : 'normal', look: [-1, 0], tail: t * 2, blush: true }, t);
  if (t > AT('Bye Biscuit')) hearts(ctx, 1260, 260, t, 3, 1);
});

// ---------- props for the new scenes ----------
function boxBack(ctx, x, y, w, h) { path(ctx, [[x - w / 2, y - h], [x - w / 2 + w * .08, y - h - h * .28], [x + w / 2 - w * .08, y - h - h * .28], [x + w / 2, y - h]]); fillStroke(ctx, '#b97c43', 7); }
function boxFront(ctx, x, y, w, h) {
  path(ctx, [[x - w / 2, y - h], [x - w / 2 - w * .16, y - h - h * .2], [x - w / 2 - w * .1, y - h + h * .12]]); fillStroke(ctx, '#d9a066', 7);
  path(ctx, [[x + w / 2, y - h], [x + w / 2 + w * .16, y - h - h * .2], [x + w / 2 + w * .1, y - h + h * .12]]); fillStroke(ctx, '#d9a066', 7);
  rrect(ctx, x - w / 2, y - h, w, h, 8); fillStroke(ctx, '#d9a066', 8);
  ctx.fillStyle = 'rgba(255,240,200,.45)'; ctx.fillRect(x - w * .09, y - h + 6, w * .18, h - 12);
  line(ctx, x - w * .3, y - h * .45, x - w * .12, y - h * .45, 5, 'rgba(120,70,30,.5)'); line(ctx, x + w * .12, y - h * .6, x + w * .32, y - h * .6, 5, 'rgba(120,70,30,.5)');
}
function catInBox(ctx, x, y, w, h, s, o, t, show = .55) {   // show: how much of the cat sits above the box rim (fraction of s)
  boxBack(ctx, x, y, w, h); drawCat(ctx, Object.assign({ x, y: y - h + s * show, s, shadow: false }, o), t); boxFront(ctx, x, y, w, h);
}
function tapeSquare(ctx, x, y, w = 520, d = 90, col = '#ffd23a') { path(ctx, [[x - w / 2, y], [x + w / 2, y], [x + w / 2 - 60, y - d], [x - w / 2 + 60, y - d]]); ctx.lineJoin = 'round'; ctx.lineWidth = 30; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 20; ctx.strokeStyle = col; ctx.stroke(); }
function toyCar(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rrect(ctx, -90, -60, 180, 60, 18); fillStroke(ctx, '#e0392f', 6); rrect(ctx, -50, -100, 100, 46, 14); fillStroke(ctx, '#e0392f', 6); rrect(ctx, -38, -92, 34, 30, 6); fillStroke(ctx, '#bfe6f8', 4); rrect(ctx, 4, -92, 34, 30, 6); fillStroke(ctx, '#bfe6f8', 4); for (const wx of [-50, 50]) { circle(ctx, wx, 0, 24); fillStroke(ctx, '#2a2026', 5); circle(ctx, wx, 0, 9); ctx.fillStyle = '#ccc'; ctx.fill(); } ctx.restore(); }
function oldCamera(ctx, x, y) { line(ctx, x, y, x - 70, y + 260, 10, '#6b3d1e'); line(ctx, x, y, x + 70, y + 260, 10, '#6b3d1e'); line(ctx, x, y, x, y + 270, 10, '#6b3d1e');
  rrect(ctx, x - 110, y - 120, 220, 140, 14); fillStroke(ctx, '#7a4a26', 8); rrect(ctx, x + 100, y - 85, 70, 70, 10); fillStroke(ctx, '#3a3036', 7); circle(ctx, x + 175, y - 50, 30); fillStroke(ctx, '#9aa3ad', 6); circle(ctx, x - 40, y - 150, 34); fillStroke(ctx, '#3a3036', 6); circle(ctx, x + 40, y - 150, 34); fillStroke(ctx, '#3a3036', 6); }
function guessShot(phrase, a, aAt, b, bAt, bg = '#ff9f43') {   // Pip asks, two choices pop, a 3-2-1 countdown while kids answer
  shot(AT(phrase), 'whip', (ctx, lt, t) => {
    applyCam(ctx, camOf(t, 1.0, 1.04, lt, 6), 1); nightSky(ctx, t, bg);
    const end = LINE_END(phrase), wait = t - end;
    drawStick(ctx, C(PIP, { x: 330, y: 930, s: 520, arms: { L: [.3, -.1], R: { ik: [.08, -.72] } }, face: pipFace(t, { eyes: wait > 0 ? 'happy' : 'normal', look: [.6, -.3] }) }));
    drawCat(ctx, { x: 1640, y: 930, s: 330, coat: BISCUIT, mood: 'normal', look: [-1, -.3], headTilt: Math.sin(t * 2) * .18 }, t);
    stamp(ctx, 'GUESS FIRST!', CX, 150, 110, lt, '#fff', -.03);
    const ka = clamp((t - aAt) / .3), kb = clamp((t - bAt) / .3);
    bubbleText(ctx, a, CX, 350, ka, '#fff7e6', '#2a2026', 62); bubbleText(ctx, b, CX, 560, kb, '#fff7e6', '#2a2026', 62);
    if (kb > 0) text(ctx, 'OR', CX, 458, 50, '#fff', INK, 9);
    if (wait > 0 && wait < 3.2) { const n = 3 - Math.floor(wait), f = wait % 1, k = backOut(clamp(f / .25));
      ctx.save(); ctx.translate(CX, 770); ctx.scale(k * .9, k * .9); circle(ctx, 0, 0, 105); fillStroke(ctx, '#fff7e6', 10);
      ctx.beginPath(); ctx.arc(0, 0, 105, -Math.PI / 2, -Math.PI / 2 + TAU * f); ctx.lineWidth = 14; ctx.strokeStyle = '#e0392f'; ctx.stroke();
      text(ctx, String(Math.max(1, n)), 0, 8, 120, '#2a2026', null, 0); ctx.restore(); }
    else if (wait <= 0 && kb > 0) text(ctx, '?', CX, 790 + Math.sin(t * 5) * 12, 170, '#ffe14d', INK, 16);
  });
}

// ===== new beats in the first three mysteries =====
shot(AT('Can I purr too'), 'whip', (ctx, lt, t) => {   // Pip tries to purr: a toy car
  applyCam(ctx, camOf(t, 1.05, 1.12, lt, 4), 1); room(ctx, t, { shelf: false });
  const tried = t > AT('I tried'), car = t > AT('toy car');
  drawStick(ctx, C(PIP, { x: 720 + (tried && !car ? Math.sin(t * 60) * 4 : 0), y: 900, s: 560, arms: { L: [.3, -.1], R: car ? [2.2, .2] : [.3, -.1] }, face: pipFace(t, { eyes: car ? 'happy' : tried ? 'squint' : 'normal', mouth: tried && !car ? 'o' : undefined }) }));
  drawCat(ctx, { x: 1300, y: 900, s: 360, coat: BISCUIT, mood: car ? 'normal' : 'happy', look: [-1, 0], purr: car ? 0 : .8, headTilt: car ? .25 : 0 }, t);
  if (tried && !car) text(ctx, 'BRRRRR!', 720, 260, 90, '#fff', INK, 12);
  if (car) { const k = backOut(clamp((t - AT('toy car')) / .3)); ctx.save(); ctx.translate(980, 380); ctx.scale(k, k); toyCar(ctx, 0, 0, 1.4); ctx.restore(); text(ctx, 'VROOM?', 980, 180, 70, '#e0392f', INK, 11); }
});
guessShot('Quick guess first', 'YES', AT('Yes or no'), 'NO', AT('Yes or no', 2));
guessShot('Guess first When she turns', 'ALL AT ONCE', AT('all at once'), 'HALF AT A TIME', AT('one half at a time'), '#5d8fd8');
shot(AT('More than a hundred years ago'), 'whip', (ctx, lt, t) => {   // 1894: the first fast camera pictures of a falling cat
  applyCam(ctx, camOf(t, 1.0, 1.06, lt, 8), 1); ctx.fillStyle = '#efdcb4'; ctx.fillRect(-800, -800, W + 1600, H + 1600);
  for (let i = 0; i < 70; i++) { const R = rng(i + 31); circle(ctx, R() * W, R() * H, 2 + R() * 3); ctx.fillStyle = 'rgba(120,80,40,.15)'; ctx.fill(); }
  oldCamera(ctx, 260, 560); stamp(ctx, '1894', 260, 190, 110, lt, '#7a4a26', -.05);
  const n = 5, k0 = AT('special fast camera');
  rrect(ctx, 520, 340, 1340, 300, 10); fillStroke(ctx, '#2a2026', 6);
  for (let i = 0; i < 26; i++) { rrect(ctx, 540 + i * 51, 352, 26, 20, 4); ctx.fillStyle = '#efdcb4'; ctx.fill(); rrect(ctx, 540 + i * 51, 608, 26, 20, 4); ctx.fill(); }
  for (let i = 0; i < n; i++) { const at = k0 + i * .45 + (t > AT('For the first time') ? -10 : 0), k = clamp((t - at) / .25), x = 640 + i * 262;
    rrect(ctx, x - 115, 385, 230, 210, 8); fillStroke(ctx, k > 0 ? '#f5ead2' : '#4a3d45', 5);
    if (k > 0) { ctx.save(); ctx.globalAlpha = k; rotCat(ctx, x, 490, 150, lerp(Math.PI, 0, i / (n - 1)), { coat: BISCUIT, mood: i === n - 1 ? 'happy' : 'wide' }, t); ctx.restore(); } }
  if (t > AT('one picture at a time')) for (let i = 0; i < n; i++) text(ctx, String(i + 1), 640 + i * 262, 720, 64, '#7a4a26', '#fff', 8);
});
shot(AT('Some cats even close'), 'whip', (ctx, lt, t) => {   // eyes closed, purring, a little drool
  applyCam(ctx, camOf(t, 1.1, 1.25, lt, 6), 1); room(ctx, t, { shelf: false });
  blanket(ctx, CX, 900, 900, 150, Math.sin(t * 6));
  drawCat(ctx, { x: CX, y: 900, s: 600, coat: BISCUIT, mood: 'happy', purr: t > AT('eyes purr') ? 1 : 0, knead: true, blush: true }, t);
  if (t > AT('eyes purr')) purrRings(ctx, CX + 30, 480, 600, t, .7);
  if (t > AT('or drool')) { const f = (t * .7) % 1; ellipse(ctx, CX + 18, 610 + f * 50, 12, 16 + f * 8); fillStroke(ctx, '#bfe6f8', 4); }
  bubbleText(ctx, 'EYES CLOSED', 470, 330, (t - AT('close their eyes')) / .3, '#fff7e6', '#2a2026', 50);
  bubbleText(ctx, 'PURR', 1450, 330, (t - AT('eyes purr', 1)) / .3, '#fff7e6', '#2a2026', 50);
  bubbleText(ctx, 'A LITTLE DROOL', 1450, 470, (t - AT('or drool')) / .3, '#7fd3e0', '#2a2026', 50);
  if (t > AT('one happy cat')) stamp(ctx, 'ONE HAPPY CAT!', CX, 150, 100, t - AT('one happy cat'), '#f2b52a', -.03);
});
guessShot('Guess first Did it start', 'AS KITTENS', AT('when they were tiny'), 'AS GROWN-UPS', AT('all grown up'), '#3fa35b');

// ===== MYSTERY 4: THE BOX =====
shot(AT('Mystery number four'), 'whip', (ctx, lt, t) => card(ctx, t, lt, 'MYSTERY #4', 'THE BOX', '#7a4bc4'));
shot(AT('Yesterday a big box'), 'whip', (ctx, lt, t) => {   // the delivery box; Biscuit jumps in first
  applyCam(ctx, camOf(t, 1.0, 1.06, lt, 6), 1); room(ctx, t);
  const bx = lerp(2300, 1250, ease(clamp(lt / .8))), j = AT('jumped in'), ph = clamp((t - j) / .7);
  drawStick(ctx, C(PIP, { x: 820, y: 900, s: 540, arms: ph > 0 ? POSE.handsUp.arms : { L: [.3, -.1], R: [1.6, .1] }, face: pipFace(t, { eyes: ph > 0 ? 'wide' : 'happy', look: [1, 0] }) }));
  if (ph <= 0) { boxBack(ctx, bx, 900, 420, 280); boxFront(ctx, bx, 900, 420, 280); drawCat(ctx, { x: 460, y: 900, s: 300, coat: BISCUIT, mood: 'normal', look: [1, 0] }, t); }
  else if (ph < 1) { boxBack(ctx, bx, 900, 420, 280); rotCat(ctx, lerp(460, bx, ph), lerp(760, 620, ph) - Math.sin(ph * Math.PI) * 330, 300, ph * .6 - .3, { coat: BISCUIT, mood: 'wide' }, t); boxFront(ctx, bx, 900, 420, 280); }
  else catInBox(ctx, bx, 900, 420, 280, 300, { coat: BISCUIT, mood: 'happy', look: [-1, 0] }, t, .62);
  if (ph >= 1 && t < j + 1.6) stamp(ctx, 'BOING!', bx, 330, 100, t - j - .7, '#f2b52a', .05);
  if (t > AT('before I even opened')) text(ctx, '?!', 820, 250, 110, '#e0392f', INK, 12);
});
shot(AT('Biscuit Even when a box'), 'whip', (ctx, lt, t) => {   // a box that is far too small
  applyCam(ctx, camOf(t, 1.05, 1.15, lt, 4), 1); room(ctx, t, { shelf: false });
  const sq = t > AT('squeezes right in');
  catInBox(ctx, CX, 920, 230, 130, 440, { coat: BISCUIT, mood: sq ? 'happy' : 'normal', blush: true, fluff: true }, t, .25);
  if (t > AT('way too small')) { line(ctx, CX - 115, 1000, CX + 115, 1000, 6, '#fff'); text(ctx, 'TOO SMALL?', CX + 470, 760, 64, '#fff', INK, 10); }
  if (sq) stamp(ctx, 'IF I FITS, I SITS!', CX, 160, 100, t - AT('squeezes right in'), '#f2b52a', -.03);
});
guessShot('Guess first Do cats like boxes', 'BORED', AT("because they're bored"), 'SAFE', AT('make them feel safe'), '#7a4bc4');
shot(AT('Boxes make them feel safe Inside'), 'whip', (ctx, lt, t) => {   // nobody can sneak up behind you
  applyCam(ctx, camOf(t, 1.05, 1.12, lt, 5), 1); room(ctx, t, { shelf: false });
  catInBox(ctx, 760, 920, 520, 330, 460, { coat: BISCUIT, mood: 'happy', look: [Math.sin(t * 1.5), 0] }, t, .5);
  stamp(ctx, 'SAFE!', 760, 200, 120, t - AT('Boxes make them feel safe Inside'), '#3fa35b', -.04);
  if (t > AT('sneak up behind')) { const k = clamp((t - AT('sneak up behind')) / .3); ctx.save(); ctx.globalAlpha = k;
    rrect(ctx, 1230, 380, 520, 300, 30); fillStroke(ctx, '#fff7e6', 8); text(ctx, 'WALLS ALL AROUND', 1490, 470, 46, '#2a2026', null, 0);
    for (const [dx, a] of [[-120, 0], [0, 0], [120, 0]]) { line(ctx, 1490 + dx, 520, 1490 + dx, 620, 14, '#d9a066'); } text(ctx, 'NO SNEAKING!', 1490, 650, 44, '#e0392f', null, 0); ctx.restore(); }
});
shot(AT('Wild cats hide'), 'whip', (ctx, lt, t) => {   // a wild cat in a rocky den
  applyCam(ctx, camOf(t, 1.0, 1.06, lt, 5), 1); savanna(ctx, t);
  ctx.beginPath(); ctx.ellipse(1100, 860, 460, 330, 0, Math.PI, 0); ctx.closePath(); fillStroke(ctx, '#9a8f86', 9);
  ctx.beginPath(); ctx.ellipse(1100, 860, 230, 200, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#3a3036'; ctx.fill();
  drawCat(ctx, { x: 1100, y: 880, s: 300, coat: CHEETAH, mood: t > AT('so they can rest') && t < AT('keep watch') ? 'sleepy' : 'normal', look: [Math.sin(t * 1.3), 0] }, t);
  bubbleText(ctx, 'REST', 560, 330, (t - AT('so they can rest', 3)) / .3, '#fff7e6', '#2a2026', 60);
  bubbleText(ctx, 'KEEP WATCH', 1600, 300, (t - AT('keep watch')) / .3, '#fff7e6', '#2a2026', 60);
});
shot(AT('Scientists tested this'), 'whip', (ctx, lt, t) => {   // the shelter study: box vs no box
  applyCam(ctx, camOf(t, 1.0, 1.04, lt, 6), 1); nightSky(ctx, t, '#5d8fd8');
  const calm = t > AT('calmed down faster');
  for (const [x, hasBox] of [[540, true], [1380, false]]) {
    rrect(ctx, x - 330, 300, 660, 640, 30); fillStroke(ctx, '#fff7e6', 9);
    if (hasBox) catInBox(ctx, x, 880, 360, 230, 300, { coat: KIT2, mood: calm ? 'happy' : 'normal' }, t, .6);
    else drawCat(ctx, { x, y: 880, s: 300, coat: KIT1, mood: 'scared', fluff: true, mouth: 'frown' }, t);
    for (let i = 0; i < 7; i++) line(ctx, x - 300 + i * 100, 310, x - 300 + i * 100, 930, 6, 'rgba(42,32,38,.25)');
    text(ctx, hasBox ? 'WITH A BOX' : 'NO BOX', x, 250, 56, '#fff', INK, 10);
  }
  if (calm) { bubbleText(ctx, 'CALM FASTER', 540, 400, (t - AT('calmed down faster')) / .3, '#3fa35b', '#fff', 54); bubbleText(ctx, 'STILL WORRIED', 1380, 400, (t - AT('calmed down faster') - .3) / .3, '#e0392f', '#fff', 54); }
});
shot(AT('Boxes are warm too'), 'whip', (ctx, lt, t) => {   // cardboard keeps heat in
  applyCam(ctx, camOf(t, 1.05, 1.12, lt, 6), 1); room(ctx, t, { shelf: false });
  catInBox(ctx, 760, 920, 460, 280, 400, { coat: BISCUIT, mood: 'sleepy', blush: true }, t, .5);
  if (t > AT('keeps the heat in')) for (let i = 0; i < 4; i++) { const f = (t * .5 + i / 4) % 1; ctx.save(); ctx.globalAlpha = 1 - f; ctx.beginPath(); const x0 = 620 + i * 90, y0 = 560 - f * 220; ctx.moveTo(x0, y0); ctx.bezierCurveTo(x0 + 25, y0 - 30, x0 - 25, y0 - 60, x0, y0 - 90); ctx.lineWidth = 10; ctx.strokeStyle = '#ff9f43'; ctx.stroke(); ctx.restore(); }
  const th = clamp((t - AT('keeps the heat in')) / 1.5);
  rrect(ctx, 1440, 260, 80, 520, 40); fillStroke(ctx, '#fff', 8); circle(ctx, 1480, 800, 75); fillStroke(ctx, '#e0392f', 8);
  rrect(ctx, 1458, lerp(700, 330, th), 44, lerp(80, 450, th), 22); ctx.fillStyle = '#e0392f'; ctx.fill();
  if (t > AT('warmer than we do')) stamp(ctx, 'TOASTY!', 1180, 200, 110, t - AT('warmer than we do'), '#ff9f43', -.04);
});
shot(AT("And here's the funniest part"), 'whip', (ctx, lt, t) => {   // a tape square on the floor
  applyCam(ctx, camOf(t, 1.0, 1.05, lt, 6), 1); room(ctx, t, { shelf: false });
  const tp = clamp((t - AT('square made of tape')) / .6);
  if (tp > 0) { ctx.save(); ctx.globalAlpha = tp; tapeSquare(ctx, CX, 930); ctx.restore(); }
  const w0 = AT('on the floor'), wk = clamp((t - w0) / 1.6);
  drawCat(ctx, { x: lerp(1700, CX, ease(wk)), y: 890 - (wk > 0 && wk < 1 ? Math.abs(Math.sin(t * 10)) * 10 : 0), s: 330, coat: BISCUIT, mood: wk >= 1 ? 'happy' : 'normal', look: [wk < 1 ? -1 : 0, 0] }, t);
  stamp(ctx, 'FUNNIEST PART', CX, 160, 96, t - AT('funniest part'), '#f2b52a', -.03);
  if (wk >= 1) text(ctx, 'NO BOX?!', CX, 330, 90, '#fff', INK, 12);
});
shot(AT('Scientists asked cat owners'), 'whip', (ctx, lt, t) => {   // the home experiment: some cats sit in the square
  applyCam(ctx, camOf(t, 1.0, 1.03, lt, 6), 1); room(ctx, t, { shelf: false });
  const sat = AT('walked right into');
  [[380, KIT1, true], [960, KIT3, false], [1540, KIT2, true]].forEach(([x, coat, sits], i) => {
    ctx.save(); ctx.translate(x, 900); ctx.scale(.6, .6); ctx.translate(-x, -900); tapeSquare(ctx, x, 940); ctx.restore();
    const k = clamp((t - sat - i * .35) / .5);
    if (sits) { drawCat(ctx, { x: lerp(x + 260, x, ease(k)), y: 900, s: 240, coat, mood: k >= 1 ? 'happy' : 'normal' }, t); if (k >= 1) text(ctx, '✓', x, 520, 110, '#3fa35b', INK, 12); }
    else drawCat(ctx, { x: x + 200, y: 900, s: 240, coat, mood: 'sleepy', look: [1, 0], flip: -1 }, t);
  });
  if (t > AT('try this at home')) bubbleText(ctx, 'TRY IT AT HOME', CX, 220, (t - AT('try this at home')) / .3, '#fff7e6', '#2a2026', 60);
});
shot(AT("There's no box at all"), 'whip', (ctx, lt, t) => {   // just a square, and that's enough
  applyCam(ctx, camOf(t, 1.05, 1.1, lt, 4), 1); room(ctx, t, { shelf: false });
  tapeSquare(ctx, 1150, 930); drawCat(ctx, { x: 1150, y: 890, s: 330, coat: BISCUIT, mood: 'happy', blush: true }, t);
  const en = t > AT("that's enough");
  drawStick(ctx, C(PIP, { x: 520, y: 900, s: 540, arms: en ? POSE.handsUp.arms : POSE.hips.arms, face: pipFace(t, { eyes: en ? 'happy' : 'normal' }) }));
  bubbleText(ctx, 'JUST A SQUARE', 1150, 330, (t - AT('Just a square')) / .3, '#2f9be0', '#fff', 60);
  if (en) stamp(ctx, 'ENOUGH!', 1150, 170, 110, t - AT("that's enough"), '#3fa35b', -.04);
});
shot(AT('So if your cat sits in a box'), 'whip', (ctx, lt, t) => {   // a safe, warm hideout
  applyCam(ctx, camOf(t, 1.05, 1.15, lt, 5), 1); room(ctx, t); sofa(ctx, 1080, 790);
  catInBox(ctx, 1080, 780, 420, 260, 360, { coat: BISCUIT, mood: 'sleepy', purr: .6, blush: true }, t, .55);
  hearts(ctx, 1080, 260, t, 3, clamp((t - AT('not being silly')) / .4));
  if (t > AT('safe warm hideout')) stamp(ctx, 'SAFE, WARM HIDEOUT', 1080, 150, 92, t - AT('safe warm hideout'), '#7a4bc4', -.03);
});
SHOTS.sort((a, b) => a.start - b.start);
for (let i = 0; i < SHOTS.length; i++) SHOTS[i].end = i + 1 < SHOTS.length ? SHOTS[i + 1].start : (WORDS.length ? WORDS[WORDS.length - 1].e + 1.6 : 60);
