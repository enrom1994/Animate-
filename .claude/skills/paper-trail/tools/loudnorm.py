"""Two-pass loudness: measure a file, print the exact ffmpeg loudnorm filter that brings it to the target.
   loudnorm.py <audio-or-video> [I=-14] [TP=-1.5] [LRA=11]   (single-pass loudnorm undershoots on long programmes)"""
import json, re, subprocess, sys
f = sys.argv[1]; I, TP, LRA = (sys.argv[2:5] + ["-14", "-1.5", "11"][len(sys.argv[2:5]):])
base = f"loudnorm=I={I}:TP={TP}:LRA={LRA}"
err = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", base + ":print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.findall(r"\{[^{}]*\}", err)[-1])
print(f"{base}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
