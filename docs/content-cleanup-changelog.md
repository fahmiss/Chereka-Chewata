# Content cleanup changelog

**Branch:** `content/party-quality-audit`  
**Date:** 2026-11-02  
**Quiz:** untouched  

## Summary by action

| Action | Count |
|---|---:|
| add | 66 |
| deactivate | 23 |
| fix | 1 |
| rehome | 2 |
| rewrite | 10 |

## Before → after (active)

| Game | Before | Deactivated | Rewritten / rehomed | Added | After |
|---|---:|---:|---:|---:|---:|
| Taboo | 425 | 18 | 0 | 16 | 423 |
| Impostor | 371 | 3 | 2 rehomed | 5 | 373 |
| Who's the Liar | 226 | 0 | 9 | 5 | 231 |
| Tikus Dinich | 157 | 2 | 0 | 25 | 180 |
| Would You Rather | 253 | 0 | 1 | 4 | 257 |
| Most Likely | 262 | 0 | 0 | 4 | 266 |
| Gimbar | 55 | 0 | 1 sort fix | 7 | 62 |

\*Kept ≈ active items not deactivated in this pass (approximate).

## Changes by game

### Taboo

| ID | Action | Reason | Detail |
|---|---|---|---|
| `taboo_sports_128` | deactivate | Duplicate football concept — keep Football category copy | Referee |
| `taboo_sports_130` | deactivate | Duplicate football concept — keep Football category copy | Coach |
| `taboo_sports_131` | deactivate | Duplicate football concept — keep Football category copy | Penalty |
| `taboo_sports_132` | deactivate | Duplicate football concept — keep Football category copy | Stadium |
| `taboo_sports_133` | deactivate | Duplicate football concept — keep Football category copy | Jersey |
| `taboo_sports_287` | deactivate | Duplicate football concept — keep Football category copy | Goalkeeper |
| `taboo_sports_293` | deactivate | Duplicate football concept — keep Football category copy | Offside |
| `taboo_sports_294` | deactivate | Duplicate football concept — keep Football category copy | Substitute |
| `taboo_sports_295` | deactivate | Duplicate football concept — keep Football category copy | Captain |
| `taboo_ethiopia_003` | deactivate | Duplicate Injera — keep food_and_drink copy | Injera |
| `taboo_places_050` | deactivate | Duplicate Lalibela — keep ethiopia_and_culture | Lalibela |
| `taboo_places_051` | deactivate | Duplicate Axum — keep ethiopia_and_culture | Axum |
| `taboo_places_264` | deactivate | Duplicate Simien Mountains — keep ethiopia_and_culture | Simien Mountains |
| `taboo_music_and_entertainment_243` | deactivate | Duplicate Krar — keep ethiopia_and_culture | Krar |
| `taboo_football_005` | deactivate | Duplicate Messi — keep taboo_cur_015 | Messi |
| `taboo_sports_new_001` | add | Replace deactivated football-dupe sports slots | Badminton |
| `taboo_sports_new_002` | add | Replace deactivated football-dupe sports slots | High jump |
| `taboo_sports_new_003` | add | Replace deactivated football-dupe sports slots | Diving |
| `taboo_sports_new_004` | add | Replace deactivated football-dupe sports slots | Gymnastics |
| `taboo_sports_new_005` | add | Replace deactivated football-dupe sports slots | Surfing |
| `taboo_sports_new_006` | add | Replace deactivated football-dupe sports slots | Skateboard |
| `taboo_sports_new_007` | add | Replace deactivated football-dupe sports slots | Relay race |
| `taboo_sports_new_008` | add | Replace deactivated football-dupe sports slots | Finish line |
| `taboo_sports_new_009` | add | Replace deactivated football-dupe sports slots | Helmet |
| `taboo_ethiopia_new_001` | add | Strengthen Ethiopia & Culture Taboo pool | Ashenda |
| `taboo_ethiopia_new_002` | add | Strengthen Ethiopia & Culture Taboo pool | Tej |
| `taboo_ethiopia_new_003` | add | Strengthen Ethiopia & Culture Taboo pool | Mitmita |
| `taboo_ethiopia_new_004` | add | Strengthen Ethiopia & Culture Taboo pool | Kitfo |
| `taboo_ethiopia_new_005` | add | Strengthen Ethiopia & Culture Taboo pool | Walia |
| `taboo_ethiopia_new_002` | deactivate | Duplicate of Food & Drink Taboo target — keep food category | Tej |
| `taboo_ethiopia_new_003` | deactivate | Duplicate of Food & Drink Taboo target — keep food category | Mitmita |
| `taboo_ethiopia_new_004` | deactivate | Duplicate of Food & Drink Taboo target — keep food category | Kitfo |
| `taboo_ethiopia_new_007` | add | Ethiopia Taboo without food-category collision | Demera |
| `taboo_ethiopia_new_008` | add | Ethiopia cultural gathering | Senbet |

### Impostor

| ID | Action | Reason | Detail |
|---|---|---|---|
| `imp_ent_025` | deactivate | Duplicate Basketball — keep Sports | Basketball |
| `imp_ent_026` | deactivate | Duplicate Tennis — keep Sports | Tennis |
| `imp_ent_027` | deactivate | Duplicate Swimming — keep Sports | Swimming |
| `imp_ent_028` | rehome | Move from Entertainment to Everyday Life | Camping |
| `imp_ent_029` | rehome | Move from Entertainment to Everyday Life | Picnic |
| `imp_eth_new_001` | add | Expand Ethiopia & Culture with recognizable terms | Ashenda |
| `imp_eth_new_003` | add | Expand Ethiopia & Culture with recognizable terms | Mitmita |
| `imp_eth_new_005` | add | Expand Ethiopia & Culture with recognizable terms | Walia ibex |
| `imp_eth_new_006` | add | Expand Ethiopia & Culture with recognizable terms | Gursha |
| `imp_eth_new_007` | add | Expand Ethiopia & Culture with recognizable terms | Fichee |

### Bomb

| ID | Action | Reason | Detail |
|---|---|---|---|
| `bomb_sport_001` | deactivate | Duplicate Football clubs — keep football category | Football clubs |
| `bomb_sport_002` | deactivate | Duplicate Football players — keep football category | Football players |
| `bomb_sport_new_002` | add | Expand thin / replace football-overlap Sports prompts | Things athletes wear |
| `bomb_nature_new_001` | add | Expand thin / replace football-overlap Sports prompts | Animals found in Africa |
| `bomb_nature_new_003` | add | Expand thin / replace football-overlap Sports prompts | Birds people can name |
| `bomb_nature_new_004` | add | Expand thin / replace football-overlap Sports prompts | Things you find in a forest |
| `bomb_nature_new_005` | add | Expand thin / replace football-overlap Sports prompts | Pets people keep at home |
| `bomb_eth_new_001` | add | Expand thin / replace football-overlap Sports prompts | Things found at an Ethiopian wedding |
| `bomb_eth_new_002` | add | Expand thin / replace football-overlap Sports prompts | Ethiopian breakfast foods |
| `bomb_eth_new_003` | add | Expand thin / replace football-overlap Sports prompts | Ethiopian holidays or festivals |
| `bomb_eth_new_004` | add | Expand thin / replace football-overlap Sports prompts | Things you might see at a coffee ceremony |
| `bomb_eth_new_005` | add | Expand thin / replace football-overlap Sports prompts | Famous Ethiopian athletes |
| `bomb_football_new_001` | add | Expand thin / replace football-overlap Sports prompts | Famous football goalkeepers |
| `bomb_football_new_002` | add | Expand thin / replace football-overlap Sports prompts | Ways a football match can end |
| `bomb_football_new_003` | add | Expand thin / replace football-overlap Sports prompts | Things fans do at a match |
| `bomb_football_new_004` | add | Expand thin / replace football-overlap Sports prompts | African national football teams |
| `bomb_food_new_001` | add | Expand thin / replace football-overlap Sports prompts | Ethiopian dishes |
| `bomb_food_new_002` | add | Expand thin / replace football-overlap Sports prompts | Things you put in coffee |
| `bomb_day_new_001` | add | Expand thin / replace football-overlap Sports prompts | Things people forget when traveling |
| `bomb_day_new_002` | add | Expand thin / replace football-overlap Sports prompts | Things found inside a kitchen |
| `bomb_places_new_001` | add | Expand thin / replace football-overlap Sports prompts | Ethiopian cities |
| `bomb_places_new_002` | add | Expand thin / replace football-overlap Sports prompts | Places you go on a weekend |
| `bomb_places_new_003` | add | Expand thin / replace football-overlap Sports prompts | Things you pack in a suitcase |
| `bomb_sport_new_004` | add | Top up Sports after football-dupe removal | Winter sports |
| `bomb_sport_new_005` | add | Top up Sports after football-dupe removal | Sports that use a net |
| `bomb_sport_new_006` | add | Top up Sports after football-dupe removal | Reasons people stretch before exercise |
| `bomb_sport_new_007` | add | Top up Sports after football-dupe removal | Famous Ethiopian runners |

### Liar

| ID | Action | Reason | Detail |
|---|---|---|---|
| `liar_football_007` | rewrite | Parallel club-opinion questions so the liar can blend in |  |
| `liar_addis_life_012` | rewrite | Broaden Addis-local prompt into Ethiopia-wide / social experience | What is the most overrated food trend right now? / What is the most overrated café trend right now? |
| `liar_addis_life_014` | rewrite | Broaden Addis-local prompt into Ethiopia-wide / social experience | Which Ethiopian city would you never want to live in? / Which Ethiopian city would you move to tomorrow? |
| `liar_addis_life_017` | rewrite | Broaden Addis-local prompt into Ethiopia-wide / social experience | Which market do you only visit once? / Which market do you pretend to enjoy? |
| `liar_addis_life_103` | rewrite | Broaden Addis-local prompt into Ethiopia-wide / social experience | Which Ethiopian city is overrated? / Which Ethiopian city is underrated? |
| `liar_addis_life_159` | rewrite | Broaden Addis-local prompt into Ethiopia-wide / social experience | Where is a terrible first date? / Where is a surprisingly good first date? |
| `liar_addis_life_160` | rewrite | Broaden Addis-local prompt into Ethiopia-wide / social experience | Which social setting feels like a job interview? / Which social setting feels like a family meeting? |
| `liar_addis_life_100` | rewrite | Broaden Addis-local prompt into Ethiopia-wide / social experience | Which journey do you dread? / Which journey do you secretly enjoy? |
| `liar_addis_life_099` | rewrite | Broaden Addis-local prompt into Ethiopia-wide / social experience | What is never worth the wait? / What is always worth the wait? |
| `liar_eth_new_001` | add | Strong parallel-answer Ethiopia / social pairs | Which Ethiopian holiday has the best food? |
| `liar_eth_new_002` | add | Strong parallel-answer Ethiopia / social pairs | Which Ethiopian dish do guests always ask for? |
| `liar_eth_new_003` | add | Strong parallel-answer Ethiopia / social pairs | Which football club do Ethiopian fans argue about most? |
| `liar_eth_new_004` | add | Strong parallel-answer Ethiopia / social pairs | What is the hardest part of a coffee ceremony for guests? |
| `liar_eth_new_005` | add | Strong parallel-answer Ethiopia / social pairs | Which relative always starts the family debate? |

### WYR

| ID | Action | Reason | Detail |
|---|---|---|---|
| `wyr_eth_001` | rewrite | Replace forgettable early/late dilemma with host-vs-travel trade-off |  |
| `wyr_eth_new_001` | add | Memorable balanced dilemma | Never miss an Ethiopian wedding invitation / Never miss a Champions League final night |
| `wyr_eth_new_002` | add | Memorable balanced dilemma | Only eat injera for a year / Never eat injera for a year |
| `wyr_new_001` | add | Memorable balanced dilemma | Have free flights forever but only to places your family chooses / Pay for every trip but choose every destination yourself |
| `wyr_new_002` | add | Memorable balanced dilemma | Be famous in your city and uncomfortable in public / Be unknown everywhere and completely free |

### Most Likely

| ID | Action | Reason | Detail |
|---|---|---|---|
| `likely_eth_new_001` | add | Recognizable social beat | Who is most likely to cry during a wedding toast? |
| `likely_eth_new_002` | add | Recognizable social beat | Who is most likely to eat the last piece of injera without asking? |
| `likely_football_new_001` | add | Recognizable social beat | Who is most likely to change the channel mid-conversation for a match? |
| `likely_uni_new_001` | add | Recognizable social beat | Who is most likely to start a group project chat and then disappear? |

### Gimbar

| ID | Action | Reason | Detail |
|---|---|---|---|
| `people_and_relationships` | fix | Resolve duplicate sort_order 60 with football → 65 |  |
| `gimbar_eth_new_001` | add | Grow thin Gimbar pools | Jebena |
| `gimbar_eth_new_002` | add | Grow thin Gimbar pools | Eskista |
| `gimbar_eth_new_003` | add | Grow thin Gimbar pools | Injera |
| `gimbar_eth_new_004` | add | Grow thin Gimbar pools | Teddy Afro |
| `gimbar_eth_new_005` | add | Grow thin Gimbar pools | Meskel |
| `gimbar_new_002` | add | Grow thin Gimbar pools | Football |
| `gimbar_new_003` | add | Grow thin Gimbar pools | WhatsApp |

## Remaining issues

- Native Ethiopian cultural review for Impostor Entertainment creator names
- Amharic translation for rewritten Liar / WYR cards (EN meaning changed; AM fields removed)
- Bomb / Gimbar category pools still under the aspirational 30/category target
- Ewnet factual spot-checks deferred
- Playtest rewritten Ethiopia Liar pairs with non-Addis groups
- Home catalog Quiz ↔ Who's the Liar order swap lives on this branch in `src/domain/games.ts` (from prior request)

## Validation

- `npm run validate:content` — pass
- `node scripts/test-party-rules.mjs` — pass

## Revision pass (2026-11-02 follow-up)

Addressed opposite Liar pairs, `pending_am` tagging, weak Bomb prompts, and semantic overlaps.

| ID | Action | Reason | Detail |
|---|---|---|---|
| `liar_addis_life_014` | rewrite | Replace opposite live/never-live pair with related city qualities | Which Ethiopian city has the best food scene? / Which Ethiopian city has the best nightlife? |
| `liar_addis_life_099` | rewrite | Replace never/always-worth-wait opposites with related inconvenience trade-offs | What is worth waiting in a long line for? / What is worth sitting in traffic for? |
| `liar_addis_life_103` | rewrite | Replace overrated/underrated opposites with related city reputation questions | Which Ethiopian city is most overrated? / Which Ethiopian city gets talked about the most? |
| `liar_addis_life_159` | rewrite | Replace terrible/good opposites with related first-date judgments | Where is a risky first date? / Where is a memorable first date? |
| `liar_addis_life_100` | rewrite | Replace dread/enjoy opposites with related travel feelings (overlapping destinations) | Which journey do you always prepare for carefully? / Which journey do you dread a little? |
| `liar_football_007` | tag | Document intentional EN fallback until native Amharic review | pending_am |
| `liar_addis_life_012` | tag | Document intentional EN fallback until native Amharic review | pending_am |
| `liar_addis_life_017` | tag | Document intentional EN fallback until native Amharic review | pending_am |
| `liar_addis_life_160` | tag | Document intentional EN fallback until native Amharic review | pending_am |
| `wyr_eth_001` | tag | Document intentional EN fallback after rewrite | pending_am |
| `wyr_eth_new_002` | keep | Keep injera year dilemma at friends level — extreme but balanced joke | reviewed |
| `bomb_football_new_002` | rewrite | Replace limited match-ending prompt with many-answer stadiums category | Football stadiums around the world |
| `bomb_nature_new_003` | rewrite | Replace unfinished birds wording; check dupe vs existing | Animals that can fly |
| `bomb_sport_new_006` | rewrite | Replace explanation-heavy stretch prompt with rapid nameable sports | Sports played without a ball |
| `bomb_food_new_001` | deactivate | Semantic dupe of Ethiopian foods / Regional Ethiopian dishes | Ethiopian dishes |
| `bomb_places_new_001` | deactivate | Semantic dupe of Cities in Ethiopia | Ethiopian cities |
| `bomb_football_new_002` | rewrite | Avoid overlap with existing Football stadiums prompt | African football clubs |
| `likely_uni_new_001` | deactivate | Semantic overlap with group-chat disappear / group project prompts | Who is most likely to start a group project chat and then disappear? |
| `bomb_nature_new_003` | rewrite | Avoid semantic dupe of Animals that fly | Animals with feathers |

### Amharic policy

Rewritten Liar/WYR cards keep **English-only** text with tag `pending_am`. Former Amharic strings were removed so they cannot contradict new English. Native translation is required before Amharic/Mixed content language is relied on for these IDs.

### Unrelated catalog swap

`src/domain/games.ts` Quiz ↔ Who's the Liar ordering is **removed from this content branch** so the merge stays content-focused. Re-apply in a separate PR if desired.


## Final live state (authoritative)

Historical rows above may show intermediate wording from earlier passes. **These are the current active values on the branch:**

### Who's the Liar (rewritten)

| ID | Main | Liar | Status |
|---|---|---|---|
| `liar_addis_life_014` | Which Ethiopian city has the best food scene? | Which Ethiopian city has the best nightlife? | Keep |
| `liar_addis_life_099` | What is worth waiting in a long line for? | What is worth sitting in traffic for? | Keep |
| `liar_addis_life_100` | Which journey do you plan the most carefully? | Which journey do you pack the most carefully for? | Improved (closer answer overlap) |
| `liar_addis_life_103` | Which Ethiopian city is most overrated? | Which Ethiopian city gets talked about the most? | Keep |
| `liar_addis_life_159` | Where is a risky first date? | Where is a memorable first date? | Keep — playtest |
| `liar_football_007` | Which football club has the most loyal fans? | Which football club has the loudest fans? | Keep |
| `liar_addis_life_012` | What is the most overrated food trend right now? | What is the most overrated café trend right now? | Keep |
| `liar_addis_life_017` | Which market do you only visit once? | Which market do you pretend to enjoy? | Keep |
| `liar_addis_life_160` | Which social setting feels like a job interview? | Which social setting feels like a family meeting? | Keep |

All of the above carry `pending_am` (English-only until native translation).

### Bomb prompts (new IDs — current)

| ID | Prompt | Active |
|---|---|---|
| `bomb_football_new_002` | African football clubs | yes |
| `bomb_nature_new_003` | Animals with feathers | yes |
| `bomb_sport_new_006` | Sports played without a ball | yes |
| `bomb_food_new_001` | Ethiopian dishes | **no** (semantic dupe) |
| `bomb_places_new_001` | Ethiopian cities | **no** (semantic dupe) |

### Catalog order

`src/domain/games.ts` matches `main` (Quiz ↔ Who's the Liar swap not included).
