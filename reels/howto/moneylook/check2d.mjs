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
const [T0, T1] = (process.env.SPAN || `0:${dur}`).split(':').map(Number);   // SPAN=a:b audits only those seconds (to split the gate across processes)
// speed is checked too: a frame should draw in well under a second (the pilot's drew in 18-37 s until toon.js stopped resampling
// still outlines and off-screen edges, which turned a 3 1/2 hour render into 3 minutes). A slow frame is an error, caught here, not mid-render.
const SLOW = 1000, timed = t => pg.evaluate(([t, SLOW]) => { const a = performance.now(), r = window.audit(t), ms = performance.now() - a;
  return ms > SLOW ? [...r, ['error', `frame takes ${(ms / 1000).toFixed(1)} s to draw (limit ${SLOW / 1000} s): profile it; usually a huge shape resampled point by point`]] : r; }, [t, SLOW]);
// code after a mid-line // is commented out: the page and the shared money code are read as text first (the ep. 3 car shot drew
// nothing for six seconds this way, and render2d's wait never ran). Same rule as the howto gate's check 14.
{ const files = [path.join(MONEY, page.replace(/^\/money\//, '')), ...fs.readdirSync(path.join(MONEY, 'look2')).filter(f => f.endsWith('.js')).map(f => path.join(MONEY, 'look2', f))];
  const CODE = /(\)\(\)|;\s*\w+\s*\(|\b\w+\(t[,)]|\b(card|stamp|banner|split|drawWide|maxShot|theoShot|shape|text|push|pop)\(|=>\s*\{|\bconst\s+\w|\blet\s+\w|return\s)/;
  for (const f of files) fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => { const c = line.indexOf('//');
    if (c > 0 && !/https?:\/\//.test(line) && !/['"`][^'"`]*\/\//.test(line.slice(0, c + 2)) && /\S/.test(line.slice(0, c)) && CODE.test(line.slice(c + 2)))
      { const k = `code after a // comment is commented out: ${path.basename(f)}:${i + 1}`; if (!seen.has(k)) seen.set(k, ['error', k, ['lint']]); } }); }
for (let t = T0; t < Math.min(T1, dur); t += +step) for (const [lvl, msg] of await timed(t)) { const k = msg.replace(/\d+(%| px)/g, '#'); if (!seen.has(k)) seen.set(k, [lvl, msg, []]); seen.get(k)[2].push(t.toFixed(2)); }
await b.close(); server.close();
const rows = [...seen.values()].sort((a, b) => (a[0] === 'error' ? 0 : 1) - (b[0] === 'error' ? 0 : 1));
for (const [lvl, msg, ts] of rows) console.log(`${lvl.toUpperCase().padEnd(5)} t=${ts.length > 4 ? ts.slice(0, 2).join(',') + '…' + ts.at(-1) : ts.join(',')}  ${msg}`);
const errs = rows.filter(r => r[0] === 'error').length; console.log(`\n${page}: ${errs} error(s), ${rows.length - errs} warning(s)`); process.exit(errs ? 1 : 0);
