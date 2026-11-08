# Score + foley + voice → out/mix.wav (48 kHz stereo). Reads events.json (exported from film.js) and voices/*.wav.
# Run with the library's Python from the library root:  cd $LIB && .venv/bin/python <project>/mix.py
# Instruments: ukulele (FreePats), clarinet + bassoon (VSCO 2 CE), glockenspiel, recorder, woodblock, shaker (VCSL): all CC0. Music box: modelled (pluck.py).
import sys, os, json, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.getcwd())
from core.audio import sampler as S, pluck as P
from core.audio import sfx as X
from core.audio.sfx import SR, add
S.seed(7)
E = json.load(open(f'{HERE}/events.json')); DUR = E['dur']; EV = E['ev']
N = int((DUR + 0.5) * SR)
music, fol, amb, vox = (np.zeros((N, 2), np.float32) for _ in range(4))
cue = {e['id']: e['t'] for e in EV if e['type'] == 'cue'}
def put(buf, x, t, g=1.0, pan=0.0):
    if x.ndim == 2: x = x.mean(1)
    add(buf, x.astype(np.float32), t, g, pan)

# ———————————— score: 6/8 lilt, dotted quarter = 92, D major ————————————
Q = 60 / 92; E8 = Q / 3; BAR = 2 * Q
PROG = [('D3', ['D4', 'F#4', 'A4']), ('G3', ['G3', 'B3', 'D4']), ('A3', ['A3', 'C#4', 'E4']), ('D3', ['D4', 'F#4', 'A4'])]
# the theme (two bars per line, in eighths): heard in pieces through the day, whole only once, on the music box at night
THEME = [('F#5', 3), ('E5', 1), ('D5', 2), ('A4', 3), ('B4', 2), ('C#5', 1), ('D5', 3), ('E5', 3), ('F#5', 2), ('G5', 1), ('A5', 3), ('F#5', 3), ('E5', 3), ('D5', 3)]
def uke_bar(t, i, vel=.5, busy=False):
    root, ch = PROG[i % 4]
    pats = [0, 3] if not busy else [0, 1, 2, 3, 4, 5]
    for k in pats:
        for j, n in enumerate(ch): put(music, S.note('ukulele', S.midi(n) + 12, E8 * 3, vel=vel * (1 if k in (0, 3) else .7)), t + k * E8 + j * .012, .9, -.25)
    put(music, S.note('bassoon_stac', root, Q, vel=.45), t, .55, .1)
def melody(inst, t0, notes, vel=.5, gain=1.0, pan=.2, oct=0):
    t = t0
    for n, d in notes: put(music, S.note(inst, S.midi(n) + oct, d * E8 * .95, vel=vel), t, gain, pan); t += d * E8
    return t
def bars(t0, t1): return [(t0 + i * BAR, i) for i in range(int((t1 - t0) / BAR + .001))]
# morning: ukulele, clarinet sings the first phrase
for t, i in bars(cue['morning'] + .2, cue['count']): uke_bar(t, i, .45)
melody('clarinet', cue['morning'] + .2 + 2 * BAR, THEME[:7], vel=.45, gain=.8, oct=-12)
# the count: soft ukulele, a glockenspiel note per coloured box (rising up the scale)
for t, i in bars(cue['count'], cue['longago']): uke_bar(t, i, .32)
SCALE = ['D5', 'E5', 'F#5', 'G5', 'A5', 'B5', 'C#6', 'D6']
for e in EV:
    if e['type'] == 'box': put(music, S.note('glockenspiel', S.midi(SCALE[e['i'] % 8]) + (12 if e['i'] >= 8 else 0), .6, vel=.55), e['t'], 1.0, e['pan'])
# long ago: bassoon creeping, woodblock steps, then the pounce
creep = ['D2', 'F#2', 'A2', 'G#2', 'A2', 'F#2', 'E2', 'A1']
t = cue['longago']; k = 0
while t < cue['rest'] - .2:
    put(music, S.note('bassoon_stac', creep[k % 8], E8 * 1.6, vel=.55), t, .9, .1)
    if k % 2 == 0: put(music, S.hit('woodblock', 'a' if k % 4 == 0 else 'b', .4), t, .5, -.3)
    t += E8 * 2; k += 1
# rest: gentle ukulele, clarinet long notes; the energy jar fills with a rising glockenspiel
for t, i in bars(cue['rest'], cue['listen']): uke_bar(t, i, .35)
for j, n in enumerate(['A4', 'B4', 'C#5', 'D5']): put(music, S.note('clarinet', S.midi(n) - 12, BAR * .9, vel=.4), cue['rest'] + j * BAR, .7, .2)
for e in EV:
    if e['type'] == 'jar':
        for j in range(8): put(music, S.note('glockenspiel', S.midi(SCALE[j]), .5, vel=.4), e['t'] + j * e['dur'] / 8, .8, .3)
# listening: almost nothing, then nothing (the silence before the clink)
sil = next(e['t'] for e in EV if e['type'] == 'silence')
for t, i in bars(cue['listen'], sil - .2): put(music, S.note('ukulele', S.midi(PROG[i % 4][1][0]) + 12, Q * 2, vel=.25), t, .6, -.2)
# sunset: busier strum, shaker; clarinet run up into the zoomies
for t, i in bars(cue['sunset'], cue['night'] - .3): uke_bar(t, i, .5, busy=t > cue['sunset'] + 3)
t = cue['sunset'] + 2.2
while t < cue['night'] - .4: put(music, S.hit('shaker', 'down' if int(t / E8) % 2 else 'up', .35), t, .45, .35); t += E8
zt = next(e['t'] for e in EV if e['type'] == 'zoom')
for j, n in enumerate(['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5']): put(music, S.note('clarinet_stac', n, .12, vel=.6), zt - .5 + j * .07, .8, .2)
# night: the whole theme, once, on the music box; recorder answers softly; the box winds down at the end
mb = lambda n, d, vel=.6, bend=0: P.pluck('music_box', S.midi(n) + bend, d, vel=vel)
t = cue['night'] + .3
for n, d in THEME: put(music, mb(n, d * E8 * 1.15 + .6), t, .9, .1); t += d * E8 * 1.15
melody('recorder', cue['night'] + .3 + 4 * BAR * 1.15, THEME[7:], vel=.3, gain=.45, pan=-.25, oct=-12)
for t, i in bars(cue['night'], cue['end']): put(music, S.note('ukulele', S.midi(PROG[i % 4][0]) + 12, Q * 2, vel=.22), t, .5, -.3)
t = cue['end'] + .4
for j, (n, d) in enumerate(THEME[:6]):
    slow = 1 + j * .18; put(music, mb(n, d * E8 * slow + .8, vel=.5 - j * .05, bend=-j * .12), t, .85, .1); t += d * E8 * slow * 1.25
music = S.room(music, size=.35, mix=.16)

# ———————————— foley ————————————
rng = np.random.default_rng(3)
def crayon(d, speed=1.0):   # stick-slip: band-passed noise with a grainy amplitude
    n = X.noise(d); g = np.abs(X.lp(rng.standard_normal(len(n)), 40 * speed)) * 3
    x = X.bp(n, 1800, 6500) * np.clip(g, 0, 1.5); e = np.minimum(1, X.t_(d) / .03) * np.minimum(1, (d - X.t_(d)) / .06)
    return x * e * .5
def scribble(d):
    tt = X.t_(d); return crayon(d, 2.0) * (.55 + .45 * np.sin(2 * np.pi * 7 * tt) ** 2)
def brush(d):
    x = X.lp(X.noise(d), 1400) + X.bp(X.noise(d), 3000, 7000) * .25; tt = X.t_(d); return x * np.sin(np.pi * np.clip(tt / d, 0, 1)) ** .7 * .35
def squeak():
    out = np.zeros(int(.5 * SR))
    for k in range(3):
        d = .07; tt = X.t_(d); f = 3200 + 900 * np.sin(np.pi * tt / d); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) * .3
        i = int(k * .13 * SR); out[i:i + len(x)] += x
    return out
def chirp_bird():
    d = .12; tt = X.t_(d); f = 4200 - 1600 * tt / d; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) * .12
for e in EV:
    t, ty, pan = e['t'], e['type'], e.get('pan', 0)
    if ty == 'scratch': put(fol, crayon(e['dur']), t, .55, pan)
    elif ty == 'scribble': put(fol, scribble(e['dur']), t, .45, pan)
    elif ty == 'write': put(fol, crayon(e['dur'], 3.0), t, .4, pan)
    elif ty == 'brush': put(fol, brush(e['dur']), t, .8, .5 * e['dir'])
    elif ty == 'pop': put(fol, X.pop(.6), t, .5, pan)
    elif ty == 'squeak': put(fol, squeak(), t, .7, .4)
    elif ty == 'pounce': put(fol, X.whoosh(.45, .8), t, .6, 0)
    elif ty == 'land': put(fol, X.thump(.6, 90), t, .6, .1)
    elif ty == 'clink': put(fol, X.ding(.7), t, .55, .6); put(fol, X.click(2.2, .6), t, .5, .6)
    elif ty == 'ear': put(fol, X.click(1.6, .4), t, .35, .3); put(fol, X.click(1.8, .3), t + .17, .3, .3)
    elif ty == 'zoom':
        for k in range(4): put(fol, X.whoosh(.32, .7), t + k * e['dur'] / 4, .45, [-.6, .2, .7, -.2][k])
        put(fol, scribble(e['dur']), t, .3, 0)
    elif ty == 'skid': put(fol, crayon(.35, 4), t, .55, -.2); put(fol, X.thump(.4, 120), t + .3, .4, 0)
    elif ty == 'yawn': put(fol, X.lp(X.noise(.7), 700) * np.sin(np.pi * X.t_(.7) / .7) * .15, t, .5, .2)
    elif ty == 'box': put(fol, scribble(.18), t, .25, pan)
    elif ty == 'jar': put(fol, scribble(e['dur']), t, .25, .3)
# ambience: birds by day, crickets by night
night = cue['night']
for k in range(28):
    t = .5 + k * 1.5 + rng.random() * .8
    if t < night - 1 and not (sil - .3 < t < sil + 1.4): put(amb, chirp_bird(), t, .5, rng.uniform(-.8, .8)); put(amb, chirp_bird(), t + .16, .4, rng.uniform(-.8, .8))
for k in range(60):
    t = night + .5 + k * .2
    if t > DUR: break
    d = .05; tt = X.t_(d); x = np.sin(2 * np.pi * 4600 * tt) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 60 * tt))) * np.sin(np.pi * tt / d) * .05
    put(amb, x, t, .7, -.6 if k % 2 else .6)

# ———————————— voice: compress first, soften the highs, a little room ————————————
for e in EV:
    if e['type'] != 'voice': continue
    v, sr = sf.read(f"{HERE}/voices/{e['id']}.wav", dtype='float32')
    if v.ndim > 1: v = v.mean(1)
    v = X.compress(X.hp(v, 80), thr=.2, ratio=2.5); v = v / (np.sqrt(np.mean(v ** 2)) + 1e-9) * .1
    put(vox, v, e['t'], 1.0, 0)
vox = vox * .82 + S.room(vox, size=.2, mix=.08) * .18
# ———————————— mix: music ducks under the voice; silence is kept silent ————————————
venv = np.convolve(np.abs(vox[:, 0]), np.ones(2400) / 2400, 'same'); duck = 1 - .55 * np.clip(venv / .03, 0, 1)
mix = vox + music * .55 * duck[:, None] + fol * .9 + amb * .8
s0, s1 = int((sil - .05) * SR), int((sil + .9) * SR); fade = np.ones(N); fade[s0:s1] = .05; mix[:, :] *= fade[:, None] ** 0 if False else 1
mix[s0:s1] = vox[s0:s1] + fol[s0:s1]                                    # the silence: voice tail and foley only
mix = X.limit(mix, .9)
os.makedirs(f'{HERE}/out', exist_ok=True); sf.write(f'{HERE}/out/mix.wav', mix, SR)
print('mix', mix.shape, round(N / SR, 2), 's; instruments credits:'); print(S.credits(['ukulele', 'clarinet', 'clarinet_stac', 'bassoon_stac', 'glockenspiel', 'recorder', 'woodblock', 'shaker']))
