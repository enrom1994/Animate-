"""Dark narration with Kokoro (free, on this machine). Run from the reel folder.
Reads reel.json: "script" (display text, digits allowed), "say" (display -> spoken, e.g. {"1933": "nineteen thirty-three"}),
"voice" {"name", "speed", "pitch" (semitones), "gap"}. Writes audio/vo.wav (processed) and audio/lines.json."""
import json, os, re, subprocess, sys, tempfile, shutil, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.realpath(__file__))
KIT = os.path.realpath(os.path.join(HERE, "..", "..", "..", "kit"))
from kokoro_onnx import Kokoro, EspeakConfig
import espeakng_loader
sys.path.insert(0, HERE); import config

def spoken(line, say):
    for k in sorted(say, key=len, reverse=True): line = re.sub(rf"(?<![\w]){re.escape(k)}(?![\w])", say[k], line)
    return line

if __name__ == "__main__":
    R = config.load(); V = {"name": "am_onyx", "speed": .9, "pitch": -1.0, "gap": .32, **R.get("voice", {})}
    data = espeakng_loader.get_data_path()
    if len(data) > 100:  # espeak-ng breaks on long data paths
        short = os.path.join(tempfile.gettempdir(), "kokoro-espeak-ng-data")
        if not os.path.exists(os.path.join(short, "phontab")): shutil.rmtree(short, ignore_errors=True); shutil.copytree(data, short)
        data = short
    k = Kokoro(f"{KIT}/models/kokoro-v1.0.onnx", f"{KIT}/models/voices-v1.0.bin",
               espeak_config=EspeakConfig(lib_path=espeakng_loader.get_library_path(), data_path=data))
    os.makedirs("audio", exist_ok=True)
    out, meta, t, sr = [], [], 0.0, 24000
    lead = (R.get("intro") or {}).get("dur", 0)  # chapter title card: silent breathing room before the narration
    if lead: out.append(np.zeros(int(lead * sr), dtype=np.float32)); t = lead
    engine = V.get("engine", "kokoro")
    if engine == "chatterbox":  # better, slower (~5x real time on CPU); runs in its own venv
        import subprocess
        texts = [spoken(l, R.get("say", {})) for l in R["script"]]
        import hashlib
        cache = "audio/cb_lines"; os.makedirs(cache, exist_ok=True)
        ref = os.path.realpath(os.path.join(os.path.dirname(os.path.abspath("reel.json")), V["ref"])) if V.get("ref") else ""
        params = [os.path.basename(ref), V.get("exaggeration", .35), V.get("cfg", .35)]
        # one file per line, named by its text + settings: editing one line re-records only that line
        files = [f"{cache}/{hashlib.sha1(json.dumps([t] + params).encode()).hexdigest()[:12]}.wav" for t in texts]
        todo = [[t, f] for t, f in zip(texts, files) if not os.path.exists(f)]
        if todo:
            json.dump(todo, open(f"{cache}/todo.json", "w"))
            subprocess.run([f"{KIT}/.venv-cb/bin/python", f"{HERE}/tts_chatterbox.py", f"{cache}/todo.json", ref,
                            str(V.get("exaggeration", .35)), str(V.get("cfg", .35))], check=True)
        print(f"chatterbox: {len(texts) - len(todo)} lines reused, {len(todo)} recorded")
    for i, line in enumerate(R["script"]):
        if engine == "chatterbox": a, sr = sf.read(files[i], dtype="float32"); a = np.asarray(a, dtype=np.float32)
        else: a, sr = k.create(spoken(line, R.get("say", {})), voice=V["name"], speed=V["speed"], lang="en-us" if V["name"][0] == "a" else "en-gb")
        idx = np.where(np.abs(a) > .01)[0]; a = a[max(0, idx[0] - int(.02 * sr)): idx[-1] + int(.08 * sr)]
        meta.append({"i": i, "text": line, "start": round(t, 3), "dur": round(len(a) / sr, 3)})
        gap = V["gap"] * (1.8 if i == 0 else 1.0)  # a held beat after the hook
        if i == R["story_lines"] - 1 and len(R["script"]) > R["story_lines"]: gap = R["outro"].get("pause", 1.3)  # breathe before the end card
        out += [a, np.zeros(int(gap * sr), dtype=a.dtype)]; t += len(a) / sr + gap
    sf.write("audio/vo_raw.wav", np.concatenate(out), sr)
    json.dump(meta, open("audio/lines.json", "w"), indent=1)
    # darker: small pitch drop (tempo kept), warm low end, softened top, a little room, gentle compression
    r = 2 ** ((V["pitch"] if engine == "kokoro" else V.get("cb_pitch", 0)) / 12)
    af = (f"asetrate={sr}*{r:.5f},aresample={sr},atempo={1 / r:.5f},"
          "equalizer=f=110:t=q:w=1:g=3,equalizer=f=3200:t=q:w=1.5:g=-2,lowpass=f=9500,"
          "aecho=0.8:0.6:38|71:0.10|0.06,acompressor=threshold=0.12:ratio=3:attack=8:release=120:makeup=1.6")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "audio/vo_raw.wav", "-af", af, "-ar", "44100", "-ac", "1", "audio/vo.wav"], check=True)
    json.dump({"script": R["script"], "say": R.get("say", {}), "voice": V}, open("audio/voiced.json", "w"), indent=1)  # what this take says
    print(f"{engine}:{V.get('ref') or V['name']} {t:.2f}s -> audio/vo.wav")
