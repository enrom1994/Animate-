#!/usr/bin/env python3
"""The hook gate: python3 reels/hookgate.py <film folder>     (exit 1 = do not record the voice yet)

Every Short, video or script in this repo runs this BEFORE its voice is recorded, so no finished film has to be reopened
for its hook. It uses the hooks toolkit (.claude/skills/yt-script: the 21 formulas in hooks.json and hookscore.py).

The film folder needs:
  script.json  the spoken lines; line 1 is the hook
  hooks.txt    at least five candidate hooks, one per line, written against the 21 formulas (the chosen one among them)
It passes when line 1 of the script is one of the candidates, takes 5.5 s or less to say (voiced and timed), scores at least 60
(WORKABLE), and is the top scorer or within 5 points of it (a lower pick is allowed for a reason, written as a '# why:' line in hooks.txt). It writes hooks_report.txt
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
def spoken_seconds(line):   # the hook voiced by the channel voice (Kokoro Fenrir, speed 1.08) and timed: numbers make word counts lie
    try:
        import numpy as np, espeakng_loader
        from kokoro_onnx import Kokoro, EspeakConfig
        kit = os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', '.claude', 'kit', 'models')
        k = Kokoro(os.path.join(kit, 'kokoro-v1.0.onnx'), os.path.join(kit, 'voices-v1.0.bin'), espeak_config=EspeakConfig(lib_path=espeakng_loader.get_library_path(), data_path=espeakng_loader.get_data_path()))
        a, sr = k.create(line, voice=os.environ.get('HOOK_VOICE', 'am_fenrir'), speed=float(os.environ.get('HOOK_SPEED', 1.08)), lang='en-us')
        i = np.where(np.abs(a) > .01)[0]; return (i[-1] - i[0]) / sr
    except Exception as e:
        print('(no voice to time the hook with:', e, '- estimating from the words, numbers counted as three)')
        return sum(3 if any(c.isdigit() for c in w) else 1 for w in line.split()) / 3.2
MAX_S = 5.5
secs = spoken_seconds(hook); print(f'spoken length of the hook: {secs:.1f} s (limit {MAX_S} s)')
if secs > MAX_S: fail(f'the hook takes {secs:.1f} s to say; keep it to {MAX_S} s or less (ep. 1 ran 7.2 s and lost half its audience before it ended)')
mine = next((r for r in res if norm(r['hook']) == norm(hook)), None)
if not mine: fail('line 1 of script.json is not one of the candidates in hooks.txt')
if mine['verdict'] < MIN_SCORE: fail(f"the hook scores {mine['verdict']} ({mine['band']}); it needs {MIN_SCORE}. Weakest: {min(mine['properties'], key=mine['properties'].get)}")
if mine['verdict'] < res[0]['verdict'] - SLACK and not why: fail(f"a candidate scores {res[0]['verdict']} against the chosen {mine['verdict']}: use it, or say why in a '# why:' line")
print(f"\nHOOK GATE PASSED: {mine['verdict']} ({mine['band']}, {mine['formula']})")
