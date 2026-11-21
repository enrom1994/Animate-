#!/usr/bin/env python3
"""The hook gate: python3 reels/hookgate.py <film folder>     (exit 1 = do not record the voice yet)

Every Short, video or script in this repo runs this BEFORE its voice is recorded, so no finished film has to be reopened
for its hook. It uses the hooks toolkit (.claude/skills/yt-script: the 21 formulas in hooks.json and hookscore.py).

The film folder needs:
  script.json  the spoken lines; line 1 is the hook
  hooks.txt    at least five candidate hooks, one per line, written against the 21 formulas (the chosen one among them)
It passes when line 1 of the script is one of the candidates, scores at least 60 (WORKABLE), and is the top scorer or within
5 points of it (a lower pick is allowed for a reason, written as a '# why:' line in hooks.txt). It writes hooks_report.txt
(every candidate's five properties and verdict) next to the script, to keep with the film.
"""
import json, os, subprocess, sys
FILM = os.path.realpath(sys.argv[1]); TOOL = os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', '.claude', 'skills', 'yt-script', 'hookscore.py')
MIN_SCORE, MIN_OPTIONS, SLACK = 60, 5, 5
norm = lambda s: ' '.join(s.lower().replace('’', "'").split())
fail = lambda msg: (print('HOOK GATE FAILED:', msg), sys.exit(1))
if not os.path.exists(os.path.join(FILM, 'script.json')): fail('no script.json')
if not os.path.exists(os.path.join(FILM, 'hooks.txt')): fail('no hooks.txt: write at least five candidate hooks against .claude/skills/yt-script/hooks.json')
hook = json.load(open(os.path.join(FILM, 'script.json')))[0]
lines = [l.strip() for l in open(os.path.join(FILM, 'hooks.txt')) if l.strip()]
why = [l for l in lines if l.startswith('#')]; cands = [l for l in lines if not l.startswith('#')]
if len(cands) < MIN_OPTIONS: fail(f'{len(cands)} candidates in hooks.txt; write at least {MIN_OPTIONS}')
tmp = os.path.join(FILM, '.hooks_tmp.txt'); open(tmp, 'w').write('\n'.join(cands) + '\n')
try: res = json.loads(subprocess.run([sys.executable, TOOL, '--json', tmp], capture_output=True, text=True, check=True).stdout)
finally: os.remove(tmp)
res.sort(key=lambda r: -r['verdict'])
rep = [f"hook gate · {os.path.basename(FILM)} · line 1: {hook}", '']
for r in res: rep.append(f"{r['verdict']:3d} {r['band']:<9} {r['formula']:<24} {'  '.join(f'{k[:4]} {v}' for k, v in r['properties'].items())}  |  {r['hook']}")
open(os.path.join(FILM, 'hooks_report.txt'), 'w').write('\n'.join(rep + why) + '\n'); print('\n'.join(rep))
mine = next((r for r in res if norm(r['hook']) == norm(hook)), None)
if not mine: fail('line 1 of script.json is not one of the candidates in hooks.txt')
if mine['verdict'] < MIN_SCORE: fail(f"the hook scores {mine['verdict']} ({mine['band']}); it needs {MIN_SCORE}. Weakest: {min(mine['properties'], key=mine['properties'].get)}")
if mine['verdict'] < res[0]['verdict'] - SLACK and not why: fail(f"a candidate scores {res[0]['verdict']} against the chosen {mine['verdict']}: use it, or say why in a '# why:' line")
print(f"\nHOOK GATE PASSED: {mine['verdict']} ({mine['band']}, {mine['formula']})")
