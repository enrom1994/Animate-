// node moneylook/cover.mjs <page> <t> <out.png>: a 1080 x 1920 cover frame without the caption (for a Short's uploaded thumbnail)
import { createRequire } from 'node:module'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = '/home/user/Animate-/reels/howto', KIT = path.resolve(ROOT, '../../.claude/kit'), MONEY = path.resolve(ROOT, '../money');
const { chromium } = createRequire(ROOT + '/moneylook/')('playwright');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]), p = u.startsWith('/money/') ? path.join(MONEY, u.slice(7)) : path.join(u.startsWith('/node_modules/') ? KIT : ROOT, u); fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); }).listen(0);
const [page, t, out] = process.argv.slice(2);
const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 720, height: 1280 }, deviceScaleFactor: 1.5 });
await pg.goto(`http://localhost:${server.address().port}${page}`); await pg.waitForFunction(() => window.done && window.renderAt, null, { timeout: 30000 });
await pg.evaluate(t => { window.renderAt(t); document.getElementById('cap').innerHTML = ''; }, +t);
await pg.screenshot({ path: out, clip: { x: 0, y: 0, width: 720, height: 1280 } }); await b.close(); server.close();
