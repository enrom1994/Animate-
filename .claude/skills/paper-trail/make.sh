#!/usr/bin/env bash
# Build a paper-trail reel end to end:  make.sh <reel-folder> [stills 1.5,6,12]
#   voice (Kokoro, skipped if audio/vo.wav exists; VOICE=1 to remake) -> word timings -> plan -> score + SFX -> frames -> <name>.mp4
#   Your own narration: put it at <reel>/audio/vo.wav (44.1 kHz mono) and run as usual.
set -euo pipefail
SK="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; KIT="$(cd "$SK/../../kit" && pwd)"; PY="$KIT/.venv/bin/python"
[ -x "$PY" ] || { echo "voice tools missing: run  bash $KIT/setup.sh --voice"; exit 1; }
[ -d "$KIT/node_modules/playwright" ] || (cd "$KIT" && npm install --silent --no-audit --no-fund)
DIR="$(cd "${1:?usage: make.sh <reel-folder> [stills t1,t2]}" && pwd)"; NAME="$(basename "$DIR")"; cd "$DIR"
[ -f reel.json ] || { echo "no reel.json in $DIR"; exit 1; }
python3 - "$SK" <<'PY'   # fetch any page listed in reel.json "assets" that isn't on disk yet
import json, os, subprocess, sys
for n, url in json.load(open("reel.json")).get("assets", {}).items():
    if not os.path.exists(f"assets/{n}.jpg"): subprocess.run([sys.executable, f"{sys.argv[1]}/tools/loc.py", "fetch", url, n], check=True)
PY
if [ ! -f audio/vo.wav ] || [ "${VOICE:-0}" = 1 ]; then echo "== voice"; "$PY" "$SK/tools/voice.py"; fi
if [ ! -f audio/words.json ] || [ audio/vo.wav -nt audio/words.json ] || [ reel.json -nt audio/words.json ]; then echo "== word timings"; "$PY" "$SK/tools/align.py"; fi
echo "== plan"; "$PY" "$SK/tools/plan.py"
if [ "${2:-}" = stills ]; then node "$SK/tools/render.mjs" stills "$3"; exit 0; fi
echo "== score + sfx"; "$PY" "$SK/tools/audio.py"
echo "== frames"; node "$SK/tools/render.mjs" video "${WORKERS:-4}"
[ "${NOMUX:-0}" = 1 ] && { echo "frames + mix ready (NOMUX)"; exit 0; }
echo "== mux"
ffmpeg -v error -y -i build/silent.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=9" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$NAME.part.mp4"
mv "$NAME.part.mp4" "$NAME.mp4"; echo "done: $DIR/$NAME.mp4"
