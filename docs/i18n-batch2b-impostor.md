# Amharic Batch 2B — Impostor remaining gameplay UI

**Status:** Proposed (mapped + wired) — awaiting native review  
**Scope:** Catalog meta + remaining Impostor session chrome from `docs/i18n-gameplay-strings-en.md`  
**Does not overwrite:** Batch 2 keys (`impostor.howTo.*`, role label/name, talk it out, accuse, confirm, final guess, correct/incorrect, crew/impostor wins, shared `session.*`)

## Logic check (deadlock & round 2)

| UI / outcome | Implementation | Translation notes |
|---|---|---|
| Deadlock button | `resolveGroupDeadlock` → result, `winner: 'impostor'`, `accusedPlayerId: null` (group cannot agree) | AM corrected: ቡድኑ መስማማት አልቻለም — ኢምፖስተሩ አሸነፈ! |
| Result reason (no accused) | Same deadlock path | AM: ቡድኑ … መስማማት አልቻለም — **matches**. |
| Caught + another Impostor | Accusation copy → final guess; wrong guess starts round 2 | AM `caughtRound2` matches. |
| Caught + last Impostor | One aloud guess | AM `caughtGuess` matches (masculine “ተይዘሃል” — see gender flags). |
| Crew win reason | Every Impostor caught; final guess wrong | AM matches. |
| Guess-correct reason | Caught Impostor guessed word | AM matches. |

## Gender / grammar (corrected)

Noun-based / impersonal forms — no player-name gender verbs:

- `{name} starts` → መጀመሪያ ተጫዋች፦ {name}
- `{name} guesses` → ቃሉን የሚገምተው፦ {name}
- Caught one-chance → ኢምፖስተሩ ተይዟል! … ጮክ ብሎ …
- Guess instruction → … ጮክ ብሎ መናገር አለበት። …

## Key map (Batch 2B only)

See `src/i18n/en.ts` / `am.ts` keys prefixed `impostor.` added after Batch 2 (tagline through `deckExhaustedBody`), plus:

- `impostor.resultLabel` / `resultLabelPlural` — “Impostor:” / “Impostors:” with ፦ in Amharic  
- `impostor.reason.*` — result detail lines  

## Wiring

- `ImpostorSessionView` — remaining hardcoded session strings  
- `impostorResultReason(session, language)`  
- Catalog: `GameCard` + game details for Impostor tagline / players / duration  

## Native review checklist

- [x] Deadlock button = group failed to agree  
- [x] Name labels noun-based (no gendered verbs)  
- [ ] Long clue / caught / result strings wrap on a narrow phone  
- [ ] Catalog chips (3–15 / ወደ 10 ደቂቃ) on home half cards  
