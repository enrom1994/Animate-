// node moneylook/check2d.mjs </money/.../page.html> [step]: plays a money-channel scene and audits every frame (look2/check.js):
// labels covered or cut off, labels too small, characters too small or cut off. Exit code 1 on any error.
import { createRequire } from 'node:module'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), KIT = path.resolve(ROOT, '../../.claude/kit'), MONEY = path.resolve(ROOT, '../money');
let chromium; try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { ({ chromium } = createRequire(KIT + '/')('playwright')); }
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]), p = u.startsWith('/money/') ? path.join(MONEY, u.slice(7)) : path.join(u.startsWith('/node_modules/') ? KIT : ROOT, u); fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); }).listen(0);
const [page, step = .25] = process.argv.slice(2);
const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 720, height: 1280 } }); pg.on('pageerror', e => console.log('[pageerror]', e.message));
await pg.goto(`http://localhost:${server.address().port}${page}`); await pg.waitForFunction(() => window.done && window.audit, null, { timeout: 60000 });
const dur = await pg.evaluate(() => window.DURATION), seen = new Map();
for (let t = 0; t < dur; t += +step) for (const [lvl, msg] of await pg.evaluate(t => window.audit(t), t)) { const k = msg.replace(/\d+(%| px)/g, '#'); if (!seen.has(k)) seen.set(k, [lvl, msg, []]); seen.get(k)[2].push(t.toFixed(2)); }
await b.close(); server.close();
const rows = [...seen.values()].sort((a, b) => (a[0] === 'error' ? 0 : 1) - (b[0] === 'error' ? 0 : 1));
for (const [lvl, msg, ts] of rows) console.log(`${lvl.toUpperCase().padEnd(5)} t=${ts.length > 4 ? ts.slice(0, 2).join(',') + '…' + ts.at(-1) : ts.join(',')}  ${msg}`);
const errs = rows.filter(r => r[0] === 'error').length; console.log(`\n${page}: ${errs} error(s), ${rows.length - errs} warning(s)`); process.exit(errs ? 1 : 0);
