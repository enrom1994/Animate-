// Render a reel's frames with headless Chromium. Run from the reel folder:
//   node render.mjs stills 1.5,6,12      -> build/stills/s_<t>.jpg
//   node render.mjs video [workers]      -> build/silent.mp4
// Uses Playwright from kit/node_modules; CHROME=/path/to/chrome to use an existing browser.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { spawn } from 'node:child_process';
import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ENGINE = path.join(HERE, '..', 'engine');
const KIT = fs.realpathSync(path.join(HERE, '..', '..', '..', 'kit'));
const { chromium } = createRequire(path.join(KIT, 'package.json'))('playwright');
const REEL = process.cwd(), FONTS = path.join(KIT, 'fonts');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
const roots = { '/engine/': ENGINE, '/reel/': REEL, '/fonts/': FONTS };
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]); const k = Object.keys(roots).find(p => u.startsWith(p));
  const f = k && path.join(roots[k], u.slice(k.length));
  if (!f || !f.startsWith(roots[k]) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const URL_ = `http://127.0.0.1:${srv.address().port}/engine/index.html`;
const browser = await chromium.launch({ ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}) });
async function openPage() {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('[err]', e.message)); p.on('console', m => m.type() === 'error' && console.log('[page]', m.text()));
  await p.goto(URL_); await p.evaluate(() => window.READY); return p;
}
const frame = async (p, f, q) => Buffer.from((await p.evaluate(([f, q]) => { renderFrame(f); return grab(q); }, [f, q])).split(',')[1], 'base64');
const mode = process.argv[2];
fs.mkdirSync('build', { recursive: true });
if (mode === 'stills') {
  const p = await openPage(); fs.mkdirSync('build/stills', { recursive: true });
  for (const t of process.argv[3].split(',').map(Number)) fs.writeFileSync(`build/stills/s_${t.toFixed(2)}.jpg`, await frame(p, Math.round(t * 30), .9));
  console.log('stills in build/stills');
} else {
  const N = Number(process.argv[3] || process.env.WORKERS || 4), p0 = await openPage();
  const total = await p0.evaluate(() => window.TOTAL_FRAMES); await p0.close();
  const per = Math.ceil(total / N), t0 = Date.now();
  await Promise.all([...Array(N)].map(async (_, w) => {
    const f0 = w * per, f1 = Math.min(total, f0 + per); if (f0 >= f1) return;
    const p = await openPage();
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-r', '30', `build/seg_${w}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = f0; f < f1; f++) {
      if (!ff.stdin.write(await frame(p, f, .94))) await new Promise(r => ff.stdin.once('drain', r));
      if (w === 0 && (f - f0) % 150 === 0) console.log(`worker 0: ${f - f0}/${f1 - f0} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); if (await new Promise(r => ff.on('close', r))) throw new Error('ffmpeg failed on segment ' + w);
  }));
  fs.writeFileSync('build/segs.txt', [...Array(N)].map((_, w) => `file 'seg_${w}.mp4'`).filter((_, w) => w * per < total).join('\n'));
  await new Promise((res, rej) => spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', 'build/segs.txt', '-c', 'copy', 'build/silent.mp4'], { stdio: 'inherit' }).on('close', c => c ? rej(c) : res()));
  console.log(`build/silent.mp4: ${total} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close(); srv.close();
