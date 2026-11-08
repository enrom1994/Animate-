#!/bin/sh
# One command: imagery → plates → measurement → voice → picture → mix → master → .srt   (sh build.sh)
set -e
HERE=$(cd "$(dirname "$0")" && pwd); ROOT=$(cd "$HERE/../../.." && pwd)
LIB=${LIB:-$ROOT/.claude/kit/lemo-opuscar}; export PLAYWRIGHT_CHROME=${PLAYWRIGHT_CHROME:-/opt/pw-browsers/chromium}
[ -f "$LIB/core/render/video.mjs" ] || sh "$ROOT/.claude/skills/lemo-opuscar/scripts/setup.sh"
cd "$HERE"
python3 -I tools/fetch.py . && python3 -I tools/plates.py . && "$LIB/.venv/bin/python" -I tools/measure.py > /dev/null
[ -f voices/durations.json ] && [ -f voices/n01.wav ] || "$ROOT/.claude/kit/.venv/bin/python" tts_lines.py
cd "$LIB"
node core/render/events.mjs "$HERE" --size 1080x1920
node core/render/video.mjs "$HERE" --fps 30 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4"
.venv/bin/python "$HERE/mix.py"
LN=$(python3 "$ROOT/.claude/skills/paper-trail/tools/loudnorm.py" "$HERE/out/mix.wav")
ffmpeg -v error -y -i "$HERE/out/video.mp4" -i "$HERE/out/mix.wav" -map 0:v -map 1:a -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p \
  -af "$LN" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$HERE/egypt-nile.mp4"
echo "done: $HERE/egypt-nile.mp4"
