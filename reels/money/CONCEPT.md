# Ten Years On: channel concept

Everyday money choices, played out over time: two neighbors on one street, the same paycheck, a different choice, and the
years roll on. Faceless, animated, Shorts first. Audience in the US: dollars, US sources, American spelling on screen.

Updated 22 November 2026, after three finished episodes. Channel art: `brand/` (profile picture and banner, drawn by the film
code in `brand/brand.html`).

## Why this name

- "Same Paycheck" was the first idea, but a YouTube channel already has that name (checked November 2026). Next Door Money,
  The Money Street, Money Lane and Two Doors Down are taken too.
- "Ten Years On" turned up no channel of that name and says what the channel does: the time jump. `@tenyearson` was taken, so the
  channel is **Ten Years On, handle `@TenYearsOnShorts`** (created November 2026). The name need not be unique; only the handle is.
- The two-people money comparison is not an empty format: at least one channel runs one ("Jordan & Alex"). Our edge is the
  street that ages, the numbers living on the objects, and the neighbors' ongoing story, not the comparison itself.

## The promise

**See what a choice really costs before you make it.** The viewer picks a side in the first second, then watches where it leads.

## Audience

18 to 35, earning their own money, making first big choices: first car, first apartment, first card, first raise.

## The cast

Two neighbors, the same age, the same pay. Neither is a villain. Drawn in `look2/` (`cast.js`, `max.js`, `faces.js`).

| | Theo (the saver) | Max (the spender) |
|---|---|---|
| Look | design "Theo C": green polo, buzz cut, grey trousers | orange cap with shades on it, gold chain, gold watch; a black satin bomber off duty, the orange store vest at work |
| Job | (not shown yet) | works the counter at the QUICK STOP |
| Home | one-storey tan house, teal door | two-storey cream house with a garage, red door |
| Car | a used grey-green hatchback | a red coupe with gold rims |
| Habit | plans ahead, sometimes too much | lives for now, sometimes rightly (ep. 3: his sneaker resale is an asset) |

Rule: Max and Theo are never squeezed into one shot. They share the screen by split screen, cuts, pans or zooms.

Over the series they live a story: partners, kids, job changes, a move. Early episodes are first cars and first cards; later ones
are mortgages, school costs, retirement. Viewers come back to see what happens to them.

## The episode formula (35 to 45 s Shorts)

1. **Hook, 0 to 5 s:** passes the hook gate (below) before the voice is recorded. It says *you*, names what it costs, and leaves a
   question open; the sourced fact can sit on screen as a card while the voice carries the hook.
2. **The choice, to about 12 s:** each neighbor picks a side; the price lands on the thing.
3. **The time jump or the test, to about 35 s:** numbers move on the objects (a car's value falls, a fund rises, payments stack).
4. **The reason:** why, in one line (depreciation, compound growth, stacked due dates).
5. **The rule:** one practical takeaway, alone on screen at the end, never "you will earn X".

## Four series (rotated, so no viewer sees the same shape twice in a row)

- **Same Street** (the core): one choice, two neighbors, the years roll on.
- **What It Really Costs:** one everyday habit over ten years, the alternative growing beside it.
- **Money Traps:** how a common product quietly takes money; the twist does the work.
- **Asset or Liability?:** quick-fire; a thing appears and the street shows whether it puts money in or takes it out.

## Keeping it from going stale

- **The outcome varies.** Some episodes the spender's choice is right, some both lose (savings eaten by inflation), some the
  saver overdoes it. If the saver always wins, viewers stop by episode ten. So far: ep. 1 saver wins; ep. 2 nobody is ruined;
  ep. 3 Max wins one.
- **The story moves on** (see the cast), **the world travels** (dealership, phone shop, supermarket, holiday, job interview),
  **viewers pick the next choice** in the comments.
- **Retention decides.** Once live, YouTube Studio's retention export shows where people leave (`/yt-retention`). A series
  whose retention falls episode after episode is changed or retired. **None is uploaded yet: upload the pilot first.**

## Episodes

### Made

| # | Folder | Title (yt-package) | Hook (hook gate) | Series | Length |
|---|---|---|---|---|---|
| 1 | `ep01-look2/` | New Car vs Used Car: The $24,000 Difference (94) | "Before you sign a 787 dollar car payment, see why your neighbor ends up 24,000 dollars ahead." (70) | Same Street | 39.0 s |
| 2 | `ep02-bnpl/` | Buy Now, Pay Later: What 4 Payments Really Cost (94) | "Before you split 400 dollars into four payments, watch what happens to your next six weeks." (67) | Money Traps | 41.5 s |
| 3 | `ep03-asset/` | Is Your Car an Asset? 4 Things, Tested (100) | "Stop. Before you call your car an asset, see which of these 4 things actually pays you." (73) | Asset or Liability? | 42.7 s |

Each folder has `SOURCES.md`, `hooks.txt` and `hooks_report.txt`, and `UPLOAD.md` (title, cover frame, description).
Before uploading ep. 2: confirm the late-fee figures on the lenders' own pages.

### Next, in rotation order

Demand is measured by YouTube's own search suggestions (10 = the box fills with real questions on the topic): a rough signal,
not a search volume.

| Episode | Series | Searches it answers | Demand | Note |
|---|---|---|---|---|
| **The $400 emergency**: an emergency fund vs a credit card | Same Street | emergency fund, emergency fund or pay off debt | 10 | opens on the Federal Reserve's household survey figure (to confirm) |
| **The minimum payment**: $2,000 on a card, paying the minimum | Money Traps | minimum payment credit card, credit card interest explained | 10 | |
| **The raise**: lifestyle creep vs keeping the old budget | What It Really Costs | lifestyle creep | 7 | the first of this series |
| **$100 a month**: started at 22 vs started at 32 | Same Street | how compound interest works, invest 100 a month | 10 | another saver-wins: pair it with a Max win nearby |
| **Pay off debt or invest?** | Same Street | should i pay off debt or invest | 10 | |
| **Rent or buy**: and why both can win | Same Street | rent vs buy, should i rent or buy a house | 10 | both can win |
| **Lease or buy the car** | Same Street | lease vs buy car | 10 | |

Held for later: is college worth it (10, but depends heavily on the subject), good debt vs bad debt (7), the phone every year (2),
the daily coffee (no search demand as a question; works as a hook, not a search). "Assets vs liabilities rich dad poor dad" shows
how the book is searched; we answer the idea, never use the name.

## Money-content rules (stricter than the How-to channel's)

- Every number is sourced in the episode's `SOURCES.md`, dated, and shown as a range where it varies. Illustrative numbers are
  said to be illustrative, on screen. A figure whose sources disagree (long-run house prices) is left out, and the film says
  "it depends" and gives the condition.
- Words must not overstate the number: "the $24,000 difference", not "costs $24,000"; "investments", not "invested", for a grown value.
- No stock, fund, app or bank picks; no "you will earn X"; no crypto or trading hype.
- "Education, not financial advice" in every description, and on screen in any episode about investing.
- No "Rich Dad Poor Dad" name, characters or cover; no real brands, logos or product names (not even in titles: "Pay in 4" is a
  product name).

## Look

- **2D toon, code-drawn:** a dark boiling ink line, flat fills with hard toon shadows, big-eyed faces (`look2/toon.js`).
- **A real 3D world drawn in that line:** the town at night (houses, the QUICK STOP, streets, traffic) and every prop are 3D
  models in real meters, seen through a real perspective camera, so sizes are right by construction (`look2/wide.js`,
  `look2/store.js`, `look2/props/`). A new prop goes into the prop library first and is checked on `props/sheet.html` beside a
  1.75 m person. Never size a prop by eye.
- **Point of view shots:** a letter or a phone in his hands, at true size, the background out of focus (`look2/phonepov.js`).
- **Numbers live on cards pinned to the objects**, popping in and counting; stamps for verdicts (LIABILITY, ASSET, IT DEPENDS).
- **Split screens** for comparisons; the last line alone over a blurred, darkened frame.
- **The camera always travels:** pushes, pulls, pans, the pull-out through the shop window and over the town.

## Production

1. **Sources** in `SOURCES.md`.
2. **The hook gate:** five or more hooks against the 21 formulas in `hooks.txt`, then `python3 reels/hookgate.py <film>`, which
   must pass (60 or more, top or within 5 points).
3. **The script** (`script.json`), then the **voice:** Kokoro "Fenrir" at speed 1.08 (`tts_kokoro.py am_fenrir 1.08`), a 0.45 s
   pause before the closing rule (`tools/voice_fix.py`), word timings (`align.py`, with `captions.json` moved aside while it runs),
   captions (`engine/retime.py`).
4. **The film** (`film.html`), built on the shared kit: `look2/edit.js` (cards, stamps, split screens, camera rig) and
   `look2/street.js` (the two men, their houses and cars).
5. **The money gate:** `node reels/howto/moneylook/check2d.mjs /money/<film>/film.html` must report 0 errors: labels covered, cut
   off or overflowing their box, characters too small or cut off, code commented out by a mid-line `//`, any frame over 1 s to draw.
6. **Stills of every shot**, then the render: `render2d.mjs` at about 0.17 s a frame, so a 40 s Short renders in about 3.5 minutes.
7. **Sound:** real recordings (`real-sfx` library) and the CC0 `uisfx` pack for phone sounds, cues in `cues.json`, 8 to 13 in the
   first 20 s, mixed by `engine/mix.py`.
8. **The title:** ten options through `yt-package` (`titles.txt`), written as a pair with the hook; the cover frame picked so its
   words differ from the title's. Everything goes into `UPLOAD.md`.
