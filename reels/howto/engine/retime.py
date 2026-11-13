#!/usr/bin/env python3
"""After a new voice take: python3 engine/retime.py <film folder>
The shots in src/shots.js are timed against a reference take (tools/words_ref.json: word start times and the end). This maps them onto the take in
audio/vo.words.json word by word, and rewrites src/captions.js (captions, duration, the time map) for the new take."""
import json, os, re
import sys
HERE = os.path.realpath(sys.argv[1])
ref_path = os.path.join(HERE, 'tools/words_ref.json')
W = json.load(open(os.path.join(HERE, 'audio/vo.words.json')))
if not os.path.exists(ref_path): json.dump({'end': round(W[-1]['e'] + .9, 2), 'words': [round(w['s'], 3) for w in W]}, open(ref_path, 'w'))
RJ = json.load(open(ref_path)); REF, REF_END = RJ['words'], RJ['end']; assert len(REF) == len(W), 'the script changed: re-time src/shots.js by hand and delete tools/words_ref.json'
end = round(W[-1]['e'] + .85, 2)
warp = [[0, 0]] + [[r, round(w['s'], 3)] for r, w in zip(REF, W) if r > 0] + [[REF_END, end]]
warp = [p for i, p in enumerate(warp) if i == 0 or (p[0] > warp[i - 1][0] and p[1] > warp[i - 1][1])]
HI = {'not', 'river', 'olympic', 'tire', 'drown', 'under', 'hundred', 'sideways', 'along', 'angle', 'relax', 'wave', 'gap', 'grabs'}
caps, cur = [], []
def flush():
    global cur
    if not cur: return
    ws = [re.sub(r"[^a-z0-9' ]", '', w['w'].lower()) for w in cur]
    last = cur[0]['s'] > W[-1]['s'] - 1.2
    caps.append([round(cur[0]['s'] - .03, 2), ' '.join(f'<b>{c}</b>' if c in HI or (last and c == 'rip') else c for c in ws), round(cur[-1]['e'] + .25, 2)]); cur = []
for i, w in enumerate(W):
    cur.append(w); nxt = W[i + 1] if i + 1 < len(W) else None
    if re.search(r'[.,?!]$', w['w']) or len(cur) >= 3 or sum(len(x['w']) for x in cur) >= 11 or (nxt and nxt['s'] - w['e'] > .25): flush()
flush()
for a, b in zip(caps, caps[1:]): a[2] = min(a[2], b[0])
open(os.path.join(HERE, 'src/captions.js'), 'w').write('// written by engine/retime.py from audio/vo.words.json\nexport const CAPTIONS = ' + json.dumps(caps) + ';\nexport const DURATION = ' + str(end) + ';\n// [time in the first take, time in this take]: the shots are written in first-take seconds\nexport const WARP = ' + json.dumps(warp) + ';\n')
json.dump(warp, open(os.path.join(HERE, 'tools/warp.json'), 'w'))
print('duration', end, len(caps), 'captions')
