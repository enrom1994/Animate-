# Facts — "Egypt: one river" (long form)

Searches run 2026-11-08 (standard web search); see the conversation log for result lists. Measurements are made on the plates shown (`tools/measure.py` → `assets/measure.json`).

| Claim (wording used) | Source / method |
|---|---|
| Egypt bigger than France + Germany | Egypt 1,001,450 km²; France (metropolitan) ~551,500; Germany ~357,600 → ~909,000 km² |
| "about 95% of Egyptians live along the Nile, on roughly 4% of the land" | Geography of Egypt (Wikipedia: ~95% within 20 km of the Nile/delta; valley + delta ~4% of area); FAO country profile (~35,000 km², 3.5%); Britannica up to 99% |
| "Cairo gets less than 3 cm of rain in a whole year" | Cairo climate normals ~18–25 mm/yr (Wikipedia climate box / Egyptian Meteorological Authority normals) |
| "about 97% of Egypt's water comes from one river" | Nile Basin Initiative Egypt baseline report (Nile ≈ 97% of renewable fresh water); Egyptian irrigation minister (Arab News / Ahram); Wikipedia gives ~90% for total supply, so the on-screen note says *renewable* water |
| "just 8.4 km wide" (narrowest, near Qena) | Measured: Landsat 9 LC09_L2SP_175042_20251008 (2025-10-08), see ../egypt-nile/FACTS.md |
| Summer flood from Ethiopian highland rains; black silt; "Kemet, the black land" | Standard Nile hydrology (Blue Nile / Atbara monsoon flood peaking Aug–Sep) and Egyptology (km.t, "the black land") |
| "in 1970, Egypt finished the Aswan High Dam" | Encyclopedia / EBSCO research starter: completed 1970 (inaugurated 1971) |
| Lake Nasser "one of the largest man-made lakes", "about 550 km, from Egypt into Sudan" | Wikipedia Lake Nasser (~550 km long incl. the Sudanese part, Lake Nubia); on screen marked "approx." |
| "More than 98% of the river's sediment now settles in the lake" | IAHR library item on the High Dam (>98% of the sediment load trapped in Lake Nasser); Eastleigh Voice summary of a delta-erosion study |
| Farmers replaced the mud with fertiliser; the coast lost its supply of new land | Widely documented consequence (World Food Prize paper, EBSCO research starter); delta erosion increased after the dam (J. Coastal Research 1995; AGU 2016 abstract) |
| "the tip of the land has pulled back 3.8 km" (Rosetta, 1972 → 2025) | Measured: Landsat 1 MSS LM01_L1TP_190038_19720831 (NIR > 34 DN = land; sea 24–29, wet sand 35–60, checked on the band) vs Landsat 9 LC09_L2SP_177038_20250819 (MNDWI < 0 = land); distance from the 1972 tip (31.504°N 30.357°E) to the nearest 2025 land pixel. Literature: ~120 m/yr retreat 1964–1990 (Masria et al. 2015, Land 4(1):216) |
| Sea wall "in the early nineties" / "built 1991" | Masria et al. 2015 / Ghoneim et al. 2015: 4.85 km seawall built 1991, groins 2003–2005 |
| "much of the northern delta lies barely above sea level" | General delta geography (low-lying northern delta and lagoons); no number used |
| "about 27 million people in 1960", "more than 109 million" today | UN population estimates (1960 ≈ 27 M); CAPMAS population clock 109 M on 9 May 2026 |
| "Cairo alone has roughly 25 million. It is the largest city in Africa." | UN World Urbanization Prospects 2025 (Cairo urban agglomeration 25.5–25.6 M; Lagos next at 12.8 M), via The Star / Roya News |
| "roughly 1 in 4 of the fields that were green here in 1984 are now built over" | Measured: Landsat 5 TM 1984-04-20/29 vs Landsat 8 OLI 2025-03-13/04-05 (same season), NDVI > 0.3 = green field; built 2025 = NDVI < 0.2, NDBI > 0, mean visible reflectance < 0.2. 27.1% of 1984 green pixels (16.7% counting only whole blocks); the red overlay shows those pixels. Local studies (Ain Shams, Qalyubia, Gharbia) report similar encroachment but no national figure exists, so the claim is limited to "here" |
| New capital: empty in 2015, now ministries + tallest building in Africa | Landsat 8 2015-09-26 vs Landsat 9 2025-09-13 (visual); project announced March 2015 (Wikipedia, Britannica); government relocation from 2023 (Wikipedia, Ahram); Iconic Tower, tallest in Africa (Wikipedia) |
| "Whether millions of people will follow is still an open question" | Hedge; reporting on low occupancy varies — no number used |
| Toshka lakes "first formed in 1998, grow and shrink with the floods" | NASA Earth Observatory "Toshka Lakes, Southern Egypt" (first documented Nov 1998); Wikipedia (refilled after the 2022 Sudanese floods); measured lake area in frame: 584 km² (Landsat 7, 2001-12-25) vs 955 km² (Landsat 8, 2021-10-21), MNDWI > 0.1, west of 31.35°E |
| New farms watered from the lake (pivot circles) | Visible on Landsat 8 2021-10-21; Toshka project draws water from Lake Nasser (Mubarak pumping station; Wikipedia "New Valley Project") |

Removed after checking: an earlier draft said the Toshka lakes were "drying up"; the imagery shows more water in 2021 than in 2001, so the script says they grow and shrink. An automatic Rosetta "land lost" area (95 km²) was dropped: turbid 1972 coastal water reads as land in the MSS NIR band.
