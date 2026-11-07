# Pip's voice (the kids channel): Kokoro af_heart, normal speed, lifted 4 semitones with the tempo kept, low-mids softened.
# Run from a reel folder: reads script.json (optional say.json: {"written": "spoken"}, optional pauses.json: {"line": seconds}), writes audio/vo.wav (44.1 kHz mono).
#   tts_pip.py [speed=1.0] [semitones=4]
import json, os, re, subprocess, sys, shutil, tempfile, numpy as np, soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
KIT = os.path.realpath(os.path.join(ROOT, "..", "..", "..", "kit"))
from kokoro_onnx import Kokoro, EspeakConfig
import espeakng_loader
data = espeakng_loader.get_data_path()
if len(data) > 100:
    short = os.path.join(tempfile.gettempdir(), "kokoro-espeak-ng-data")
    if not os.path.exists(os.path.join(short, "phontab")): shutil.rmtree(short, ignore_errors=True); shutil.copytree(data, short)
    data = short
speed = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0; semi = float(sys.argv[2]) if len(sys.argv) > 2 else 4
k = Kokoro(os.path.join(KIT, "models/kokoro-v1.0.onnx"), os.path.join(KIT, "models/voices-v1.0.bin"), espeak_config=EspeakConfig(lib_path=espeakng_loader.get_library_path(), data_path=data))
lines = json.load(open("script.json")); say = json.load(open("say.json")) if os.path.exists("say.json") else {}
wait = json.load(open("pauses.json")) if os.path.exists("pauses.json") else {}   # {"exact line": seconds of silence after it}, e.g. a guess-first pause
os.makedirs("audio", exist_ok=True); out, sr = [], 24000
for i, line in enumerate(lines):
    orig = line
    for a_, b_ in sorted(say.items(), key=lambda x: -len(x[0])): line = re.sub(rf"(?<!\w){re.escape(a_)}(?!\w)", b_, line)
    a, sr = k.create(line, voice="af_heart", speed=speed, lang="en-us")
    idx = np.where(np.abs(a) > .01)[0]; a = a[max(0, idx[0] - int(.02 * sr)): idx[-1] + int(.06 * sr)]
    pause = .55 if line.rstrip().endswith(("?", "!")) else .28          # a breath after questions and exclamations
    pause = max(pause, wait.get(orig, 0))
    out += [a, np.zeros(int(pause * sr), dtype=a.dtype)]
sf.write("audio/vo_pip_raw.wav", np.concatenate(out), sr)
r = 2 ** (semi / 12)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "audio/vo_pip_raw.wav", "-af",
                f"asetrate={sr}*{r:.5f},aresample={sr},atempo={1 / r:.5f},equalizer=f=250:t=q:w=1:g=-3", "-ar", "44100", "-ac", "1", "audio/vo.wav"], check=True)
print("pip ->", "audio/vo.wav", round(sum(len(x) for x in out) / sr, 2), "s")
