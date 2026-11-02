"""Chatterbox TTS (Resemble AI, MIT licence) for paper-trail. Runs in kit/.venv-cb (torch CPU).
   tts_chatterbox.py <lines.json> <outdir> [ref.wav] [exaggeration] [cfg]  -> outdir/line_XX.wav (24 kHz)
Outputs carry Resemble's inaudible Perth watermark."""
import json, os, sys, torch, soundfile as sf
from chatterbox.tts import ChatterboxTTS
torch.set_num_threads(os.cpu_count() or 4)
lines = json.load(open(sys.argv[1])); out = sys.argv[2]; ref = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else None
ex = float(sys.argv[4]) if len(sys.argv) > 4 else .35; cfg = float(sys.argv[5]) if len(sys.argv) > 5 else .35
m = ChatterboxTTS.from_pretrained(device="cpu"); os.makedirs(out, exist_ok=True)
for i, line in enumerate(lines):
    f = f"{out}/line_{i:02d}.wav"
    if os.path.exists(f): continue  # resumable: long scripts take a while on CPU
    torch.manual_seed(1000 + i)  # same text -> same take
    wav = m.generate(line, exaggeration=ex, cfg_weight=cfg, **({"audio_prompt_path": ref} if ref else {}))
    sf.write(f, wav.squeeze().numpy(), m.sr); print(f"line {i + 1}/{len(lines)}", flush=True)
