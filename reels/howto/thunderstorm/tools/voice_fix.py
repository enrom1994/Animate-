#!/usr/bin/env python3
"""The voice take as used in the film: python3 tools/voice_fix.py  (run from the film folder after tts_kokoro.py)
audio/vo_kokoro.wav -> audio/vo.wav with two changes to the last sentence, "Call for help.":
a pause of 0.45 s before it (it began straight after "They hold no charge." and was lost), and 2.5 dB more level
(the take speaks it about 2.7 dB under the rest). Then run engine/retime.py, which leaves 1.35 s after the last word."""
import subprocess
CUT, PAUSE, GAIN = 38.56, 0.45, 1.33
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'audio/vo_kokoro.wav', '-filter_complex',
  f"[0:a]atrim=0:{CUT},asetpts=N/SR/TB[a];[0:a]atrim={CUT},asetpts=N/SR/TB,volume={GAIN}[b];anullsrc=r=24000:cl=mono,atrim=0:{PAUSE}[s];[a][s][b]concat=n=3:v=0:a=1[o]",
  '-map', '[o]', '-ar', '24000', '-ac', '1', 'audio/vo.wav'], check=True)
print('wrote audio/vo.wav')
