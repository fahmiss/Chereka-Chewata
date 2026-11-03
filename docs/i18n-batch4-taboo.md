# Amharic Batch 4 — Taboo

**Status:** Proposed (mapped + wired) — awaiting native review  
**Scope:** Catalog, how-to, round-ready, active timer/card controls, turn summary, results, replay, and empty states  
**Out of scope:** Content-deck cards, team/scoring mechanics, timer behavior, setup-option translation, and UI restructuring

## Architecture and behavior

- Interface copy lives in `src/i18n/en.ts` and `src/i18n/am.ts` and is read through `useT()` / `translate()`.
- Content language remains independent. Taboo targets and forbidden-word lists still come from the existing deck and are unchanged.
- Team assignment, describer rotation, sudden death, equal-turn settlement, skip limits, violations, pause/resume, and rematch behavior are unchanged.
- The shared scoreboard accepts optional localized team labels; other games keep their existing labels.
- Shared result actions now use common localized Play again / Change setup / Another game keys.

## Key map

| Surface | Keys |
|---|---|
| Catalog/details | `taboo.name`, `taboo.tagline`, `taboo.players`, `taboo.duration` |
| How-to | `taboo.howTo.1`–`taboo.howTo.3` |
| Teams/round ready | `taboo.teamA`, `taboo.teamB`, `taboo.suddenDeath`, `taboo.roundReady`, `taboo.teamTurn`, `taboo.watcherInstruction`, `taboo.describer`, `taboo.describerHint`, `taboo.startSeconds` |
| Active turn | `taboo.paused`, `taboo.teamPlaying`, `taboo.correct`, `taboo.skip*`, `taboo.violation`, `taboo.pause`, `taboo.resume`, `taboo.timer*`, `taboo.seconds`, `taboo.hurry`, `taboo.turnMeta`, `taboo.describe`, `taboo.dontSay`, `taboo.deckExhaustedTurn` |
| Summary | `taboo.turnSummary`, `taboo.teamScored`, `taboo.adjustInstruction`, `taboo.skipped`, `taboo.violations`, `taboo.turnPoints`, `taboo.nextTeam` |
| Result/replay | `taboo.final`, `taboo.tie`, `taboo.teamWins`, `taboo.gameOver`, `taboo.reason.*`, `taboo.replayHint`, `taboo.sameTeams`, `taboo.rematchFailed`, `taboo.noCards` |
| Shared result actions | `common.playAgain`, `common.changeSetup`, `common.anotherGame`, `common.gotIt` |

## Dynamic placeholders

- Team flow preserves `{team}`, `{seconds}`, and `{n}`.
- Active-turn metadata preserves `{correct}`, `{skips}`, and `{violations}`.
- Result explanations preserve `{team}`, `{a}`, `{b}`, and `{n}`.
- Score and outcome interpolation occurs after the machine resolves the turn or match.

## Native-review flags

These choices are best-effort and need a native speaker in context:

- Game name: `Taboo` → `ታቡ`.
- Describer: `ገላጭ`.
- Sudden death: `የመለያ ዙር`.
- Violation / forbidden wording: `ጥሰት` / `የተከለከሉ ቃላት`.
- `taboo.describe` uses the singular imperative `ግለጽ`; confirm whether a neutral noun label is preferable.
- Confirm whether team labels should remain Latin `A/B` or use Ethiopic ordering.
- Confirm scoring language remains natural for negative turn totals and a 0-point result.

Shared explanations use plural group language where natural. Player names and deck text are not grammatically inflected.

## Narrow-screen review

Existing gameplay scrolling and wrapping remain in place. The custom Correct / Skip / Violation controls use shrinking centered labels; standard buttons use the shared wrapping components.

Native sign-off should verify at 320 × 568 or the smallest supported device:

- [ ] Catalog title/tagline and three how-to steps do not clip.
- [ ] Round-ready instruction, describer hint, and Start button fit.
- [ ] Timer labels and all four active-turn actions remain readable.
- [ ] Long forbidden words wrap without covering the controls.
- [ ] Summary rows and Next team fit with negative scores.
- [ ] Result reason, replay hint, same-team action, and rematch dialog fit.

## Validation

- `npm run typecheck`
- `npm run validate:content`
- `npm run test:party-rules`
- `npx expo export -p web`
- Verify no files under `content/taboo/` changed.
