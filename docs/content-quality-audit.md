# Content quality audit — Chereka Chewata

**Branch:** `content/party-quality-audit`  
**Date:** 2026-11-02  
**Scope:** All party-game decks except Quiz (Quiz left untouched unless a loader bug appears).  
**Method:** Repository inspection + semantic duplicate review + mechanics checks against `CONTENT.md` / product rules.

---

## 1. Snapshot (active cards)

| Game | Active | Notes |
|---|---:|---|
| Impostor | 371 | Entertainment heavy (86); Ethiopia thin (25) |
| Who's the Liar | 226 | People & Relationships dominant (61) |
| Taboo | 425 | 14 cross-category target duplicates |
| Most Likely | 262 | Strong overall; some theme clustering |
| Would You Rather | 253 | Quality of dilemma varies |
| Tikus Dinich (Bomb) | 157 | Several categories under 20 prompts |
| Gimbar | 55 | Thin pools; duplicate `sort_order` 60 |
| Ewnet weys Saks | 80 | Fact sources present; needs ongoing accuracy review |
| Man Negn | 80 | Mix of icons / characters / things |
| Mizan | 77 | Spectra only — not a category deck |

Quiz: out of scope for this audit (recently curated).

---

## 2. Priority ranking

1. **Taboo** — cross-category duplicate targets (Football↔Sports, Ethiopia↔Places/Food/Entertainment)
2. **Who's the Liar** — answer-type mismatches + Addis-local concentration
3. **Impostor** — sports words duplicated into Entertainment; Camping/Picnic mis-shelved
4. **Tikus Dinich** — Football prompts duplicated under Sports; thin nature/football pools
5. **Gimbar** — category sort collision (`football` and `people_and_relationships` both `60`)
6. **Would You Rather** — unbalanced / forgettable dilemmas (selective)
7. **Most Likely** — light theme clustering only; avoid rewrite churn
8. **Ewnet / Man Negn / Mizan** — maintain; flag for human/cultural review where needed

---

## 3. Duplicate findings

### Taboo — exact target duplicates (active)

| Target | Keep | Deactivate |
|---|---|---|
| Referee, Penalty, Stadium, Offside, Goalkeeper, Substitute, Captain, Jersey, Coach | Football copies | Sports copies |
| Injera | `taboo_ethiopian_food_002` (Food) | `taboo_ethiopia_003` |
| Lalibela, Axum, Simien Mountains | Ethiopia & Culture | Places & Travel copies |
| Krar | Ethiopia & Culture | Entertainment copy |
| Messi / Lionel Messi | One Football card | The other Football card |

### Impostor — word duplicates

| Word | Keep | Deactivate / move |
|---|---|---|
| Basketball, Tennis, Swimming | Sports | Entertainment copies |
| Camping, Picnic | — | Rehome to Everyday Life |

### Bomb — prompt duplicates

| Prompt | Keep | Deactivate |
|---|---|---|
| Football clubs / Football players | Football category | Sports copies |

### Who's the Liar — mechanics / locality

| ID | Problem |
|---|---|
| `liar_football_007` | Main asks watch-time; liar asks fall-asleep-time — overlapping shape but different social meaning; liar stands out |
| `liar_addis_life_*` (≈19) | Ethiopia & Culture tilted to Addis cafés, routes, neighbourhoods |

---

## 4. Category distribution issues

| Game | Weak / skewed categories |
|---|---|
| Taboo | Football 24 (below 30 target after cleanup need replacements in Sports) |
| Taboo | Ethiopia 25 — OK after keeping cultural landmarks |
| Impostor | Entertainment 86 vs Sports 23 / Ethiopia 25 |
| Bomb | Animals 13, Football 15, Sports 15, Places 17 — under 30 |
| Gimbar | Most categories ≤11; Entertainment/Random/School ≤4 |
| Liar | People 61 vs Football 17 / Random 16 |

**Category architecture recommendation:** Do **not** add/remove top-level category IDs. Keep Football separate from Sports. Use tags (`Addis`, `Ethiopian`) rather than new categories. Entertainment should not hold pure sports or outdoor-activity words.

---

## 5. Mechanics-related problems

- **Taboo:** Some forbidden lists include weak generics (`Game`, `Fun`); 28 cards have forbidden terms that collide with the target inflection (review over time).
- **Liar:** Pair quality depends on answer-type parity more than wording polish.
- **Bomb:** Prompts must support many rapid answers; Sports-hosted Football prompts steal Football's identity.
- **Gimbar:** Duplicate `sort_order` makes category chips unstable.

---

## 6. Missing translations

Large English-only additions across decks (no `*_am`) — already documented in `CONTENT.md`. Rewrites in this cleanup drop contradictory Amharic when English meaning changes and flag native translation.

---

## 7. Recommended category changes

| Change | Status |
|---|---|
| Rename/remove categories | **Not recommended** |
| Split Entertainment | **Not now** — fix mis-shelved words first |
| Keep Football ≠ Sports | **Confirmed** |

---

## 8. Implementation plan (this branch)

1. Deactivate Taboo / Impostor / Bomb duplicates; replace Sports Taboo slots with non-football targets.
2. Rehome Impostor Camping/Picnic → Everyday Life.
3. Rewrite weak Liar pairs (football_007 + most Addis-local) toward Ethiopia-wide experiences.
4. Expand Bomb thin categories with answerable Ethiopia-friendly prompts.
5. Fix Gimbar sort orders; selective WYR improvement.
6. Light Impostor Ethiopia expansion (recognizable only).
7. Validate with `npm run validate:content` + party-rule tests.
8. Record every ID change in `docs/content-cleanup-changelog.md`.

---

## 9. Remaining issues (need humans)

- Native review of Ethiopian creator names in Impostor Entertainment.
- Amharic translation pass for English-only / rewritten cards.
- Playtest Who's the Liar Ethiopia pairs with non-Addis groups.
- Ewnet fact spot-checks against primary sources.
- Gimbar / Bomb volume still below 30/category after this pass — further expansion later.
