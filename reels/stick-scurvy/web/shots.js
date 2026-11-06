// ---------- characters ----------
const YOU = { cols: PAL.red, hat: 'bandana', hatCol: '#d8312b', dotCol: '#fff' };
const PATCH = { cols: PAL.yellow, hat: 'bandana', hatCol: '#6c43c0', dotCol: '#fff' };
const SAILOR = { cols: PAL.blue, hat: 'sailor', belt: false };
const C = (base, extra) => Object.assign({}, base, extra);
const walkLegs = (t, sp = 9, amp = .55) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const walkArms = (t, sp = 9, amp = .6) => ({ L: [.3 - Math.sin(t * sp) * amp, -.3], R: [.3 + Math.sin(t * sp) * amp, -.3] });
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);

// deck background (sky, sea, pillars, bulwark, floor)
function deckBG(ctx, t, cam, o = {}) {
  applyCam(ctx, cam, .08); drawSky(ctx, o.skyTop, o.skyBot);
  if (o.sun) { applyCam(ctx, cam, .1); drawSun(ctx, o.sun[0], o.sun[1], o.sun[2], t, o.sunPow || 1); }
  applyCam(ctx, cam, .14);
  drawCloud(ctx, 160 + t * 6, 260, 120, 1); drawCloud(ctx, 760 + t * 4, 150, 90, 2); drawCloud(ctx, 1050 + t * 5, 420, 70, 3, .9); drawCloud(ctx, -100 + t * 5, 520, 80, 4, .9);
  applyCam(ctx, cam, .3); drawPillars(ctx, o.horizon || 760, o.set || 'A');
  applyCam(ctx, cam, .45); drawSea(ctx, o.horizon || 760, t);
  if (o.farShip) { drawShip(ctx, o.farShip[0], (o.horizon || 760) + 40, o.farShip[1], t, { skull: true, flag: '#1b1820', hull: '#3d2a2a', ph: 1 }); }
  applyCam(ctx, cam, 1);
  drawBulwark(ctx, o.back || 1000, o.wallH || 140);
  drawDeckFloor(ctx, o.back || 1000, o.vx || 540);
}
function caribbeanHeat(ctx, a) { if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(900, 200, 50, 900, 200, 1500); g.addColorStop(0, `rgba(255,220,120,${.55 * a})`); g.addColorStop(1, `rgba(255,170,60,${.12 * a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }

// ---------- props for the scurvy reel ----------
const DOC = { cols: PAL.navy, hat: 'captain', belt: false };
const CAPT = { cols: PAL.purple, hat: 'captain', belt: false };
const SAD = { eyes: 'half', mouth: 'frown', browAng: .25 };
const FRUIT = { orange: ['#f39a1e'], lemon: ['#f7d93a'], lime: ['#8bd14a'] };
function fruit(ctx, x, y, r, kind, glow = 0, rot = 0) {
  if (glow > 0) { ctx.save(); ctx.globalAlpha = .45 * glow; circle(ctx, x, y, r * 1.9); ctx.fillStyle = '#fff3a0'; ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  if (kind === 'orange') circle(ctx, 0, 0, r); else ellipse(ctx, 0, 0, r * 1.15, r * .85);
  fillStroke(ctx, FRUIT[kind][0], r > 8 ? Math.max(2, r * .09) : r * .09);   // inside a character the units are its scale
  ellipse(ctx, -r * .35, -r * .3, r * .26, r * .14, -.6); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill();
  if (kind !== 'lemon') { ctx.save(); ctx.translate(r * .2, -r * .95); ctx.rotate(-.5); ellipse(ctx, 0, 0, r * .36, r * .15); fillStroke(ctx, '#3fa35b', r > 8 ? Math.max(2, r * .06) : r * .06); ctx.restore(); }
  else { ellipse(ctx, r * 1.12, 0, r * .12, r * .1); ctx.fillStyle = '#d9b51f'; ctx.fill(); }
  ctx.restore();
}
function bottle(ctx, x, y, s, col = '#6b8f3a', label = '') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -45, -150, 90, 150, 20); fillStroke(ctx, col, 7); rrect(ctx, -18, -215, 36, 70, 8); fillStroke(ctx, col, 7);
  rrect(ctx, -22, -232, 44, 22, 6); fillStroke(ctx, '#9a6a3a', 6);
  rrect(ctx, -36, -110, 72, 56, 6); fillStroke(ctx, '#f5ead2', 5);
  if (label) text(ctx, label, 0, -82, 26, '#4a2614', null, 0, 'Poppins', 700);
  ellipse(ctx, -25, -120, 7, 22); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fill(); ctx.restore();
}
function bucket(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  path(ctx, [[-90, -150], [90, -150], [70, 0], [-70, 0]]); fillStroke(ctx, '#9a5a2c', 7);
  for (const yy of [-110, -40]) line(ctx, -84 + (yy + 150) * .13, yy, 84 - (yy + 150) * .13, yy, 7, '#5b3018');
  ellipse(ctx, 0, -150, 90, 22); fillStroke(ctx, '#2c8fc0', 6);
  for (let i = 0; i < 3; i++) { const yy = -150 + Math.sin(t * 4 + i) * 4; line(ctx, -50 + i * 35, yy, -30 + i * 35, yy, 4, '#bfe8f5'); }
  ctx.restore();
}
function mug(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.arc(70, -80, 38, -Math.PI / 2, Math.PI / 2); ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 8; ctx.strokeStyle = '#b8743c'; ctx.stroke();
  rrect(ctx, -70, -160, 140, 160, 14); fillStroke(ctx, '#b8743c', 7);
  ellipse(ctx, 0, -160, 70, 16); fillStroke(ctx, '#e9b33a', 6);
  puff(ctx, -20, -185, 22, 0, '#fff7e0', 3, .7); puff(ctx, 25, -190, 16, 0, '#fff7e0', 4, .6);
  ctx.restore();
}
// a big word that slams in (screen space)
function stamp(ctx, str, x, y, size, k, fill = '#e0392f', rot = -.05, font = 'Poppins') {
  if (k <= 0) return; const sc = lerp(1.7, 1, backOut(clamp(k / .18))), a = clamp(k / .08);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = a;
  text(ctx, str, 0, 0, size, fill, INK, size * .16, font, 700); text(ctx, str, 0, 0, size, fill, null, 0, font, 700);
  ctx.restore();
}
function table(ctx) { ctx.fillStyle = '#7a4527'; ctx.fillRect(-600, -600, 2300, 3200); for (let y = -600; y < 2600; y += 190) line(ctx, -600, y, 1700, y + 20, 6, '#5e321b'); }
const handFruit = (kind, r = .06, glow = 0) => (ctx, k, p, ang, side) => { if (k === 'R') fruit(ctx, p[0], p[1] - r * .6, r, kind, glow); };
const lying = (x, y, s, ch, face, t, ph = 0) => drawStick(ctx_, C(ch, { x, y, s, lean: 1.45, face, shadow: false, arms: { L: [.6, -.2], R: [.9, -.4] }, legs: { L: [.1, -.05], R: [.2, -.1] }, bob: Math.sin(t * 2 + ph) * .004 }));
let ctx_;

const SHOTS = [];
// A — hook: the cannon booms, but the danger is the missing fruit
SHOTS.push({ start: 0, end: 3.6, tr: 'whip', draw(ctx, lt, t) {
  const fire = lt - 1.85, sh = fire > 0 ? Math.max(0, 1 - fire * 3) : 0, hk = shake(t * 3, 22 * sh, 3), hh = handheld(t, 3);
  const cam = { x: 540 + hh[0] + hk[0], y: 960 + hh[1] + hk[1], z: kf(lt, [[0, 1.0], [3.6, 1.12]]), r: Math.sin(t * .5) * .006 };
  deckBG(ctx, t, cam, { sun: [880, 180, 80], sunPow: 1.1, farShip: [80, .5] });
  applyCam(ctx, cam, 1);
  drawMast(ctx, 110, -900, 1040, 64); drawBarrel(ctx, 960, 1060, 1.0);
  drawCannon(ctx, 820, 1150, 1.5, -.12, -1);
  if (fire > 0 && fire < .9) { puff(ctx, 600, 980, 120 + fire * 260, fire, '#f3efe6', 3, 1 - fire); if (fire < .25) { ctx.save(); ctx.translate(560, 990); ctx.scale(.7, .7); burst(ctx, 0, 0, 200, 12, '#ffd23a', 3); ctx.restore(); } }
  const raise = kf(lt, [[2.55, 0], [2.95, 1, backOut]]), glow = kf(lt, [[2.9, 0], [3.2, 1]]);
  drawStick(ctx, C(SAILOR, {
    x: 330, y: 1190, s: 600, bob: Math.sin(t * 3) * .004,
    arms: { L: [.3, -.1], R: [lerp(.4, 2.75, raise), lerp(-.2, .25, raise)] },
    prop: raise > .2 ? handFruit('orange', .075, glow) : null,
    face: lt < 2.5 ? { eyes: fire > 0 ? 'wide' : 'normal', look: [.8, 0], mouth: fire > 0 ? 'o' : 'smile' } : { eyes: 'wide', look: [.3, -.6], mouth: 'grin', browUp: 1 },
  }));
  if (glow > 0) sparkle(ctx, 330 + 140, 1190 - 600 * .98, 60 * glow, glow);
} });
// B — long voyages: the sun races, the sailor wilts
SHOTS.push({ start: 3.6, end: 8.08, tr: 'whip', draw(ctx, lt, t) {
  const day = clamp(lt / 1.6), hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [1.6, 1.0], [4.4, 1.25]]), r: 0 };
  const sx = lerp(120, 980, day), sy = 420 - Math.sin(day * Math.PI) * 280;
  deckBG(ctx, t, cam, { sun: [sx, sy, 75], sunPow: 1, horizon: 780 });
  applyCam(ctx, cam, 1);
  const weak = kf(lt, [[1.0, 0], [2.2, 1]]), jaw = kf(lt, [[2.1, 0], [2.4, 1]]), bleed = kf(lt, [[2.45, 0], [2.7, 1]]), wound = kf(lt, [[3.2, 0], [3.5, 1]]);
  const s = 1150, x = 560, y = 1840;   // head above the caption band
  drawStick(ctx, C(SAILOR, {
    x, y, s, squash: lerp(1, .93, weak), lean: lerp(0, .06, weak) + Math.sin(t * 1.3) * .01, headTilt: lerp(0, .12, weak),
    arms: { L: [lerp(.3, .1, weak), -.05], R: jaw > 0 ? { ik: [lerp(.3, .07, jaw), lerp(-.4, -.66, jaw)], bend: -1 } : [.3, -.1] },
    face: weak < .5 ? { eyes: 'normal', mouth: 'smile', look: [-.3, 0] } : { ...SAD, eyes: wound > 0 ? 'squint' : 'half', mouth: bleed > 0 ? 'teeth' : 'frown' },
  }));
  if (weak > .4) sweat(ctx, x + .16 * s, y - .86 * s, 1.3, weak);
  if (bleed > 0) for (let i = 0; i < 3; i++) { circle(ctx, x - 40 + i * 38, y - .66 * s + 18 + (lt - 2.45) * 20 * (i + 1), 11 * bleed); ctx.fillStyle = '#d42a2a'; ctx.fill(); }
  if (wound > 0) { ctx.save(); ctx.translate(x - .2 * s, y - .44 * s); ctx.rotate(.5); rrect(ctx, -60 * wound, -9, 120 * wound, 18, 9); fillStroke(ctx, '#e0392f', 5); ctx.restore(); }
  if (day < 1) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = .18 * Math.sin(day * Math.PI); ctx.fillStyle = '#ffcf6b'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
} });
// C — scurvy: sick crew below deck, and the tally against the guns
SHOTS.push({ start: 8.08, end: 12.48, tr: 'whip', draw(ctx, lt, t) {
  ctx_ = ctx; const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.12], [4.4, 1.0]]), r: 0 };
  applyCam(ctx, cam, 1);
  drawBelowDeck(ctx, .4, 540, t); drawLantern(ctx, 540 + Math.sin(t * 1.4) * 40, 260, 1.0, 1, t);
  lying(250, 1180, 330, SAILOR, { ...SAD, eyes: 'x' }, t, 0); lying(560, 1120, 300, SAILOR, SAD, t, 1); lying(860, 1190, 330, SAILOR, { ...SAD, eyes: 'spiral' }, t, 2);
  stamp(ctx, 'SCURVY', 540, 470, 170, lt - .42, '#3fa35b');
  const bars = kf(lt, [[2.3, 0], [3.4, 1]]);
  if (bars > 0) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    rrect(ctx, 150, 600, 780, 420, 26); ctx.globalAlpha = .9; fillStroke(ctx, '#f5ead2', 7); ctx.globalAlpha = 1;
    const base = 960; rrect(ctx, 260, base - 300 * bars, 180, 300 * bars, 12); fillStroke(ctx, '#3fa35b', 7);
    rrect(ctx, 640, base - 90 * bars, 180, 90 * bars, 12); fillStroke(ctx, '#55505a', 7);
    text(ctx, 'SCURVY', 350, 640 + 18, 46, '#3fa35b', INK, 8); text(ctx, 'GUNS', 730, 640 + 18, 46, '#d9d4ca', INK, 8);
    ctx.restore();
  }
} });
// D — 1747: Dr James Lind tries something new
SHOTS.push({ start: 12.48, end: 16.0, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [3.5, 1.1]]), r: 0 };
  deckBG(ctx, t, cam, { sun: [900, 200, 70], horizon: 760 });
  applyCam(ctx, cam, 1); drawMast(ctx, 930, -900, 1040, 60);
  const walk = clamp(lt / 1.0), x = lerp(-150, 460, easeOut(walk)), idea = kf(lt, [[2.72, 0], [2.95, 1, backOut]]);
  drawStick(ctx, C(DOC, {
    x, y: 1220, s: 700, vest: '#1d2d6b', legs: walk < 1 ? walkLegs(t, 10) : undefined, bob: walk < 1 ? Math.abs(Math.sin(t * 10)) * -.01 : 0,
    arms: idea > 0 ? { L: [.3, -.1], R: [2.9, .2] } : (walk < 1 ? walkArms(t, 10) : { L: [.3, -.1], R: [.9, -1.9] }),
    face: idea > 0 ? { eyes: 'wide', mouth: 'grin', browUp: 1, look: [.2, -.5] } : { eyes: 'normal', mouth: 'smirk', look: [.6, 0] },
  }));
  stamp(ctx, '1747', 540, 330, 150, lt - .16, '#ffe14d', -.04);
  const nk = kf(lt, [[1.95, 0], [2.2, 1, backOut]]);
  if (nk > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(780, 600); ctx.scale(nk, nk); rrect(ctx, -190, -48, 380, 96, 18); fillStroke(ctx, '#f5ead2', 7); text(ctx, 'DR JAMES LIND', 0, 2, 44, '#2a3f8f', null, 0); ctx.restore(); }
  if (idea > 0) { ctx.save(); ctx.translate(x + 160, 1220 - 700 * 1.18); ctx.scale(idea, idea); burst(ctx, 0, 0, 80, 10, '#ffe14d', 4); star5(ctx, 0, 0, 40, t, '#fff6c4'); ctx.restore(); }
} });
// E — twelve sick sailors, six pairs
SHOTS.push({ start: 16.0, end: 19.92, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.08], [3.9, 1.0]]), r: 0 };
  applyCam(ctx, cam, 1); drawBelowDeck(ctx, .2, 540, t); drawLantern(ctx, 540, 200, 1.0, 1, t);
  const tagCols = ['#e0392f', '#2f63c9', '#f2b52a', '#7a4bc4', '#3fa35b', '#f39a1e'];
  for (let i = 0; i < 6; i++) {
    const row = Math.floor(i / 3), col = i % 3, cx = 210 + col * 330, cy = row ? 1170 : 830, k = kf(lt, [[.2 + i * .13, 0], [.42 + i * .13, 1, backOut]]);
    if (k <= 0) continue;
    for (const dx of [-62, 62]) drawStick(ctx, C(SAILOR, { x: cx + dx, y: cy, s: 250 * k, face: { ...SAD, look: [dx < 0 ? .5 : -.5, 0] }, bob: Math.sin(t * 2 + i + dx) * .006, arms: { L: [.2, -.05], R: [.2, -.05] } }));
    const tk = kf(lt, [[1.7 + i * .1, 0], [1.9 + i * .1, 1, backOut]]);
    if (tk > 0) { ctx.save(); ctx.translate(cx, cy - 290); ctx.scale(tk, tk); circle(ctx, 0, 0, 40); fillStroke(ctx, tagCols[i], 7); text(ctx, String(i + 1), 0, 3, 44, '#fff', null, 0); ctx.restore(); }
  }
  const q = kf(lt, [[3.1, 0], [3.3, 1, backOut]]);
  if (q > 0) for (let i = 0; i < 6; i++) { const cx = 210 + (i % 3) * 330, cy = (Math.floor(i / 3) ? 1170 : 830) - 380; text(ctx, '?', cx + Math.sin(t * 3 + i) * 8, cy, 70 * q, '#ffe14d', INK, 10); }
} });
// F — the cures: vinegar, seawater, cider ... and citrus
SHOTS.push({ start: 19.92, end: 24.64, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0], y: 900 + hh[1], z: kf(lt, [[0, 1.05], [4.7, 1.0]]), r: -.015 };
  applyCam(ctx, cam, 1); table(ctx);
  const items = [[0, 290, 640, 'VINEGAR'], [.8, 790, 640, 'SEAWATER'], [1.68, 290, 1140, 'CIDER'], [2.88, 790, 1140, 'CITRUS']];
  for (const [at, x, y, name] of items) {
    const k = kf(lt, [[at, 0], [at + .22, 1, backOut]]); if (k <= 0) continue;
    const dim = name !== 'CITRUS' && lt > 3.7 ? .45 : 1;
    ctx.save(); ctx.globalAlpha = dim; ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y);
    if (name === 'VINEGAR') bottle(ctx, x, y, 1.1, '#7a8f3a', 'VIN');
    if (name === 'SEAWATER') bucket(ctx, x, y, 1.05, t);
    if (name === 'CIDER') mug(ctx, x, y, 1.0);
    if (name === 'CITRUS') { const g = kf(lt, [[3.7, 0], [4.0, 1]]); fruit(ctx, x - 90, y - 70, 70, 'orange', g); fruit(ctx, x + 20, y - 95, 70, 'orange', g); fruit(ctx, x + 110, y - 55, 62, 'lemon', g, .2); if (g > 0) sparkle(ctx, x + 60, y - 200, 60 * g, g); }
    text(ctx, name, x, y + 70, 52, '#fff', INK, 10); ctx.restore();
  }
} });
// G — the citrus pair recovers
SHOTS.push({ start: 24.64, end: 28.64, tr: 'whip', draw(ctx, lt, t) {
  ctx_ = ctx; const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [4, 1.08]]), r: 0 };
  applyCam(ctx, cam, 1); drawBelowDeck(ctx, .15, 300, t); lightShaft(ctx, 330, -100, 260, 520, 1500, kf(lt, [[.9, .3], [1.4, 1]]));
  lying(820, 1230, 300, SAILOR, SAD, t, 1); lying(700, 1000, 260, SAILOR, { ...SAD, eyes: 'x' }, t, 2);
  const up = kf(lt, [[1.0, 0], [1.4, 1, backOut]]), dance = lt > 2.3;
  for (const [i, dx] of [[0, -90], [1, 90]]) {
    const jump = up >= 1 ? Math.abs(Math.sin((t + i * .3) * 7)) * (dance ? 70 : 25) : 0;
    drawStick(ctx, C(i ? SAILOR : C(SAILOR, { cols: PAL.green }), {
      x: 330 + dx, y: 1220 - jump, s: lerp(300, 430, up), squash: up < 1 ? lerp(.7, 1, up) : 1,
      arms: dance ? { L: [2.6 + Math.sin(t * 8) * .3, .2], R: [2.6 - Math.sin(t * 8) * .3, .2] } : { L: [.4, -.2], R: [.4, -.2] },
      legs: dance && i === 0 ? walkLegs(t, 14, .5) : undefined,
      prop: i === 0 ? handFruit('orange', .07, 1) : null,
      face: up > .5 ? { eyes: 'happy', mouth: 'grin', browUp: 1 } : SAD,
    }));
  }
  if (up > 0) { sparkle(ctx, 230, 600, 50 * up, up); sparkle(ctx, 450, 560, 40 * up, up); }
  stamp(ctx, 'BACK ON HIS FEET', 540, 360, 84, lt - 2.4, '#3fa35b', .03);
} });
// H — the Navy took until 1795
SHOTS.push({ start: 28.64, end: 32.8, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .02, r: 0 };
  deckBG(ctx, t, cam, { sun: [880, 200, 70], horizon: 760 });
  applyCam(ctx, cam, 1);
  const tap = Math.max(0, Math.sin(t * 9)) * .25, cheer = lt > 2.9;
  drawStick(ctx, C(SAILOR, { x: 300, y: 1210, s: 560, legs: cheer ? undefined : { L: [.1, -.04], R: [.1 + tap, -.04 - tap] }, arms: cheer ? POSE.handsUp.arms : POSE.hips.arms,
    face: cheer ? { eyes: 'happy', mouth: 'grin' } : { eyes: 'squint', mouth: 'flat', browAng: -.3, look: [.7, -.2] } }));
  if (!cheer) sweat(ctx, 300 + 100, 1210 - 560 * .9, 1.0, 1);
  const y = Math.round(lerp(1747, 1795, easeOut(clamp((lt - .3) / 1.4))));
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  rrect(ctx, 590, 380, 400, 300, 24); fillStroke(ctx, '#f5ead2', 8); rrect(ctx, 590, 380, 400, 70, 24); fillStroke(ctx, '#e0392f', 8);
  text(ctx, String(y), 790, 575, 120, '#2a2026', null, 0);
  if (y < 1795) for (let k = 0; k < 2; k++) { const f = ((t * 3 + k * .5) % 1); ctx.save(); ctx.globalAlpha = 1 - f; ctx.translate(790 + f * 220, 520 - f * 160); ctx.rotate(f * 2); rrect(ctx, -60, -40, 120, 80, 8); fillStroke(ctx, '#f5ead2', 5); ctx.restore(); }
  ctx.restore();
  const bk = kf(lt, [[2.85, 0], [3.2, 1, backOut]]);
  if (bk > 0) { ctx.save(); ctx.translate(790, 1180); ctx.scale(bk, bk); drawCrate(ctx, 0, 40, 340, 220, 0, 'LEMON JUICE'); fruit(ctx, -60, -215, 50, 'lemon'); fruit(ctx, 50, -210, 46, 'lemon', 0, .4); ctx.restore(); }
} });
// I — to save money: lemons become limes
SHOTS.push({ start: 32.8, end: 35.76, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [3, 1.1]]), r: 0 };
  deckBG(ctx, t, cam, { sun: [880, 200, 70], horizon: 760 });
  applyCam(ctx, cam, 1);
  drawStick(ctx, C(CAPT, { x: 260, y: 1210, s: 560, arms: { L: { ik: [.05, -.45] }, R: { ik: [-.05, -.42 + Math.sin(t * 10) * .02] } }, face: { eyes: 'smug', mouth: 'smirk', look: [.8, 0] } }));
  const flip = lt - 1.2, sx = flip < 0 ? 1 : Math.abs(Math.cos(clamp(flip / .4) * Math.PI)), limes = flip > .2;
  ctx.save(); ctx.translate(720, 1180); ctx.scale(sx, 1);
  drawCrate(ctx, 0, 40, 380, 240, 0, limes ? 'LIMES' : 'LEMONS');
  for (let i = 0; i < 4; i++) fruit(ctx, -120 + i * 80, -235 - (i % 2) * 20, 46, limes ? 'lime' : 'lemon', 0, i * .4);
  ctx.restore();
  const ck = lt - .4;
  if (ck > 0 && ck < 1.4) for (let i = 0; i < 5; i++) { const f = clamp(ck * 1.3 - i * .12); if (f <= 0) continue; const x = 420 + i * 60, y = 760 - Math.sin(f * Math.PI) * 220 + f * 120; ctx.save(); ctx.globalAlpha = 1 - clamp((f - .8) / .2); circle(ctx, x, y, 34); fillStroke(ctx, '#ffd23a', 6); text(ctx, '£', x, y + 2, 38, '#a87a10', null, 0); ctx.restore(); }
  stamp(ctx, 'CHEAPER!', 720, 420, 110, lt - 2.1, '#3fa35b', .05);
} });
// J — far less vitamin C: the chart, and scurvy creeps back
SHOTS.push({ start: 35.76, end: 39.28, tr: 'whip', draw(ctx, lt, t) {
  ctx_ = ctx; const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0, r: -.01 };
  applyCam(ctx, cam, 1); table(ctx);
  ctx.save(); ctx.translate(540, 760); ctx.rotate(-.02);
  rrect(ctx, -400, -420, 800, 840, 16); fillStroke(ctx, '#f5ead2', 8);
  text(ctx, 'VITAMIN C', 0, -340, 80, '#4a2614', null, 0, 'Lora', 700);
  const g = kf(lt, [[.5, 0], [1.4, 1, easeOut]]), base = 300;
  rrect(ctx, -260, base - 520 * g, 200, 520 * g, 14); fillStroke(ctx, '#f7d93a', 7); rrect(ctx, 60, base - 150 * g, 200, 150 * g, 14); fillStroke(ctx, '#8bd14a', 7);
  fruit(ctx, -160, base + 70, 50, 'lemon'); fruit(ctx, 160, base + 70, 50, 'lime');
  ctx.restore();
  const sick = kf(lt, [[2.2, 0], [2.6, 1]]);
  if (sick > 0) { drawStick(ctx, C(SAILOR, { x: 900, y: 1210, s: 380 * sick, face: { ...SAD, eyes: 'spiral' }, lean: .1 * sick })); sweat(ctx, 960, 1210 - 380 * .9, .9, sick); }
} });
// K — nobody knew why, until vitamin C was discovered
SHOTS.push({ start: 39.28, end: 42.72, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [3.4, 1.12]]), r: 0 };
  applyCam(ctx, cam, 1); ctx.fillStyle = '#20324f'; ctx.fillRect(-600, -600, 2300, 3200);
  for (let i = 0; i < 40; i++) { const R = rng(i + 3); star5(ctx, R() * 1080, R() * 1300, 4 + R() * 5, t * .2, 'rgba(255,255,255,.5)'); }
  const q = clamp(1 - (lt - 1.0) * 2);
  if (q > 0) for (let i = 0; i < 4; i++) text(ctx, '?', 250 + i * 190, 520 + Math.sin(t * 3 + i) * 20, 120 * q, '#ffe14d', INK, 14);
  const m = kf(lt, [[1.0, 0], [1.5, 1, backOut]]);
  if (m > 0) {
    ctx.save(); ctx.translate(540, 620); ctx.scale(m, m); ctx.rotate(t * .3);
    const P = [...Array(5)].map((_, i) => [Math.cos(i / 5 * TAU - Math.PI / 2) * 150, Math.sin(i / 5 * TAU - Math.PI / 2) * 150]);
    path(ctx, P); ctx.lineWidth = 14; ctx.strokeStyle = '#fff'; ctx.stroke();
    P.forEach(([x, y], i) => { circle(ctx, x, y, 34); fillStroke(ctx, i === 0 ? '#e0392f' : '#ffe14d', 7); line(ctx, x, y, x * 1.6, y * 1.6, 10, '#fff'); circle(ctx, x * 1.6, y * 1.6, 24); fillStroke(ctx, '#7fd3e0', 6); });
    ctx.restore(); text(ctx, 'C', 540, 640, 120, '#fff', INK, 14);
  }
  const lens = kf(lt, [[1.6, 0], [2.0, 1]]);
  if (lens > 0) { const lx = lerp(900, 640, lens), ly = lerp(1100, 760, lens); circle(ctx, lx, ly, 140); ctx.lineWidth = 26; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 14; ctx.strokeStyle = '#c9a14a'; ctx.stroke(); line(ctx, lx + 100, ly + 100, lx + 220, ly + 220, 34, INK); line(ctx, lx + 100, ly + 100, lx + 220, ly + 220, 20, '#7a4527'); }
  stamp(ctx, 'DECADES LATER', 540, 1050, 92, lt - 2.45, '#ffe14d', -.03);
} });
// L — limeys: a toast with the fruit that almost worked
SHOTS.push({ start: 42.72, end: 48.0, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.12], [5, 1.0]]), r: Math.sin(t * .5) * .006 };
  deckBG(ctx, t, cam, { sun: [880, 210, 85], sunPow: 1.2, horizon: 780, farShip: [-120, .5] });
  applyCam(ctx, cam, 1); drawMast(ctx, 540, -900, 1000, 64); drawRigging(ctx, 700, 1000, 560, 200, 9, 110);
  const toast = kf(lt, [[2.6, 0], [3.0, 1, backOut]]);
  [[200, PAL.blue], [540, PAL.red], [880, PAL.green]].forEach(([x, col], i) => {
    const b = Math.abs(Math.sin(t * 6 + i)) * 18 * toast;
    drawStick(ctx, C(SAILOR, { cols: col, x, y: 1200 - b, s: 460, arms: { L: [.3, -.1], R: [lerp(.5, 2.6, toast), lerp(-.3, .25, toast)] }, prop: handFruit('lime', .075, toast * .6),
      face: toast > 0 ? { eyes: 'happy', mouth: 'grin' } : { eyes: 'normal', mouth: 'smile', look: [i === 0 ? .6 : i === 2 ? -.6 : 0, 0] } }));
  });
  stamp(ctx, 'LIMEYS', 540, 380, 190, lt - 3.0, '#8bd14a', -.05);
  if (lt > 3.0) for (let i = 0; i < 6; i++) { const R = rng(i + 9); sparkle(ctx, 140 + R() * 800, 220 + R() * 340, 30 + 20 * Math.sin(t * 5 + i), .8); }
} });
