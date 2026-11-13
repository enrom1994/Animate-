// node make.mjs  ->  avatar.png (800 x 800) and banner.png (2560 x 1440), drawn by art.html
import { createRequire } from 'node:module';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(new URL(import.meta.url).pathname), HOWTO = path.resolve(HERE, '..'), KIT = path.resolve(HERE, '../../../.claude/kit');
let chromium; try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { ({ chromium } = createRequire(KIT + '/')('playwright')); }
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]), p = path.join(u.startsWith('/node_modules/') ? KIT : HOWTO, u);
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); }).listen(0);
const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 2600, height: 2300 } });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(`http://localhost:${server.address().port}/channel/art.html`); await page.waitForFunction(() => window.done);
for (const id of ['avatar', 'banner']) fs.writeFileSync(path.join(HERE, id + '.png'), Buffer.from((await page.evaluate(i => document.getElementById(i).toDataURL('image/png'), id)).split(',')[1], 'base64'));
await browser.close(); server.close(); console.log('wrote avatar.png, banner.png');
