"""Chatterbox TTS (Resemble AI, MIT licence) for paper-trail. Runs in kit/.venv-cb (torch CPU).
   tts_chatterbox.py <todo.json: [[text, out.wav], ...]> [ref.wav] [exaggeration] [cfg]   (24 kHz output)
Outputs carry Resemble's inaudible Perth watermark."""
import json, os, sys, zlib, torch, soundfile as sf
from chatterbox.tts import ChatterboxTTS
torch.set_num_threads(os.cpu_count() or 4)
todo = json.load(open(sys.argv[1])); ref = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] else None
ex = float(sys.argv[3]) if len(sys.argv) > 3 else .35; cfg = float(sys.argv[4]) if len(sys.argv) > 4 else .35
m = ChatterboxTTS.from_pretrained(device="cpu")
for i, (text, out) in enumerate(todo):
    torch.manual_seed(zlib.crc32(text.encode()))  # same text -> same take
    wav = m.generate(text, exaggeration=ex, cfg_weight=cfg, **({"audio_prompt_path": ref} if ref else {}))
    sf.write(out + ".part.wav", wav.squeeze().numpy(), m.sr); os.replace(out + ".part.wav", out)
    print(f"line {i + 1}/{len(todo)}", flush=True)
