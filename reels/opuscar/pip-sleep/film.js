// "Why Do Cats Sleep So Much?" — one tall crayon page, one day: morning naps → why → listening → sunset zoomies → the night wash reveals the dream.
// World page 2160 × 5000 (full width at CAM.s = 0.5). Screen 1080 × 1920.
import { layer, clear, line, fill, dab, text, handCircle, ellipse, CAM, BOIL, W, H, sx, sy } from './crayon.js';
import { group, clearGroup, part, tube, curve } from './rig.js';
import { cat, mouse, pip } from './chars.js';
import { PAL } from './pal.js';
import { clamp, lerp, hash, track, mulberry } from '/core/lib.js';
const K = PAL.crayon;
const pr = (t, a, b) => clamp((t - a) / (b - a));
export const DUR = 56.5;

// —— narration (t = start, d = spoken length, from voices/durations.json); printed words hold ≥ 1.8 s and ≥ speech + 0.6 s ——
export const LINES = [
  { id: 'n01', t: 1.2, d: 2.864, text: "This is my cat, Biscuit. She's asleep. Again." },
  { id: 'n02', t: 5.0, d: 4.134, text: 'Asleep on the sofa. Asleep in the sun. Asleep in my sock drawer!' },
  { id: 'n03', t: 10.2, d: 2.548, text: 'Cats sleep about 12 to 16 hours a day.' },
  { id: 'n04', t: 15.4, d: 1.81, text: "That's half the day, or even more!" },
  { id: 'n05', t: 18.4, d: 4.2, text: 'Why so sleepy? Long ago, wild cats had to hunt for every meal.' },
  { id: 'n06', t: 23.1, d: 2.445, text: 'Running and pouncing takes lots of energy.' },
  { id: 'n07', t: 26.6, d: 3.068, text: 'So cats rest a lot, and save it for the big moments.' },
  { id: 'n08', t: 30.6, d: 3.637, text: 'Most cat naps are light. Even asleep, her ears keep listening.' },
  { id: 'n09', t: 37.3, d: 3.447, text: 'Cats are busiest at sunrise and sunset. Like right now!' },
  { id: 'n10', t: 41.2, d: 0.59, text: 'Zoom!' },
  { id: 'n11', t: 43.6, d: 1.419, text: 'And when the stars come out...' },
  { id: 'n12', t: 47.6, d: 2.16, text: 'Scientists think cats might even dream.' },
  { id: 'n13', t: 51.4, d: 2.161, text: 'Goodnight, Biscuit. Asleep. Again.' },
];
const at = (id, frac = 0) => { const L = LINES.find(l => l.id === id); return L.t + L.d * frac; };
export const SUBS = LINES.map((L, i) => { const t0 = L.t - 0.1; let t1 = Math.max(t0 + 1.8, L.t + L.d + 0.7); const nx = LINES[i + 1]; if (nx) t1 = Math.min(t1, nx.t - 0.2); return { t0, t1, text: L.text }; });

// —— key times ——
const T = {
  sofa: at('n02', 0.02), sun: at('n02', 0.34), drawer: at('n02', 0.62),
  boxes: 10.0, count: 12.3, half: at('n04', 0.15), more: at('n04', 0.62),
  wild: 18.0, pounce: at('n06', 0.25), jar: 26.4, jarFill: 27.3,
  clink: 35.35, sunset: 36.9, wake: at('n09', 0.74), zoom0: 41.15, zoom1: 42.75, curl: 43.7,
  w0: 44.0, w1: 45.7, w2: 47.4, w3: 49.1,
};
export const BANDS = [
  { y0: -260, y1: 860, t0: T.w0, t1: T.w1, dir: 1, seed: 1 },
  { y0: 760, y1: 1700, t0: T.w1 - 0.1, t1: T.w2, dir: -1, seed: 2 },
  { y0: 1600, y1: 2780, t0: T.w2 - 0.1, t1: T.w3, dir: 1, seed: 3 },
];

// —— camera (world centre x, y, zoom) ——
const camT = track([
  [0, [1150, 1830, 1.0]], [4.3, [1170, 1840, 1.1]],
  [5.0, [1080, 3280, 0.74]], [9.5, [1080, 3420, 0.74]],
  [10.1, [1080, 4200, 0.62]], [17.6, [1080, 4200, 0.62]],
  [18.3, [1080, 4860, 0.8]], [22.6, [1080, 4880, 0.66]], [25.9, [1160, 4900, 0.66]],
  [26.5, [1450, 1880, 0.92]], [29.9, [1460, 1880, 0.95]],
  [30.6, [1330, 1950, 1.55]], [36.6, [1330, 1950, 1.6]],
  [38.2, [1080, 1250, 0.64]], [49.6, [1080, 1250, 0.65]],
  [50.9, [1140, 2000, 1.28]], [56.5, [1140, 2000, 1.32]],
]);

// —— events for the mixer ——
export const EV = [];
const ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
LINES.forEach(L => ev(L.t, 'voice', { id: L.id }));
ev(0.0, 'scratch', { dur: 0.6, pan: 0.2 }); ev(0.3, 'scribble', { dur: 0.7, pan: 0.2 }); ev(0.8, 'scratch', { dur: 0.6, pan: -0.4 }); ev(0.3, 'write', { dur: 2.0, pan: -0.2 });
[[T.sofa, -0.3], [T.sun, 0], [T.drawer, 0.3]].forEach(([t, pan]) => { ev(t, 'scratch', { dur: 0.5, pan }); ev(t + 0.4, 'scribble', { dur: 0.6, pan }); });
ev(T.drawer + 0.6, 'squeak');
ev(T.boxes, 'scratch', { dur: 0.8 });
for (let i = 0; i < 16; i++) ev(T.count + i * 0.2, 'box', { i, pan: -0.6 + (i % 12) * 0.1 });
ev(T.half, 'write', { dur: 0.5 }); ev(T.more, 'pop');
ev(T.wild, 'scratch', { dur: 1.2, pan: -0.3 }); ev(T.wild + 0.6, 'scribble', { dur: 0.9 });
ev(T.pounce, 'pounce'); ev(T.pounce + 0.55, 'land'); ev(T.pounce + 0.35, 'squeak');
ev(T.jar, 'scratch', { dur: 0.5, pan: 0.5 }); ev(T.jarFill, 'jar', { dur: 2.0 });
ev(34.4, 'silence', { dur: 0.95 }); ev(T.clink, 'clink', { pan: 0.6 }); ev(T.clink + 0.12, 'ear');
ev(T.sunset, 'scribble', { dur: 2.2, pan: 0.4 });
ev(T.wake, 'pop'); ev(T.zoom0, 'zoom', { dur: T.zoom1 - T.zoom0 }); ev(T.zoom1 - 0.05, 'skid');
ev(T.curl, 'yawn');
BANDS.forEach(b => ev(b.t0, 'brush', { dur: b.t1 - b.t0, dir: b.dir }));
// music sections
[['morning', 0], ['count', 10.0], ['longago', 18.0], ['rest', 26.4], ['listen', 30.4], ['sunset', 36.6], ['night', 43.4], ['end', 51.0]].forEach(([id, t]) => ev(t, 'cue', { id }));

// —— the hidden dream, in white wax (on the page from frame one; only the night wash shows it) ——
const DREAM = (() => {
  const pts = [];   // a scalloped dream cloud
  const N = 18; for (let i = 0; i <= N * 6; i++) { const a = i / (N * 6) * Math.PI * 2; const sc = 1 + 0.08 * Math.abs(Math.sin(a * N / 2)); pts.push([1080 + Math.cos(a) * 860 * sc, 640 + Math.sin(a) * 420 * sc]); }
  return { cloud: pts };
})();
const STARS = (() => { const R = mulberry(77); const out = []; while (out.length < 46) { const x = R() * 2160, y = R() * 1500 - 120; const inCloud = ((x - 1080) / 900) ** 2 + ((y - 640) / 460) ** 2 < 1; if (!inCloud && y < 1450) out.push({ x, y, r: 10 + R() * 16 }); } return out; })();
function starPoly(x, y, r) { const p = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return p; }
function drawDream(C) {
  const W8 = { col: K.white, p: 1, w: 9 };
  line(C.l, DREAM.cloud, { ...W8, seed: 501, closed: false });
  // Biscuit, leaping (white outline only)
  const bx = 720, by = 760;
  line(C.l, ellipse(bx, by, 170, 70, 40, 0, Math.PI * 2, -0.25), { ...W8, seed: 502 });
  line(C.l, handCircle(bx + 190, by - 80, 70, 503, 0.1, 40), { ...W8, seed: 503 });
  line(C.l, [[bx + 140, by - 130], [bx + 150, by - 200], [bx + 190, by - 150]], { ...W8, seed: 504 });
  line(C.l, [[bx + 205, by - 150], [bx + 250, by - 205], [bx + 255, by - 130]], { ...W8, seed: 505 });
  line(C.l, curve([[bx - 160, by + 30], [bx - 260, by - 40], [bx - 300, by - 160]]), { ...W8, seed: 506 });
  for (const [lx, ly, dx] of [[bx - 100, by + 50, -110], [bx - 50, by + 60, -60], [bx + 90, by + 20, 150], [bx + 130, by + 10, 200]]) line(C.l, [[lx, ly], [lx + dx * 0.6, ly + 90]], { ...W8, seed: 507 + lx });
  // the giant fish it is chasing
  const fx = 1420, fy = 560;
  line(C.l, curve([[fx - 220, fy], [fx - 60, fy - 150], [fx + 160, fy - 40], [fx + 220, fy], [fx + 160, fy + 40], [fx - 60, fy + 150], [fx - 220, fy]]), { ...W8, seed: 520 });
  line(C.l, [[fx + 210, fy], [fx + 330, fy - 100], [fx + 310, fy], [fx + 330, fy + 100], [fx + 210, fy]], { ...W8, seed: 521 });
  line(C.l, handCircle(fx - 140, fy - 20, 18, 522, 0.1, 16), { ...W8, seed: 522 });
  for (let i = 0; i < 4; i++) line(C.l, [[fx - 60 + i * 60, fy - 60], [fx - 30 + i * 60, fy], [fx - 60 + i * 60, fy + 60]], { ...W8, w: 7, seed: 523 + i });
  // a ball of yarn and the crescent moon
  line(C.l, handCircle(430, 980, 70, 530, 0.1, 40), { ...W8, seed: 530 });
  for (let i = 0; i < 3; i++) line(C.l, curve([[380, 930 + i * 30], [430, 950 + i * 30], [480, 920 + i * 30]]), { ...W8, w: 6, seed: 531 + i });
  fill(C.f, [...ellipse(1880, 260, 110, 110, 30, -1.9, 1.9), ...ellipse(1840, 260, 90, 100, 30, 1.9, -1.9)], { col: K.white, p: 1, gap: 6, w: 9, seed: 540 });
  for (const s of STARS) fill(C.f, starPoly(s.x, s.y, s.r), { col: K.white, p: 1, gap: 4, w: 6, seed: 550 + s.x, over: 2 });
}

// —— the page ——
function drawPage(BGf, BGl, t) {
  const d = (a, b) => pr(t, a, b);
  // the sun: high in the morning, stepping down to the horizon at sunset (a new drawing per beat), gone at night
  const sunPos = t < T.sunset ? [1760, 380] : t < T.sunset + 0.6 ? [1830, 820] : t < T.sunset + 1.2 ? [1870, 1260] : [1890, 1610];
  if (t < T.w2) {
    const r = 120, sp = handCircle(sunPos[0], sunPos[1], r, 600, 0.1, 36);
    const low = t >= T.sunset + 1.2;
    fill(BGf, low ? sp.filter(p => p[1] < 1650) : sp, { col: low ? '#ef6f3c' : K.sun, p: 0.95, gap: 8, w: 10, seed: 601, draw: d(0.4, 1.0) });
    line(BGl, low ? sp.filter(p => p[1] < 1650) : sp, { w: 7, seed: 602, draw: d(0.2, 0.7) });
    if (!low) for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.2; line(BGl, [[sunPos[0] + Math.cos(a) * 150, sunPos[1] + Math.sin(a) * 150], [sunPos[0] + Math.cos(a) * 205, sunPos[1] + Math.sin(a) * 205]], { w: 7, col: '#e9a21c', seed: 610 + i, draw: d(0.6 + i * 0.04, 1.0 + i * 0.04) }); }
  }
  // sunset: the horizon coloured orange then pink, scribbled in
  if (t > T.sunset) {
    const band = [[-200, 1180], [2360, 1180], [2360, 1680], [-200, 1680]];
    fill(BGf, band, { col: '#f3a04a', p: 0.6, gap: 14, w: 14, seed: 620, ang: 0.15, draw: d(T.sunset, T.sunset + 1.4) });
    fill(BGf, [[-200, 1380], [2360, 1380], [2360, 1680], [-200, 1680]], { col: K.pink, p: 0.5, gap: 16, w: 14, seed: 621, ang: -0.2, draw: d(T.sunset + 0.8, T.sunset + 2.2) });
  }
  // house (child perspective: a gable front and a slanted side wall)
  const hd = d(0.4, 1.2), hf = d(0.9, 1.8);
  const wall = [[120, 1260], [560, 1260], [560, 1720], [120, 1720]], side = [[560, 1260], [700, 1200], [700, 1640], [560, 1720]], roof = [[80, 1270], [340, 1000], [600, 1270]], sroof = [[340, 1000], [500, 950], [740, 1210], [600, 1270]];
  fill(BGf, side, { col: '#e7c58c', p: 0.8, seed: 630, draw: hf }); fill(BGf, wall, { col: K.cream, p: 0.85, seed: 631, draw: hf });
  fill(BGf, sroof, { col: '#b8392f', p: 0.9, seed: 632, draw: hf }); fill(BGf, roof, { col: K.red, p: 0.9, seed: 633, draw: hf });
  [wall, side, roof, sroof].forEach((p, i) => line(BGl, [...p, p[0]], { w: 8, seed: 640 + i, draw: hd }));
  const win = [[200, 1340], [330, 1340], [330, 1460], [200, 1460]], door = [[390, 1520], [500, 1520], [500, 1720], [390, 1720]];
  fill(BGf, win, { col: t > T.w1 ? K.sun : K.sky, p: 0.9, seed: 650, draw: hf }); line(BGl, [...win, win[0]], { w: 7, seed: 651, draw: hd }); line(BGl, [[265, 1340], [265, 1460]], { w: 6, seed: 652, draw: hd });
  fill(BGf, door, { col: K.brown, p: 0.85, seed: 653, draw: hf }); line(BGl, [...door, door[0]], { w: 7, seed: 654, draw: hd });
  // lawn
  const lawn = [[-200, 1680]]; for (let x = -200; x <= 2360; x += 80) lawn.push([x, 1660 + 14 * Math.sin(x * 0.01)]); lawn.push([2360, 2720], [-200, 2720]);
  fill(BGf, lawn, { col: K.green, p: 0.8, gap: 11, w: 12, seed: 660, ang: 0.3, draw: d(0.6, 1.8) });
  line(BGl, lawn.slice(1, -2), { w: 7, seed: 661, draw: d(0.4, 1.0) });
  for (let i = 0; i < 26; i++) { const x = -100 + i * 95 + hash(i) * 40; line(BGl, [[x, 1672], [x + 10, 1630], [x + 22, 1675]], { w: 5, col: '#3f7d34', seed: 670 + i, draw: d(1.0, 1.6) }); }
  // the cushion
  const cush = ellipse(1350, 1950, 250, 70, 40);
  fill(BGf, cush, { col: K.red, p: 0.9, gap: 9, w: 11, seed: 680, draw: d(0.3, 0.9) }); line(BGl, cush, { w: 8, seed: 681, draw: d(0.1, 0.5) });
  line(BGl, ellipse(1350, 1945, 205, 46, 30), { w: 4, col: K.cream, seed: 682, draw: d(0.5, 0.9), p: 0.8 });
  // title, hand-lettered in the sky (stays in the sky; the camera leaves it)
  text(BGl, 'Why do cats', sx(1150), sy(1120), { size: 112 * CAM.s, font: 'Gaegu', weight: 700, reveal: d(0.3, 1.2), seed: 21, p: 0.95, stroke: 2, col: K.ink });
  text(BGl, 'sleep so much?', sx(1150), sy(1245), { size: 112 * CAM.s, font: 'Gaegu', weight: 700, reveal: d(1.2, 2.3), seed: 29, p: 0.95, stroke: 2, col: K.ink });
  // the energy jar
  if (t > T.jar) {
    const jx = 1860, jy = 1990, jar = [[jx - 70, jy - 230], [jx + 70, jy - 230], [jx + 80, jy], [jx - 80, jy]];
    const lvl = lerp(0, 0.92, pr(t, T.jarFill, T.jarFill + 2.0));
    if (lvl > 0) fill(BGf, [[jx - 78, jy - 230 * lvl], [jx + 78, jy - 230 * lvl], [jx + 80, jy], [jx - 80, jy]], { col: K.sun, p: 0.95, seed: 690, gap: 7, ang: 0.1 });
    line(BGl, [...jar, jar[0]], { w: 7, seed: 691, draw: d(T.jar, T.jar + 0.5) });
    line(BGl, [[jx - 90, jy - 250], [jx + 90, jy - 250]], { w: 12, col: K.brown, seed: 692, draw: d(T.jar + 0.3, T.jar + 0.6) });
    if (lvl > 0.4) line(BGl, [[jx + 10, jy - 170], [jx - 30, jy - 100], [jx + 20, jy - 100], [jx - 20, jy - 30]], { w: 9, col: '#e07b1c', seed: 693 });
    text(BGl, 'energy', sx(jx), sy(jy + 70), { size: 64 * CAM.s, font: 'Gaegu', weight: 700, reveal: pr(t, T.jar + 0.4, T.jar + 0.9), seed: 31, col: K.ink });
  }
  // —— section A: the three naps, read top to bottom ——
  [[T.sofa, 2770], [T.sun, 3170], [T.drawer, 3570]].forEach(([t0, y0], i) => {
    const fr = [[380, y0], [1780, y0 + 8], [1772, y0 + 350], [386, y0 + 342]];
    line(BGl, [...fr, fr[0]], { w: 8, seed: 700 + i, draw: pr(t, t0 - 0.5, t0) });
    const f = pr(t, t0 + 0.2, t0 + 0.9);
    if (i === 0) { const sofa = [[620, y0 + 160], [1440, y0 + 160], [1480, y0 + 320], [580, y0 + 320]]; const back = [[640, y0 + 60], [1420, y0 + 60], [1440, y0 + 170], [620, y0 + 170]];
      fill(BGf, back, { col: K.lilac, p: 0.85, seed: 710, draw: f }); fill(BGf, sofa, { col: K.lilac, p: 0.9, seed: 711, draw: f }); line(BGl, [...back, back[0]], { w: 7, seed: 712, draw: f }); line(BGl, [...sofa, sofa[0]], { w: 7, seed: 713, draw: f }); }
    if (i === 1) { const beam = [[420, y0 + 20], [700, y0 + 20], [1500, y0 + 330], [900, y0 + 330]]; fill(BGf, beam, { col: K.sun, p: 0.65, gap: 14, seed: 720, draw: f, ang: 0.9 });
      line(BGl, [[440, y0 + 30], [640, y0 + 30], [640, y0 + 150], [440, y0 + 150], [440, y0 + 30]], { w: 7, seed: 721, draw: f }); }
    if (i === 2) { const dr = [[760, y0 + 60], [1400, y0 + 60], [1400, y0 + 330], [760, y0 + 330]], drawer = [[720, y0 + 150], [1440, y0 + 150], [1440, y0 + 250], [720, y0 + 250]];
      fill(BGf, dr, { col: K.brown, p: 0.85, seed: 730, draw: f }); line(BGl, [...dr, dr[0]], { w: 7, seed: 731, draw: f });
      [K.red, K.sky, K.green, K.sun, K.pink].forEach((c, k) => fill(BGf, ellipse(820 + k * 120, y0 + 150, 50, 26, 16), { col: c, p: 0.95, seed: 732 + k, draw: f }));
      fill(BGf, drawer, { col: '#9a6a46', p: 0.9, seed: 740, draw: f }); line(BGl, [...drawer, drawer[0]], { w: 7, seed: 741, draw: f }); dab(BGf, 1080, y0 + 200, 14, { col: K.sun, seed: 742 }); }
  });
  // —— section B: one day = 24 hours; 16 of them coloured in for sleep ——
  if (t > T.boxes - 0.2) {
    text(BGl, '1 day = 24 hours', sx(1080), sy(3990), { size: 86 * CAM.s, font: 'Gaegu', weight: 700, reveal: pr(t, T.boxes, T.boxes + 0.8), seed: 41, col: K.ink });
    for (let i = 0; i < 24; i++) {
      const r = Math.floor(i / 12), c = i % 12, x = 400 + c * 125, y = 4080 + r * 150;
      const box = [[x, y], [x + 110, y + 4], [x + 108, y + 112], [x + 2, y + 108]];
      line(BGl, [...box, box[0]], { w: 6, seed: 800 + i, draw: pr(t, T.boxes + i * 0.03, T.boxes + 0.4 + i * 0.03) });
      if (i < 16) { const k = pr(t, T.count + i * 0.2, T.count + i * 0.2 + 0.22); if (k > 0) { fill(BGf, box, { col: K.lilac, p: 0.95, gap: 7, w: 9, seed: 830 + i, draw: k }); if (k >= 1) text(BGl, 'z', sx(x + 55), sy(y + 78), { size: 64 * CAM.s, font: 'Gaegu', weight: 700, seed: 860 + i, col: K.ink, p: 0.8 }); } }
    }
    if (t > T.half) { line(BGl, [[385, 4080], [360, 4085], [360, 4185], [385, 4190]], { w: 7, seed: 890, draw: pr(t, T.half, T.half + 0.3) }); text(BGl, 'half', sx(290), sy(4160), { size: 64 * CAM.s, font: 'Gaegu', weight: 700, reveal: pr(t, T.half + 0.2, T.half + 0.5), seed: 51, col: K.ink }); }
    if (t > T.more) { line(BGl, handCircle(400 + 3 * 125 + 55, 4230 + 56, 100, 891, 0.15, 36), { w: 7, col: K.red, seed: 892, draw: pr(t, T.more, T.more + 0.4) }); text(BGl, 'or more!', sx(830), sy(4470), { size: 76 * CAM.s, font: 'Gaegu', weight: 700, reveal: pr(t, T.more + 0.2, T.more + 0.6), seed: 52, col: K.red }); }
  }
  // —— section C: long ago, in the tall grass ——
  if (t > T.wild - 0.2) {
    text(BGl, 'long ago...', sx(1080), sy(4630), { size: 86 * CAM.s, font: 'Gaegu', weight: 700, reveal: pr(t, T.wild, T.wild + 0.7), seed: 61, col: K.ink });
    const gf = pr(t, T.wild + 0.3, T.wild + 1.3);
    fill(BGf, [[-200, 5100], [2360, 5100], [2360, 5400], [-200, 5400]], { col: '#c9b25a', p: 0.75, gap: 12, seed: 900, draw: gf, ang: 0.4 });
    for (let i = 0; i < 30; i++) { const x = -80 + i * 78 + hash(i * 3) * 40, h = 180 + hash(i) * 150; line(BGl, [[x, 5160], [x + 20, 5160 - h * 0.5], [x + 40 * (hash(i + 9) - 0.3), 5160 - h]], { w: 6, col: '#7d8a35', seed: 910 + i, draw: pr(t, T.wild + 0.2 + i * 0.02, T.wild + 0.8 + i * 0.02) }); }
  }
}

// —— layers ——
const DRM = group(), OTH = group(), MAIN = group(), BG = { f: layer(), l: layer() }, WASH = layer(), FX = layer(), SUBK = layer(), SUBT = layer();

// Biscuit on the cushion, through the day
function biscuitMain(t) {
  const base = { x: 1360, y: 1972, s: 1.0, seed: 100 };
  if (t < T.wake) {
    const ear = t > T.clink + 0.1 && t < T.clink + 1.3 ? (Math.floor((t - T.clink) * 12) % 4 < 2 ? 1 : 0.6) : 0;
    return { ...base, pose: 'curl', eyes: 'closed', ear, draw: pr(t, 0, 0.6), fill: pr(t, 0.2, 0.9) };
  }
  if (t < T.zoom0) return { ...base, pose: 'sit', eyes: 'wide', ear: 1, y: 1990 };
  if (t < T.zoom1) {   // zoomies: once round the lawn, a new drawing every 1/12 s
    const u = Math.floor((t - T.zoom0) * 12) / 12 / (T.zoom1 - T.zoom0), a = -Math.PI / 2 + u * Math.PI * 2;
    const x = 1150 + Math.cos(a) * 760, y = 2020 + Math.sin(a) * 110;
    return { x, y, s: 0.8, pose: 'run', eyes: 'wide', flip: Math.sin(a) > 0 ? -1 : 1, step: Math.floor(t * 12), seed: 100 };
  }
  if (t < T.curl) return { ...base, pose: 'sit', eyes: 'open', y: 1990 };
  return { ...base, pose: 'curl', eyes: 'closed' };
}
function pipMain(t) {
  if (t < T.zoom0) return { x: 760, y: 2120, s: 0.95, pose: t < 4.6 ? 'point' : 'stand', eyes: t > 30 && t < 36.6 ? 'open' : 'open' };
  if (t < T.zoom1 + 0.3) return { x: 760, y: 2120, s: 0.95, pose: 'jump', eyes: 'wide', mouth: 'o', jumpY: 30 + 20 * Math.abs(Math.sin((t - T.zoom0) * 8)) };
  if (t < 51.2) return { x: 760, y: 2120, s: 0.95, pose: 'stand', eyes: 'open' };
  return { x: 900, y: 2120, s: 0.95, pose: 'shh', eyes: 'closed' };
}

export function frame(comp, t) {
  [CAM.x, CAM.y, CAM.s] = camT(t);
  BOIL.amp = t > 50 ? 0.5 : 1;
  [DRM, OTH, MAIN].forEach(clearGroup); [BG.f, BG.l, WASH, FX, SUBK, SUBT].forEach(clear);
  drawDream(DRM);
  drawPage(BG.f, BG.l, t);
  // the naps (section A): one small Biscuit per picture
  if (t > T.sofa + 0.1) cat(OTH, { x: 1060, y: 2770 + 190, s: 0.55, pose: 'curl', seed: 300, draw: pr(t, T.sofa + 0.1, T.sofa + 0.6), fill: pr(t, T.sofa + 0.4, T.sofa + 1.0) });
  if (t > T.sun + 0.1) cat(OTH, { x: 1120, y: 3170 + 320, s: 0.6, pose: 'curl', seed: 320, draw: pr(t, T.sun + 0.1, T.sun + 0.6), fill: pr(t, T.sun + 0.4, T.sun + 1.0) });
  if (t > T.drawer + 0.2) cat(OTH, { x: 1110, y: 3570 + 150, s: 0.5, pose: 'curl', seed: 340, flip: -1, draw: pr(t, T.drawer + 0.2, T.drawer + 0.7), fill: pr(t, T.drawer + 0.5, T.drawer + 1.1) });
  // long ago: the wild cat stalks, pounces; the mouse gets away
  if (t > T.wild + 0.4) {
    const pu = pr(t, T.pounce, T.pounce + 0.55);
    const wx = lerp(560, 1320, pu), wy = 5160 - Math.sin(pu * Math.PI) * 280;
    const pose = pu <= 0 ? 'crouch' : pu < 1 ? 'run' : 'sit';
    cat(OTH, { x: wx, y: wy, s: 0.9, pose, coat: 'wild', eyes: pu >= 1 ? 'open' : 'wide', seed: 200, step: 1, draw: pr(t, T.wild + 0.4, T.wild + 1.1), fill: pr(t, T.wild + 0.8, T.wild + 1.5) });
    const mu = pr(t, T.pounce + 0.3, T.pounce + 1.2), mx = lerp(1480, 2300, mu);
    if (mx < 2250) mouse(OTH, { x: mx, y: 5170, s: 1.2 });
    if (pu >= 1 && t < T.pounce + 2.2) text(FX, '?', sx(1380), sy(4860), { size: 120 * CAM.s, font: 'Gaegu', weight: 700, seed: 71, col: K.ink });
  }
  cat(MAIN, biscuitMain(t));
  pip(MAIN, pipMain(t));
  // sleep z's, the ear's listening lines, the clink, the zoom scribbles
  if (t < T.wake || t > T.curl + 0.4) for (let j = 0; j < 3; j++) { const u = ((t * 0.45 + j / 3) % 1); text(FX, 'z', sx(1240 + 70 * u + j * 10), sy(1790 - 210 * u), { size: (54 + 40 * u) * CAM.s, font: 'Gaegu', weight: 700, p: (1 - u) * 0.9, seed: 80 + j, col: K.ink }); }
  if (t > T.clink && t < T.clink + 1.3) { for (let k = 0; k < 3; k++) line(FX, [[1450 + k * 34, 1760 - k * 30], [1480 + k * 34, 1736 - k * 30]], { w: 6, seed: 90 + k }); text(FX, 'clink!', sx(1560), sy(1660), { size: 64 * CAM.s, font: 'Gaegu', weight: 700, seed: 95, col: K.ink }); }
  if (t > T.zoom0 && t < T.zoom1 + 0.4) { const R = mulberry(Math.floor(t * 12)); for (let k = 0; k < 6; k++) { const u = Math.floor((t - T.zoom0) * 12) / 12 / (T.zoom1 - T.zoom0) - k * 0.03, a = -Math.PI / 2 + u * Math.PI * 2; line(FX, handCircle(1150 + Math.cos(a) * 760, 2050 + Math.sin(a) * 110, 26 + R() * 20, 100 + k, 0.2, 18), { w: 5, col: K.brown, seed: 110 + k, p: 0.7 }); }
    text(FX, 'ZOOM!', sx(1080), sy(1560), { size: 150 * CAM.s, font: 'Gaegu', weight: 700, seed: 120, col: K.red, stroke: 3, reveal: pr(t, T.zoom0, T.zoom0 + 0.3) }); }
  // the wash, then the dream bubble's trail (white crayon) once the night has come
  if (t > T.w0) drawWash(WASH, t);
  if (t > T.w3 - 0.4) for (let k = 0; k < 3; k++) { const kk = pr(t, T.w3 - 0.4 + k * 0.35, T.w3 - 0.1 + k * 0.35); if (kk > 0) fill(FX, handCircle(1560 + k * 80, 1640 - k * 170, 18 + k * 12, 130 + k, 0, 20), { col: K.white, p: kk, gap: 4, w: 6, seed: 131 + k }); }
  // twinkles on a few stars after the reveal
  if (t > T.w1) for (let k = 0; k < 10; k++) { const s = STARS[(k * 7) % STARS.length]; const ph = (t * 0.6 + hash(k) * 3) % 3; if (ph > 0.5) continue; const a = Math.sin(ph / 0.5 * Math.PI), r = s.r * (1.4 + a); line(FX, [[s.x - r, s.y], [s.x + r, s.y]], { w: 4, col: K.white, p: a, seed: 140 + k, wob: 0.2 }); line(FX, [[s.x, s.y - r], [s.x, s.y + r]], { w: 4, col: K.white, p: a, seed: 150 + k, wob: 0.2 }); }
  subTo(SUBK, SUBT, t);
  comp.paperCam(CAM.x * 0.6, CAM.y * 0.6, CAM.s / 0.6);
  comp.begin();
  comp.group(DRM);
  comp.crayon(BG.f.c); comp.crayon(BG.l.c);
  const go = [hash(BOIL.step) * 300, hash(BOIL.step + 7) * 300];
  comp.group(OTH, { goff: go });
  if (t > T.w0) comp.wash(WASH.c, { color: PAL.wash, resist: 0.72 });
  comp.group(MAIN, { goff: go });     // Pip and Biscuit after the wash: they stay readable at night
  comp.crayon(FX.c, { goff: go });
  comp.knock(SUBK.c); comp.crayon(SUBT.c);
  comp.finish({ vig: 0.3 });
}

// —— watercolour wash: wide bands with bristle streaks and a darker wet leading edge ——
const X0 = -300, X1 = 2460;
function bandFront(b, t) { const u = clamp((t - b.t0) / (b.t1 - b.t0)); const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; const v = 0.15 * u + 0.85 * e; return b.dir > 0 ? lerp(X0, X1, v) : lerp(X1, X0, v); }
function drawWash(LW, t) {
  const g = LW.g; g.save(); g.setTransform(CAM.s, 0, 0, CAM.s, W / 2 - CAM.x * CAM.s, H / 2 - CAM.y * CAM.s);
  for (const b of BANDS) {
    if (t < b.t0) continue;
    const f = bandFront(b, t);
    const frontX = y => f + b.dir * 70 * Math.sin(clamp((y - b.y0) / (b.y1 - b.y0)) * Math.PI) + 12 * Math.sin(y * 0.05);
    g.save(); g.beginPath();
    if (b.dir > 0) { g.moveTo(X0 - 50, b.y0 - 200); for (let y = b.y0 - 200; y <= b.y1 + 200; y += 20) g.lineTo(frontX(y), y); g.lineTo(X0 - 50, b.y1 + 200); }
    else { g.moveTo(X1 + 50, b.y0 - 200); for (let y = b.y0 - 200; y <= b.y1 + 200; y += 20) g.lineTo(frontX(y), y); g.lineTo(X1 + 50, b.y1 + 200); }
    g.closePath(); g.clip();
    const shape = new Path2D(); for (let x = X0; x <= X1; x += 40) { const y = b.y0 + 12 * Math.sin(x * 0.006 + b.seed) + 8 * hash(x * 0.37 + b.seed); x === X0 ? shape.moveTo(x, y) : shape.lineTo(x, y); }
    for (let x = X1; x >= X0; x -= 40) shape.lineTo(x, b.y1 + 14 * Math.sin(x * 0.005 + b.seed * 2) + 8 * hash(x * 0.71 + b.seed)); shape.closePath();
    g.fillStyle = '#000'; g.globalAlpha = 0.82; g.fill(shape);
    g.save(); g.clip(shape); const R = mulberry(b.seed * 97);
    for (let i = 0; i < 26; i++) { const yy = lerp(b.y0, b.y1, R()), wd = 6 + R() * 30, dark = R() < 0.55; g.beginPath(); for (let x = X0; x <= X1; x += 60) { const y = yy + 14 * Math.sin(x * 0.002 + i) + 6 * Math.sin(x * 0.01 + i * 2); x === X0 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.lineWidth = dark ? wd : wd * 0.5; g.globalCompositeOperation = dark ? 'source-over' : 'destination-out'; g.globalAlpha = dark ? 0.14 + R() * 0.12 : 0.05 + R() * 0.07; g.strokeStyle = '#000'; g.stroke(); }
    g.globalCompositeOperation = 'source-over';
    if (t < b.t1) { g.beginPath(); for (let y = b.y0 - 80; y <= b.y1 + 80; y += 16) { const x = frontX(y) - b.dir * 14; y === b.y0 - 80 ? g.moveTo(x, y) : g.lineTo(x, y); } g.lineWidth = 26; g.globalAlpha = 0.22; g.stroke(); }
    g.restore(); g.restore();
  }
  g.restore();
}

// —— the printed words: handwriting on a ragged patch of blank paper, wrapped to two lines ——
export function subTo(SUBK, SUBT, t) {
  const S = SUBS.find(s => t >= s.t0 && t < s.t1); if (!S) return;
  const g = SUBK.g; g.save(); g.font = '400 58px "Patrick Hand"';
  const words = S.text.split(' '), rows = []; let cur = '';
  for (const w of words) { const tryS = cur ? cur + ' ' + w : w; if (g.measureText(tryS).width > 860 && cur) { rows.push(cur); cur = w; } else cur = tryS; }
  rows.push(cur);
  const tw = Math.max(...rows.map(r => g.measureText(r).width)); g.restore();
  const cx = 540, cy = 1600, hw = tw / 2 + 50, hh = 34 + rows.length * 33;
  g.save(); g.fillStyle = '#000'; g.beginPath();
  for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI * 2; const px = Math.cos(a), py = Math.sin(a); const sq = Math.pow(Math.abs(px), 0.3) * Math.sign(px); const n = 1 + 0.06 * Math.sin(a * 7 + 1.3) + 0.03 * Math.sin(a * 17); const X = cx + sq * hw * n, Y = cy + Math.sign(py) * Math.pow(Math.abs(py), 0.5) * hh * n; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }
  g.closePath(); g.fill(); g.restore();
  const total = S.text.length; let done = 0;
  rows.forEach((r, i) => { const rv = clamp((pr(t, S.t0, S.t0 + 0.35 + 0.012 * total) * total - done) / r.length); done += r.length + 1;
    text(SUBT, r, cx, cy + 20 + (i - (rows.length - 1) / 2) * 66, { size: 58, col: K.ink, reveal: rv, seed: 11 + S.t0 * 3 + i, p: 1, stroke: 1.2 }); });
}
