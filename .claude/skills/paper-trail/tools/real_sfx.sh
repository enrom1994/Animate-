#!/usr/bin/env bash
# Real sound effects for a paper-trail render, via the real-sfx skill:  real_sfx.sh <base.mp4> <cues.json> <out.mp4> <workdir>
#   base.mp4  = picture + voice + score, no synthesized effects (audio.py with "sfx": "real")
#   cues.json = the typed event list audio.py wrote (paper, camera, hit, thump, key, gunshot)
# Settings come from channel.json/film.json/reel.json "real_sfx": {"map": {...}, "keys_db": 4, "voice_depth": "light"}.
set -euo pipefail
BASE="$1"; CUES="$2"; OUT="$3"; WORK="$4"; SK="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RS="$(cd "$SK/../real-sfx" && pwd)"
[ -f "$RS/library_index.json" ] || { echo "real-sfx has no library index: python3 $SK/../../kit/sfx/fetch.py && python3 $RS/scripts/setup.py init --library noir=$SK/../../kit/sfx/library --index"; exit 1; }
mkdir -p "$WORK"
read -r MAP KEYS DEPTH < <(python3 - <<'PY'
import json, os, sys; sys.path.insert(0, os.environ["SKT"]); import config
R = config.load(os.environ.get("REEL_JSON", "reel.json")).get("real_sfx", {})
print(json.dumps(R.get("map", {})).replace(" ", ""), R.get("keys_db", 4), R.get("voice_depth", "light"))
PY
)
python3 "$RS/scripts/from_cues.py" "$CUES" --video "$BASE" --out "$WORK/cues.json" --ui library --keys-db "$KEYS" --map "$MAP" --no-check 2>&1 | grep -E "^(declared|routed|typing|WARN|NOT)" || true
python3 "$RS/scripts/mix.py" "$WORK/cues.json" --out "$WORK/sfx.mp4" --voice-safe --voice-depth "$DEPTH" --no-match-layer 2>&1 | grep -E "^(loudness|WARN|cues:)" || true
python3 "$RS/scripts/critique.py" "$WORK/sfx_resolved_cues.json" "$WORK/sfx_sfx_track.wav" --listen-out "$WORK/listen.wav" > "$WORK/critique.md" 2>&1 || true
grep -E "^\| (sync|variety|balance|audibility|speech) " "$WORK/critique.md" | cut -c1-110 || true
mv "$WORK/sfx.mp4" "$OUT"; echo "real sfx -> $OUT  (critique: $WORK/critique.md, listen-list: $WORK/listen.wav)"
