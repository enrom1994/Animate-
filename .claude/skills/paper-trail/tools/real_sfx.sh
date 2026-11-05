#!/usr/bin/env bash
# Real sound effects for a paper-trail render, via the real-sfx skill:  real_sfx.sh <base.mp4> <cues.json> <out.mp4> <workdir>
#   base.mp4  = picture + voice + score, no synthesized effects (audio.py with "sfx": "real")
#   cues.json = the typed event list audio.py wrote (paper, camera, hit, thump, key, gunshot)
# Settings come from channel.json/film.json/reel.json "real_sfx": {"map": {...}, "keys_db": 4, "voice_depth": "light"}.
set -euo pipefail
BASE="$1"; CUES="$2"; OUT="$3"; WORK="$4"; SK="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RS="$(cd "$SK/../real-sfx" && pwd)"; export RS
[ -f "$RS/library_index.json" ] || { echo "real-sfx has no library index: python3 $SK/../../kit/sfx/fetch.py && python3 $RS/scripts/setup.py init --library noir=$SK/../../kit/sfx/library --index"; exit 1; }
mkdir -p "$WORK"
read -r MAP KEYS DEPTH < <(python3 - <<'PY'
import json, os, sys; sys.path.insert(0, os.environ["SKT"]); import config
R = config.load(os.environ.get("REEL_JSON", "reel.json")).get("real_sfx", {})
# map entries name recordings by file ("mixkit1097"); turn them into the ids of the current library index
sounds = json.load(open(os.path.join(os.environ["RS"], "library_index.json")))["sounds"]
def rid(key):
    hits = [i for i, x in enumerate(sounds) if key in os.path.basename(x["path"])]
    if len(hits) != 1: sys.exit(f"real_sfx map: '{key}' matches {len(hits)} sounds in the library index")
    return hits[0]
M = R.get("map", {})
for v in M.values():
    if "ids" in v: v["ids"] = [({**{k: x for k, x in e.items() if k != "file"}, "id": rid(e["file"])} if isinstance(e, dict) and "file" in e
                               else rid(e) if isinstance(e, str) else e) for e in v["ids"]]
print(json.dumps(M).replace(" ", ""), R.get("keys_db", 4), R.get("voice_depth", "light"))
PY
)
python3 "$RS/scripts/from_cues.py" "$CUES" --video "$BASE" --out "$WORK/cues.json" --ui library --keys-db "$KEYS" --map "$MAP" --no-check 2>&1 | grep -E "^(declared|routed|typing|WARN|NOT)" || true
python3 "$RS/scripts/mix.py" "$WORK/cues.json" --out "$WORK/sfx.mp4" --voice-safe --voice-depth "$DEPTH" --no-match-layer 2>&1 | grep -E "^(loudness|WARN|cues:)" || true
python3 "$RS/scripts/critique.py" "$WORK/sfx_resolved_cues.json" "$WORK/sfx_sfx_track.wav" --listen-out "$WORK/listen.wav" > "$WORK/critique.md" 2>&1 || true
grep -E "^\| (sync|variety|balance|audibility|speech) " "$WORK/critique.md" | cut -c1-110 || true
[ -f "$WORK/sfx.mp4" ] || { echo "real sfx: mix.py made no video (run it by hand to see why)"; exit 1; }
mv "$WORK/sfx.mp4" "$OUT"; echo "real sfx -> $OUT  (critique: $WORK/critique.md, listen-list: $WORK/listen.wav)"
# independent ears (earshot, if installed): does every cue frame really get a sound, and what does the film sound like?
ES="$SK/../../kit/.venv-earshot/bin/earshot"
if [ -x "$ES" ]; then
  "$ES" timeline "$OUT" --cues "$CUES" --detail low --out "$WORK/earshot_timeline.json" > "$WORK/earshot_timeline.txt" 2>/dev/null || true
  grep -oE "Sync to [0-9]+ cues[^;]*" "$WORK/earshot_timeline.txt" | head -1 | sed 's/^/earshot: /' || true
  grep -oE "[0-9]+ section[(]s[)]: .*" "$WORK/earshot_timeline.txt" | head -1 | cut -c1-300 | sed 's/^/earshot hears: /' || true
fi
