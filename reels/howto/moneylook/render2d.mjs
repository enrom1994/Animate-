// node moneylook/render2d.mjs <page.html> stills t1,t2 <dir>   |   node moneylook/render2d.mjs <page.html> video <out.mp4> [fps]
// Renders a 2D money-channel page whose frames are window.renderAt(t). No GPU needed: it is canvas drawing.
import { createRequire } from 'node:module'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { spawn } from 'node:child_process';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), KIT = path.resolve(ROOT, '../../.claude/kit');
let chromium; try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { ({ chromium } = createRequire(KIT + '/')('playwright')); }
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]), p = path.join(u.startsWith('/node_modules/') ? KIT : ROOT, u); fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); }).listen(0);
const [page, mode, a, b] = process.argv.slice(2);
const br = await chromium.launch(), pg = await br.newPage({ viewport: { width: 720, height: 1280 } }); pg.on('pageerror', e => console.log('[pageerror]', e.message));
await pg.goto(`http://localhost:${server.address().port}/moneylook/${page}`); await pg.waitForFunction(() => window.done && window.renderAt, null, { timeout: 30000 });
const shot = () => pg.screenshot({ clip: { x: 0, y: 0, width: 720, height: 1280 }, type: 'png' });
if (mode === 'stills') { fs.mkdirSync(b, { recursive: true }); for (const t of a.split(',').map(Number)) { await pg.evaluate(t => window.renderAt(t), t); fs.writeFileSync(path.join(b, `t_${t.toFixed(2)}.png`), await shot()); } }
else { const fps = Number(b || 30), dur = await pg.evaluate(() => window.DURATION), T0 = Date.now();
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-', '-vf', 'scale=1080:1920:flags=lanczos', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', a], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let n = 0; n < Math.round(dur * fps); n++) { await pg.evaluate(t => window.renderAt(t), n / fps); const buf = await shot(); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log(`${Math.round(dur * fps)} frames, ${((Date.now() - T0) / Math.round(dur * fps)).toFixed(0)} ms a frame`); }
await br.close(); server.close();
