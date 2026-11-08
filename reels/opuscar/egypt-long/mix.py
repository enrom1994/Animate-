# One chapter's score + telemetry foley + voice → out/mix_<ch>.wav (48 kHz stereo).
# Reads out/events_<ch>.json (from film.js) and voices/*.wav. Run from the library root with its Python:
#   cd $LIB && .venv/bin/python <project>/mix.py <ch>
# Palette (Satellite Briefing §7): pulse bass with harmonics, detuned-saw pad, timpani + low brass on the key readings,
# FM pings, noise scans, servo whines, ratchets; one wet timbre (vibraphone) for the turns.
import sys, os, json, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.getcwd())
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add
CH = int(sys.argv[1]); S.seed(20 + CH)
E = json.load(open(f'{HERE}/out/events_{CH}.json')); DUR = E['dur']; EV = E['ev']
N = int((DUR + .3) * SR)
mus, fol, bed, vox = (np.zeros((N, 2), np.float32) for _ in range(4))
def put(buf, x, t, g=1.0, pan=0.0):
    if x.ndim == 2: x = x.mean(1)
    add(buf, x.astype(np.float32), max(0, t), g, pan)
tt = X.t_
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def pulse(m, d, v=1.0):
    t = tt(d); f = hz(m); x = np.sin(2 * np.pi * f * t) + .5 * np.sin(4 * np.pi * f * t) + .28 * np.sin(6 * np.pi * f * t)
    return X.lp(x, 900) * np.exp(-t * 5) * np.minimum(1, t / .004) * .35 * v
def pad(ms, d, v=1.0, cut=1200):
    t = tt(d); x = np.zeros(len(t))
    for m in ms:
        for dt in (-.006, 0, .007): ph = np.cumsum(np.full(len(t), hz(m) * (1 + dt))) / SR; x += 2 * (ph % 1) - 1
    return X.lp(x / (len(ms) * 3), cut, 2) * np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.0) * .22 * v
def ping(f=1800, v=1.0):
    t = tt(.9); return np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * f * 1.41 * t) * 2.2 * np.exp(-t * 6)) * np.exp(-t * 5.5) * .35 * v
def scan(d, down=True):
    t = tt(d); n = X.noise(d); out = np.zeros(len(t)); k = 8
    for i in range(k):
        f = 600 * 2 ** ((k - i if down else i) / 2.2); out += X.bp(n, f, min(f * 1.6, 20000)) * np.exp(-((t / d - i / (k - 1)) / .16) ** 2)
    return out * np.sin(np.pi * np.clip(t / d, 0, 1)) * .55
def servo(d, up=True):
    t = tt(d); f = (300 + 500 * t / d) if up else (800 - 500 * t / d); ph = np.cumsum(f) / SR
    return X.lp(np.sin(2 * np.pi * ph) + .3 * np.sin(4 * np.pi * ph), 2500) * np.sin(np.pi * np.clip(t / d, 0, 1)) * .07
def riser(d): t = tt(d); return X.bp(X.noise(d), 1500, 9000) * (t / d) ** 2.2 * .35
def tick(v=1.0): t = tt(.03); return X.hp(X.noise(.03), 3500) * np.exp(-t * 260) * .5 * v
# ———— score ————
BPM = 96; E8 = 30 / BPM; BAR = 8 * E8
HARM = [(38, [50, 57, 62, 65]), (34, [46, 53, 58, 62]), (41, [53, 57, 60, 65]), (36, [48, 55, 60, 64])]   # Dm Bb F C
STYLE = {0: (False, .9, 900), 1: (True, .8, 1300), 2: (False, 1.0, 1100), 3: (True, .7, 1200), 4: (True, .8, 1500), 5: (True, .75, 1300), 6: (False, 1.0, 1300)}[CH]
pulse_on, pad_v, cut = STYLE
t = 0.0; b = 0
while t < DUR - .2:
    root, ch = HARM[(b + CH) % 4]; L = min(BAR, DUR - t)
    put(mus, pad(ch, L + .8, pad_v, cut), t)
    if pulse_on:
        for k in range(8):
            if t + k * E8 < DUR - .5: put(mus, pulse(root + (12 if k % 4 == 3 else 0), E8 * .9, .9 if k % 2 == 0 else .62), t + k * E8, 1, -.1)
    t += BAR; b += 1
if CH in (0, 6):
    for j, m in enumerate([74, 77, 81, 79, 77, 74]): put(mus, S.note('vibraphone', m, 1.8, vel=.45), 1.0 + j * E8 * 3, .5, .25)
# ———— events ————
suck = []
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'orbit': put(bed, X.lp(X.noise(e['dur']), 160) * .45 * np.minimum(1, tt(e['dur']) / 1.0) * np.minimum(1, (e['dur'] - tt(e['dur'])) / 1.2), t, .8)
    elif ty == 'card': put(mus, S.hit('gran_cassa', None, .7), t, .8); put(mus, S.hit('sus_cymbal', None, .35), t, .4, .2)
    elif ty == 'lock': put(fol, ping(1760), t, .8); put(fol, ping(2640, .5), t + .09, .45, .2)
    elif ty == 'title': put(mus, S.note('timpani', 'D2', 2.0, vel=.75), t, .9); put(mus, S.note('trombone', 'D3', .7, vel=.6), t, .45, -.1); put(mus, S.note('vibraphone', 86, 2.5, vel=.5), t + .3, .45, .2)
    elif ty == 'scan': put(fol, scan(e['dur'] + .3, down=e['dir'] > 0), t - .1, .8)
    elif ty == 'glass': put(mus, S.note('vibraphone', 86, 2.5, vel=.55), t, .5, -.3)
    elif ty == 'ticks': [put(fol, tick(), t + k * e['dur'] / 10, .55, .4 - .08 * k) for k in range(10)]
    elif ty == 'reading':
        put(mus, S.note('timpani', 'D2', 1.5, vel=.8 if e['heavy'] else .5), t, 1.0 if e['heavy'] else .65)
        if e['heavy']: put(mus, S.note('trombone', 'D3', .5, vel=.75), t, .55, -.1); put(mus, S.note('tuba', 'D2', .5, vel=.7), t, .45, .1)
        put(fol, ping(2200, .4), t, .5, .3)
    elif ty == 'servo': put(fol, servo(e['dur']), t, .9, -.2)
    elif ty == 'dive': put(fol, riser(e['dur']), t, .7); put(fol, servo(e['dur'], up=False), t, .8, .2)
    elif ty == 'climb': put(fol, X.whoosh(min(1.6, e['dur']), .7), t, .5); put(fol, servo(e['dur'], up=True), t, .6, -.2)
    elif ty == 'ratchet': [put(fol, X.click(1.3, .5), t + k * e['dur'] / 9, .55, -.3 + .07 * k) for k in range(9)]
    elif ty == 'stamp': put(fol, tick(1.2), t, .6, .5); put(fol, ping(3100, .3), t + .05, .35, .5)
    elif ty == 'flood': d = e['dur']; put(mus, pad([45, 52, 57, 60], d + 1.5, 1.3, 700), t, 1, 0); put(bed, X.lp(X.noise(d + 1), 500) * .25 * np.sin(np.pi * tt(d + 1) / (d + 1)), t, 1, -.2)
    elif ty == 'suckout': suck.append(t)
put(bed, X.hp(X.noise(DUR + .2), 3000) * .013, 0, 1)
mus = S.room(mus, size=.45, mix=.18)
for s0 in suck: i0, i1 = int(s0 * SR), int((s0 + .4) * SR); mus[i0:i1] *= .06; fol[i0:i1] *= .06
# ———— voice ————
for e in EV:
    if e['type'] != 'voice': continue
    v, sr = sf.read(f"{HERE}/voices/{e['id']}.wav", dtype='float32')
    if v.ndim > 1: v = v.mean(1)
    if sr != SR: v = np.interp(np.arange(int(len(v) * SR / sr)) / SR, np.arange(len(v)) / sr, v).astype(np.float32)
    v = X.compress(X.hp(v, 75), thr=.2, ratio=2.5); v = v / (np.sqrt(np.mean(v ** 2)) + 1e-9) * .1
    put(vox, v, e['t'])
venv = np.convolve(np.abs(vox[:, 0]), np.ones(2400) / 2400, 'same'); duck = 1 - .5 * np.clip(venv / .03, 0, 1)
mix = vox + mus * .48 * duck[:, None] + fol * .8 + bed * .7
mix = X.hp(mix.T, 40).T.astype(np.float32)
fi, fo = int(.03 * SR), int(.25 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]; mix[-fo:] *= np.linspace(1, 0, fo)[:, None]   # clean chapter joins
mix = X.limit(mix, .9)
sf.write(f'{HERE}/out/mix_{CH}.wav', mix, SR); print('mix', CH, round(N / SR, 1), 's')
