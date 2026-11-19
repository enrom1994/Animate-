// node moneylook/shot2d.mjs out.png : renders the flat 2D look test page to a PNG
import { createRequire } from 'node:module'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), KIT = path.resolve(ROOT, '../../.claude/kit');
let chromium; try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { ({ chromium } = createRequire(KIT + '/')('playwright')); }
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]), p = path.join(u.startsWith('/node_modules/') ? KIT : ROOT, u); fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); }).listen(0);
const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 720, height: 1280 } }); pg.on('pageerror', e => console.log('[pageerror]', e.message));
await pg.goto(`http://localhost:${server.address().port}/moneylook/flat2d.html`); await pg.waitForFunction(() => window.done, null, { timeout: 30000 });
await pg.screenshot({ path: process.argv[2], clip: { x: 0, y: 0, width: 720, height: 1280 } }); await b.close(); server.close();
