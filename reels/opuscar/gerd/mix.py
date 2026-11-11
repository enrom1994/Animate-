# The whole film's sound in ONE pass → out/mix.wav (48 kHz stereo): one continuous score that runs across the chapter
# joins (no restarts, no fades at the joins), place sounds, timpani on readings, voice.
# Reads out/events_<ch>.json (from film.js), out/ch<ch>.mp4 (for exact chapter lengths) and voices/*.wav.
#   cd $LIB && .venv/bin/python <project>/mix.py
# Palette (Satellite Briefing §7): pulse bass with harmonics, detuned-saw pad, timpani + low brass on the key readings,
# real recorded whooshes, hits and place ambiences (Mixkit); no hiss beds; one wet timbre (vibraphone) for the turns.
import sys, os, json, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.getcwd())
from core.audio import sampler as S
from core.audio import sfx as X
from core.audio.sfx import SR, add
import subprocess
S.seed(20)
FPS = 30
def frames(c): return int(subprocess.run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', f'{HERE}/out/ch{c}.mp4'], capture_output=True, text=True, check=True).stdout.strip().rstrip(','))
CHS = list(range(8)); START = {}; EV = []; t0 = 0.0
for c in CHS:                                     # chapter c starts where the previous chapter's frames end
    START[c] = t0; E = json.load(open(f'{HERE}/out/events_{c}.json'))
    EV += [dict(e, t=e['t'] + t0, ch=c) for e in E['ev']]; t0 += frames(c) / FPS
DUR = t0; N = int(DUR * SR)
def chap_at(t): return max(c for c in CHS if START[c] <= t + 1e-6)
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
# ———— score: one piece for the whole film ————
# The bar grid and the chord cycle never reset. Each chapter only changes the arrangement (pulse on/off, pad
# brightness and level), and those changes glide over ~3 s, so a chapter join is heard as the music developing.
BPM = 96; E8 = 30 / BPM; BAR = 8 * E8
HARM = [(38, [50, 57, 62, 65]), (34, [46, 53, 58, 62]), (41, [53, 57, 60, 65]), (36, [48, 55, 60, 64])]   # Dm Bb F C
HARM_B = [(43, [55, 58, 62, 67]), (39, [51, 55, 58, 63]), (34, [46, 50, 53, 58]), (45, [52, 57, 61, 64])]   # Gm Eb Bb A: the tension section (chapters 4-6)
STYLE = {0: (1, .9, 1000), 1: (0, .9, 1200), 2: (0, 1.0, 1000), 3: (1, .8, 1300), 4: (1, .8, 1500), 5: (0, .95, 1100), 6: (1, .8, 1300), 7: (0, 1.0, 1200)}
def glide(i):                                     # style value i at time t, crossfaded over 3 s around each join
    def f(t):
        c = chap_at(t); v = STYLE[c][i]
        if c > 0 and t - START[c] < 1.5: return v + (STYLE[c - 1][i] - v) * (1.5 - (t - START[c])) / 3
        if c < CHS[-1] and START[c + 1] - t < 1.5: return v + (STYLE[c + 1][i] - v) * (1.5 - (START[c + 1] - t)) / 3
        return v
    return f
pulse_g, pad_g, cut_g = glide(0), glide(1), glide(2)
t = 0.0; b = 0
while t < DUR - .2:
    root, ch = (HARM_B if chap_at(t + BAR / 2) in (4, 5, 6) else HARM)[b % 4]; L = min(BAR, DUR - t)
    put(mus, pad(ch, L + .8, pad_g(t + BAR / 2), cut_g(t + BAR / 2)), t)
    for k in range(8):
        tk = t + k * E8; g = pulse_g(tk)
        if g > .01 and tk < DUR - .5: put(mus, pulse(root + (12 if k % 4 == 3 else 0), E8 * .9, (.9 if k % 2 == 0 else .62) * g), tk, 1, -.1)
    t += BAR; b += 1
for c0 in (0, 7):                                 # the vibraphone motif opens the film and returns for the last chapter
    for j, m in enumerate([74, 77, 81, 79, 77, 74]): put(mus, S.note('vibraphone', m, 1.8, vel=.45), START[c0] + 1.0 + j * E8 * 3, .5, .25)
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
WHOOSHES = ['whoosh/quick_air_woosh_mixkit2605.mp3', 'whoosh/air_woosh_mixkit1489.mp3', 'whoosh/cinematic_whoosh_fast_transition_mixkit1492.mp3', 'whoosh/deep_air_woosh_mixkit2604.mp3']; THUD = 'impact/deep_heartbeat_impact_mixkit498.mp3'
HIT, LOGO = 'impact/movie_impact_intro_presentation_mixkit2902.mp3', 'impact/movie_logo_intro_impact_mixkit2900.mp3'
DESERT, RIVER, SEA, CITY = 'ambience/desert_ambience_mixkit2495.mp3', 'ambience/river_water_flowing_mixkit2454.mp3', 'ambience/sea_waves_ambience_mixkit1189.mp3', 'ambience/city_traffic_ambience_mixkit2931.mp3'
# Cue list (EDITING.md §4): a timpani note when a key number lands, a place sound under the photo of that place, and in the
# hook a whoosh on every cut, a riser into the reveal, a hit after it and a low drone under the threat.
AMB = {'desert': DESERT, 'river': RIVER, 'sea': SEA, 'city': CITY}
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'reading': put(mus, S.note('timpani', 'D2', 1.4, vel=.5 if e.get('heavy') else .35), t, .5 if e.get('heavy') else .35)
    elif ty == 'amb': bed_from(AMB[e['name']], t - .3, t + e['dur'] + .5, .6, 0, .8)
    elif ty == 'whoosh': put(fol, clip(WHOOSHES[e.get('k', 0) % len(WHOOSHES)], 1.1, .5), t, .16 * e.get('g', 1), (-.25, .25)[e.get('k', 0) % 2])
    elif ty == 'riser': put(fol, riser(e['dur']), t, .5)
    elif ty == 'hit': put(fol, clip(HIT if e.get('heavy') else THUD, 2.2 if e.get('heavy') else 1.2, .8), t, .34 if e.get('heavy') else .22)
    elif ty == 'drone': put(fol, X.lp(pad([26, 33], e['dur'], 1.0, 300), 400), t, .9)
    elif ty == 'title': put(mus, S.note('timpani', 'D2', 2.0, vel=.55), t, .55)
mus = S.room(mus, size=.45, mix=.18)
# ———— voice ————
for e in EV:
    if e['type'] != 'voice': continue
    v, sr = sf.read(f"{HERE}/voices/{e['id']}.wav", dtype='float32')
    if v.ndim > 1: v = v.mean(1)
    if sr != SR: v = np.interp(np.arange(int(len(v) * SR / sr)) / SR, np.arange(len(v)) / sr, v).astype(np.float32)
    v = X.compress(X.hp(v, 75), thr=.2, ratio=2.5); v = v / (np.sqrt(np.mean(v ** 2)) + 1e-9) * .1
    put(vox, v, e['t'])
cs = np.concatenate([[0], np.cumsum(np.abs(vox[:, 0]), dtype=np.float64)]); i = np.arange(N); venv = (cs[np.minimum(N, i + 1200)] - cs[np.maximum(0, i - 1200)]) / 2400; duck = 1 - .5 * np.clip(venv / .03, 0, 1)
mix = vox + mus * .48 * duck[:, None] + fol * .8 + bed * .7
mix = X.hp(mix.T, 40).T.astype(np.float32)
fi, fo = int(.03 * SR), int(2.5 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]; mix[-fo:] *= np.linspace(1, 0, fo)[:, None]   # film start and end only
mix = X.limit(mix, .9)
sf.write(f'{HERE}/out/mix.wav', mix, SR); print('mix', round(N / SR, 2), 's')
