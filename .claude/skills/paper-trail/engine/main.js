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
  await document.fonts.load('800 80px "Inter Tight"'); await document.fonts.load('500 40px "JB Mono"'); await document.fonts.load('600 60px Lora');
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
// [cx, cy, w, h] of the screen area a view is fitted into
function frameOf(sh) { return sh.frame || (sh.layout === 'clip' ? [.5, .43, .8, .5] : [.5, .5, 1, 1]); }
function cam(img, b, fr) {
  const bw = (b[2] - b[0]) * img.w, bh = (b[3] - b[1]) * img.h;
  return { s: (fr.cover ? Math.max : Math.min)(W * fr[2] / bw, H * fr[3] / bh), cx: (b[0] + b[2]) / 2 * img.w, cy: (b[1] + b[3]) / 2 * img.h, fx: fr[0] * W, fy: fr[1] * H };
}
function camAt(sh, t) {
  const img = IMG[sh.img], fr = Object.assign([...frameOf(sh)], { cover: sh.layout === 'photo' }), a = cam(img, sh.from, fr), b = cam(img, sh.to, fr);
  const k = (ease[sh.ease] || ease.inout)(clamp(t / Math.max(.01, sh.end - sh.start)));
  const drift = { x: Math.sin(t * .7 + sh.start) * 3, y: Math.cos(t * .53 + sh.start) * 3 };  // a breath of handheld
  return { fx: a.fx, fy: a.fy, s: a.s * Math.pow(b.s / a.s, k), cx: a.cx + (b.cx - a.cx) * k + drift.x / a.s, cy: a.cy + (b.cy - a.cy) * k + drift.y / a.s };
}
const toScreen = (c, x, y) => [c.fx + (x - c.cx) * c.s, c.fy + (y - c.cy) * c.s];

const KINDS = {};
function drawShot(sh, t) {
  if (sh.kind && sh.kind !== 'page' && sh.kind !== 'photo') { KINDS[sh.kind](sh, t); if (sh.label) drawLabel(sh.label); return; }
  drawImageShot(sh, t); if (sh.label) drawLabel(sh.label);
}
function drawImageShot(sh, t) {
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
    if (sh.layout !== 'photo') ctx.shadowColor = 'rgba(0,0,0,.9)', ctx.shadowBlur = 60;
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


// ---------- paper, cards, maps, footage, outro ----------
const PAPER_BG = (() => {  // aged paper: warm base, fibres, blotches, burnt edges (made once)
  const c = mk(W, H), g = c.getContext('2d'); g.fillStyle = '#e6dcc4'; g.fillRect(0, 0, W, H);
  const d = g.getImageData(0, 0, W, H);
  for (let i = 0; i < d.data.length; i += 4) { const n = (rnd(i * .013) - .5) * 26; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n * .8; }
  g.putImageData(d, 0, 0);
  for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(120,90,50,${.02 + .04 * rnd(k)})`; g.beginPath(); g.arc(rnd(k + 1) * W, rnd(k + 2) * H, 30 + 160 * rnd(k + 3), 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(90,70,40,.12)'; for (let k = 0; k < 400; k++) { const x = rnd(k * 3) * W, y = rnd(k * 5) * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20 * (rnd(k) - .5), y + 30 * rnd(k + 9)); g.stroke(); }
  const r = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); r.addColorStop(0, 'rgba(60,40,20,0)'); r.addColorStop(1, 'rgba(60,40,20,.55)');
  g.fillStyle = r; g.fillRect(0, 0, W, H); return c;
})();
const INKC = '#1d1712';
function paper(t, sh) {  // paper fills the frame with a slow push
  const z = 1 + .04 * clamp(t / Math.max(1, sh.end - sh.start)); ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.drawImage(PAPER_BG, -W / 2, -H / 2); ctx.restore();
}
function typed(text, x, y, t, cps, font, color, align = 'center') {
  const n = Math.floor(clamp(t * cps / text.length) * text.length); if (n <= 0) return;
  ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.letterSpacing = '3px';
  ctx.fillText(text.slice(0, n), x, y); ctx.restore();
}
function stampText(text, x, y, t, font, color, maxW = 900) {  // lands with a little overshoot, slightly rough
  if (t < 0) return; const k = ease.out(clamp(t / .18)), sc = 1.25 - .25 * k;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha = k; ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lines = wrap(text, maxW); lines.forEach((L, i) => { ctx.fillStyle = color; ctx.fillText(L, 0, (i - (lines.length - 1) / 2) * parseInt(font.match(/(\d+)px/)[1]) * 1.05); });
  ctx.restore();
}
function wrap(text, maxW) {
  const out = [''];
  for (const w of text.split(' ')) { const tryL = out[out.length - 1] ? out[out.length - 1] + ' ' + w : w; if (ctx.measureText(tryL).width > maxW && out[out.length - 1]) out.push(w); else out[out.length - 1] = tryL; }
  return out;
}
KINDS.card = (sh, t) => {  // {text, sub, style: number|quote|title}
  paper(t, sh);
  const st = sh.style || 'number';
  if (st === 'quote') { ctx.font = '600 76px Lora'; stampText('“' + sh.text + '”', W / 2, H * .45, t - .15, '600 76px Lora', INKC, 860); }
  else { ctx.font = '800 150px "Inter Tight"'; stampText(sh.text.toUpperCase(), W / 2, H * .45, t - .15, '800 150px "Inter Tight"', st === 'number' ? INK : INKC, 900); }
  if (sh.sub) typed(sh.sub.toUpperCase(), W / 2, H * .45 + 230, t - .6, 28, '500 36px "JB Mono"', INKC);
  const k = clamp((t - .35) / .4); ctx.fillStyle = INK; ctx.fillRect(W / 2 - 160 * k, H * .45 - 190, 320 * k, 6);
};
KINDS.map = (sh, t) => {  // ink diagram: blocks [x0,y0,x1,y1,label], points [{x,y,label}], route [[x,y]...], xs [{x,y,at}]
  paper(t, sh);
  const X = x => 90 + x * 900, Y = y => 420 + y * 900;  // map area inside the safe zone, above the captions
  ctx.save(); ctx.strokeStyle = INKC; ctx.fillStyle = INKC; ctx.lineWidth = 4;
  const draw = clamp(t / .9);
  for (const [i, b] of (sh.blocks || []).entries()) {
    const k = clamp(draw * 1.6 - i * .15); if (k <= 0) continue; ctx.globalAlpha = k;
    ctx.strokeRect(X(b[0]), Y(b[1]), (b[2] - b[0]) * 900, (b[3] - b[1]) * 900);
    ctx.save(); ctx.beginPath(); ctx.rect(X(b[0]), Y(b[1]), (b[2] - b[0]) * 900, (b[3] - b[1]) * 900); ctx.clip(); ctx.lineWidth = 1.5; ctx.globalAlpha = .35 * k;
    for (let h = -900; h < 900; h += 18) { ctx.beginPath(); ctx.moveTo(X(b[0]) + h, Y(b[1])); ctx.lineTo(X(b[0]) + h + 600, Y(b[1]) + 600); ctx.stroke(); }
    ctx.restore();
    if (b[4]) { ctx.globalAlpha = k; ctx.font = '500 30px "JB Mono"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = INKC;
      const tw = ctx.measureText(b[4]).width; ctx.fillStyle = '#e6dcc4'; ctx.fillRect((X(b[0]) + X(b[2])) / 2 - tw / 2 - 10, (Y(b[1]) + Y(b[3])) / 2 - 22, tw + 20, 44);
      ctx.fillStyle = INKC; ctx.fillText(b[4], (X(b[0]) + X(b[2])) / 2, (Y(b[1]) + Y(b[3])) / 2); }
  }
  ctx.globalAlpha = 1;
  const R = sh.route || []; if (R.length > 1) {  // red route draws itself
    const k = ease.inout(clamp((t - .6) / Math.max(.8, (sh.end - sh.start) * .55))); let L = 0; const seg = [];
    for (let i = 1; i < R.length; i++) { const d = Math.hypot(X(R[i][0]) - X(R[i - 1][0]), Y(R[i][1]) - Y(R[i - 1][1])); seg.push(d); L += d; }
    ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.setLineDash([26, 16]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X(R[0][0]), Y(R[0][1]));
    let left = L * k; for (let i = 1; i < R.length && left > 0; i++) { const f = Math.min(1, left / seg[i - 1]); ctx.lineTo(X(R[i - 1][0]) + (X(R[i][0]) - X(R[i - 1][0])) * f, Y(R[i - 1][1]) + (Y(R[i][1]) - Y(R[i - 1][1])) * f); left -= seg[i - 1]; }
    ctx.stroke(); ctx.setLineDash([]);
  }
  for (const [i, p] of (sh.points || []).entries()) {
    const k = clamp((t - .3 - i * .25) / .3); if (k <= 0) continue; ctx.globalAlpha = k;
    ctx.fillStyle = INKC; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 12, 0, 7); ctx.fill();
    ctx.font = '800 40px "Inter Tight"'; ctx.textAlign = p.align || 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(p.label.toUpperCase(), X(p.x) + (p.align === 'right' ? -28 : 28), Y(p.y) + (p.dy || 0));
  }
  ctx.globalAlpha = 1;
  for (const [i, x] of (sh.xs || []).entries()) {  // red X stamped
    const tt = t - (x.at ?? 1.2 + i * .3); if (tt < 0) continue; const k = ease.out(clamp(tt / .15)), s = 34 * (1.4 - .4 * k);
    ctx.strokeStyle = INK; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.globalAlpha = k;
    ctx.beginPath(); ctx.moveTo(X(x.x) - s, Y(x.y) - s); ctx.lineTo(X(x.x) + s, Y(x.y) + s); ctx.moveTo(X(x.x) + s, Y(x.y) - s); ctx.lineTo(X(x.x) - s, Y(x.y) + s); ctx.stroke();
    if (x.label) { ctx.fillStyle = INK; ctx.font = '800 34px "Inter Tight"'; ctx.textAlign = 'center'; ctx.fillText(x.label.toUpperCase(), X(x.x), Y(x.y) + 70); }
  }
  ctx.restore();
  if (sh.title) typed(sh.title.toUpperCase(), W / 2, 345, t - .1, 30, '500 40px "JB Mono"', INKC);
};
const FOOT = {};  // footage frames, loaded on demand
function footFrame(sh, i) {
  const key = sh.img + ':' + i; if (FOOT[key]) return Promise.resolve(FOOT[key]);
  return new Promise(res => { const im = new Image(); im.onload = () => { FOOT[key] = im; res(im); }; im.onerror = () => res(null);
    im.src = `/reel/build/frames/${sh.img}/${String(i + 1).padStart(5, '0')}.jpg`; });
}
KINDS.footage = (sh, t) => {
  const im = sh._im; ctx.fillStyle = DARK; ctx.fillRect(0, 0, W, H); if (!im) return;
  const s = Math.max(W / im.width, H / im.height) * (1 + .05 * clamp(t / (sh.end - sh.start)));
  ctx.save(); ctx.filter = `grayscale(1) sepia(${G.sepia}) contrast(${G.contrast}) brightness(${G.bright})`;
  ctx.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2, im.width * s, im.height * s); ctx.restore();
};
KINDS.outro = (sh, t) => {  // case-file checklist: each box gets a red tick
  ctx.drawImage(VIG, 0, 0); ctx.fillStyle = DARK; ctx.fillRect(0, 0, W, H);
  const items = sh.items && sh.items.length ? sh.items : [sh.text];
  ctx.save(); ctx.font = '800 104px "Inter Tight"'; ctx.textBaseline = 'middle';
  const bw = 78, gap = 38, colW = Math.max(...items.map(s => ctx.measureText(s).width)) + bw + gap, x0 = (W - colW) / 2, y0 = H * .44 - (items.length - 1) * 85;
  items.forEach((it, i) => {
    const y = y0 + i * 170, k = clamp((t - .15 - i * .12) / .25); if (k <= 0) return; ctx.globalAlpha = k;
    ctx.strokeStyle = PAPER; ctx.lineWidth = 6; ctx.strokeRect(x0, y - bw / 2, bw, bw);
    ctx.fillStyle = PAPER; ctx.fillText(it, x0 + bw + gap, y + 4);
    const tk = clamp((t - .5 - i * .3) / .16); if (tk > 0) {  // the tick
      ctx.strokeStyle = INK; ctx.lineWidth = 13; ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath();
      const a = [x0 + 12, y + 2], b = [x0 + 30, y + 24], c2 = [x0 + bw + 14, y - bw / 2 - 18];
      ctx.moveTo(...a); if (tk < .4) ctx.lineTo(a[0] + (b[0] - a[0]) * tk / .4, a[1] + (b[1] - a[1]) * tk / .4);
      else { ctx.lineTo(...b); const f = (tk - .4) / .6; ctx.lineTo(b[0] + (c2[0] - b[0]) * f, b[1] + (c2[1] - b[1]) * f); } ctx.stroke();
    }
  });
  ctx.restore(); ctx.globalAlpha = 1;
  typed('FOR MORE', W / 2, y0 + items.length * 170 + 10, t - 1.3, 16, '500 50px "JB Mono"', PAPER);
  if (P.series) { typed(P.series.toUpperCase(), W / 2, y0 + items.length * 170 + 100, t - 1.75, 45, '500 32px "JB Mono"', INK); }
};
function drawLabel(text) {  // small honest tag: ILLUSTRATION / AI ILLUSTRATION
  ctx.save(); ctx.font = '500 24px "JB Mono"'; ctx.letterSpacing = '3px'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width; ctx.fillStyle = 'rgba(10,8,6,.7)'; ctx.fillRect(980 - tw - 20, 1478, tw + 30, 40);
  ctx.fillStyle = PAPER; ctx.fillText(text, 975, 1499); ctx.restore();
}
function drawMidCTA(T) {
  const m = P.cta_mid; if (!m || T < m.s || T > m.e) return;
  const k = Math.min(ease.out(clamp((T - m.s) / .3)), ease.out(clamp((m.e - T) / .3)));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 30); ctx.font = '500 32px "JB Mono"'; ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const text = m.text.toUpperCase(), tw = ctx.measureText(text).width;
  ctx.fillStyle = 'rgba(10,8,6,.82)'; ctx.fillRect(W / 2 - tw / 2 - 44, 1452, tw + 88, 62);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(W / 2 - tw / 2 - 18, 1483, 8, 0, 7); ctx.fill();
  ctx.fillStyle = PAPER; ctx.fillText(text, W / 2 + 10, 1484); ctx.restore();
}

async function renderFrame(f) {
  const T = f / FPS;
  ctx.fillStyle = DARK; ctx.fillRect(0, 0, W, H);
  const i = Math.max(0, P.shots.findIndex(s => T >= s.start && T < s.end) === -1 ? P.shots.length - 1 : P.shots.findIndex(s => T >= s.start && T < s.end));
  const sh = P.shots[i], lt = T - sh.start;
  for (const s2 of [sh, P.shots[i - 1]]) if (s2 && s2.kind === 'footage') s2._im = await footFrame(s2, Math.min(s2.frames - 1, Math.floor((T - s2.start) * FPS)));
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
  if (sh.kind !== 'outro') drawSeries(T); drawCaption(T); drawMidCTA(T);
  const out = P.dur - T; if (out < .6) { ctx.fillStyle = `rgba(0,0,0,${1 - out / .6})`; ctx.fillRect(0, 0, W, H); }
}
window.renderFrame = renderFrame; window.TOTAL_FRAMES = Math.round(P.dur * FPS);
window.grab = (q = .93) => cv.toDataURL('image/jpeg', q);
window.READY = load().then(() => true);
