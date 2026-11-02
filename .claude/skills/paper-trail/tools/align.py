"""Word timings for the narration (Parakeet, on this machine). Run from the reel folder after voice.py (or with your own audio/vo.wav).
Writes audio/words.json: one entry per DISPLAY word of the script (so "1933" gets the time of "nineteen")."""
import json, re, os, glob, sys, difflib, numpy as np, soundfile as sf, sherpa_onnx
HERE = os.path.dirname(os.path.realpath(__file__)); sys.path.insert(0, HERE)
from voice import spoken
KIT = os.path.realpath(os.path.join(HERE, "..", "..", "..", "kit"))
d = glob.glob(os.path.join(KIT, "models", "sherpa-onnx-nemo-parakeet*"))
if not d: sys.exit(f"word-timing model missing: run  bash {KIT}/setup.sh --voice")
d = d[0]
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f"{d}/encoder.int8.onnx", decoder=f"{d}/decoder.int8.onnx",
    joiner=f"{d}/joiner.int8.onnx", tokens=f"{d}/tokens.txt", model_type="nemo_transducer")
a, sr = sf.read(sys.argv[1] if len(sys.argv) > 1 else "audio/vo.wav", dtype="float32")
if a.ndim > 1: a = a.mean(1)
dur = len(a) / sr
if sr != 16000: a = np.interp(np.linspace(0, len(a) - 1, int(len(a) * 16000 / sr)), np.arange(len(a)), a).astype(np.float32); sr = 16000
s = rec.create_stream(); s.accept_waveform(sr, a); rec.decode_stream(s); r = s.result
asr = []
for tok, ts in zip(r.tokens, r.timestamps):
    if tok.startswith((" ", "▁")) or not asr: asr.append([tok.strip(" ▁"), ts])
    else: asr[-1][0] += tok
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
R = json.load(open("reel.json")); say = R.get("say", {})
disp, toks = [], []   # display words, and the spoken tokens each one owns
for li, line in enumerate(R["script"]):
    for w in line.split():
        sp = [norm(x) for x in re.split(r"[\s-]+", spoken(w, say)) if norm(x)] or [norm(w)]
        disp.append({"w": w, "line": li, "tok": len(toks)}); toks += sp
A = [norm(x[0]) for x in asr]
start = [None] * len(toks)
for b in difflib.SequenceMatcher(a=toks, b=A, autojunk=False).get_matching_blocks():
    for k in range(b.size): start[b.a + k] = asr[b.b + k][1]
known = [i for i, v in enumerate(start) if v is not None]
for i in range(len(start)):  # fill gaps by interpolation
    if start[i] is None:
        lo = max([j for j in known if j < i], default=None); hi = min([j for j in known if j > i], default=None)
        start[i] = (start[lo] + (start[hi] - start[lo]) * (i - lo) / (hi - lo)) if lo is not None and hi is not None else (start[lo] + .3 if lo is not None else 0)
words = []
for n, w in enumerate(disp):
    s0 = start[w["tok"]]; nxt = start[disp[n + 1]["tok"]] if n + 1 < len(disp) else dur
    words.append({"w": w["w"], "s": round(s0, 3), "e": round(min(nxt, s0 + 1.4), 3), "line": w["line"]})
json.dump({"dur": round(dur, 3), "words": words}, open("audio/words.json", "w"), indent=0)
print(f"matched {len(known)} of {len(toks)} spoken tokens, {dur:.2f}s")
print(" ".join(f"{w['w']}@{w['s']:.2f}" for w in words[:16]))
