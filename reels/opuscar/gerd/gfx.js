// Graphics package for the "Egypt: one river" studio edit. One palette, one type system, one set of motions:
//   numbers count up and settle; labels slide in on a leader; captions are clean, centred, no box.
export const W = 1920, H = 1080;
export const COL = { ink: '#0b0f12', text: '#f4f2ee', dim: 'rgba(244,242,238,.8)', amber: '#ffb547', teal: '#5ec4c0', blue: '#6f9ad8', sand: '#d8b98a', green: '#6f9f52', red: '#e86a4f' };
export const F = { num: '"Barlow Condensed"', lab: 'Barlow', mono: '"IBM Plex Mono"', serif: '"IBM Plex Serif"' };
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const pr = (t, a, b) => clamp((t - a) / (b - a));
export const eo = x => 1 - Math.pow(1 - clamp(x), 3);
export const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const lerp = (a, b, t) => a + (b - a) * t;
export const win = (t, a, b, f = .35) => pr(t, a, a + f) * (1 - pr(t, b - f, b));
export function text(g, s, x, y, font, col = COL.text, align = 'left', a = 1, shadow = true, track = 0) {
  if (a <= 0 || !s) return; g.save(); g.globalAlpha = Math.min(1, a); g.font = font; g.textAlign = align; g.textBaseline = 'alphabetic';
  if (track) g.letterSpacing = track + 'px';
  if (shadow) { g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 18; g.shadowOffsetY = 2; }
  g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
// a soft dark panel behind left-third numbers (not a box: a gradient that fades into the picture)
function panel(g, a) { g.save(); g.globalAlpha = a; const gr = g.createLinearGradient(0, 0, 900, 0); gr.addColorStop(0, 'rgba(8,11,14,.72)'); gr.addColorStop(1, 'rgba(8,11,14,0)'); g.fillStyle = gr; g.fillRect(0, 0, 900, H); g.restore(); }
// big number: counts from `from` to `to` in the first 0.9 s, label above, source below
export function counter(g, t, t0, t1, { to, from = 0, fmt = v => Math.round(v).toLocaleString('en-US'), label, sub, col = COL.amber, x = 120, y = 560, size = 190 }) {
  const a = win(t, t0, t1, .4); if (a <= 0) return;
  panel(g, a);
  const k = eo(pr(t, t0 + .1, t0 + 1.0)), v = lerp(from, to, k), dy = 30 * (1 - eo(pr(t, t0, t0 + .5)));
  text(g, label, x, y - size * .72 + dy, `600 34px ${F.lab}`, COL.text, 'left', a, true, 3);
  g.save(); g.fillStyle = col; g.globalAlpha = a; g.fillRect(x, y - size * .72 + 18 + dy, 90 * eo(pr(t, t0 + .1, t0 + .6)), 5); g.restore();
  text(g, fmt(v), x - 6, y + dy, `500 ${size}px ${F.num}`, col, 'left', a);
  if (sub) text(g, sub, x, y + 54 + dy, `400 26px ${F.mono}`, COL.dim, 'left', a);
}
// lower third: accent bar + title + meta, slides in from the left
export function lower(g, t, t0, t1, title, meta) {
  const a = win(t, t0, t1, .4); if (a <= 0) return; const dx = -40 * (1 - eo(pr(t, t0, t0 + .5)));
  g.save(); g.globalAlpha = a; g.fillStyle = COL.amber; g.fillRect(120 + dx, 742, 6, 62); g.restore();
  text(g, title, 146 + dx, 772, `600 36px ${F.lab}`, COL.text, 'left', a, true, 3);
  text(g, meta, 146 + dx, 806, `400 26px ${F.mono}`, COL.dim, 'left', a);
}
// chapter title: number + rule + title, over a moving shot
export function chapter(g, t, t0, t1, num, title) {
  const a = win(t, t0, t1, .5); if (a <= 0) return;
  g.save(); g.globalAlpha = a * .55; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore();
  const k = eo(pr(t, t0 + .2, t0 + 1.0));
  text(g, num, W / 2, 470, `500 40px ${F.mono}`, COL.amber, 'center', a, true, 8);
  g.save(); g.globalAlpha = a; g.fillStyle = COL.amber; g.fillRect(W / 2 - 160 * k, 500, 320 * k, 3); g.restore();
  text(g, title, W / 2, 610 + 20 * (1 - k), `500 104px ${F.num}`, COL.text, 'center', a * k, true, 2);
}
// subtitles: centred, two lines max, no box
export function subtitle(g, s, a) {
  if (!s || a <= 0) return; g.save(); g.font = `500 40px ${F.lab}`; const words = s.split(' '), rows = []; let cur = '';
  for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (g.measureText(tr).width > 1300 && cur) { rows.push(cur); cur = w; } else cur = tr; } rows.push(cur); g.restore();
  g.save(); g.globalAlpha = a; const top = 1000 - (rows.length - 1) * 50 - 70, gr = g.createLinearGradient(0, top, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.45, 'rgba(0,0,0,.5)'); gr.addColorStop(1, 'rgba(0,0,0,.62)'); g.fillStyle = gr; g.fillRect(0, top, W, H - top); g.restore();
  rows.forEach((r, i) => { g.save(); g.globalAlpha = a; g.font = `500 40px ${F.lab}`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.55)'; g.strokeText(r, W / 2, 1000 - (rows.length - 1 - i) * 50); g.restore(); text(g, r, W / 2, 1000 - (rows.length - 1 - i) * 50, `500 40px ${F.lab}`, COL.text, 'center', a, true); });
}
export function credit(g, s, a) { text(g, s, W - 40, H - 22, `400 18px ${F.mono}`, 'rgba(244,242,238,.55)', 'right', a, false); }
// full-screen photo with a slow move (cover fit; from/to = [centre x 0..1, centre y 0..1, zoom])
export function photo(g, im, t, t0, t1, from, to, a = 1) {
  if (!im || a <= 0) return; const u = eio(pr(t, t0, t1)), cx = lerp(from[0], to[0], u), cy = lerp(from[1], to[1], u), z = lerp(from[2], to[2], u);
  const ar = im.width / im.height, base = Math.max(W / im.width, H / im.height) * z, w = im.width * base, h = im.height * base;
  const x = clamp(W / 2 - cx * w, W - w, 0), y = clamp(H / 2 - cy * h, H - h, 0);
  g.save(); g.globalAlpha = a; g.drawImage(im, x, y, w, h);
  const v = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.restore();
}
export function bg(g, a = 1) {   // infographic backdrop: deep slate, faint grid, soft light
  g.save(); g.globalAlpha = a; g.fillStyle = '#10161b'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.035)'; g.lineWidth = 1; for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  const r = g.createRadialGradient(W * .6, H * .4, 50, W * .6, H * .4, W * .7); r.addColorStop(0, 'rgba(255,181,71,.07)'); r.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = r; g.fillRect(0, 0, W, H); g.restore();
}
