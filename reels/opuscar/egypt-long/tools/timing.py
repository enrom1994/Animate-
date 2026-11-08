"""Chapter timing from the recorded lines: each chapter = a title card (except the cold open and the outro), then the
lines with a 0.45 s gap and the extra pauses below (reveals, scans, measurements). Writes timing.json.
usage: python3 -I tools/timing.py"""
import json
L = json.load(open('lines.json')); D = json.load(open('voices/durations.json'))
TITLES = {0: None, 1: 'A country of 4%', 2: 'The flood that built Egypt', 3: 'The coast pulls back', 4: 'A city on its own fields', 5: 'Into the desert', 6: None}
CARD = 3.8; GAP = 0.45
PAUSE = {'c0b': 1.2, 'c0d': 3.4, 'c1b': .6, 'c1f': 1.6, 'c1g': 1.6, 'c2b': 1.0, 'c2d': 1.4, 'c2e': 1.2, 'c3a': .8, 'c3b': .6, 'c3c': 2.0, 'c3d': 1.4,
         'c4c': .6, 'c4d': 1.4, 'c4e': 2.0, 'c4f': .6, 'c4g': 1.4, 'c5b': 1.0, 'c5c': 1.0, 'c5d': .8, 'c5e': .6, 'c5f': 2.0, 'c5g': 1.0, 'c6b': 1.2, 'c6c': 3.0}
out = []
for ch in range(7):
    t = CARD + .4 if TITLES[ch] else 1.2
    lines = []
    for l in [x for x in L if x['ch'] == ch]:
        lines.append({'id': l['id'], 't': round(t, 3), 'd': D[l['id']], 'text': l.get('sub', l['text'])})
        t += D[l['id']] + GAP + PAUSE.get(l['id'], 0)
    out.append({'ch': ch, 'title': TITLES[ch], 'card': CARD if TITLES[ch] else 0, 'dur': round(t + .8, 3), 'lines': lines})
json.dump(out, open('timing.json', 'w'), indent=1)
print(' '.join(f"ch{c['ch']}:{c['dur']:.1f}s" for c in out), ' total', round(sum(c['dur'] for c in out), 1), 's')
