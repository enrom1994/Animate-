// paper-trail renderer: archive pages with slow camera moves, film grade, grain, red ink marks, typed stamps, captions.
// Deterministic: renderFrame(f) draws frame f from window.PLAN; window.READY resolves when images and fonts are loaded.
const P = window.PLAN, W = P.W || 1080, H = P.H || 1920, FPS = P.fps, WIDE = W > H;
// layout per format: portrait (Shorts, 1080x1920) or wide (long form, 1920x1080)
const L = WIDE ? { capY: 968, capW: 1500, capPx: 64, capLH: 76, stampY: 96, labelX: 1860, labelY: 1036, cardY: 470, cardPx: 120, cardW: 1500, quotePx: 112, mapFont: 36,
                   map: { x: 360, y: 150, w: 1200, h: 760 }, outroY: 400, ctaY: 860, clip: [.5, .46, .62, .8], series: 60 }
               : { capY: 1330, capW: 880, capPx: 84, capLH: 96, stampY: 345, labelX: 980, labelY: 1499, cardY: H * .45, cardPx: 150, cardW: 900, quotePx: 76, mapFont: 30,
                   map: { x: 90, y: 420, w: 900, h: 900 }, outroY: H * .44, ctaY: 1452, clip: [.5, .43, .8, .5], series: 238 };
const cv = Object.assign(document.getElementById('c'), { width: W, height: H }), ctx = cv.getContext('2d');
const G = Object.assign({ sepia: .38, contrast: 1.3, bright: .9, grain: .09, vignette: .75 }, P.grade || {});
const INK = '#c4161c', PAPER = '#efe6d2', DARK = '#0b0907';
const TAU = Math.PI * 2;
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
  await document.fonts.load('800 80px "Inter Tight"'); await document.fonts.load('500 40px "JB Mono"'); await document.fonts.load('600 60px Lora'); await document.fonts.load('500 48px Inter');
}
// grain frames + vignette, made once
const GRAIN = [...Array(8)].map((_, k) => {
  const c = mk(W / 3, H / 3), g = c.getContext('2d'), d = g.createImageData(W / 3, H / 3);
  for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (rnd(i * .37 + k * 9973) - .5) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); return c;
});
const VIG = (() => { const c = mk(W, H), g = c.getContext('2d'); const r = g.createRadialGradient(W / 2, H * .46, H * .22, W / 2, H * .5, H * .78);
  r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, `rgba(0,0,0,${G.vignette})`); g.fillStyle = r; g.fillRect(0, 0, W, H); return c; })();

// camera: a view box (normalized image coords) -> scale + centre that fits it in the frame
// [cx, cy, w, h] of the screen area a view is fitted into
function frameOf(sh) { return sh.frame || (sh.layout === 'clip' ? L.clip : [.5, .5, 1, 1]); }
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
  if (sh.kind && sh.kind !== 'page' && sh.kind !== 'photo') {
    if (sh.push) {  // slow camera push on a drawn shot: {x, y (0..1 of the frame), z, at, dur}
      const pu = sh.push, k = ease.inout(clamp((t - (pu.at || 0)) / (pu.dur || Math.max(1, sh.end - sh.start - (pu.at || 0))))), z = 1 + (pu.z - 1) * k;
      ctx.save(); ctx.translate(W * pu.x, H * pu.y); ctx.scale(z, z); ctx.translate(-W * pu.x, -H * pu.y); KINDS[sh.kind](sh, t); ctx.restore();
    } else KINDS[sh.kind](sh, t);
    if (sh.label) drawLabel(sh.label); return; }
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
  const full = ctx.measureText(text).width, x = (W - full) / 2, y = L.stampY;
  ctx.fillStyle = 'rgba(10,8,6,.78)'; ctx.fillRect(x - 28, y - 42, full + 56, 84);
  ctx.fillStyle = PAPER; ctx.fillText(text.slice(0, n), x, y + 2);
  if (n < text.length || Math.floor(t * 2) % 2 === 0) ctx.fillRect(x + ctx.measureText(text.slice(0, n)).width + 4, y - 20, 4, 40);
  ctx.restore();
}

function drawSeries(T) {
  if (!P.series || !P.series_label) return;
  ctx.save(); const g = ctx.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, 'rgba(6,5,4,.92)'); g.addColorStop(.55, 'rgba(6,5,4,.7)'); g.addColorStop(1, 'rgba(6,5,4,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 400); ctx.font = '500 26px "JB Mono"'; ctx.letterSpacing = '4px'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.globalAlpha = .85; ctx.fillStyle = PAPER; ctx.fillText(P.series.toUpperCase(), W / 2, L.series);
  ctx.fillStyle = INK; ctx.fillRect(W / 2 - 40, L.series + 24, 80, 4); ctx.restore();
}

function drawCaption(T) {
  const c = P.captions.find(c => T >= c.s && T < c.e); if (!c) return;
  const age = T - c.s, pop = 1 + .07 * (1 - ease.out(clamp(age / .12)));
  ctx.save(); ctx.font = `800 ${L.capPx}px "Inter Tight"`; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '1px';
  const sp = ctx.measureText(' ').width, ws = c.words.map(w => ({ ...w, wd: ctx.measureText(w.w).width }));
  const lines = [[]]; let lw = 0;
  for (const w of ws) { if (lw && lw + sp + w.wd > L.capW) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += (lw ? sp : 0) + w.wd; }
  const y0 = L.capY - (lines.length - 1) * L.capLH / 2;
  ctx.translate(W / 2, y0); ctx.scale(pop, pop); ctx.globalAlpha = clamp(age / .06);
  lines.forEach((Ln, li) => {
    const tw = Ln.reduce((a, w) => a + w.wd, 0) + sp * (Ln.length - 1); let x = -tw / 2; const y = li * L.capLH;
    for (const w of Ln) {
      ctx.lineJoin = 'round'; ctx.lineWidth = L.capPx / 6; ctx.strokeStyle = 'rgba(8,6,5,.95)'; ctx.strokeText(w.w, x, y);
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
  const quote = st === 'quote', px = quote ? L.quotePx : L.cardPx, font = quote ? `600 ${px}px Lora` : `800 ${px}px "Inter Tight"`;
  const text = quote ? '“' + sh.text + '”' : sh.text.toUpperCase(), maxW = quote ? L.cardW - 40 : L.cardW; ctx.font = font;
  const half = wrap(text, maxW).length * px * 1.05 / 2;  // measure the block so the rule and sub sit outside it
  stampText(text, W / 2, L.cardY, t - .15, font, st === 'number' ? INK : INKC, maxW);
  if (sh.sub) typed(sh.sub.toUpperCase(), W / 2, L.cardY + half + 70, t - .6, 28, '500 36px "JB Mono"', INKC);
  const k = clamp((t - .35) / .4); ctx.fillStyle = INK; ctx.fillRect(W / 2 - 160 * k, L.cardY - half - 60, 320 * k, 6);
};

// ---------- ink drawings for maps: a 1930s sedan (top view) and Union Station (front elevation) ----------
function inkLine(pts, close) { ctx.beginPath(); ctx.moveTo(...pts[0]); for (const q of pts.slice(1)) ctx.lineTo(...q); if (close) ctx.closePath(); ctx.stroke(); }
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function drawCar(d, t, X, Y, M) {
  // d: {x, y, w (length as a fraction of map width), face: 'right'|'left', at, occupants: [{seat, label, side, at}], driver: {label, at, x: true}}
  const Lp = d.w * M.w, Wp = Lp * .4, k = clamp((t - (d.at ?? .2)) / .6); if (k <= 0) return;
  ctx.save(); ctx.translate(X(d.x), Y(d.y)); if (d.face === 'left') ctx.scale(-1, 1);
  ctx.globalAlpha = k; ctx.strokeStyle = INKC; ctx.lineJoin = ctx.lineCap = 'round';
  const fx = Lp * .5, rx = -Lp * .5, hw = Wp / 2;
  // fenders: four rounded wheel arches that stick out past the body
  ctx.lineWidth = 4; ctx.fillStyle = '#d9cdb2';
  for (const [cx, sy] of [[Lp * .33, -1], [Lp * .33, 1], [-Lp * .3, -1], [-Lp * .3, 1]]) {
    ctx.beginPath(); ctx.ellipse(cx, sy * (hw - Wp * .04), Lp * .085, Wp * .15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  // running boards
  ctx.lineWidth = 3; for (const sy of [-1, 1]) inkLine([[-Lp * .19, sy * (hw + Wp * .1)], [Lp * .22, sy * (hw + Wp * .1)]]);
  // body: long hood in front, cabin, short trunk
  ctx.lineWidth = 5; ctx.fillStyle = '#e8dfc9';
  ctx.beginPath(); ctx.moveTo(rx + Lp * .05, -hw); ctx.lineTo(Lp * .12, -hw); ctx.quadraticCurveTo(Lp * .2, -hw * .78, Lp * .44, -hw * .62);
  ctx.quadraticCurveTo(fx, -hw * .55, fx, 0); ctx.quadraticCurveTo(fx, hw * .55, Lp * .44, hw * .62); ctx.quadraticCurveTo(Lp * .2, hw * .78, Lp * .12, hw);
  ctx.lineTo(rx + Lp * .05, hw); ctx.quadraticCurveTo(rx, hw, rx, 0); ctx.quadraticCurveTo(rx, -hw, rx + Lp * .05, -hw); ctx.closePath(); ctx.fill(); ctx.stroke();
  // hood louvres + centre seam + grille
  ctx.lineWidth = 2; inkLine([[Lp * .13, 0], [fx - Lp * .02, 0]]);
  for (let i = 0; i < 5; i++) { const x = Lp * (.22 + i * .04); inkLine([[x, -hw * .5], [x + Lp * .02, -hw * .5]]); inkLine([[x, hw * .5], [x + Lp * .02, hw * .5]]); }
  ctx.lineWidth = 4; inkLine([[fx - Lp * .012, -hw * .42], [fx - Lp * .012, hw * .42]]);
  // headlamps
  for (const sy of [-1, 1]) { ctx.beginPath(); ctx.arc(Lp * .43, sy * hw * .82, Wp * .07, 0, 7); ctx.stroke(); }
  // cabin roof with windscreen and rear window
  ctx.lineWidth = 3.5; rrect(-Lp * .3, -hw * .82, Lp * .42, hw * 1.64, Wp * .12); ctx.stroke();
  ctx.lineWidth = 2; inkLine([[Lp * .1, -hw * .7], [Lp * .1, hw * .7]]); inkLine([[-Lp * .27, -hw * .6], [-Lp * .27, hw * .6]]);
  // doors (seams) on each side
  for (const sy of [-1, 1]) { inkLine([[Lp * .02, sy * hw], [Lp * .02, sy * hw * .82]]); inkLine([[-Lp * .12, sy * hw], [-Lp * .12, sy * hw * .82]]); }
  // spare tyre on the back
  ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(rx - Lp * .025, 0, Lp * .035, Wp * .22, 0, 0, 7); ctx.fillStyle = '#cfc2a4'; ctx.fill(); ctx.stroke();
  // bench seats: front (with a split back) and rear
  ctx.lineWidth = 2.5; ctx.fillStyle = 'rgba(120,95,60,.18)';
  rrect(-Lp * .04, -hw * .74, Lp * .1, hw * 1.48, 8); ctx.fill(); ctx.stroke(); inkLine([[-Lp * .02, -hw * .7], [-Lp * .02, hw * .7]]);
  rrect(-Lp * .26, -hw * .74, Lp * .1, hw * 1.48, 8); ctx.fill(); ctx.stroke(); inkLine([[-Lp * .24, -hw * .7], [-Lp * .24, hw * .7]]);
  // steering wheel on the driver's (left = top) side
  ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(Lp * .075, -hw * .42, Lp * .012, Wp * .12, 0, 0, 7); ctx.stroke();
  ctx.restore();
  // occupants: a head in the seat, a leader line, a name outside the car (drawn unflipped so text reads)
  const flip = d.face === 'left' ? -1 : 1;
  const SEAT = { 'front-left': [.02, -.42], 'front-right': [.02, .42], 'rear-left': [-.2, -.5], 'rear-mid': [-.2, 0], 'rear-right': [-.2, .5] };
  for (const o of d.occupants || []) {
    const kk = clamp((t - (o.at ?? 1)) / .3); if (kk <= 0) continue; const [sx, sy] = SEAT[o.seat];
    const hx = X(d.x) + flip * sx * Lp, hy = Y(d.y) + sy * hw, side = o.side || (sy < 0 ? -1 : 1);
    ctx.save(); ctx.globalAlpha = kk; ctx.fillStyle = INKC; ctx.beginPath(); ctx.arc(hx, hy, Wp * .085, 0, 7); ctx.fill();
    const ly = Y(d.y) + side * (hw + Wp * .55) + (o.dy || 0), lx = hx + (o.dx || 0);
    ctx.strokeStyle = INKC; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); inkLine([[hx, hy + side * Wp * .1], [lx, ly - side * 22]]); ctx.setLineDash([]);
    ctx.font = '800 38px "Inter Tight"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.label.toUpperCase(), lx, ly);
    const tx = t - (o.x_at ?? 1e9); if (tx > 0) { const kx = ease.out(clamp(tx / .15)), r = Wp * .14 * (1.4 - .4 * kx);
      ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.globalAlpha = kx; ctx.setLineDash([]);
      inkLine([[hx - r, hy - r], [hx + r, hy + r]]); inkLine([[hx + r, hy - r], [hx - r, hy + r]]); ctx.globalAlpha = kk; ctx.fillStyle = INKC; }
    if (o.note) { ctx.font = `500 ${Math.round(L.mapFont * .8)}px "JB Mono"`; ctx.fillText(o.note.toUpperCase(), lx, ly + side * 40); }
    ctx.restore();
  }
  if (d.driver) {  // someone standing outside the driver's door
    const o = d.driver, kk = clamp((t - (o.at ?? 1)) / .3);
    if (kk > 0) { const hx = X(d.x) + flip * .02 * Lp, hy = Y(d.y) - hw - Wp * .32;
      ctx.save(); ctx.globalAlpha = kk; ctx.fillStyle = INKC; ctx.beginPath(); ctx.arc(hx, hy, Wp * .085, 0, 7); ctx.fill();
      ctx.font = '800 38px "Inter Tight"'; ctx.textAlign = flip > 0 ? 'left' : 'right'; ctx.textBaseline = 'middle'; ctx.fillText(o.label.toUpperCase(), hx + flip * Wp * .2, hy); ctx.restore();
      const tx = t - (o.x_at ?? 1e9); if (tx > 0) { const kx = ease.out(clamp(tx / .15)), r = Wp * .16 * (1.4 - .4 * kx);
        ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.globalAlpha = kx;
        inkLine([[hx - r, hy - r], [hx + r, hy + r]]); inkLine([[hx + r, hy - r], [hx - r, hy + r]]); ctx.restore(); } }
  }
}
function drawStation(d, t, X, Y, M) {  // Union Station, Kansas City: central hall with three great arched windows, long wings
  const w = d.w * M.w, h = w * .3, x0 = X(d.x) - w / 2, yb = Y(d.y), k = clamp((t - (d.at ?? .1)) / .8); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = INKC; ctx.fillStyle = '#e8dfc9'; ctx.lineJoin = 'round';
  const cw = w * .36, cx0 = X(d.x) - cw / 2, ch = h, wh = h * .55;
  ctx.lineWidth = 4;
  ctx.fillRect(x0, yb - wh, w, wh); ctx.strokeRect(x0, yb - wh, w, wh);                    // wings
  ctx.fillRect(cx0, yb - ch, cw, ch); ctx.strokeRect(cx0, yb - ch, cw, ch);                // central hall
  ctx.lineWidth = 3; inkLine([[cx0 - 10, yb - ch], [cx0 + cw + 10, yb - ch]]); inkLine([[cx0 - 6, yb - ch + 12], [cx0 + cw + 6, yb - ch + 12]]);  // cornice
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {                                                             // the three arches
    const aw = cw * .2, ax = cx0 + cw * (.14 + i * .29), top = yb - ch * .78, r = aw / 2;
    ctx.beginPath(); ctx.moveTo(ax, yb - 6); ctx.lineTo(ax, top + r); ctx.arc(ax + r, top + r, r, Math.PI, 0); ctx.lineTo(ax + aw, yb - 6); ctx.stroke();
    ctx.lineWidth = 1.5; for (let g = 1; g < 4; g++) inkLine([[ax, top + r + (yb - top - r) * g / 4], [ax + aw, top + r + (yb - top - r) * g / 4]]); inkLine([[ax + r, top], [ax + r, yb - 6]]); ctx.lineWidth = 3;
  }
  ctx.lineWidth = 1.8;                                                                       // wing windows
  for (const [a, b] of [[x0, cx0], [cx0 + cw, x0 + w]]) { const n = Math.floor((b - a) / 34);
    for (let i = 0; i < n; i++) for (let r = 0; r < 2; r++) ctx.strokeRect(a + 12 + i * (b - a - 24) / n, yb - wh + 14 + r * wh * .42, (b - a - 24) / n - 12, wh * .26); }
  ctx.lineWidth = 4; inkLine([[x0 - 40, yb], [x0 + w + 40, yb]]);                          // ground line
  if (d.label) { ctx.font = `500 ${L.mapFont}px "JB Mono"`; ctx.fillStyle = INKC; ctx.textAlign = 'center'; ctx.letterSpacing = '4px'; ctx.fillText(d.label.toUpperCase(), X(d.x), yb - ch - 34); }
  ctx.restore();
}

function drawPrison(d, t, X, Y, M) {  // Leavenworth: a long cellhouse front with a big central dome, a wall and a gate
  const w = d.w * M.w, x0 = X(d.x) - w / 2, yb = Y(d.y), h = w * .22, k = clamp((t - (d.at ?? .1)) / .8); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = INKC; ctx.fillStyle = '#e8dfc9'; ctx.lineJoin = 'round';
  const bw = w * .8, bx = X(d.x) - bw / 2, bh = h * .62, dw = w * .2;
  ctx.lineWidth = 4; ctx.fillRect(bx, yb - h * .3 - bh, bw, bh); ctx.strokeRect(bx, yb - h * .3 - bh, bw, bh);   // cellhouse
  const dcx = X(d.x), dtop = yb - h * .3 - bh;                                                                     // drum + dome
  ctx.fillRect(dcx - dw / 2, dtop - h * .28, dw, h * .28); ctx.strokeRect(dcx - dw / 2, dtop - h * .28, dw, h * .28);
  ctx.beginPath(); ctx.ellipse(dcx, dtop - h * .28, dw / 2, h * .42, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 2; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.ellipse(dcx, dtop - h * .28, dw / 2 * i / 6, h * .42, 0, Math.PI, 0); ctx.stroke(); }
  ctx.fillRect(dcx - 8, dtop - h * .28 - h * .42 - 26, 16, 26); ctx.strokeRect(dcx - 8, dtop - h * .28 - h * .42 - 26, 16, 26);   // lantern
  ctx.lineWidth = 1.6; const rows = 3, cols = Math.floor(bw / 30);                                                  // cell windows
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const wx = bx + 10 + c * (bw - 20) / cols, wy = dtop + 12 + r * bh / rows;
    if (Math.abs(wx - dcx) < dw / 2 + 6) continue; ctx.strokeRect(wx, wy, (bw - 20) / cols - 12, bh / rows - 22); }
  ctx.lineWidth = 5; const wallY = yb - h * .3, gw = w * .08;                                                       // wall with a gate
  ctx.fillStyle = '#d9cdb2'; ctx.fillRect(x0, wallY, w / 2 - gw / 2, h * .3); ctx.strokeRect(x0, wallY, w / 2 - gw / 2, h * .3);
  ctx.fillRect(X(d.x) + gw / 2, wallY, w / 2 - gw / 2, h * .3); ctx.strokeRect(X(d.x) + gw / 2, wallY, w / 2 - gw / 2, h * .3);
  ctx.lineWidth = 2; for (let gx = X(d.x) - gw / 2 + 8; gx < X(d.x) + gw / 2; gx += 12) inkLine([[gx, wallY], [gx, yb]]);  // gate bars
  ctx.lineWidth = 4; inkLine([[x0 - 30, yb], [x0 + w + 30, yb]]);
  if (d.label) { ctx.font = `500 ${L.mapFont}px "JB Mono"`; ctx.fillStyle = INKC; ctx.textAlign = 'center'; ctx.letterSpacing = '4px'; ctx.fillText(d.label.toUpperCase(), X(d.x), yb + 50); }
  ctx.restore();
}
function drawFigure(d, t, X, Y, M) {  // one small person walking along a path [[x,y],...] between at and at+dur
  const k = clamp((t - (d.at ?? .5)) / (d.dur || 3)), P_ = d.path; if (t < (d.at ?? .5)) return;
  let Lt = 0; const seg = []; for (let i = 1; i < P_.length; i++) { const l = Math.hypot(X(P_[i][0]) - X(P_[i - 1][0]), Y(P_[i][1]) - Y(P_[i - 1][1])); seg.push(l); Lt += l; }
  let left = Lt * ease.inout(k), x = X(P_[0][0]), y = Y(P_[0][1]);
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.setLineDash([10, 12]); ctx.beginPath(); ctx.moveTo(x, y);
  for (let i = 1; i < P_.length && left > 0; i++) { const f = Math.min(1, left / seg[i - 1]); x = X(P_[i - 1][0]) + (X(P_[i][0]) - X(P_[i - 1][0])) * f; y = Y(P_[i - 1][1]) + (Y(P_[i][1]) - Y(P_[i - 1][1])) * f; ctx.lineTo(x, y); left -= seg[i - 1]; }
  ctx.stroke(); ctx.setLineDash([]);
  const s = (d.size || 1) * 26, step = Math.sin(t * 9) * .35;  // the walker
  ctx.fillStyle = INKC; ctx.strokeStyle = INKC; ctx.lineCap = 'round'; ctx.lineWidth = s * .28;
  ctx.beginPath(); ctx.arc(x, y - s * 2.2, s * .42, 0, 7); ctx.fill();
  inkLine([[x, y - s * 1.75], [x, y - s * .9]]); inkLine([[x, y - s * .9], [x - s * step, y]]); inkLine([[x, y - s * .9], [x + s * step, y]]);
  inkLine([[x, y - s * 1.55], [x + s * step * .8, y - s * 1.05]]); inkLine([[x, y - s * 1.55], [x - s * step * .8, y - s * 1.05]]);
  if (d.label) { ctx.font = '800 36px "Inter Tight"'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(d.label.toUpperCase(), x + s * .9, y - s * 2.2); }
  ctx.restore();
}
function drawRoutes(sh, t, X, Y) {  // several routes: style car (dashed), rail (track with ties), plan (faint dotted: never happened)
  for (const r of sh.routes || []) {
    const t0 = r.at ?? .6, k = ease.inout(clamp((t - t0) / (r.dur || 1.6))); if (k <= 0) continue;
    const P_ = r.pts; let Lt = 0; const seg = []; for (let i = 1; i < P_.length; i++) { const l = Math.hypot(X(P_[i][0]) - X(P_[i - 1][0]), Y(P_[i][1]) - Y(P_[i - 1][1])); seg.push(l); Lt += l; }
    const pts = [[X(P_[0][0]), Y(P_[0][1])]]; let left = Lt * k;
    for (let i = 1; i < P_.length && left > 0; i++) { const f = Math.min(1, left / seg[i - 1]); pts.push([X(P_[i - 1][0]) + (X(P_[i][0]) - X(P_[i - 1][0])) * f, Y(P_[i - 1][1]) + (Y(P_[i][1]) - Y(P_[i - 1][1])) * f]); left -= seg[i - 1]; }
    ctx.save(); ctx.lineCap = 'round';
    if (r.style === 'rail') {
      ctx.strokeStyle = INKC; ctx.lineWidth = 3; for (const off of [-7, 7]) { ctx.beginPath(); pts.forEach((p, i) => { const q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)]; const dx = q[0] - o[0], dy = q[1] - o[1], n = Math.hypot(dx, dy) || 1; const xx = p[0] - dy / n * off, yy = p[1] + dx / n * off; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }); ctx.stroke(); }
      ctx.lineWidth = 2; for (let i = 1; i < pts.length; i++) { const [a, b] = [pts[i - 1], pts[i]], l = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let u = 0; u < l; u += 16) { const px = a[0] + (b[0] - a[0]) * u / l, py = a[1] + (b[1] - a[1]) * u / l, nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l; inkLine([[px - nx * 12, py - ny * 12], [px + nx * 12, py + ny * 12]]); } }
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.globalAlpha = .55; ctx.stroke();
    } else { ctx.strokeStyle = r.style === 'plan' ? 'rgba(29,23,18,.45)' : INK; ctx.lineWidth = r.style === 'plan' ? 4 : 8; ctx.setLineDash(r.style === 'plan' ? [4, 12] : [24, 14]);
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke(); }
    if (r.label && k > .6) { ctx.globalAlpha = clamp((k - .6) / .3); ctx.font = `500 ${Math.round(L.mapFont * .85)}px "JB Mono"`; ctx.fillStyle = INKC; ctx.textAlign = 'center'; const m = pts.length === 2 ? [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2] : pts[Math.floor(pts.length / 2)]; ctx.fillText(r.label.toUpperCase(), m[0] + (r.lx || 0), m[1] + (r.ly || -24)); }
    ctx.restore();
  }
}
// minimal timeline (the minimalistic-graphics look: pure black, white hairlines, one solid dot, one quiet lowercase line)
KINDS.timeline = (sh, t) => {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const [y0, y1] = sh.span, ax = W * .1, bx = W * .9, ay = H * (WIDE ? .55 : .5), X_ = yr => ax + (yr - y0) / (y1 - y0) * (bx - ax);
  const k = ease.inout(clamp((t - .3) / .9));
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + (bx - ax) * k, ay); ctx.stroke();
  ctx.font = '500 30px "JB Mono"'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.75)';
  for (let yr = Math.ceil(y0); yr <= y1; yr++) { const x = X_(yr); if (x > ax + (bx - ax) * k) break; const big = (sh.years || []).includes(yr);
    ctx.beginPath(); ctx.moveTo(x, ay - (big ? 18 : 8)); ctx.lineTo(x, ay + (big ? 18 : 8)); ctx.stroke(); if (big) ctx.fillText(String(yr), x, ay + 64); }
  if (sh.move) {  // one solid white dot travels from year a to year b
    const [a, b] = sh.move, m = ease.inout(clamp((t - (sh.move_at ?? 1.0)) / (sh.move_dur ?? Math.max(1, sh.end - sh.start - 2.2)))), x = X_(a + (b - a) * m);
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X_(a), ay); ctx.lineTo(x, ay); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, ay, 15, 0, 7); ctx.fill();
  }
  for (const e of sh.events || []) {  // dots that appear, then go out (hollow, red ring) on cue
    const kin = clamp((t - (e.at ?? 1)) / .35); if (kin <= 0) continue; const x = X_(e.year), out = clamp((t - (e.out_at ?? 1e9)) / .4);
    ctx.globalAlpha = kin; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, ay, 15 * (1 - out), 0, 7); ctx.fill();
    if (out > 0) { ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, ay, 15 + 10 * out, 0, 7); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.font = '800 40px "Inter Tight"'; ctx.fillText(e.label.toUpperCase(), x, ay - 60);
    if (e.sub) { ctx.font = '500 26px "JB Mono"'; ctx.fillStyle = out > 0 ? '#e0473c' : 'rgba(255,255,255,.7)'; ctx.fillText(e.sub.toUpperCase(), x, ay - 105); }
    ctx.globalAlpha = 1;
  }
  if (sh.text) { const n = Math.floor(clamp((t - .6) / 1.2) * sh.text.length); ctx.font = '500 48px Inter'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(sh.text.toLowerCase().slice(0, n), W / 2, H * (WIDE ? .3 : .35)); }
  ctx.restore();
};

function drawApollo(d, t, X, Y, M) {  // side view: command module (cone) + service module (cylinder) docked nose-to-nose with the lunar module
  const w = d.w * M.w, x0 = X(d.x) - w / 2, cy = Y(d.y), k = clamp((t - (d.at ?? .1)) / .7); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = INKC; ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.fillStyle = '#e8dfc9';
  const smW = w * .36, smH = w * .2, cmW = w * .14, nz = w * .05;
  const smX = x0, cmX = x0 + smW;
  ctx.beginPath(); ctx.moveTo(smX - w * .05, cy - smH * .28); ctx.lineTo(smX, cy - smH * .38); ctx.lineTo(smX, cy + smH * .38); ctx.lineTo(smX - w * .05, cy + smH * .28); ctx.closePath(); ctx.fill(); ctx.stroke();  // engine bell
  ctx.fillRect(smX, cy - smH / 2, smW, smH); ctx.strokeRect(smX, cy - smH / 2, smW, smH);                          // service module
  ctx.lineWidth = 2; for (let i = 1; i < 6; i++) inkLine([[smX + smW * i / 6, cy - smH / 2], [smX + smW * i / 6, cy + smH / 2]]); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(cmX, cy - smH / 2); ctx.lineTo(cmX + cmW, cy - smH * .12); ctx.lineTo(cmX + cmW, cy + smH * .12); ctx.lineTo(cmX, cy + smH / 2); ctx.closePath(); ctx.fill(); ctx.stroke();   // command module
  ctx.fillRect(cmX + cmW, cy - smH * .07, nz, smH * .14); ctx.strokeRect(cmX + cmW, cy - smH * .07, nz, smH * .14);     // docking tunnel
  const lx = cmX + cmW + nz, lw = w * .26, lh = w * .3;                                                               // lunar module: ascent stage + gold descent stage + legs
  ctx.beginPath(); ctx.moveTo(lx, cy - lh * .22); ctx.lineTo(lx + lw * .38, cy - lh * .3); ctx.lineTo(lx + lw * .38, cy + lh * .3); ctx.lineTo(lx, cy + lh * .22); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#d8b25a'; ctx.fillRect(lx + lw * .38, cy - lh * .34, lw * .38, lh * .68); ctx.strokeRect(lx + lw * .38, cy - lh * .34, lw * .38, lh * .68);
  for (const sy of [-1, 1]) { inkLine([[lx + lw * .76, cy + sy * lh * .3], [lx + lw * 1.0, cy + sy * lh * .5]]); inkLine([[lx + lw * .96, cy + sy * lh * .5], [lx + lw * 1.04, cy + sy * lh * .5]]); }
  ctx.font = `800 ${Math.round(L.mapFont * 1.05)}px "Inter Tight"`; ctx.fillStyle = INKC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('ODYSSEY', cmX + cmW * .4, cy - smH * .95); ctx.fillText('AQUARIUS', lx + lw * .45, cy - lh * .62);
  ctx.font = `500 ${Math.round(L.mapFont * .8)}px "JB Mono"`; ctx.fillText('SERVICE MODULE', smX + smW / 2, cy + smH * .85);
  const bt = t - (d.burst_at ?? 1e9); if (bt > 0) {  // the oxygen tank bursts: a red ink star, a puff of gas, debris
    const bk = ease.out(clamp(bt / .25)), bx = smX + smW * .55, by = cy - smH * .25;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(.2); ctx.beginPath();
    for (let i = 0; i < 18; i++) { const r = (i % 2 ? .45 : 1) * smH * .55 * bk; ctx.lineTo(Math.cos(i / 18 * TAU) * r, Math.sin(i / 18 * TAU) * r); }
    ctx.closePath(); ctx.fillStyle = 'rgba(196,22,28,.85)'; ctx.fill(); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 3; for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .35, r0 = smH * .5, r1 = r0 + Math.min(bt, .5) * 160; inkLine([[bx + Math.cos(a) * r0, by + Math.sin(a) * r0], [bx + Math.cos(a) * r1, by + Math.sin(a) * r1]]); }
  }
  ctx.restore();
}
function drawPeg(d, t, X, Y, M) {  // a square filter that will not go into a round socket
  const k = clamp((t - (d.at ?? .2)) / .5); if (k <= 0) return; const s = d.w * M.w, cx = X(d.x), cy = Y(d.y);
  ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = INKC; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(cx, cy + s * .45, s * .28, 0, TAU); ctx.fillStyle = '#2a2420'; ctx.fill(); ctx.stroke();                  // round socket
  const drop = ease.inout(clamp((t - (d.at ?? .2) - .4) / .8)), jig = Math.sin(t * 30) * 6 * clamp((t - (d.at ?? .2) - 1.2) / .2) * (1 - clamp((t - (d.at ?? .2) - 2.2) / .3));
  const py = cy - s * .2 + drop * s * .32;
  ctx.save(); ctx.translate(cx + jig, py); ctx.rotate(jig * .004); ctx.fillStyle = '#e8dfc9'; ctx.fillRect(-s * .3, -s * .3, s * .6, s * .6); ctx.strokeRect(-s * .3, -s * .3, s * .6, s * .6);
  ctx.lineWidth = 2; for (let i = 1; i < 6; i++) inkLine([[-s * .3, -s * .3 + i * s * .1], [s * .3, -s * .3 + i * s * .1]]); ctx.restore();
  ctx.font = `800 ${Math.round(L.mapFont * 1.1)}px "Inter Tight"`; ctx.fillStyle = INKC; ctx.textAlign = 'center';
  ctx.fillText('COMMAND MODULE FILTER', cx, cy - s * .62); ctx.fillText('LUNAR MODULE SOCKET', cx, cy + s * .9);
  const xk = t - (d.x_at ?? 1e9); if (xk > 0) { const a = ease.out(clamp(xk / .15)), r = s * .2 * (1.4 - .4 * a); ctx.strokeStyle = INK; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.globalAlpha = a;
    inkLine([[cx + s * .42 - r, cy - r], [cx + s * .42 + r, cy + r]]); inkLine([[cx + s * .42 + r, cy - r], [cx + s * .42 - r, cy + r]]); }
  ctx.restore();
}
function drawPlanet(d, t, X, Y, M) {  // a body in ink: Earth (blue wash) or Moon (grey with craters)
  const k = clamp((t - (d.at ?? .1)) / .5); if (k <= 0) return; const r = d.r * M.w, cx = X(d.x), cy = Y(d.y);
  ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = INKC; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = d.body === 'earth' ? '#9fb7c9' : '#cfc6b4'; ctx.fill(); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip(); ctx.lineWidth = 2;
  if (d.body === 'earth') { ctx.fillStyle = '#c2b48a'; for (const [a, b, c] of [[-.3, -.2, .45], [.35, .25, .35], [-.1, .45, .25]]) { ctx.beginPath(); ctx.ellipse(cx + a * r, cy + b * r, c * r, c * r * .6, a, 0, TAU); ctx.fill(); ctx.stroke(); } }
  else for (const [a, b, c] of [[-.35, -.25, .18], [.3, .1, .24], [-.05, .45, .12], [.4, -.4, .1]]) { ctx.beginPath(); ctx.arc(cx + a * r, cy + b * r, c * r, 0, TAU); ctx.stroke(); }
  ctx.restore();
  if (d.label) { ctx.font = `800 ${Math.round(L.mapFont * 1.1)}px "Inter Tight"`; ctx.fillStyle = INKC; ctx.textAlign = 'center'; ctx.fillText(d.label.toUpperCase(), cx, cy + r + L.mapFont * 1.4); }
  ctx.restore();
}
KINDS.map = (sh, t) => {  // ink diagram: blocks [x0,y0,x1,y1,label], points [{x,y,label}], route [[x,y]...], xs [{x,y,at}]
  paper(t, sh);
  const M = L.map, X = x => M.x + x * M.w, Y = y => M.y + y * M.h;  // map area inside the safe zone, above the captions
  ctx.save(); ctx.strokeStyle = INKC; ctx.fillStyle = INKC; ctx.lineWidth = 4;
  const draw = clamp(t / .9);
  for (const [i, b] of (sh.blocks || []).entries()) {
    const at = b[5] && b[5].at; const k = at != null ? clamp((t - at) / .35) : clamp(draw * 1.6 - i * .15); if (k <= 0) continue; ctx.globalAlpha = k;
    ctx.strokeRect(X(b[0]), Y(b[1]), (b[2] - b[0]) * M.w, (b[3] - b[1]) * M.h);
    ctx.save(); ctx.beginPath(); ctx.rect(X(b[0]), Y(b[1]), (b[2] - b[0]) * M.w, (b[3] - b[1]) * M.h); ctx.clip(); ctx.lineWidth = 1.5; ctx.globalAlpha = .35 * k;
    for (let h = -M.h; h < M.w; h += 18) { ctx.beginPath(); ctx.moveTo(X(b[0]) + h, Y(b[1])); ctx.lineTo(X(b[0]) + h + 600, Y(b[1]) + 600); ctx.stroke(); }
    ctx.restore();
    if (b[4]) { ctx.globalAlpha = k; ctx.font = `500 ${L.mapFont}px "JB Mono"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = INKC;
      const tw = ctx.measureText(b[4]).width; ctx.fillStyle = '#e6dcc4'; ctx.fillRect((X(b[0]) + X(b[2])) / 2 - tw / 2 - 10, (Y(b[1]) + Y(b[3])) / 2 - L.mapFont * .75, tw + 20, L.mapFont * 1.5);
      ctx.fillStyle = INKC; ctx.fillText(b[4], (X(b[0]) + X(b[2])) / 2, (Y(b[1]) + Y(b[3])) / 2); }
  }
  ctx.globalAlpha = 1;
  for (const d of sh.drawings || []) ({ car: drawCar, station: drawStation, prison: drawPrison, figure: drawFigure, apollo: drawApollo, peg: drawPeg, planet: drawPlanet }[d.type])(d, t, X, Y, M);
  drawRoutes(sh, t, X, Y);
  const R = sh.route || []; if (R.length > 1) {  // red route draws itself
    const k = ease.inout(clamp((t - .6) / Math.max(.8, (sh.end - sh.start) * .55))); let L = 0; const seg = [];
    for (let i = 1; i < R.length; i++) { const d = Math.hypot(X(R[i][0]) - X(R[i - 1][0]), Y(R[i][1]) - Y(R[i - 1][1])); seg.push(d); L += d; }
    ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.setLineDash([26, 16]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X(R[0][0]), Y(R[0][1]));
    let left = L * k; for (let i = 1; i < R.length && left > 0; i++) { const f = Math.min(1, left / seg[i - 1]); ctx.lineTo(X(R[i - 1][0]) + (X(R[i][0]) - X(R[i - 1][0])) * f, Y(R[i - 1][1]) + (Y(R[i][1]) - Y(R[i - 1][1])) * f); left -= seg[i - 1]; }
    ctx.stroke(); ctx.setLineDash([]);
  }
  for (const [i, p] of (sh.points || []).entries()) {
    const k = clamp((t - (p.at ?? .3 + i * .25)) / .3); if (k <= 0) continue; ctx.globalAlpha = k;
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
  if (sh.title) typed(sh.title.toUpperCase(), W / 2, L.stampY, t - .1, 30, '500 40px "JB Mono"', INKC);
};

KINDS.chapter = (sh, t) => {  // section title: a slow push on a dark blurred page, PART label stamped, headline typed, place/date typed
  const span = sh.end - sh.start;
  if (sh.img && IMG[sh.img]) { const z = 1.04 + .06 * clamp(t / span); ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.globalAlpha = .9; ctx.drawImage(IMG[sh.img].bg, -W / 2, -H / 2, W, H); ctx.restore(); }
  else { ctx.fillStyle = DARK; ctx.fillRect(0, 0, W, H); }
  const cy = H * .46;
  if (sh.part) { ctx.save(); ctx.font = '500 44px "JB Mono"'; ctx.letterSpacing = '12px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const k = ease.out(clamp((t - .5) / .2)); ctx.globalAlpha = k; ctx.fillStyle = '#e0473c'; ctx.fillText(sh.part.toUpperCase(), W / 2, cy - (WIDE ? 130 : 180)); ctx.restore(); }
  const head = (sh.text || '').toUpperCase(), n = Math.floor(clamp((t - 1.0) / Math.max(.6, head.length * .07)) * head.length);
  if (n > 0) { ctx.save(); ctx.font = `800 ${WIDE ? 120 : 112}px "Inter Tight"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = PAPER;
    const lines = wrap(head, WIDE ? 1600 : 920); let used = 0;
    lines.forEach((ln, i) => { const m = Math.max(0, Math.min(ln.length, n - used)); used += ln.length + 1; if (m) ctx.fillText(ln.slice(0, m), W / 2, cy + (i - (lines.length - 1) / 2) * 128); });
    ctx.restore(); }
  const k = ease.inout(clamp((t - 1.0 - head.length * .07) / .5)); ctx.fillStyle = INK; ctx.fillRect(W / 2 - 220 * k, cy + (WIDE ? 95 : 150), 440 * k, 5);
  if (sh.sub) typed(sh.sub.toUpperCase(), W / 2, cy + (WIDE ? 160 : 220), t - 1.4 - head.length * .07, 26, '500 40px "JB Mono"', PAPER);
};
const FOOT = {};  // footage frames, loaded on demand
function footFrame(sh, i) {
  const key = sh.img + ':' + i; if (FOOT[key]) return Promise.resolve(FOOT[key]);
  return new Promise(res => { const im = new Image(); im.onload = () => { FOOT[key] = im; res(im); }; im.onerror = () => res(null);
    im.src = `/reel/build/frames/${sh.img}/${String(i + 1).padStart(5, '0')}.jpg`; });
}
KINDS.footage = (sh, t) => {
  const im = sh._im; ctx.fillStyle = DARK; ctx.fillRect(0, 0, W, H); if (!im) return;
  const push = 1 + .05 * clamp(t / (sh.end - sh.start)), grade = `grayscale(1) sepia(${G.sepia}) contrast(${G.contrast}) brightness(${G.bright})`;
  const wideInTall = im.width / im.height > (W / H) * 1.25;  // 4:3 or 16:9 film in a vertical frame: cropping would zoom it ~2.5x
  if (!wideInTall || sh.fill) {
    const s = Math.max(W / im.width, H / im.height) * push;
    ctx.save(); ctx.filter = grade; ctx.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2, im.width * s, im.height * s); ctx.restore(); return;
  }
  // a full-width print of the film over a dark, blurred copy of itself
  const sb = Math.max(W / im.width, H / im.height) * 1.1;
  ctx.save(); ctx.filter = `${grade} blur(24px) brightness(.4)`; ctx.drawImage(im, (W - im.width * sb) / 2, (H - im.height * sb) / 2, im.width * sb, im.height * sb); ctx.restore();
  const s = W * .94 / im.width * push, w = im.width * s, h = im.height * s, x = (W - w) / 2, y = H * .42 - h / 2;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 16; ctx.fillStyle = '#0b0907'; ctx.fillRect(x, y, w, h); ctx.restore();
  ctx.save(); ctx.filter = grade; ctx.drawImage(im, x, y, w, h); ctx.restore();
};
KINDS.outro = (sh, t) => {  // case-file checklist: each box gets a red tick
  ctx.drawImage(VIG, 0, 0); ctx.fillStyle = DARK; ctx.fillRect(0, 0, W, H);
  const items = sh.items && sh.items.length ? sh.items : [sh.text];
  ctx.save(); ctx.font = '800 104px "Inter Tight"'; ctx.textBaseline = 'middle';
  const bw = 78, gap = 38, colW = Math.max(...items.map(s => ctx.measureText(s).width)) + bw + gap, x0 = (W - colW) / 2, y0 = L.outroY - (items.length - 1) * 85;
  items.forEach((it, i) => {
    const y = y0 + i * 170, k = clamp((t - .15 - i * .12) / .25); if (k <= 0) return; ctx.globalAlpha = k;
    ctx.strokeStyle = PAPER; ctx.lineWidth = 6; ctx.strokeRect(x0, y - bw / 2, bw, bw);
    ctx.fillStyle = PAPER; ctx.fillText(it, x0 + bw + gap, y + 4);
    const tk = clamp((t - sh.ticks[i]) / .16); if (tk > 0) {  // the tick
      ctx.strokeStyle = INK; ctx.lineWidth = 13; ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath();
      const a = [x0 + 12, y + 2], b = [x0 + 30, y + 24], c2 = [x0 + bw + 14, y - bw / 2 - 18];
      ctx.moveTo(...a); if (tk < .4) ctx.lineTo(a[0] + (b[0] - a[0]) * tk / .4, a[1] + (b[1] - a[1]) * tk / .4);
      else { ctx.lineTo(...b); const f = (tk - .4) / .6; ctx.lineTo(b[0] + (c2[0] - b[0]) * f, b[1] + (c2[1] - b[1]) * f); } ctx.stroke();
    }
  });
  ctx.restore(); ctx.globalAlpha = 1;
  typed('FOR MORE', W / 2, y0 + items.length * 170 + 10, t - sh.more_t, 16, '500 50px "JB Mono"', PAPER);
  if (P.series && P.series_label) { typed(P.series.toUpperCase(), W / 2, y0 + items.length * 170 + 100, t - sh.more_t - .45, 45, '500 32px "JB Mono"', INK); }
};
function drawLabel(text) {  // small honest tag: ILLUSTRATION / AI ILLUSTRATION
  ctx.save(); ctx.font = '500 24px "JB Mono"'; ctx.letterSpacing = '3px'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width; ctx.fillStyle = 'rgba(10,8,6,.7)'; ctx.fillRect(L.labelX - tw - 20, L.labelY - 21, tw + 30, 40);
  ctx.fillStyle = PAPER; ctx.fillText(text, L.labelX - 5, L.labelY); ctx.restore();
}
function drawMidCTA(T) {
  const m = P.cta_mid; if (!m || T < m.s || T > m.e) return;
  const k = Math.min(ease.out(clamp((T - m.s) / .3)), ease.out(clamp((m.e - T) / .3)));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 30); ctx.font = '500 32px "JB Mono"'; ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const text = m.text.toUpperCase(), tw = ctx.measureText(text).width;
  ctx.fillStyle = 'rgba(10,8,6,.82)'; ctx.fillRect(W / 2 - tw / 2 - 44, L.ctaY, tw + 88, 62);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(W / 2 - tw / 2 - 18, L.ctaY + 31, 8, 0, 7); ctx.fill();
  ctx.fillStyle = PAPER; ctx.fillText(text, W / 2 + 10, L.ctaY + 32); ctx.restore();
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
