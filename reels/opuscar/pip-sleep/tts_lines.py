# Pip's voice, one WAV per line (Kokoro af_heart, +4 semitones, low-mids softened): voices/<id>.wav + voices/durations.json
#   <animate kit>/.venv/bin/python tts_lines.py [speed=0.95]
import json, os, sys, subprocess, shutil, tempfile, numpy as np, soundfile as sf
KIT = os.path.realpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '.claude', 'kit'))
from kokoro_onnx import Kokoro, EspeakConfig
import espeakng_loader
data = espeakng_loader.get_data_path()
if len(data) > 100:
    short = os.path.join(tempfile.gettempdir(), 'kokoro-espeak-ng-data')
    if not os.path.exists(os.path.join(short, 'phontab')): shutil.rmtree(short, ignore_errors=True); shutil.copytree(data, short)
    data = short
speed = float(sys.argv[1]) if len(sys.argv) > 1 else 0.95; r = 2 ** (4 / 12)
k = Kokoro(f'{KIT}/models/kokoro-v1.0.onnx', f'{KIT}/models/voices-v1.0.bin', espeak_config=EspeakConfig(lib_path=espeakng_loader.get_library_path(), data_path=data))
D = {}
for L in json.load(open('lines.json')):
    a, sr = k.create(L['text'], voice='af_heart', speed=speed, lang='en-us')
    i = np.where(np.abs(a) > .01)[0]; a = a[max(0, i[0] - int(.02 * sr)): i[-1] + int(.08 * sr)]
    sf.write('voices/_raw.wav', a, sr)
    out = f"voices/{L['id']}.wav"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'voices/_raw.wav', '-af', f'asetrate={sr}*{r:.5f},aresample={sr},atempo={1 / r:.5f},equalizer=f=250:t=q:w=1:g=-3', '-ar', '48000', '-ac', '1', out], check=True)
    D[L['id']] = round(sf.info(out).duration, 3)
os.remove('voices/_raw.wav'); json.dump(D, open('voices/durations.json', 'w'), indent=1); print(D, round(sum(D.values()), 2))
