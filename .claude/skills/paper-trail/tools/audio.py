"""Score + SFX for a paper-trail reel, made in code, placed by build/plan.json. Run from the reel folder after plan.py.
Shot "sfx": paper | flash | hit | burst | type | drop   (drop = the score cuts out for a beat). Writes audio/mix.wav."""
import json, os, sys, numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.realpath(__file__))); import config
from scipy import signal
SR = 44100; rng = np.random.default_rng(7)
P = json.load(open("build/plan.json")); R = config.load()
vo, vsr = sf.read("audio/vo.wav", dtype="float32")
if vo.ndim > 1: vo = vo.mean(1)
assert vsr == SR, "audio/vo.wav must be 44.1 kHz (voice.py writes it so)"
N = int(P["dur"] * SR) + SR; T = np.arange(N) / SR
def lp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2)); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), "high"); return signal.lfilter(b, a, x)
def bp(x, lo, hi, o=2): b, a = signal.butter(o, [lo / (SR / 2), hi / (SR / 2)], "band"); return signal.lfilter(b, a, x)
def place(buf, x, at, g=1.):
    i = int(at * SR); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += x[:j - i] * g
def verb(x, decay=1.6, mix=.35):  # cheap dark reverb: decaying filtered noise convolution
    n = int(decay * SR); ir = lp(rng.standard_normal(n), 2500) * np.exp(-np.arange(n) / SR * 5 / decay)
    w = np.zeros(len(x) + n); c = signal.fftconvolve(x, ir) * .03; w[:len(c)] = c[:len(w)]
    return np.concatenate([x, np.zeros(n)]) * (1 - mix) + w * mix

# ---- score: low drone, slow swell, a heartbeat pulse ----
drone = np.zeros(N)
for f, a in [(41.2, 1), (61.74, .55), (82.4, .35), (123.5, .12)]:
    ph = 2 * np.pi * f * T + .3 * np.sin(2 * np.pi * .07 * T)
    drone += a * (np.sin(ph) + .3 * np.sin(2 * ph) + .12 * np.sin(3 * ph))
drone = lp(drone, 380) * (.75 + .25 * np.sin(2 * np.pi * .05 * T))
drone += lp(rng.standard_normal(N), 220) * .5                              # room rumble
tension = np.sin(2 * np.pi * 659.3 * T) * (.5 + .5 * np.sin(2 * np.pi * 5.2 * T)) * .035
swell = np.clip(T / P["dur"], 0, 1) ** 1.5
score = drone * .5 + tension * swell
def thud(f0=52, d=.45):
    n = int(d * SR); t = np.arange(n) / SR; f = f0 * (1 + 1.2 * np.exp(-t * 28))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) + lp(rng.standard_normal(n), 300) * np.exp(-t * 35) * .4
beat = np.zeros(N); b = thud()
t, k = 1.2, 0
while t < P["dur"] - .5:
    place(beat, b, t, .9); place(beat, b * .55, t + .28); t += 1.15 - .25 * (t / P["dur"])
score += beat * .55
fade = np.clip(T / 1.5, 0, 1) * np.clip((P["dur"] + .2 - T) / 1.2, 0, 1)
score *= fade

# ---- SFX ----
def paper(d=.55):
    n = int(d * SR); x = bp(rng.standard_normal(n), 900, 7000)
    crackle = (rng.random(n) > .985) * rng.standard_normal(n) * 3
    return (x * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5 + hp(crackle, 2000) * .5) * .5
def flash():
    n = int(.7 * SR); t = np.arange(n) / SR
    pop = hp(rng.standard_normal(n), 1500) * np.exp(-t * 90) * 1.2 + thud(70, .7)[:n] * .8
    whine = np.sin(2 * np.pi * (3200 + 2400 * t) * t) * np.exp(-t * 6) * .05
    return verb(pop + whine, 1.2, .3)
def hit():
    n = int(2.5 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * np.cumsum(38 * (1 + 2 * np.exp(-t * 18))) / SR) * np.exp(-t * 2.2) * 1.4
    x += lp(rng.standard_normal(n), 900) * np.exp(-t * 14) * .7
    return verb(x, 2.2, .4)
def burst(shots=11, rate=11.5):  # distant, muffled: an echo off a building, not a gun in your ear
    out = np.zeros(int(2.4 * SR))
    for i in range(shots):
        n = int(.18 * SR); t = np.arange(n) / SR
        s = lp(rng.standard_normal(n), 1400) * np.exp(-t * 40) + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 30) * .6
        place(out, s * (.8 + .4 * rng.random()), i / rate + .01 * rng.standard_normal())
    return verb(out, 1.8, .5)[:int(3.5 * SR)] * .9
def typing(d=.9):
    out = np.zeros(int((d + .2) * SR)); t0 = 0
    while t0 < d:
        n = int(.03 * SR); t = np.arange(n) / SR
        place(out, hp(rng.standard_normal(n), 2500) * np.exp(-t * 260) * .7 + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 200) * .2, t0); t0 += .055 + .05 * rng.random()
    return out
def stamp():
    n = int(.5 * SR); t = np.arange(n) / SR
    return verb(thud(95, .5)[:n] * .9 + bp(rng.standard_normal(n), 200, 2500) * np.exp(-t * 45) * .7, .8, .25)
def stamp3():
    out = np.zeros(int(2.4 * SR))
    for i in range(3): place(out, stamp(), .5 + i * .3)
    return out
FX = {"stamp": (stamp, .7), "stamp3": (stamp3, .7), "paper": (paper, .55), "flash": (flash, .7), "hit": (hit, .9), "burst": (burst, .55), "type": (typing, .35)}
sfx = np.zeros(N + 4 * SR)
# REAL sound effects (real-sfx skill): the same events become a typed cue list (build/cues.json) and the synthesized
# effects stay out of the mix; they are still made here only so the score keeps exactly the level it had.
REAL = R.get("sfx", "synth") == "real"
CUES = []
def cue(t, kind, g=1.0, **kw): CUES.append({"t": round(float(t), 3), "type": kind, "g": round(g, 2), **kw})
KIND = {"paper": "paper", "flash": "camera", "hit": "hit", "stamp": "thump"}
def emit(name, t):
    if name in KIND: cue(t, KIND[name])
    elif name == "stamp3": [cue(t + .5 + i * .3, "thump") for i in range(3)]
    elif name == "type": cue(t + .15, "key", .8, len=.9, n=10)
    elif name == "burst":  # a burst of real single gunshots, distant and fading (no machine-gun recording in the library)
        for i in range(9): cue(t + i / 9.5, "gunshot", .85 - i * .05)
for s in P["shots"]:
    for name in s["sfx"]:
        if name == "drop":  # score drops out under this shot's first 1.6 s
            i, j = int(s["start"] * SR), int((s["start"] + 1.6) * SR); g = np.ones(N)
            g[i:j] = 0; g = np.convolve(g, np.ones(2205) / 2205, "same"); score *= g
        elif name in FX:
            f, gain = FX[name]; place(sfx, f(), s["start"] + (.15 if name == "type" else 0), gain); emit(name, s["start"])
        else: print("unknown sfx", name)
for s in P["shots"]:
    if s["kind"] == "chapter":
        place(sfx, stamp(), s["start"] + .5, .6)
        place(sfx, typing(max(.6, len(s.get("text") or "") * .07)), s["start"] + 1.0, .35)
        place(sfx, typing(.9), s["start"] + 1.4 + len(s.get("text") or "") * .07, .25)
        tl = len(s.get("text") or ""); cue(s["start"] + .5, "thump", .8)
        cue(s["start"] + 1.0, "key", .8, len=round(max(.6, tl * .07), 2), n=max(3, len((s.get("text") or "").replace(" ", ""))))
        if s.get("sub"): cue(s["start"] + 1.4 + tl * .07, "key", .6, len=.9, n=12)
    if s["kind"] == "outro":
        for t in s["ticks"]: place(sfx, stamp(), s["start"] + t - .02, .7); cue(s["start"] + t - .02, "thump")
        place(sfx, typing(.5), s["start"] + s["more_t"], .35); cue(s["start"] + s["more_t"], "key", .7, len=.5, n=8)
sfx = sfx[:N]

# ---- mix: duck the score under the voice ----
v = np.zeros(N); v[:min(N, len(vo))] = vo[:N]
env = np.convolve(np.abs(v), np.ones(4410) / 4410, "same"); env = env / (env.max() + 1e-9)
duck = 1 - .5 * np.clip(env * 3, 0, 1)
bed = score * .3 * duck + sfx * (1 - .3 * np.clip(env * 3, 0, 1))
rms = lambda x: np.sqrt((x ** 2).mean()) + 1e-9
BED_DB = R.get("bed_db", -14)  # score + SFX sit this many dB under the narration (overall RMS)
k_bed = rms(v) * 10 ** (BED_DB / 20) / rms(bed); bed *= k_bed
if not REAL and os.path.exists("build/cues.json"): os.remove("build/cues.json")
if REAL:  # same score level as the synthesized version, effects left to real-sfx
    bed = score * .3 * duck * k_bed
    CUES.sort(key=lambda c: c["t"]); json.dump(CUES, open("build/cues.json", "w"), indent=0)
    print(f"real sfx: {len(CUES)} cues -> build/cues.json (synthesized effects left out of the mix)")
mix = v + bed
mix = mix / max(1e-6, np.abs(mix).max()) * .89
NF = round(P["dur"] * 30) * SR // 30  # exactly the video's length, so chapters stitch without drift
mix = np.concatenate([mix, np.zeros(max(0, NF - len(mix)))])[:NF]
sf.write("audio/mix.wav", mix.astype(np.float32), SR)
print("audio/mix.wav", round(len(mix) / SR, 2), "s")
