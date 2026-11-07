// ---------- characters ----------
const YOU = { cols: PAL.red, hat: 'bandana', hatCol: '#d8312b', dotCol: '#fff' };
const PATCH = { cols: PAL.yellow, hat: 'bandana', hatCol: '#6c43c0', dotCol: '#fff' };
const SAILOR = { cols: PAL.blue, hat: 'sailor', belt: false };
const C = (base, extra) => Object.assign({}, base, extra);
const walkLegs = (t, sp = 9, amp = .55) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const walkArms = (t, sp = 9, amp = .6) => ({ L: [.3 - Math.sin(t * sp) * amp, -.3], R: [.3 + Math.sin(t * sp) * amp, -.3] });
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);

// ---------- "Why do cats purr?" : a kids' explainer ----------
// Shot times come from the narration's own word timings, so the picture follows the voice.
const LW = (l, w = 0) => { const ws = WORDS.filter(x => x.line === l); return ws.length ? (ws[Math.min(w, ws.length - 1)].s) : 0; };
const KID = { cols: PAL.red, hat: 'none', belt: false };
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
  for (const x of [-.08, .16]) { ellipse(ctx, x, -.03, .085, .05); fill(C_.fur); }
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
// ---------- places ----------
function livingRoom(ctx, t) {
  ctx.fillStyle = '#f7dca8'; ctx.fillRect(-600, -600, 2300, 3200);
  for (let x = -600; x < 1700; x += 120) { ctx.fillStyle = 'rgba(230,180,110,.35)'; ctx.fillRect(x, -600, 50, 1900); }
  // window
  rrect(ctx, 600, 230, 380, 430, 18); fillStroke(ctx, '#bfe6f8', 10); drawCloud(ctx, 760 + Math.sin(t * .2) * 30, 360, 60, 2); line(ctx, 790, 230, 790, 660, 10, INK); line(ctx, 600, 445, 980, 445, 10, INK);
  ctx.fillStyle = '#e0503a'; ctx.beginPath(); ctx.moveTo(570, 200); ctx.quadraticCurveTo(630, 450, 580, 700); ctx.lineTo(540, 700); ctx.lineTo(540, 200); ctx.closePath(); fillStroke(ctx, '#e0503a', 7);
  ctx.beginPath(); ctx.moveTo(1010, 200); ctx.quadraticCurveTo(950, 450, 1000, 700); ctx.lineTo(1040, 700); ctx.lineTo(1040, 200); ctx.closePath(); fillStroke(ctx, '#e0503a', 7);
  // frame with a fish (a cat's favourite art)
  rrect(ctx, 120, 300, 250, 190, 10); fillStroke(ctx, '#fff7e6', 9); ellipse(ctx, 240, 395, 60, 34); fillStroke(ctx, '#5bb8e8', 6); path(ctx, [[300, 395], [340, 365], [340, 425]]); fillStroke(ctx, '#5bb8e8', 6);
  // floor + rug
  ctx.fillStyle = '#c98a52'; ctx.fillRect(-600, 1180, 2300, 1400); for (let y = 1180; y < 2600; y += 110) line(ctx, -600, y, 1700, y, 4, '#a96e3a');
  ellipse(ctx, 540, 1330, 520, 110); fillStroke(ctx, '#5d8fd8', 8); ellipse(ctx, 540, 1330, 420, 80); ctx.strokeStyle = '#fff3cc'; ctx.lineWidth = 6; ctx.stroke();
}
function sofa(ctx, x, y, w = 760) {
  rrect(ctx, x - w / 2, y - 380, w, 260, 50); fillStroke(ctx, '#e8743c', 8);
  rrect(ctx, x - w / 2 + 40, y - 180, w - 80, 150, 30); fillStroke(ctx, '#f08a4e', 8);
  rrect(ctx, x - w / 2 - 40, y - 280, 110, 270, 40); fillStroke(ctx, '#d9622a', 8); rrect(ctx, x + w / 2 - 70, y - 280, 110, 270, 40); fillStroke(ctx, '#d9622a', 8);
  for (const dx of [-w / 2 + 30, w / 2 - 60]) { rrect(ctx, x + dx, y - 20, 30, 50, 6); fillStroke(ctx, '#6b3d1e', 6); }
}
function savanna(ctx, t) {
  const g = ctx.createLinearGradient(0, -400, 0, 1100); g.addColorStop(0, '#f9b04a'); g.addColorStop(1, '#ffe6a8'); ctx.fillStyle = g; ctx.fillRect(-600, -600, 2300, 1800);
  drawSun(ctx, 780, 420, 150, t, 1);
  ctx.fillStyle = '#d6a543'; ctx.beginPath(); ctx.moveTo(-600, 1000); for (let x = -600; x <= 1700; x += 100) ctx.lineTo(x, 980 + Math.sin(x * .01) * 20); ctx.lineTo(1700, 2600); ctx.lineTo(-600, 2600); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8bd5a'; ctx.fillRect(-600, 1150, 2300, 1500);
  // acacia
  line(ctx, 170, 1000, 190, 700, 26, '#5a3a22'); ellipse(ctx, 200, 660, 230, 60); fillStroke(ctx, '#5f8f3a', 7);
  for (let i = 0; i < 40; i++) { const R = rng(i + 4), x = R() * 1080, y = 1180 + R() * 700; for (const d of [-8, 0, 8]) line(ctx, x + d, y, x + d * 1.8, y - 24 - Math.abs(d), 4, '#b8892e'); }   // grass tufts
}
function voiceBox(ctx, cx, cy, r, t, wob, pads = 0) {   // a magnified window into the throat
  ctx.save(); circle(ctx, cx, cy, r); ctx.fillStyle = '#ffd9d9'; ctx.fill(); ctx.clip();
  ctx.fillStyle = '#f6b3b8'; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); ctx.fillStyle = '#7a1f2a'; ellipse(ctx, cx, cy, r * .5, r * .82); ctx.fill();
  const g = Math.sin(t * 25 * TAU / 4) * wob;   // shown slowed down so the eye can follow it
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + sx * r * .55, cy - r * .8); ctx.quadraticCurveTo(cx + sx * r * (.08 + .12 * (1 + g)), cy, cx + sx * r * .55, cy + r * .8); ctx.lineTo(cx + sx * r, cy + r); ctx.lineTo(cx + sx * r, cy - r); ctx.closePath(); fillStroke(ctx, '#ef8f9a', 7);
    if (pads > 0) { circle(ctx, cx + sx * r * (.16 + .12 * (1 + g)), cy, r * .09 * pads); fillStroke(ctx, '#ffe14d', 6); } }
  ctx.restore(); circle(ctx, cx, cy, r); ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.stroke();
}

const SHOTS = [];
const shot = (start, tr, draw) => SHOTS.push({ start, tr, draw });
const camOf = (t, z0, z1, lt, dur) => { const hh = handheld(t, 3); return { x: 540 + hh[0], y: 960 + hh[1], z: lerp(z0, z1, clamp(lt / dur)), r: 0 }; };

// A — the question: a kid strokes a purring cat on the sofa
shot(0, 'whip', (ctx, lt, t) => {
  const cam = camOf(t, 1.0, 1.08, lt, 3); applyCam(ctx, cam, 1); livingRoom(ctx, t); sofa(ctx, 540, 1180);
  const stroke = Math.sin(t * 3) * .15;
  drawStick(ctx, C(KID, { x: 330, y: 1150, s: 520, legs: { L: [1.45, -1.5], R: [1.45, -1.5] }, arms: { L: [.3, -.1], R: { ik: [.36 + stroke * .2, -.5] } }, face: { eyes: 'happy', mouth: 'smile' } }));
  drawCat(ctx, { x: 640, y: 1000, s: 360, mood: 'happy', purr: 1, blush: true }, t); purrRings(ctx, 660, 760, 360, t, .8);
  stamp(ctx, 'WHY DO CATS PURR?', 540, 330, 92, lt - .2, '#ffe14d', -.03);
});
// B — happy purrs
shot(LW(1), 'whip', (ctx, lt, t) => {
  const cam = camOf(t, 1.15, 1.25, lt, 4); applyCam(ctx, cam, 1); livingRoom(ctx, t);
  drawCat(ctx, { x: 540, y: 1150, s: 620, mood: 'happy', purr: 1, blush: true, headTilt: Math.sin(t * 1.5) * .06 }, t);
  purrRings(ctx, 570, 750, 620, t, 1); hearts(ctx, 560, 600, t, 3, clamp((lt - .6) / .3));
});
// C — scared, sick, hurt: three cats pop in
shot(LW(2), 'whip', (ctx, lt, t) => {
  const cam = camOf(t, 1.0, 1.05, lt, 4); applyCam(ctx, cam, 1); livingRoom(ctx, t);
  const items = [[LW(2, 5), 230, 'scared'], [LW(2, 6), 540, 'sick'], [LW(2, 8), 850, 'hurt']];
  for (const [at, x, kind] of items) {
    const k = kf(t, [[at - .05, 0], [at + .2, 1, backOut]]); if (k <= 0) continue;
    ctx.save(); ctx.translate(x, 1100); ctx.scale(k, k); ctx.translate(-x, -1100);
    drawCat(ctx, { x, y: 1100, s: 300, coat: kind === 'sick' ? GREY : ORANGE, mood: kind === 'scared' ? 'scared' : kind === 'sick' ? 'sleepy' : 'normal', fluff: kind === 'scared', mouth: kind === 'scared' ? 'o' : 'frown', purr: .6 }, t);
    if (kind === 'sick') { line(ctx, x + 20, 900, x + 110, 860, 12, INK); line(ctx, x + 20, 900, x + 110, 860, 6, '#fff'); circle(ctx, x + 110, 860, 10); ctx.fillStyle = '#e0392f'; ctx.fill(); }
    if (kind === 'hurt') { rrect(ctx, x - 40, 1065, 70, 34, 10); fillStroke(ctx, '#fff7e6', 5); line(ctx, x - 5, 1066, x - 5, 1098, 3, '#e0392f'); line(ctx, x - 22, 1082, x + 12, 1082, 3, '#e0392f'); }
    text(ctx, kind.toUpperCase(), x, 1200, 52, '#fff', INK, 10); purrRings(ctx, x + 15, 870, 300, t, .5); ctx.restore();
  }
});
// D — so what IS a purr? a magnifying glass moves in
shot(LW(3), 'whip', (ctx, lt, t) => {
  const cam = camOf(t, 1.0, 1.2, lt, 2.5); applyCam(ctx, cam, 1); livingRoom(ctx, t);
  drawCat(ctx, { x: 540, y: 1180, s: 600, mood: 'normal', look: [0, -1], purr: .5 }, t);
  const k = clamp(lt / 1.2), lx = lerp(950, 600, ease(k)), ly = lerp(1150, 900, ease(k));
  circle(ctx, lx, ly, 130); ctx.fillStyle = 'rgba(200,235,255,.35)'; ctx.fill(); ctx.lineWidth = 24; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 12; ctx.strokeStyle = '#c9a14a'; ctx.stroke();
  line(ctx, lx + 92, ly + 92, lx + 210, ly + 210, 34, INK); line(ctx, lx + 92, ly + 92, lx + 210, ly + 210, 20, '#7a4527');
  text(ctx, '?', 330 + Math.sin(t * 3) * 10, 520, 170, '#ffe14d', INK, 16);
});
// E — inside: the voice box wobbles as the cat breathes in and out
shot(LW(4), 'whip', (ctx, lt, t) => {
  const cam = camOf(t, 1.0, 1.04, lt, 6); applyCam(ctx, cam, 1); ctx.fillStyle = '#2b3a67'; ctx.fillRect(-600, -600, 2300, 3200);
  drawCat(ctx, { x: 360, y: 1480, s: 700, mood: 'happy', purr: .4, shadow: false }, t);
  const show = kf(t, [[LW(4, 5), 0], [LW(4, 5) + .3, 1, backOut]]);
  if (show > 0) { line(ctx, 410, 1080, 700, 720, 8, '#fff'); circle(ctx, 410, 1080, 16); ctx.fillStyle = '#fff'; ctx.fill(); ctx.save(); ctx.translate(730, 560); ctx.scale(show, show); voiceBox(ctx, 0, 0, 210, t, t > LW(5, 8) ? 1 : 0); ctx.restore(); text(ctx, 'VOICE BOX', 730, 820, 54, '#ffe14d', INK, 10); }
  const breath = t > LW(5, 2) && t < LW(5, 8);
  if (breath) { const ph = Math.sin(t * 3); for (const sy of [-1, 1]) { const y = 560 + sy * 170 * (ph > 0 ? 1 : -1); text(ctx, ph > 0 ? '▲' : '▼', 990, 560 + sy * 120, 60, '#7fd3e0', INK, 8); } text(ctx, ph > 0 ? 'BREATHE IN' : 'BREATHE OUT', 540, 300, 64, '#7fd3e0', INK, 10); }
  const cnt = clamp((t - LW(5, 15)) / 1.2);
  if (cnt > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); rrect(ctx, 220, 230, 640, 150, 30); fillStroke(ctx, '#fff7e6', 8); text(ctx, `${Math.round(25 * cnt)} TIMES A SECOND`, 540, 310, 58, '#e0392f', null, 0); ctx.restore(); }
});
// F — that buzzing is the purr
shot(LW(6), 'cut', (ctx, lt, t) => {
  const sh = shake(t * 4, 10, 4), cam = { x: 540 + sh[0], y: 960 + sh[1], z: 1.1, r: 0 }; applyCam(ctx, cam, 1); livingRoom(ctx, t);
  drawCat(ctx, { x: 540, y: 1180, s: 640, mood: 'happy', purr: 2.5, blush: true }, t); purrRings(ctx, 570, 760, 640, t * 1.6, 1);
  stamp(ctx, 'PURRRR', 540, 400, 170, lt - .1, '#ffe14d', -.04);
});
// G — tiny soft pads in the voice box
shot(LW(7), 'whip', (ctx, lt, t) => {
  const cam = camOf(t, 1.0, 1.1, lt, 4); applyCam(ctx, cam, 1); ctx.fillStyle = '#2b3a67'; ctx.fillRect(-600, -600, 2300, 3200);
  for (let i = 0; i < 30; i++) { const R = rng(i + 7); star5(ctx, R() * 1080, R() * 1300, 4 + R() * 4, t * .3, 'rgba(255,255,255,.4)'); }
  const pads = kf(t, [[LW(7, 4) - .1, 0], [LW(7, 4) + .3, 1, backOut]]);
  voiceBox(ctx, 540, 720, 330, t, .8, pads);
  if (pads > 0) { text(ctx, 'TINY SOFT PADS', 540, 1130, 64, '#ffe14d', INK, 10); line(ctx, 380, 1080, 470, 800, 6, '#ffe14d'); line(ctx, 700, 1080, 610, 800, 6, '#ffe14d'); }
  drawStick(ctx, C(KID, { cols: PAL.purple, x: 900, y: 1220, s: 320, face: { eyes: 'wide', mouth: 'o', browUp: 1, look: [-.8, -.3] }, arms: { L: [.3, -.1], R: [2.4, .3] } }));
});
// H — a mother cat purrs to her kittens, and they purr back
shot(LW(8), 'whip', (ctx, lt, t) => {
  const cam = camOf(t, 1.05, 1.15, lt, 5); applyCam(ctx, cam, 1); livingRoom(ctx, t);
  ellipse(ctx, 540, 1200, 430, 90); fillStroke(ctx, '#c9a07a', 8); ellipse(ctx, 540, 1185, 380, 70); ctx.fillStyle = '#e8c8a0'; ctx.fill();   // a basket
  drawCat(ctx, { x: 400, y: 1180, s: 540, mood: 'happy', purr: 1, blush: true }, t); purrRings(ctx, 430, 790, 540, t, .9);
  const back = t > LW(8, 7);
  [[690, 1205, 0], [820, 1215, 1], [950, 1200, 2]].forEach(([x, y, i]) => {
    drawCat(ctx, { x, y, s: 170, coat: i === 1 ? GREY : ORANGE, mood: back ? 'happy' : 'normal', look: [-1, 0], purr: back ? 1 : 0, tail: t + i, headBob: Math.sin(t * 3 + i) * .01, lwScale: 1.4 }, t);
    if (back) purrRings(ctx, x + 10, y - 160, 200, t + i * .3, .8, '#fff3a0');
  });
  if (t > LW(8, 11)) hearts(ctx, 680, 820, t, 3, clamp((t - LW(8, 11)) / .4));
});
// I — big cats: the cheetah purrs; the lion and the tiger roar
shot(LW(9), 'whip', (ctx, lt, t) => {
  const cam = camOf(t, 1.0, 1.05, lt, 6); applyCam(ctx, cam, 1); savanna(ctx, t);
  const cheetahIn = kf(t, [[LW(9, 3) - .1, 0], [LW(9, 3) + .25, 1, backOut]]), lionIn = kf(t, [[LW(9, 7) - .1, 0], [LW(9, 7) + .25, 1, backOut]]), roar = t > LW(9, 11);
  if (cheetahIn > 0) { ctx.save(); ctx.translate(250, 1180); ctx.scale(cheetahIn, cheetahIn); ctx.translate(-250, -1180); drawCat(ctx, { x: 250, y: 1180, s: 360, coat: CHEETAH, mood: 'happy', purr: 1 }, t); purrRings(ctx, 270, 900, 360, t, .9); text(ctx, 'CHEETAH', 250, 1280, 54, '#fff', INK, 10); ctx.restore(); }
  if (lionIn > 0) {
    for (const [x, coat, name, ph] of [[620, LION, 'LION', 0], [900, TIGER, 'TIGER', .2]]) {
      ctx.save(); ctx.translate(x, 1180); ctx.scale(lionIn, lionIn); ctx.translate(-x, -1180);
      drawCat(ctx, { x, y: 1180, s: 330, coat, mood: roar ? 'normal' : 'normal', mouth: roar ? 'roar' : 'w', look: [0, -1], headBob: roar ? Math.sin(t * 20 + ph) * .01 : 0, flip: -1 }, t);
      text(ctx, name, x, 1280, 54, '#fff', INK, 10);
      if (roar) { ctx.save(); ctx.translate(x, 760); ctx.scale(.55 + .05 * Math.sin(t * 20), .55 + .05 * Math.sin(t * 20)); burst(ctx, 0, 0, 170, 11, '#ffd23a', 3 + ph * 10); text(ctx, 'ROAR!', 0, 0, 80, '#e0392f', INK, 12); ctx.restore(); }
      ctx.restore();
    }
    if (!roar) text(ctx, 'NO PURR', 760, 560, 70, '#e0392f', INK, 12);
  }
});
// J — a purring cat on your lap: a tiny buzzing engine inside
shot(LW(10), 'whip', (ctx, lt, t) => {
  const cam = camOf(t, 1.0, 1.15, lt, 5); applyCam(ctx, cam, 1); livingRoom(ctx, t); sofa(ctx, 540, 1180);
  drawStick(ctx, C(KID, { x: 470, y: 1160, s: 700, legs: { L: [1.45, -1.5], R: [1.45, -1.5] }, arms: { L: { ik: [.12, -.38] }, R: { ik: [.3, -.36] } }, face: { eyes: 'happy', mouth: 'grin', look: [.6, .3] } }));
  drawCat(ctx, { x: 640, y: 980, s: 230, mood: 'happy', purr: 1.5, blush: true }, t);
  const eng = kf(t, [[LW(10, 14) - .1, 0], [LW(10, 14) + .3, 1, backOut]]);
  if (eng > 0) { ctx.save(); ctx.translate(652, 845); ctx.scale(eng, eng); circle(ctx, 0, 0, 70); fillStroke(ctx, '#fff7e6', 7); ctx.rotate(t * 8);
    for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i / 8 * TAU); rrect(ctx, -10, -58, 20, 18, 4); fillStroke(ctx, '#9aa3ad', 4); ctx.restore(); } circle(ctx, 0, 0, 40); fillStroke(ctx, '#9aa3ad', 6); circle(ctx, 0, 0, 12); fillStroke(ctx, '#55505a', 4); ctx.restore(); }
  purrRings(ctx, 655, 850, 330, t, .7);
});
// K — sign-off: what animal should we find out about next?
shot(LW(11), 'cut', (ctx, lt, t) => {
  const cam = camOf(t, 1.05, 1.0, lt, 3); applyCam(ctx, cam, 1); livingRoom(ctx, t);
  drawStick(ctx, C(KID, { x: 330, y: 1200, s: 560, arms: { L: [.3, -.1], R: [2.6 + Math.sin(t * 8) * .25, .3] }, face: { eyes: 'happy', mouth: 'grin' } }));
  drawCat(ctx, { x: 760, y: 1200, s: 340, mood: 'normal', look: [-1, 0], purr: .5 }, t);
  const q = kf(lt, [[.6, 0], [.85, 1, backOut]]);
  if (q > 0) { ctx.save(); ctx.translate(540, 520); ctx.scale(q, q); rrect(ctx, -330, -130, 660, 260, 60); fillStroke(ctx, '#fff7e6', 9); text(ctx, 'WHICH ANIMAL', 0, -30, 70, '#2f63c9', null, 0); text(ctx, 'IS NEXT?', 0, 60, 80, '#e0392f', null, 0); ctx.restore(); }
  for (const [i, e] of ['DOGS?', 'BEES?', 'OWLS?'].entries()) { const k = kf(lt, [[1.0 + i * .2, 0], [1.25 + i * .2, 1, backOut]]); if (k > 0) { ctx.save(); ctx.translate(250 + i * 290, 860 + Math.sin(t * 3 + i) * 12); ctx.scale(k, k); rrect(ctx, -115, -55, 230, 110, 40); fillStroke(ctx, ['#f2b52a', '#3fa35b', '#7a4bc4'][i], 7); text(ctx, e, 0, 4, 52, '#fff', INK, 8); ctx.restore(); } }
});
// end times: each shot ends where the next begins; the last one holds a beat after the final word
for (let i = 0; i < SHOTS.length; i++) SHOTS[i].end = i + 1 < SHOTS.length ? SHOTS[i + 1].start : (WORDS.length ? WORDS[WORDS.length - 1].e + 1.4 : 50);
