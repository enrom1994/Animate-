# Episode 1's score on sampled instruments (pizzicato cellos/violins, glockenspiel, string section): the same notes
# and timing as the synth bed in audio.py. Writes audio/music_sampled.wav (48 kHz stereo).
# Run from the episode folder with the Lemo-Opuscar library's Python: <LIB>/.venv/bin/python music_sampled.py <LIB>
import sys, json, re, os, numpy as np, soundfile as sf
LIB = sys.argv[1]; sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add
S.seed(3)
W = json.load(open('audio/words_new.json'))
n_ = lambda x: re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', '', x.lower())).strip()
def AT(ph):
    p = n_(ph).split()
    for i in range(len(W) - len(p) + 1):
        if all(n_(W[i + q]['w']) == p[q] and W[i + q]['line'] == W[i]['line'] for q in range(len(p))): return W[i]['s']
    raise SystemExit('phrase not found: ' + ph)
END = W[-1]['e'] + 1.5; BEAT = 60 / 104
DMAJ = [(38, (62, 66, 69)), (43, (62, 67, 71)), (45, (61, 64, 69)), (38, (62, 66, 69))]
motif = [(0, 74), (.5, 77), (1, 81), (2, 79), (2.5, 77), (3, 76)]
buf = np.zeros((int((END + 3) * SR), 2), np.float32)
def put(x, t, g, pan=0): add(buf, x.astype(np.float32), t, g, pan)
def playful(t0, t1, g=1.0, stabs=True):
    t = t0; bar = 0
    while t < t1 - .05:
        root, ch = DMAJ[bar % 4]
        put(S.note('cellos_pizz', root + 12, .6, vel=.7), t, .9 * g, -.1); put(S.note('cellos_pizz', root + 19, .6, vel=.6), t + 2 * BEAT, .7 * g, -.1)
        if stabs:
            for bt in (1, 3):
                for m in ch: put(S.note('violins_pizz', m, .3, vel=.45), t + bt * BEAT, .3 * g, .25)
        if bar % 2 == 0:
            for bt, m in motif:
                mm = m + (1 if m % 12 == 5 else 0)
                if t + bt * BEAT < t1: put(S.note('glockenspiel', mm + 12 if mm < 79 else mm, 1.0, vel=.5), t + bt * BEAT, .5 * g, .15)
        t += 4 * BEAT; bar += 1
def pad(t0, d, g):
    for m in (50, 57, 62, 66): put(S.note('strings', m + 12, d, vel=.35, attack=.5), t0, g * .5, 0)
CH = [AT('Mystery number one'), AT('Mystery number two'), AT('Mystery number three'), AT('Mystery number four'), AT('So now we know')]
playful(0, CH[0], .7)
playful(CH[0], AT("Deep in Biscuit's"), .6, stabs=False)
pad(AT("Deep in Biscuit's"), max(1, AT('A few years ago') - AT("Deep in Biscuit's")), .6)   # inside the voice box: soft strings
playful(AT('A few years ago'), CH[1], .6, stabs=False)
playful(CH[1], CH[2], .65); playful(CH[2], CH[3], .6, stabs=False); playful(CH[3], CH[4], .65); playful(CH[4], END - .4, .8)
pad(END - .5, 1.6, .9)
for m in (62, 66, 69, 74): put(S.note('cellos_pizz', m - 12 + 12, .8, vel=.6), END - .45, .5, -.1); put(S.note('glockenspiel', m + 12 if m + 12 >= 79 else m + 24, 1.3, vel=.45), END - .45, .3, .15)
buf = S.room(buf, size=.3, mix=.14)
sf.write('audio/music_sampled.wav', buf, SR); print('music_sampled', round(len(buf) / SR, 1), 's')
