// node engine/check.mjs <film> [step]   (GL=swiftshader without a GPU)
// The gate before every full render. Two parts:
//  1. lint: the shot code, read as text, for mistakes we have shipped (REGRESSIONS.md 14, 23).
//  2. audit: every film moment, every `step` seconds (default 0.3), drawn and checked in the page (window.audit in main.js):
//     camera inside a solid (19), feet floating or sunk (17, 20), a body inside an object (19, 20), faces cut off by the frame edge
//     or under the captions. Errors stop the render; warnings are listed for a person to look at.
// Exit code 1 if there is any error. Prints one line per problem with the shot number and the film time.
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), KIT = path.resolve(ROOT, '../../.claude/kit'), FILM = process.argv[2], STEP = Number(process.argv[3] || .3);
if (!FILM || !fs.existsSync(path.join(ROOT, FILM, 'src/shots.js'))) { console.log('usage: node engine/check.mjs <film> [step]'); process.exit(2); }
const problems = [];
// ---- 1. lint ----
for (const f of fs.readdirSync(path.join(ROOT, FILM, 'src')).filter(f => f.endsWith('.js'))) {
  fs.readFileSync(path.join(ROOT, FILM, 'src', f), 'utf8').split('\n').forEach((line, i) => {
    const at = `${f}:${i + 1}`;
    if (/\b(walkTo|runTo|walk|run)\(\s*t\s*[,+)]/.test(line)) problems.push(['error', 'lint', at, 'a walk or run stepped by the clock (t): step it by distance, ST.walk(metres) / ST.run(metres) (check 23)']);
    if (/leg[LR]:\s*[-.\d]*\s*\*\s*Math\.sin\(\s*t\s*\*/.test(line)) problems.push(['error', 'lint', at, 'legs swung by the clock (Math.sin(t * k)): tie the swing to distance covered (check 23)']);
    const c = line.indexOf('//'); if (c > 0 && !/https?:\/\//.test(line) && /\S/.test(line.slice(0, c)) && /(w\.act|w\.cam|return\s*\{|\}\);|=>\s*\{)/.test(line.slice(c))) problems.push(['error', 'lint', at, 'code after a // comment on the same line is commented out (check 14); use /* */ or a new line']);
  });
}
// ---- 2. audit ----
let chromium; try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { ({ chromium } = createRequire(KIT + '/')('playwright')); }
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]), p = path.join(u.startsWith('/node_modules/') ? KIT : ROOT, u);
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); }).listen(0);
const GL = process.env.GL === 'swiftshader' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : ['--enable-gpu'];
const browser = await chromium.launch({ args: [...GL, '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
page.on('pageerror', e => problems.push(['error', 'page', '-', e.message]));
await page.goto(`http://localhost:${server.address().port}/engine/index.html?render=1&film=${FILM}`);
await page.waitForFunction(() => window.renderAt && window.ready && window.audit); await page.evaluate(() => window.ready);
const dur = await page.evaluate(() => window.DURATION), seen = new Map();
for (let t = .05; t < dur; t += STEP) { const r = await page.evaluate(t => window.audit(t), t);
  for (const [lvl, msg] of r.issues) { const key = r.shot + '|' + msg.replace(/[\d.]+ m/, '').replace(/\(.*\)/, ''); if (seen.has(key)) { seen.get(key)[2].push(t.toFixed(1)); continue; } const row = [lvl, 'shot ' + (r.shot + 1), [t.toFixed(1)], msg]; seen.set(key, row); problems.push(row); } }
await browser.close(); server.close();
// ---- report ----
const errs = problems.filter(p => p[0] === 'error'), warns = problems.filter(p => p[0] === 'warn');
for (const [lvl, where, at, msg] of [...errs, ...warns]) console.log(`${lvl.toUpperCase().padEnd(5)} ${where.padEnd(9)} ${Array.isArray(at) ? 't=' + (at.length > 4 ? at.slice(0, 2).join(',') + '…' + at.at(-1) : at.join(',')) : at}  ${msg}`);
console.log(`\n${FILM}: ${errs.length} error(s), ${warns.length} warning(s). ${errs.length ? 'Fix the errors before a full render.' : 'Clear to render; look at each warning in its still.'}`);
process.exit(errs.length ? 1 : 0);
