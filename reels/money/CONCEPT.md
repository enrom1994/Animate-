# Ten Years On: channel concept

Working name. Everyday money choices, played out over time: two neighbours on one street, the same paycheck, a different
choice, and the years roll on. Faceless, animated, Shorts first.

Style tests: `reels/howto/moneylook/` (`flat2d_stick.html`, `props_sheet.html`, `movetest.html`; render with `render2d.mjs`).

## Why this name

- "Same Paycheck" was the first idea, but a YouTube channel already has that name (checked November 2026). Next Door Money,
  The Money Street, Money Lane and Two Doors Down are taken too.
- "Ten Years On" turned up no channel of that name and says what the channel does: the time jump. The handle is not checked
  (that needs a signed-in YouTube account).
- The two-people money comparison is not an empty format: at least one channel runs one ("Jordan & Alex"). Our edge is the
  street that ages, the numbers living on the objects, and the neighbours' ongoing story, not the comparison itself.

## The promise

**See what a choice really costs before you make it.** The viewer picks a side in the first second, then watches where it leads.

## Audience

18 to 35, earning their own money, making first big choices: first car, first flat, first card, first raise.

## The cast

Two stickmen, the same age, the same job, the same pay, living next door to each other. Neither is a villain.

| | The saver (working name Theo) | The spender (working name Max) |
|---|---|---|
| Look | blue body, teal scarf | yellow body, orange cap |
| Home | the cream plaster house, teal door | the red brick house, red door |
| Habit | plans ahead, sometimes too much | lives for now, sometimes rightly |

Over the series they live a story: partners, kids, job changes, a move. Early episodes are first cars and first cards; later ones
are mortgages, school costs, pensions. Viewers come back to see what happens to them.

## The episode formula (40 to 50 s Shorts)

1. **Hook, 0 to 3 s:** the choice and a surprising number, on the object.
2. **The two choices, 3 to 12 s:** each neighbour picks a side; the price lands on the thing.
3. **The time jump, 12 to 35 s:** the street ages; numbers move on the objects (a car's value falls, a jar fills, a debt meter
   climbs); the world changes too (hedges grow, signs go up, the neighbours age).
4. **The reason, 35 to 42 s:** why, in one line (depreciation, compound interest, the card's interest rate).
5. **The rule, 42 to 48 s:** one practical takeaway, never "you will earn X".

## Four series (rotated, so no viewer sees the same shape twice in a row)

- **Same Street** (the core): one choice, two neighbours, the years roll on.
- **What It Really Costs:** one everyday habit over ten years, the alternative growing beside it.
- **Money Traps:** how a common product quietly takes money; the twist does the work.
- **Asset or Liability?:** quick-fire; a thing appears and the street shows whether it puts money in or takes it out.

## Keeping it from going stale

- **The outcome varies.** Some episodes the spender's choice is right (the reliable car that keeps a job), some both lose
  (savings eaten by inflation), some the saver overdoes it. If the saver always wins, viewers stop by episode ten.
- **The story moves on** (see the cast), **the world travels** (dealership, phone shop, supermarket, holiday, job interview),
  **viewers pick the next choice** in the comments.
- **Retention decides.** Once live, YouTube Studio's retention export shows where people leave (`/yt-retention`). A series
  whose retention falls episode after episode is changed or retired.

## First ten episodes

Ranked by search demand and fit. Demand is measured by YouTube's own search suggestions (10 = the box fills with real
questions on the topic). It is a rough signal, not a search volume; no free tool gives volumes.

| # | Episode | Series | Searches it answers | Demand |
|---|---|---|---|---|
| 1 | **The $34,000 car**: new on finance vs a used car and investing the difference | Same Street | car finance explained, pcp car finance, new car or used | 10 |
| 2 | **Buy now, pay later**: four easy payments, then the late fees | Money Traps | buy now pay later (and "... trap", "... scam") | 10 |
| 3 | **The minimum payment**: $2,000 on a card, paying the minimum | Money Traps | minimum payment credit card, credit card interest explained | 10 |
| 4 | **$100 a month**: started at 22 vs started at 32 | Same Street | how compound interest works, invest 100 a month | 10 |
| 5 | **Asset or liability?**: a car, a house, a console, a side business | Asset or Liability? | assets vs liabilities (and "... cartoon") | 10 |
| 6 | **The boiler breaks**: an emergency fund vs a credit card | Same Street | emergency fund, emergency fund or pay off debt | 10 |
| 7 | **Pay off debt or invest?** | Same Street | should i pay off debt or invest | 10 |
| 8 | **Rent or buy**: and why both can win | Same Street | rent vs buy, should i rent or buy a house | 10 |
| 9 | **Lease or buy the car** | Same Street | lease vs buy car | 10 |
| 10 | **The raise**: lifestyle creep vs keeping the old budget | What It Really Costs | lifestyle creep | 7 |

Held for later: is college worth it (10, but depends heavily on country and subject), good debt vs bad debt (7), the phone
every year (2), the daily coffee (no search demand as a question; works as a hook, not a search). "Assets vs liabilities rich dad
poor dad" shows how the book is searched; we answer the idea, never use the name.

**Pilot:** episode 1. The car and the jar already exist in the prop library and the moving test.

## Money-content rules (stricter than the How-to channel's)

- Every number is sourced in the episode's `SOURCES.md`, dated, and shown as a range where it varies ("6 to 8% a year", "keeps
  about a third of its value after ten years"). Illustrative numbers are said to be illustrative.
- No stock, fund, app or bank picks; no "you will earn X"; no crypto or trading hype.
- "Education, not financial advice" in every description, and on screen in any episode about investing.
- Country-neutral by default (dollars, no tax rules). An episode that depends on one country's rules says which country.
- No "Rich Dad Poor Dad" name, characters or cover; no real brands or logos on props.

## Look (from the style tests)

- **Flat 2D, front-on, a children's-book page:** limited warm palette, one dark ink line (`#2e1d1c`), paper grain over everything.
- **Stickmen** from the `stick-figure` skill's figure; one signature item each (scarf, cap), the same in every episode.
- **Props drawn in detail** (`moneylook/stick/props2d.js`): the right shape and real parts, shaded, generic (no brands). Each prop
  is drawn once and reused; the library grows with the episodes.
- **Numbers live on objects** (tags on the car, the jar, a meter), never floating. They pop in and count; a tag is never clipped
  by the frame edge.
- **The camera** glides, pushes and pulls through the street, never past its ends; the scene sits above the caption band.
- **The time jump**: days and nights flicker, the street changes, the numbers count. In a wide shot the tags grow so they still
  read on a phone (the moving test showed they get too small).

## Production

- Script in the house pattern (impossible-sounding fact first, one idea per sentence), sources first, then the voice.
- Voice: the free Kokoro voice used for Sam (Fenrir), unless a different voice suits money better; to be tested on the pilot.
- Picture: `render2d.mjs` (about 0.3 s a frame: a 45 s Short renders in about 6 minutes with no GPU).
- Sound: the house `real-sfx` approach (whooshes on moves, a register "ka-ching" or a coin drop on every number that lands).
- Checks: EDITING.md section 5 audit, `look.py`, and a still of every shot, as for every film.
