# Narrator: Kokoro bm_george, calm analyst. One WAV per line: voices/<id>.wav + voices/durations.json
#   <animate kit>/.venv/bin/python tts_lines.py [speed=0.95]
import json, os, sys, shutil, tempfile, numpy as np, soundfile as sf
KIT = os.path.realpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '.claude', 'kit'))
from kokoro_onnx import Kokoro, EspeakConfig
import espeakng_loader
data = espeakng_loader.get_data_path()
if len(data) > 100:
    short = os.path.join(tempfile.gettempdir(), 'kokoro-espeak-ng-data')
    if not os.path.exists(os.path.join(short, 'phontab')): shutil.rmtree(short, ignore_errors=True); shutil.copytree(data, short)
    data = short
speed = float(sys.argv[1]) if len(sys.argv) > 1 else 0.95
k = Kokoro(f'{KIT}/models/kokoro-v1.0.onnx', f'{KIT}/models/voices-v1.0.bin', espeak_config=EspeakConfig(lib_path=espeakng_loader.get_library_path(), data_path=data))
D = {}
for L in json.load(open('lines.json')):
    a, sr = k.create(L['text'], voice='bm_george', speed=speed, lang='en-gb')
    i = np.where(np.abs(a) > .01)[0]; a = a[max(0, i[0] - int(.02 * sr)): i[-1] + int(.1 * sr)]
    sf.write(f"voices/{L['id']}.wav", a, sr); D[L['id']] = round(len(a) / sr, 3)
json.dump(D, open('voices/durations.json', 'w'), indent=1); print(D, round(sum(D.values()), 2))
