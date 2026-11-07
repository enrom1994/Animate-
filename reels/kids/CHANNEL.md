# Kids channel: Pip & Biscuit

**Format.** 5 to 8 minute episodes in 16:9, three chapters each, one animal per episode, three real questions answered.
Each chapter also becomes a 45 to 60 second Short. Made for kids: label every video "made for kids" on upload.

**Characters.**
- **Pip**: a curious kid, red striped top, no hat. Pip talks to the viewer (first person, warm, excited, never shouting).
- **Biscuit**: an orange cat (fur #f29a3a, cream belly), expressive, never speaks, reacts with moods, purrs, tail and ears.
- Guests per episode (other animals) are drawn in the same thick-ink style.

**Voice.** Pip = `engine/tools/tts_pip.py`: Kokoro `af_heart`, speed 1.0 (was 1.05 until ep01 v2: slower suits young kids), +4 semitones, low-mids -3 dB (voice test A,
`reels/voices/kid-tests/kid_af_heart.wav`). Synthetic only: never clone a real child's voice.

**Rules.**
- Every fact is real and checked; contested ideas are said as "scientists think" or left out.
- Short sentences, one idea each. Words a 6 to 10 year old knows; new words explained once.
- No scary or unsafe moments; when a fact could invite copying (cats falling), say clearly not to try it.
- No "like and subscribe". End each episode with a question back to the viewer ("Which animal is next?").
- Bright, gentle music; cartoon sound effects; no sudden loud sounds.
- Captions on screen, lowercase, 1 to 2 words.

**Episode shape (from ep01).** ~5 min, 4 mysteries. Each mystery gets one "Guess first!" question: two choices pop up, then a 3 s countdown (pauses.json) before the answer. Chapter card per mystery, recap cards in the outro, end on "which animal next?". One 9:16 Short per mystery is cut with `shorts.sh`.
