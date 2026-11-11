"""Chapter timing from the recorded lines: each chapter = a title card (except the cold open and the outro), then the
lines with a 0.45 s gap and the extra pauses below (reveals, scans, measurements). Writes timing.json.
usage: python3 -I tools/timing.py"""
import json
L = json.load(open('lines.json')); D = json.load(open('voices/durations.json'))
TITLES = {0: None, 1: 'Where the water starts', 2: 'A treaty for two', 3: 'Power for the dark', 4: 'Five summers', 5: 'What Egypt fears', 6: 'The flood of 2025', 7: None}
CARD = 3.8; GAP = 0.45; GAP0 = 0.3   # the hook runs tighter
PAUSE = {'c0a': .15, 'c0b': .15, 'c0d': .15, 'c0e': .1, 'c0f': 3.2, 'c1c': .6, 'c1d': 1.4, 'c1f': 1.6, 'c2c': 1.6, 'c3b': 1.0, 'c3c': 1.2, 'c3f': 1.0, 'c3g': 1.2,
         'c4d': .6, 'c4e': 1.0, 'c4f': 1.0, 'c4g': 1.6, 'c4h': 2.2, 'c4i': 1.4, 'c4k': 1.0, 'c5b': 1.0, 'c5c': 1.0, 'c6b': .8, 'c6f': .6, 'c7b': 1.0, 'c7c': 3.4}
out = []
for ch in range(8):
    t = CARD + .4 if TITLES[ch] else (.5 if ch == 0 else 1.2)   # the cold open speaks at once
    lines = []
    for l in [x for x in L if x['ch'] == ch]:
        lines.append({'id': l['id'], 't': round(t, 3), 'd': D[l['id']], 'text': l.get('sub', l['text'])})
        t += D[l['id']] + (GAP0 if ch == 0 else GAP) + PAUSE.get(l['id'], 0)
    out.append({'ch': ch, 'title': TITLES[ch], 'card': CARD if TITLES[ch] else 0, 'dur': round(t + .8, 3), 'lines': lines})
json.dump(out, open('timing.json', 'w'), indent=1)
print(' '.join(f"ch{c['ch']}:{c['dur']:.1f}s" for c in out), ' total', round(sum(c['dur'] for c in out), 1), 's')
