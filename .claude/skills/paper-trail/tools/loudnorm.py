"""Two-pass loudness: measure a file, print the exact ffmpeg loudnorm filter that brings it to the target.
   loudnorm.py <audio-or-video> [I=-14] [TP=-1.5] [LRA=11]   (single-pass loudnorm undershoots on long programmes)"""
import json, re, subprocess, sys
f = sys.argv[1]; I, TP, LRA = (sys.argv[2:5] + ["-14", "-1.5", "11"][len(sys.argv[2:5]):])
# tame the SFX transients first (gunfire, hits), otherwise the true-peak ceiling stops loudnorm short of the target
pre = "alimiter=limit=0.35:attack=1:release=50:level=false"
base = f"loudnorm=I={I}:TP={TP}:LRA={LRA}"
err = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", pre + "," + base + ":print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.findall(r"\{[^{}]*\}", err)[-1])
print(f"{pre},{base}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
