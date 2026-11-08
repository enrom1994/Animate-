#!/bin/sh
# One command, from voice to the finished Short:  sh build.sh   (voice lines are cached in voices/; delete them to re-record)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../../.." && pwd)                 # the Animate repo
LIB=${LIB:-$ROOT/.claude/kit/lemo-opuscar}
export PLAYWRIGHT_CHROME=${PLAYWRIGHT_CHROME:-/opt/pw-browsers/chromium}
[ -f "$LIB/core/render/video.mjs" ] || sh "$ROOT/.claude/skills/lemo-opuscar/scripts/setup.sh"
[ -f "$HERE/voices/durations.json" ] || (cd "$HERE" && "$ROOT/.claude/kit/.venv/bin/python" tts_lines.py)
cd "$LIB"
node core/render/events.mjs "$HERE" --size 1080x1920
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4"
.venv/bin/python "$HERE/mix.py"
LN=$(python3 "$ROOT/.claude/skills/paper-trail/tools/loudnorm.py" "$HERE/out/mix.wav")
ffmpeg -v error -y -i "$HERE/out/video.mp4" -i "$HERE/out/mix.wav" -map 0:v -map 1:a -c:v libx264 -crf 22 -preset medium -pix_fmt yuv420p \
  -af "$LN" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$HERE/pip-sleep.mp4"
python3 - "$HERE" <<'PY'
import json, sys, re
H = sys.argv[1]; src = open(f'{H}/film.js').read()
# the printed words, from film.js's LINES (same timing rule as SUBS)
L = [dict(t=float(a), d=float(b), text=c.replace("\\'", "'")) for a, b, c in re.findall(r"\{ id: 'n\d+', t: ([\d.]+), d: ([\d.]+), text: [\"'](.*?)[\"'] \}", src)]
f = lambda s: f"{int(s // 3600):02}:{int(s % 3600 // 60):02}:{int(s % 60):02},{int(round(s % 1 * 1000)):03}"
out = []
for i, l in enumerate(L):
    t0 = l['t'] - .1; t1 = max(t0 + 1.8, l['t'] + l['d'] + .7)
    if i + 1 < len(L): t1 = min(t1, L[i + 1]['t'] - .2)
    out.append(f"{i + 1}\n{f(t0)} --> {f(t1)}\n{l['text']}\n")
open(f'{H}/pip-sleep.srt', 'w').write('\n'.join(out)); print('srt', len(out), 'cues')
PY
echo "done: $HERE/pip-sleep.mp4"
