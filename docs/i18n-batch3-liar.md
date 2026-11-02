# Amharic Batch 3 — Who's the Liar?

**Status:** Proposed (mapped + wired) — awaiting native review  
**Scope:** Game description, how-to, private reveal, shared answer/discussion, voting, results, and deck-exhausted dialog  
**Out of scope:** Question-pair decks, setup mechanics, voting mechanics, and UI restructuring

## Architecture and behavior

- Interface copy lives in `src/i18n/en.ts` and `src/i18n/am.ts` and is read through `useT()` / `translate()`.
- Content language remains independent. `content/whos_the_liar/pairs.en.json` is unchanged.
- The reveal still shows only the question; it never labels the player as the Liar.
- Answering and discussion remain on one shared screen.
- Group accusation remains the default; private pass-the-phone voting and runoff behavior are unchanged.

## Key map

| Surface | Keys |
|---|---|
| Catalog/details | `liar.name`, `liar.tagline`, `liar.players`, `liar.duration` |
| How-to | `liar.howTo.1`–`liar.howTo.3` |
| Private reveal | `liar.privateReveal`, `liar.holdHint`, `liar.questionShown`, `liar.holdQuestion`, `liar.yourQuestion`, `liar.answerLater` |
| Answers/discussion | `liar.answers`, `liar.nameStarts`, `liar.answerInstructions`, `liar.answerRule`, `liar.chooseLiar` |
| Voting | `liar.deadlock`, `liar.yourVote`, `liar.chooseDifferent`, `liar.lockVote` |
| Results | `liar.groupWins`, `liar.liarWins`, `liar.reason.*`, `liar.liarLabel`, `liar.commonQuestion`, `liar.liarQuestion` |
| Empty state | `liar.deckTitle`, `liar.deckBody` |

Exact behavior matches reuse existing keys instead of duplicating copy:

- `session.passPhone`, `session.imReady`, `session.holdToReveal`, `session.hideAndContinue`
- `impostor.startPrivateVoting`, `impostor.groupDecision`, `impostor.whoAccusing`, `impostor.selectSuspect`, `impostor.accusePlayer`
- `impostor.runoffVote`, `impostor.result`, `impostor.votes`
- `common.gotIt`

## Dynamic placeholders

- `liar.privateReveal` preserves `{n}` and `{total}`.
- `liar.nameStarts` and `liar.reason.innocent` preserve `{name}`.
- Result reasons receive the active interface language; player names are interpolated only after the outcome is resolved.

## Native-review flags

The supplied individual-player copy uses masculine singular second-person forms and should be reviewed in context:

- `liar.holdHint`: `ተጭነህ`, `ጥያቄህን`
- `liar.yourQuestion`: `ጥያቄህ`
- `liar.answerLater`: `ተራህ`, `መልስህን`, `ብለህ`
- `liar.yourVote`: `የአንተ`
- `liar.chooseDifferent` / `liar.lockVote`: `ድምፅህን`
- `liar.reason.innocent`: `ነበረው`

Shared instructions use group-oriented plural wording (`…አችሁ`, `…ስጡ`, `…ተወያዩ`, `…ምረጡ`).

## Narrow-screen review

The session keeps existing scroll containers for the private question, answer order, player choices, and results. Long Amharic instructions remain outside fixed-height cards and button text uses the shared wrapping button components.

Native sign-off should still verify at 320 × 568 or the smallest supported device:

- [ ] Three how-to steps do not clip.
- [ ] Private reveal hint and revealed-question guidance wrap without covering the action.
- [ ] Answer instruction and rule remain readable with 15 players.
- [ ] Deadlock and lock-vote actions wrap without clipping.
- [ ] Result reason, both question labels, and deck-exhausted dialog fit.

## Validation

- `npm run typecheck`
- `npm run validate:content`
- `npm run test:party-rules`
- `npx expo export -p web`
- Verify `content/whos_the_liar/pairs.en.json` is unchanged.
