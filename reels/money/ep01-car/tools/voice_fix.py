#!/usr/bin/env python3
"""The voice take as used in the film: python3 tools/voice_fix.py  (from the film folder, after tts_kokoro.py)
audio/vo_kokoro.wav -> audio/vo.wav with a pause of 0.45 s before the closing line ("Same paycheck..."),
placed at the quietest instant between the two sentences (standing check 13). Then run engine/retime.py."""
import array, subprocess
PAUSE = 0.5
start = __import__('json').load(open('audio/lines.json'))[-1]['start']; LO, HI = start - .25, start + .02   # just before the closing line starts
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'audio/vo_kokoro.wav', '-f', 's16le', '-ac', '1', '-ar', '8000', '-'], capture_output=True, check=True).stdout
a = array.array('h', raw); cut = min(range(int(LO * 8000), int(HI * 8000), 40), key=lambda i: sum(abs(x) for x in a[i - 160:i + 160])) / 8000
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'audio/vo_kokoro.wav', '-filter_complex',
  f"[0:a]atrim=0:{cut},asetpts=N/SR/TB[a];[0:a]atrim={cut},asetpts=N/SR/TB[b];anullsrc=r=24000:cl=mono,atrim=0:{PAUSE}[s];[a][s][b]concat=n=3:v=0:a=1[o]",
  '-map', '[o]', '-ar', '24000', '-ac', '1', 'audio/vo.wav'], check=True)
print('pause at', cut)
