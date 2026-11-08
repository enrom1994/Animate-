# One chapter's score + telemetry foley + voice → out/mix_<ch>.wav (48 kHz stereo).
# Reads out/events_<ch>.json (from film.js) and voices/*.wav. Run from the library root with its Python:
#   cd $LIB && .venv/bin/python <project>/mix.py <ch>
# Palette (Satellite Briefing §7): pulse bass with harmonics, detuned-saw pad, timpani + low brass on the key readings,
# real recorded whooshes, hits and place ambiences (Mixkit); no hiss beds; one wet timbre (vibraphone) for the turns.
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
suck = []
# ———— real recorded sounds (Mixkit, via .claude/kit/sfx/library; checked with earshot) ————
import subprocess, functools
LIB = os.path.realpath(os.path.join(HERE, '..', '..', '..', '.claude', 'kit', 'sfx', 'library'))
@functools.lru_cache(None)
def rec(name):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{LIB}/{name}', '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()
def clip(name, d=None, fade=.4):
    x = rec(name); x = x[:int(d * SR)] if d else x; n = min(len(x), int(fade * SR))
    if n: x = x.copy(); x[-n:] *= np.linspace(1, 0, n)
    return x / (np.abs(x).max() + 1e-9)
def bed_from(name, t0, t1, g, pan=0.0, fade=1.5):
    d = max(.5, t1 - t0); x = rec(name)
    while len(x) < d * SR: x = np.concatenate([x, rec(name)])
    x = x[:int(d * SR)].copy(); n = min(len(x) // 2, int(fade * SR)); x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n)
    x = X.lp(x, 3500, 2)                                         # no hiss: the top end of wind and surf is cut
    put(bed, x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * .025, t0, g, pan)
WHOOSH, SWOOSH = 'whoosh/air_woosh_mixkit1489.mp3', 'whoosh/transition_windy_swoosh_mixkit1474.mp3'
HIT, LOGO = 'impact/movie_impact_intro_presentation_mixkit2902.mp3', 'impact/movie_logo_intro_impact_mixkit2900.mp3'
DESERT, RIVER, SEA, CITY = 'ambience/desert_ambience_mixkit2495.mp3', 'ambience/river_water_flowing_mixkit2454.mp3', 'ambience/sea_waves_ambience_mixkit1189.mp3', 'ambience/city_traffic_ambience_mixkit2931.mp3'
first = lambda ty: next((e for e in EV if e['type'] == ty), None)
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'card': put(fol, clip(SWOOSH), t, .35, .1)
    elif ty == 'title': put(fol, clip(LOGO, 4.0, 1.2), t, .5); put(mus, S.note('vibraphone', 86, 2.5, vel=.45), t + .3, .4, .2)
    elif ty == 'reading':
        if e['heavy']: put(fol, clip(HIT, 2.2, .8), t - .05, .42); put(mus, S.note('timpani', 'D2', 1.5, vel=.6), t, .6)
        else: put(mus, S.note('timpani', 'D2', 1.2, vel=.4), t, .45)
    elif ty in ('dive', 'climb'): put(fol, clip(WHOOSH), t + max(0, e['dur'] * .5 - .9), .3, -.1 if ty == 'dive' else .1)
    elif ty == 'scan': put(fol, clip(WHOOSH, 1.8), t, .18, .3)
    elif ty == 'glass': put(mus, S.note('vibraphone', 86, 2.5, vel=.45), t, .4, -.3)
    elif ty == 'suckout': suck.append(t)
    elif ty == 'flood': bed_from(RIVER, t - .5, t + e['dur'] + 2.5, 1.0, -.1, 1.2)
# places, quietly under the voice
dv = first('dive'); cl = [e for e in EV if e['type'] == 'climb']
if CH == 1 and dv: bed_from(DESERT, dv['t'] + 1, DUR, .8)
if CH == 3 and dv: bed_from(SEA, dv['t'] + 1, (cl[-1]['t'] + 1.5) if cl else DUR, 1.0)
if CH == 4 and dv: bed_from(CITY, dv['t'] + .5, DUR, .7)
if CH == 5: st = first('stamp'); bed_from(DESERT, st['t'] if st else 2, DUR, .8)
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
