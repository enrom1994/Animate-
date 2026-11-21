// node moneylook/sheetshot.mjs <path from reels/money, e.g. /money/look2/props/sheet.html> <out.png> [w] [h]: a full-size screenshot of a sheet page
import { createRequire } from 'node:module'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), KIT = path.resolve(ROOT, '../../.claude/kit'), MONEY = path.resolve(ROOT, '../money');
let chromium; try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { ({ chromium } = createRequire(KIT + '/')('playwright')); }
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]), p = u.startsWith('/money/') ? path.join(MONEY, u.slice(7)) : path.join(u.startsWith('/node_modules/') ? KIT : ROOT, u); fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); }).listen(0);
const [page, out, w = 1800, h = 3400] = process.argv.slice(2);
const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: +w, height: +h } }); pg.on('pageerror', e => console.log('[pageerror]', e.message)); pg.on('console', m => m.type() === 'error' && console.log('[console]', m.text()));
await pg.goto(`http://localhost:${server.address().port}${page}`); await pg.waitForFunction(() => window.done, null, { timeout: 60000 });
await pg.screenshot({ path: out, clip: { x: 0, y: 0, width: +w, height: +h } }); await b.close(); server.close();
