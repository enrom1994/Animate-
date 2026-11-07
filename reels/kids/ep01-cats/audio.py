import numpy as np, soundfile as sf, json
from scipy import signal
SR = 44100
import json as _j, os as _os
WARP = _j.load(open('audio/warp.json')) if _os.path.exists('audio/warp.json') else None
def toNew(x):
    if not WARP: return x
    A = WARP['anchors']
    if x <= A[0][0]: return x - A[0][0] + A[0][1]
    for i in range(len(A) - 1):
        if x <= A[i + 1][0]: k = (x - A[i][0]) / (A[i + 1][0] - A[i][0]); return A[i][1] + k * (A[i + 1][1] - A[i][1])
    return x - A[-1][0] + A[-1][1]
DUR = json.load(open('audio/words_new.json'))[-1]['e'] + 1.6
N = int(DUR * SR)
rng = np.random.default_rng(3)
def T(n): return np.arange(n) / SR
def env(n, a=.005, d=.2, curve=4):
    t = T(n); e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(d, 1e-4)); return e
def place(buf, x, at, g=1.0):
    i = int(toNew(at) * SR); j = min(len(buf), i + len(x))
    if i < 0 or i >= len(buf): return
    buf[i:j] += x[:j - i] * g
def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), min(hi / (SR / 2), .99)], 'band'); return signal.lfilter(b, a, x)
def lp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'low'); return signal.lfilter(b, a, x)
def hp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)

# ---------------- SFX ----------------
def whoosh(dur=.35, up=True):
    n = int(dur * SR); x = rng.standard_normal(n); t = T(n)
    lo, hi = bp(x, 250, 1200), bp(x, 1500, 6000); k = np.linspace(0, 1, n) if up else np.linspace(1, 0, n)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return (lo * (1 - k) + hi * k) * e * 1.6
def thud(f0=70, dur=.35, g=1):
    n = int(dur * SR); t = T(n); f = f0 * (1 + 1.5 * np.exp(-t * 30))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12)
    x += lp(rng.standard_normal(n), 900) * np.exp(-t * 40) * .6
    return x * g
def clang(f0=520, dur=1.0):
    n = int(dur * SR); t = T(n); x = np.zeros(n)
    for k, (r, a, d) in enumerate([(1, 1, 5), (2.76, .6, 7), (5.4, .4, 10), (8.9, .25, 14), (1.5, .5, 6)]):
        x += a * np.sin(2 * np.pi * f0 * r * t + k) * np.exp(-t * d)
    x += hp(rng.standard_normal(n), 2000) * np.exp(-t * 60) * .8
    return x * .5 + thud(90, dur, .7)[:n]
def pluck(f, dur=.5, bright=.5):
    n = int(dur * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = bright * buf[i % p] + (1 - bright) * .5 * (buf[i % p] + buf[(i + 1) % p]) * .996 if False else .5 * (buf[i % p] + buf[(i + 1) % p]) * .995
    return out
def chime(f=1760, dur=.8):
    n = int(dur * SR); t = T(n)
    return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.01 * t) + .3 * np.sin(2 * np.pi * f * 3 * t)) * np.exp(-t * 6) * np.minimum(1, t / .003) * .5
def sparkle_sfx():
    out = np.zeros(int(.7 * SR))
    for i, f in enumerate([2093, 2637, 3136, 4186]): place(out, chime(f, .5) * .5, i * .05)
    return out
def tick(): n = int(.04 * SR); t = T(n); return hp(rng.standard_normal(n), 3000) * np.exp(-t * 200) * .8 + np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 150) * .4
def pop(f=600):
    n = int(.12 * SR); t = T(n); fr = f * (1 + 2 * t * 10); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 40)
def boing(f=220, dur=.5):
    n = int(dur * SR); t = T(n); fr = f * (1 + .35 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 3)) * (1 + t)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 5) * .6
def tweet():
    out = np.zeros(int(1.2 * SR))
    for i in range(4):
        n = int(.1 * SR); t = T(n); fr = 3200 + 900 * np.sin(2 * np.pi * 30 * t)
        place(out, np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * t / .1) * .25, i * .25)
    return out
def scribble(dur=.18):
    n = int(dur * SR); t = T(n); return bp(rng.standard_normal(n), 1500, 6000) * (0.5 + .5 * np.sin(2 * np.pi * 30 * t)) * np.sin(np.pi * t / dur) * .5
def riser(dur=2.8):
    n = int(dur * SR); t = T(n); f = 200 * (2 ** (t / dur * 2.5))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .3 + bp(rng.standard_normal(n), 800, 5000) * .3 * (t / dur)
    return x * (t / dur) ** 2
def waves(dur):
    n = int(dur * SR); t = T(n); x = lp(rng.standard_normal(n), 700, 2)
    return x * (0.5 + .5 * np.sin(2 * np.pi * t / 4.5) ** 2) * .5
def heartbeat():
    out = np.zeros(int(.8 * SR)); place(out, thud(55, .3, .8), 0); place(out, thud(50, .3, .6), .22); return out

sfx = np.zeros(N)
# every cue is tied to the narration: LW(line, word) = when that word starts
_W = json.load(open('audio/words_new.json'))
def LW(l, w=0):
    ws = [x for x in _W if x['line'] == l]; return ws[min(w, len(ws) - 1)]['s'] if ws else 0
def purr(dur, g=1.0):   # a cat purr: low noise pulsing about 25 times a second
    n = int(dur * SR); t = T(n); x = lp(rng.standard_normal(n), 380) * (0.55 + 0.45 * np.sin(2 * np.pi * 25 * t)) ** 2
    x += np.sin(2 * np.pi * 50 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 25 * t)) * .25
    e = np.minimum(1, t / .25) * np.minimum(1, (dur - t) / .3); return x * e * g
import re as _re
_n = lambda x: _re.sub(r'\s+', ' ', _re.sub(r'[^a-z0-9 ]', '', x.lower())).strip()
def AT(phrase, k=0):   # when a phrase starts (same lookup as the picture), so cues survive added lines
    p = _n(phrase).split(' ')
    for i in range(len(_W) - len(p) + 1):
        if all(_n(_W[i + q]['w']) == p[q] and _W[i + q]['line'] == _W[i]['line'] for q in range(len(p))): return _W[i + min(k, len(p) - 1)]['s']
    raise SystemExit('phrase not found: ' + phrase)
SH = json.load(open('audio/shots.json'))   # [start, end] of every shot, from the renderer
for a_, b_ in SH[1:]: place(sfx, whoosh(.32), a_ - .2, .26)
for ph in ('Mystery number one', 'Mystery number two', 'Mystery number three'):   # chapter cards
    place(sfx, pop(520), AT(ph), .4); place(sfx, sparkle_sfx(), AT(ph) + .1, .35)
place(sfx, pop(560), .2, .3); place(sfx, chime(1568, .8) * .5, AT('Biscuit'), .3)
for i in range(4): place(sfx, pop(600 + i * 120), AT('four things') + i * .25, .35)
for ph in ('She purrs', 'lands on her feet', 'squishes her paws', 'jumps into every box'): place(sfx, pop(700), AT(ph), .35)
place(sfx, sparkle_sfx(), AT("Let's go"), .35)
# purring cats on screen
for ph0, ph1, g in [('She purrs', 'lands on her feet', .35), ('Listen Biscuit is purring', 'Can I purr too', .7), ('That wobbling makes', 'A few years ago', .9),
                    ('Mother cats purr', 'Big cats are different', .55), ('Cheetahs can purr', 'lions and tigers', .5), ('So Biscuit has a little', 'Mystery number two', .6),
                    ('When cats grow up', 'Cats also have scent', .4), ('So when Biscuit kneads', 'Mystery number four', .5), ('Boxes are warm too', "And here's the funniest", .4), ('So if your cat sits', 'So now we know', .45)]:
    t0, t1 = AT(ph0), AT(ph1); place(sfx, purr(max(.5, t1 - t0 - .2)), t0, g)
place(sfx, chime(1568, .8) * .5, AT('it does'), .3)
for ph in ('scared', 'or sick', 'or hurt'): place(sfx, pop(520), AT(ph), .4)
place(sfx, pop(700), AT('voice box'), .4)
for i in range(14): place(sfx, tick(), AT('About') + i * .1, .22)
place(sfx, chime(1046, .8), AT('About') + 1.45, .3)
place(sfx, thud(55, .3, .6), AT('That wobbling makes'), .5)
place(sfx, sparkle_sfx(), AT('tiny soft pads'), .35)
place(sfx, pop(520), AT('Cheetahs can purr'), .35); place(sfx, pop(440), AT('lions and tigers'), .35)
place(sfx, lp(rng.standard_normal(int(1.2 * SR)), 500) * np.exp(-T(int(1.2 * SR)) * 2.5) * 1.2, AT('They roar'), .45)
place(sfx, sparkle_sfx(), AT('purring engine'), .3); place(sfx, chime(1318, .9) * .5, AT('Cool right'), .3)
# landing
place(sfx, whoosh(1.0, False), AT('jumped off') + .2, .35); place(sfx, thud(140, .25, .5), AT('plop'), .55); place(sfx, boing(300, .4), AT('plop') + .05, .2)
for i in range(4): place(sfx, pop(600 + i * 80), AT('all four paws') + i * .15, .25)
place(sfx, boing(240, .5), AT('How does she do it'), .2)
place(sfx, sparkle_sfx(), AT('righting reflex'), .3); place(sfx, whoosh(1.0), AT('turning the right way up'), .3)
place(sfx, pop(650), AT('inner ear'), .35); place(sfx, pop(750), AT('which way is up'), .3); place(sfx, pop(850), AT('Her eyes help'), .3)
for ph, o in (('Then she twists', 0), ('front half', 0), ('back half', 0), ('back half', 1.1)): place(sfx, whoosh(.3), AT(ph) + o - .1, .25); place(sfx, pop(600), AT(ph) + o, .3)
place(sfx, boing(200, .6), AT('like a spring'), .3)
place(sfx, pop(520), AT('stiff collarbone'), .3); place(sfx, pop(640), AT('shoulders can move'), .3)
place(sfx, whoosh(1.2, False), AT('Then she reaches'), .3); place(sfx, thud(160, .2, .4), AT('Then she reaches') + 1.4, .45)
place(sfx, pop(520), AT('three weeks'), .35); place(sfx, sparkle_sfx(), AT('seven weeks'), .35)
place(sfx, thud(70, .3, .5), AT('important part'), .4); place(sfx, pop(400), AT('never drop'), .35); place(sfx, chime(1318, .9) * .5, AT('keep our cats safe'), .35)
# kneading
place(sfx, sparkle_sfx(), AT('called kneading'), .3); place(sfx, pop(600), AT('making biscuits'), .35)
place(sfx, boing(320, .4), AT("that's your name"), .3)
place(sfx, pop(700), AT('milk come out'), .35)
place(sfx, chime(1568, .8) * .5, AT('feel safe'), .3); place(sfx, chime(1760, .8) * .5, AT('and happy'), .3)
place(sfx, sparkle_sfx(), AT('scent spots'), .3)
place(sfx, sparkle_sfx(), AT('my cozy spot'), .35)
# ---- new beats ----
def LINE_END(phrase):
    p = _n(phrase).split(' ')
    for i in range(len(_W) - len(p) + 1):
        if all(_n(_W[i + q]['w']) == p[q] and _W[i + q]['line'] == _W[i]['line'] for q in range(len(p))):
            return max(x['e'] for x in _W if x['line'] == _W[i]['line'])
    raise SystemExit('phrase not found: ' + phrase)
for ph, a_, b_ in [('Quick guess first', 'Yes or no', 'or no'), ('Guess first When she turns', 'all at once', 'one half at a time'),
                   ('Guess first Did it start', 'when they were tiny', 'all grown up'), ('Guess first Do cats like boxes', "because they're bored", 'make them feel safe')]:
    place(sfx, sparkle_sfx(), AT(ph), .3); place(sfx, pop(560), AT(a_), .35); place(sfx, pop(700), AT(b_), .35)
    e = LINE_END(ph)
    for k in range(3): place(sfx, tick(), e + k, .5); place(sfx, tick(), e + k + .5, .2)
    place(sfx, chime(1568, .9) * .6, e + 3.0, .35)          # the reveal
place(sfx, boing(180, .6), AT('I tried'), .3); place(sfx, pop(500), AT('toy car'), .35); place(sfx, boing(420, .3), AT('toy car') + .2, .2)
for i in range(5): place(sfx, tick(), AT('special fast camera') + i * .45, .45); place(sfx, pop(900), AT('special fast camera') + i * .45, .15)   # film frames
for i in range(10): place(sfx, tick(), AT('For the first time') + i * .12, .18)   # projector rattle
place(sfx, sparkle_sfx(), AT('one happy cat'), .3); place(sfx, pop(800), AT('or drool'), .3)
# the box
place(sfx, thud(90, .3, .6), AT('Yesterday a big box') + .8, .45)          # box lands
place(sfx, whoosh(.6), AT('jumped in'), .35); place(sfx, thud(120, .3, .6), AT('jumped in') + .7, .5); place(sfx, boing(300, .4), AT('jumped in') + .72, .25)
place(sfx, boing(160, .7), AT('squeezes right in'), .3)
place(sfx, chime(1318, .9) * .5, AT('feel safe'), .3); place(sfx, pop(600), AT('sneak up behind'), .3)
place(sfx, pop(520), AT('so they can rest', 3), .3); place(sfx, pop(640), AT('keep watch'), .3)
place(sfx, sparkle_sfx(), AT('calmed down faster'), .3)
place(sfx, riser(1.5) * .6, AT('keeps the heat in'), .25); place(sfx, chime(1046, .8) * .5, AT('warmer than we do'), .3)
place(sfx, scribble(.5), AT('square made of tape'), .4)
for i in range(6): place(sfx, pop(1200 + i * 40) * .4, AT('on the floor') + i * .27, .25)   # paw steps
for i in range(3): place(sfx, chime(1568 + i * 200, .6) * .4, AT('walked right into') + i * .35 + .5, .3)
place(sfx, sparkle_sfx(), AT("that's enough"), .35); place(sfx, sparkle_sfx(), AT('safe warm hideout'), .3)
# outro
place(sfx, sparkle_sfx(), AT('So now we know'), .35)
for ph in ('purrs with a tiny', 'lands on her feet by', 'makes biscuits because', 'loves boxes because'): place(sfx, pop(620), AT(ph), .35)
for i, ph in enumerate(('A dog', 'A bee', 'An owl')): place(sfx, pop(600 + i * 120), AT(ph), .35)
place(sfx, sparkle_sfx(), AT('Bye Biscuit'), .3)

# ---------------- music (procedural sea-shanty jig, D minor, 6/8) ----------------
BPM = 132  # dotted-quarter = beat; eighth = 60/BPM/... use eighth duration
E8 = 60 / BPM / 2 * 1.0  # eighth note seconds (6/8 feel)
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def saw_pad(f, dur, g=.2):
    n = int(dur * SR); t = T(n); vib = 1 + .004 * np.sin(2 * np.pi * 5.5 * t)
    ph = np.cumsum(f * vib) / SR; x = 2 * (ph % 1) - 1 + .6 * (2 * ((ph * 1.005) % 1) - 1)
    x = lp(x, 1400); e = np.minimum(1, t / .06) * np.minimum(1, (dur - t) / .08)
    return x * e * g
mel = [62, 65, 69, 67, 65, 64, 62, 64, 65, 64, 62, 61, 62, 65, 69, 72, 70, 69, 67, 65, 64, 62, 61, 62]  # 24 eighths = 4 bars of 6/8
chords = [(50, 57, 62, 65), (48, 55, 60, 64), (46, 53, 58, 62), (45, 52, 57, 61)]
plk_cache = {}
def plk(m, dur):
    k = (m, round(dur, 2))
    if k not in plk_cache: plk_cache[k] = pluck(midi(m), dur)
    return plk_cache[k]
music = np.zeros(N)
def jig(t0, t1, g=1.0, mel_on=True, bass_on=True, pad_on=True, drum=True, mel_g=.55):
    t = t0; i = 0
    while t < t1:
        bar = (i // 6) % 4; ch = chords[bar]
        if bass_on and i % 6 == 0: place(music, plk(ch[0] - 12, E8 * 6) * .7, t, g)
        if pad_on and i % 6 == 0:
            for m in ch[1:]: place(music, saw_pad(midi(m), min(E8 * 6, t1 - t)), t, g * .25)
        if mel_on and i % 3 == 0: place(music, plk(mel[i % 24], E8 * 3) * .8, t, g * mel_g)
        # light percussion: frame drum on 1 and 4
        if drum and i % 6 == 0: place(music, thud(100, .12, .15), t, g)
        t += E8; i += 1
def drone(t0, t1, g=1.0):
    n = int((t1 - t0) * SR); t = T(n)
    x = (np.sin(2 * np.pi * 73.4 * t) + .5 * np.sin(2 * np.pi * 110 * t + 1) + .3 * np.sin(2 * np.pi * 146.8 * t * 1.003)) * (0.7 + .3 * np.sin(2 * np.pi * .3 * t))
    x *= np.minimum(1, t / .4) * np.minimum(1, (t1 - t0 - t) / .4)
    place(music, x * .25, t0, g)
# ---- whimsical comedic underscore (replaces jig) ----
music = np.zeros(N)
BEAT = 60 / 104
def pizz(m, dur=.45, g=1.0):
    k = ('pz', m, round(dur, 2))
    if k not in plk_cache:
        x = pluck(midi(m), dur); n = len(x); t = T(n)
        x = bp(x, 180, 3500) * np.exp(-t * 7) + bp(rng.standard_normal(n), 1500, 5000) * np.exp(-t * 300) * .15
        plk_cache[k] = x / (np.max(np.abs(x)) + 1e-9)
    return plk_cache[k] * g
def glock(m, dur=1.2, g=1.0):
    n = int(dur * SR); t = T(n); f = midi(m)
    x = (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6) + .15 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 12))
    return x * np.exp(-t * 3.5) * np.minimum(1, t / .002) * .5 * g
def reed(m, dur=.22, g=1.0):
    n = int(dur * SR); t = T(n); f = midi(m); ph = (f * t) % 1
    x = lp(np.sign(np.sin(2 * np.pi * ph)) * .6 + (2 * ph - 1) * .4, 900)
    return x * np.minimum(1, t / .015) * np.exp(-t * 6) * np.minimum(1, (dur - t) / .03) * .5 * g
def strings(ms, dur, g=1.0):
    n = int(dur * SR); t = T(n); x = np.zeros(n)
    for m in ms:
        for d in (-.004, 0, .005):
            ph = np.cumsum(midi(m) * (1 + d) * (1 + .003 * np.sin(2 * np.pi * 5 * t))) / SR; x += 2 * (ph % 1) - 1
    x = lp(x / (len(ms) * 3), 1100); e = np.minimum(1, t / .5) * np.minimum(1, (dur - t) / .5)
    return x * e * g
# progressions (root, chord tones) in midi
DM = [(38, (62, 65, 69)), (43, (62, 67, 71)), (38, (62, 65, 69)), (45, (61, 64, 67))]   # Dm G Dm A7
DMAJ = [(38, (62, 66, 69)), (43, (62, 67, 71)), (45, (61, 64, 69)), (38, (62, 66, 69))]  # D G A D
motif = [(0, 74), (.5, 77), (1, 81), (2, 79), (2.5, 77), (3, 76)]  # glock line over 1 bar
def playful(t0, t1, prog, g=1.0, glock_on=True, stabs=True):
    t = t0; bar = 0
    while t < t1 - .05:
        root, ch = prog[bar % 4]
        place(music, pizz(root, .5, .9), t, g); place(music, pizz(root + 7, .5, .7), t + 2 * BEAT, g)
        if stabs:
            for bt in (1, 3): 
                for m in ch: place(music, pizz(m - 12, .3, .28), t + bt * BEAT, g)
        if glock_on and bar % 2 == 0:
            for (bt, m) in motif:
                mm = m if prog is DM else m + (1 if m % 12 in (5,) else 0)
                if t + bt * BEAT < t1: place(music, glock(mm, 1.0, .35), t + bt * BEAT, g)
        t += 4 * BEAT; bar += 1
def sneak(t0, t1, g=1.0):
    steps = [38, 38, 41, 40, 39, 38, 36, 37]
    t = t0; i = 0
    while t < t1 - .05:
        place(music, reed(steps[i % 8] + 12, .2, .8), t, g); place(music, pizz(steps[i % 8], .35, .6), t, g)
        t += BEAT * (1 if i % 2 == 0 else 1); i += 1
# gentle, bright underscore all the way through (a kids' video: no dark turns)
END = _W[-1]['e'] + 1.5
CH = [AT('Mystery number one'), AT('Mystery number two'), AT('Mystery number three'), AT('Mystery number four'), AT('So now we know')]
playful(0, CH[0], DMAJ, .7)
playful(CH[0], AT("Deep in Biscuit's"), DMAJ, .6, stabs=False)
place(music, strings((50, 57, 62, 66), max(1, AT('A few years ago') - AT("Deep in Biscuit's")), .3), AT("Deep in Biscuit's"))   # inside the voice box: soft pad
playful(AT('A few years ago'), CH[1], DMAJ, .6, stabs=False)
playful(CH[1], CH[2], DMAJ, .65)
playful(CH[2], CH[3], DMAJ, .6, stabs=False)
playful(CH[3], CH[4], DMAJ, .65)
playful(CH[4], END - .4, DMAJ, .8)
place(music, strings((50, 57, 62, 66), 1.4, .45), END - .5)
for m in (62, 66, 69, 74): place(music, pizz(m - 12, .8, .5), END - .45); place(music, glock(m + 12, 1.3, .25), END - .45)
music = lp(music, 6000)

# ---------------- VO + mix ----------------
vo, vsr = sf.read('audio/vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = signal.resample_poly(vo, SR, vsr)
vo = hp(vo, 90)
# gentle compression
envv = np.abs(signal.hilbert(vo)); envv = lp(envv, 20)
gain = np.where(envv > .15, (.15 / np.maximum(envv, 1e-6)) ** .4, 1.0); vo = vo * gain
vo = vo / np.max(np.abs(vo)) * .9
VO = np.zeros(N); VO[:min(N, len(vo))] = vo[:N]
# duck music under VO
venv = lp(np.abs(VO), 6); vtrack = np.clip(venv / .05, 0, 1)
duck = 1 - .55 * vtrack
mixL = VO * 1.0 + music * .22 * duck + sfx * .7
mixR = mixL.copy()
out = np.stack([mixL, mixR], 1)
fade = np.ones(N); fl = int(.5 * SR); fade[-fl:] = np.linspace(1, 0, fl); out *= fade[:, None]
pk = np.max(np.abs(out)); out = out / pk * .89
sf.write('audio/mix.wav', out, SR)
print('done', out.shape, 'rms dB', 20 * np.log10(np.sqrt(np.mean(out ** 2))))
