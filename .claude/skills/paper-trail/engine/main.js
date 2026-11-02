// paper-trail renderer: archive pages with slow camera moves, film grade, grain, red ink marks, typed stamps, captions.
// Deterministic: renderFrame(f) draws frame f from window.PLAN; window.READY resolves when images and fonts are loaded.
const P = window.PLAN, W = 1080, H = 1920, FPS = P.fps;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const G = Object.assign({ sepia: .38, contrast: 1.3, bright: .9, grain: .09, vignette: .75 }, P.grade || {});
const INK = '#c4161c', PAPER = '#efe6d2', DARK = '#0b0907';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = { inout: t => -(Math.cos(Math.PI * t) - 1) / 2, out: t => 1 - Math.pow(1 - t, 3), in: t => t * t * t, linear: t => t };
function rnd(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

const IMG = {};  // name -> {full: toned canvas, bg: blurred dark canvas, w, h}
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
async function load() {
  await Promise.all(Object.entries(P.images).map(([n, m]) => new Promise((res, rej) => {
    const im = new Image(); im.onload = () => {
      const full = mk(im.width, im.height), f = full.getContext('2d');
      f.filter = `grayscale(1) sepia(${G.sepia}) contrast(${G.contrast}) brightness(${G.bright})`; f.drawImage(im, 0, 0);
      const bg = mk(270, 480), b = bg.getContext('2d');
      const s = Math.max(270 / im.width, 480 / im.height);
      b.filter = 'grayscale(1) sepia(.5) blur(6px) brightness(.32)';
      b.drawImage(im, (270 - im.width * s) / 2, (480 - im.height * s) / 3, im.width * s, im.height * s);
      IMG[n] = { full, bg, w: im.width, h: im.height }; res();
    }; im.onerror = rej; im.src = '/reel/' + m.src;
  })));
  await document.fonts.load('800 80px "Inter Tight"'); await document.fonts.load('500 40px "JB Mono"');
}
// grain frames + vignette, made once
const GRAIN = [...Array(8)].map((_, k) => {
  const c = mk(360, 640), g = c.getContext('2d'), d = g.createImageData(360, 640);
  for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (rnd(i * .37 + k * 9973) - .5) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); return c;
});
const VIG = (() => { const c = mk(W, H), g = c.getContext('2d'); const r = g.createRadialGradient(W / 2, H * .46, H * .22, W / 2, H * .5, H * .78);
  r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, `rgba(0,0,0,${G.vignette})`); g.fillStyle = r; g.fillRect(0, 0, W, H); return c; })();

// camera: a view box (normalized image coords) -> scale + centre that fits it in the frame
function frameOf(sh) { return sh.frame || (sh.layout === 'clip' ? [.5, .43, .8, .5] : [.5, .5, 1, 1]); }
function cam(img, b, fr) {
  const bw = (b[2] - b[0]) * img.w, bh = (b[3] - b[1]) * img.h;
  return { s: Math.min(W * fr[2] / bw, H * fr[3] / bh), cx: (b[0] + b[2]) / 2 * img.w, cy: (b[1] + b[3]) / 2 * img.h, fx: fr[0] * W, fy: fr[1] * H };
}
function camAt(sh, t) {
  const img = IMG[sh.img], fr = frameOf(sh), a = cam(img, sh.from, fr), b = cam(img, sh.to, fr);
  const k = (ease[sh.ease] || ease.inout)(clamp(t / Math.max(.01, sh.end - sh.start)));
  const drift = { x: Math.sin(t * .7 + sh.start) * 3, y: Math.cos(t * .53 + sh.start) * 3 };  // a breath of handheld
  return { fx: a.fx, fy: a.fy, s: a.s * Math.pow(b.s / a.s, k), cx: a.cx + (b.cx - a.cx) * k + drift.x / a.s, cy: a.cy + (b.cy - a.cy) * k + drift.y / a.s };
}
const toScreen = (c, x, y) => [c.fx + (x - c.cx) * c.s, c.fy + (y - c.cy) * c.s];

function drawShot(sh, t) {
  const img = IMG[sh.img], c = camAt(sh, t);
  ctx.drawImage(img.bg, 0, 0, W, H);
  ctx.save();
  if (sh.layout === 'clip') {  // a cut-out clipping on the dark page
    const [x0, y0, x1, y1] = sh.clip, sx = x0 * img.w, sy = y0 * img.h, sw = (x1 - x0) * img.w, sh_ = (y1 - y0) * img.h;
    const [px, py] = toScreen(c, sx, sy);
    ctx.translate(px + sw * c.s / 2, py + sh_ * c.s / 2); ctx.rotate((sh.rot || 0) * Math.PI / 180);
    ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
    ctx.fillStyle = '#d9cfb8'; ctx.fillRect(-sw * c.s / 2, -sh_ * c.s / 2, sw * c.s, sh_ * c.s);
    ctx.shadowColor = 'transparent';
    ctx.drawImage(img.full, sx, sy, sw, sh_, -sw * c.s / 2, -sh_ * c.s / 2, sw * c.s, sh_ * c.s);
  } else {
    const [px, py] = toScreen(c, 0, 0);
    ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 60;
    ctx.drawImage(img.full, px, py, img.w * c.s, img.h * c.s);
  }
  ctx.restore();
  for (const m of sh.marks) drawMark(m, c, t, img, sh);
  if (sh.stamp) drawStamp(sh.stamp, t);
}

function drawMark(m, c, t, img, sh) {  // hand-drawn red ink, drawn on over ~0.55 s
  const p = clamp((t - m.t) / .55); if (p <= 0) return;
  let [x0, y0] = toScreen(c, m.box[0] * img.w, m.box[1] * img.h), [x1, y1] = toScreen(c, m.box[2] * img.w, m.box[3] * img.h);
  if (sh.layout === 'clip' && sh.rot) { /* small rotations: ignore for marks */ }
  ctx.save(); ctx.strokeStyle = INK; ctx.lineCap = ctx.lineJoin = 'round'; ctx.globalAlpha = .92;
  ctx.lineWidth = 8; ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 4;
  const j = i => (rnd(i + m.box[0] * 1000) - .5) * 14;
  ctx.beginPath();
  if (m.style === 'underline') {
    const y = y1 + 5; ctx.moveTo(x0, y + j(1)); ctx.lineTo(x0 + (x1 - x0) * ease.out(p), y + j(2));
  } else {  // loose rectangle, slightly overshooting at the end like a pen
    const pts = [[x0 + j(1), y0 + j(2)], [x1 + j(3), y0 + j(4)], [x1 + j(5), y1 + j(6)], [x0 + j(7), y1 + j(8)], [x0 + j(9) + 18, y0 + j(10) - 6]];
    const segs = pts.length - 1, q = ease.out(p) * segs; ctx.moveTo(...pts[0]);
    for (let i = 0; i < segs; i++) { const f = clamp(q - i); if (f <= 0) break; ctx.lineTo(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f); }
  }
  ctx.stroke(); ctx.restore();
}

function drawStamp(text, t) {  // typed on, top of frame, inside the safe area
  const n = Math.floor(clamp((t - .15) / .9) * text.length); if (n <= 0) return;
  ctx.save(); ctx.font = '500 40px "JB Mono"'; ctx.letterSpacing = '3px'; ctx.textBaseline = 'middle';
  const full = ctx.measureText(text).width, x = (W - full) / 2, y = 345;
  ctx.fillStyle = 'rgba(10,8,6,.78)'; ctx.fillRect(x - 28, y - 42, full + 56, 84);
  ctx.fillStyle = PAPER; ctx.fillText(text.slice(0, n), x, y + 2);
  if (n < text.length || Math.floor(t * 2) % 2 === 0) ctx.fillRect(x + ctx.measureText(text.slice(0, n)).width + 4, y - 20, 4, 40);
  ctx.restore();
}

function drawSeries(T) {
  if (!P.series) return;
  ctx.save(); const g = ctx.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, 'rgba(6,5,4,.92)'); g.addColorStop(.55, 'rgba(6,5,4,.7)'); g.addColorStop(1, 'rgba(6,5,4,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 400); ctx.font = '500 26px "JB Mono"'; ctx.letterSpacing = '4px'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.globalAlpha = .85; ctx.fillStyle = PAPER; ctx.fillText(P.series.toUpperCase(), W / 2, 238);
  ctx.fillStyle = INK; ctx.fillRect(W / 2 - 40, 262, 80, 4); ctx.restore();
}

function drawCaption(T) {
  const c = P.captions.find(c => T >= c.s && T < c.e); if (!c) return;
  const age = T - c.s, pop = 1 + .07 * (1 - ease.out(clamp(age / .12)));
  ctx.save(); ctx.font = '800 84px "Inter Tight"'; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '1px';
  const sp = ctx.measureText(' ').width, ws = c.words.map(w => ({ ...w, wd: ctx.measureText(w.w).width }));
  const lines = [[]]; let lw = 0;
  for (const w of ws) { if (lw && lw + sp + w.wd > 880) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += (lw ? sp : 0) + w.wd; }
  const y0 = 1330 - (lines.length - 1) * 48;
  ctx.translate(W / 2, y0); ctx.scale(pop, pop); ctx.globalAlpha = clamp(age / .06);
  lines.forEach((L, li) => {
    const tw = L.reduce((a, w) => a + w.wd, 0) + sp * (L.length - 1); let x = -tw / 2; const y = li * 96;
    for (const w of L) {
      ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = 'rgba(8,6,5,.95)'; ctx.strokeText(w.w, x, y);
      ctx.fillStyle = w.emph ? '#e2322a' : '#f4eee2'; ctx.fillText(w.w, x, y); x += w.wd + sp;
    }
  });
  ctx.restore();
}

function renderFrame(f) {
  const T = f / FPS;
  ctx.fillStyle = DARK; ctx.fillRect(0, 0, W, H);
  const i = Math.max(0, P.shots.findIndex(s => T >= s.start && T < s.end) === -1 ? P.shots.length - 1 : P.shots.findIndex(s => T >= s.start && T < s.end));
  const sh = P.shots[i], lt = T - sh.start;
  if (sh.in === 'fade' && i > 0 && lt < .35) {  // crossfade from the previous shot
    const pv = P.shots[i - 1]; drawShot(pv, T - pv.start);
    ctx.save(); ctx.globalAlpha = ease.inout(lt / .35); drawShot(sh, lt); ctx.restore();
  } else drawShot(sh, lt);
  if (sh.in === 'flash' && lt < .3) { ctx.fillStyle = `rgba(255,250,235,${(1 - lt / .3) ** 2})`; ctx.fillRect(0, 0, W, H); }
  if (sh.in === 'black' && lt < .5) { ctx.fillStyle = `rgba(0,0,0,${1 - ease.out(lt / .5)})`; ctx.fillRect(0, 0, W, H); }
  // film: flicker, grain, vignette
  ctx.fillStyle = `rgba(0,0,0,${.04 + .04 * rnd(f * 1.7)})`; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = G.grain; ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(GRAIN[f % GRAIN.length], 0, 0, W, H); ctx.restore();
  ctx.drawImage(VIG, 0, 0);
  if (rnd(f * 3.1) > .985) { ctx.fillStyle = 'rgba(240,230,210,.18)'; ctx.fillRect(rnd(f) * W, 0, 2, H); }  // the odd scratch
  drawSeries(T); drawCaption(T);
  const out = P.dur - T; if (out < .6) { ctx.fillStyle = `rgba(0,0,0,${1 - out / .6})`; ctx.fillRect(0, 0, W, H); }
}
window.renderFrame = renderFrame; window.TOTAL_FRAMES = Math.round(P.dur * FPS);
window.grab = (q = .93) => cv.toDataURL('image/jpeg', q);
window.READY = load().then(() => true);
