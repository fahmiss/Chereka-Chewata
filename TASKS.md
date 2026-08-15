# Chereka Chewata — Tasks & Roadmap

Working tracker for what's shipped and what's next. Check items off as they land,
and add new ones at the top of **Open** as they come up. Keep entries specific
enough to act on (file/area + why), not vague.

_Last updated: 2026-08-15._

---

## Open

### Shared UI kit extraction (2026-08-04)
Primary/secondary buttons and setup chrome exist. Extract player chips, toggle,
and secret-card shell into `src/components/ui` as other games land.

### Settings leftovers (2026-08-04)
- [ ] Sound *effects* (cue audio) — toggle is wired and persisted; no audio yet
- [x] Privacy / terms placeholders — in-app copy dialogs (2026-08-06)

### Who’s the Liar? polish after first playtest (2026-08-04)
Vertical slice is playable. Follow-ups once someone runs a real table:

- [ ] Optional answer / discussion timers in the session UI (options persist)
- [ ] Optional scoring on result
- [x] Grow English pairs toward 150+ — now 153 (17 per category), 2026-08-05

### Taboo polish after first playtest (2026-08-05)
- [ ] Manual team editor (random balanced split is MVP)
- [x] Grow deck toward 300+ — now 303, Friends 20 → 119, 2026-08-06
- [ ] Strict-language mode

### Who’s Most Likely polish after first playtest (2026-08-05)
- [ ] Optional digital voting mode
- [ ] Grow prompts toward 300+
- [x] Couples / close-friends tags — landed as the general tags system, 2026-08-15

### Would You Rather polish after first playtest (2026-08-05)
- [ ] Optional debate timer
- [ ] ~~Group split counters~~ — dropped with the move to a single tapped
      verdict (2026-08-05). Revisit only if per-player tapping comes back.

### Store listing / EAS profiles (deferred)

Icons + splash are branded. Skip EAS build profiles until a store submit is real.

### Analytics + remote report upload (deferred)

---

## Shipped

### Quiz seventh playable game (2026-08-15)

- Added an equal-weight mode choice before setup: Pass & Play for no-name,
  no-score casual trivia and Compete for 2–12 named players, round-robin turns,
  +1 scoring, ties, and a final leaderboard.
- Added mode-aware quick setup with multi-select categories, Easy / Medium /
  Hard / Mixed knowledge difficulty, and 10 / 20 / 30 total questions.
- Added a state-machine session flow with locked answer selection, randomized
  four-choice positions, explicit answer reveal, optional bilingual explanation,
  setting-aware sound/haptics, Pass & Play handoff pacing, rematches, and
  non-automatic advancement.
- Bundled 60 EN/AM questions: six per category and 20 per difficulty, including
  Ethiopian content both in Ethiopia & Culture and across Football, Sports,
  Entertainment, and Food & Drink.
- Added recent-question preference, safe exhaustion recycling, local card
  reports, Quiz-specific content validation, and optional source metadata.
- Added the owner-provided curious Quiz moon as a clean transparent mascot for
  Home, game detail, mode choice, handoff, and results.

### Filled the categories left empty by the taxonomy migration (2026-08-15)

- Added 164 new items (English + best-effort Amharic) across the 14 categories
  that had 0 cards after the taxonomy migration: Impostor `sports` (20) +
  `ethiopia_and_culture` (20); Liar `football` (15) + `random` (15); Taboo
  `football` (20) + `ethiopia_and_culture` (20); Most Likely
  `entertainment_pop_culture` (15) + `football` (15) + `random` (15) — the
  last of which was missed in the original migration note below and only
  found via a post-fill audit; Would You Rather `entertainment_pop_culture`
  (12) + `football` (12) + `sports` (12) + `random` (12), same audit catch;
  Bomb `football` (6).
- New decks total: Impostor 292, Liar 201, Taboo 370, Most Likely 225, Would
  You Rather 218, Bomb 54 (was 252/171/330/180/170/48).
- **Amharic on the new items is best-effort, not native-reviewed** — worth a
  native-speaker pass before these are treated as ship-quality, same caveat
  as the rest of the deck.
- `npm run validate:content` and `npm run typecheck` both clean after this
  pass (typecheck has unrelated pre-existing failures in `app/game/[gameId]/mode.tsx`
  and `src/domain/quiz/*` from separate in-progress Quiz-game work — not
  touched here).

### Standardized category taxonomy across all six games (2026-08-15)

- Replaced each game's independent, inconsistent category list with a shared
  11-name vocabulary (Everyday Life, Food & Drink, Entertainment & Pop
  Culture, Football, Sports, Places & Travel, School & Work, People &
  Relationships, Ethiopia & Culture, Animals & Nature, Random) — a category id
  like `food_and_drink` now means the same thing, and gets the same icon, in
  every game that has it.
- Re-mapped all ~1,151 existing content items (Impostor 252, Liar 171, Taboo
  330, Most Likely 180, Would You Rather 170, Bomb 48) to the new categories.
  Item `id`s were left untouched (recent-history / exclusion logic is keyed by
  id, never by category).
- Ethiopian content stays distributed across normal topic categories (Tibs in
  Food & Drink, Ethiopian musicians in Entertainment, Addis traffic in
  Ethiopia & Culture) rather than being siloed into one bucket — see
  `CONTENT.md` § Category taxonomy.
- Added an optional `tags?: string[]` field to every content item type for
  sub-topic markers that don't warrant their own category — former top-level
  categories like Friends/Family/Diaspora/Weddings/Absurd/Deep became tags
  under a broader category instead (e.g. Liar's `friends` category → `people_and_relationships`
  + `tags: ["Friends"]`). Would You Rather's `absurd_choices`/`deep_choices`
  (tone, not topic) were individually re-sorted into topical categories with
  an `Absurd`/`Deep` tag.
- Consolidated five separate per-game category-icon maps in
  `app/game/[gameId]/setup/categories.tsx` into one shared `CATEGORY_ICONS`
  map — this also fixes a pre-existing bug where Would You Rather had no icon
  map of its own and silently borrowed Impostor's.
- `scripts/validate-content.mjs` now cross-checks every item's `category_id`
  against that game's `content/categories/*.json` registry and fails the
  build on an orphaned/misspelled id (previously this passed silently and
  just made items unreachable in the UI).
- Fixed `src/content/categories.ts` (`getCategoryName`) to include Bomb's
  categories — it previously covered the other five games only.

### Who’s Got the Bomb? sixth playable game (2026-08-07)

- Added a low-friction named-player hot-potato flow: public category, random
  starter, short hidden randomized fuse, and physical answer-and-pass play.
- The app does not track handoffs, lives, eliminations, or a winner. The group
  sees who starts and knows who held the phone when it exploded.
- Added an offline looping fuse cue and explosion effect; both follow the
  app-level Sound setting and the fuse cue stops while paused.
- Added quick setup, shared player/category/content screens, session routing,
  report/history support, a bomb icon/accent, game details, and home catalog row.
- Added the owner-provided nervous crescent mascot holding a lit cartoon bomb; its
  lower silhouette is rounded so only the true right-side crescent horn reads
  as a point, and no separate mechanic badge is used on the home card.
- Bundled 48 English/Amharic category prompts across eight offline groups.
- Product decision: the locked five-game MVP is now a six-game lineup.

### Most Likely countdown clarity (2026-08-07)

- Promoted the physical-pointing countdown to a dedicated full-focus screen
  with room-scale numerals, per-beat motion, synchronized haptics, and offline
  `3 · 2 · 1` / `POINT!` audio cues that follow the Sound setting.

### Cross-game sound cues (2026-08-07)

- Added Taboo warning/final-count/time-up cues plus Correct and Violation
  feedback; Skip remains quiet.
- Added a neutral private-reveal cue for every Liar player plus verdict and
  distinct outcome cues. Impostor remains intentionally sound-free after
  playtesting; its private reveals, accusation, and results use motion/haptics.
- Centralized foreground audio setup and setting-aware effect playback. Home
  game cards and Settings already use vibration-aware shared press haptics.

### Two-Impostor mode restored with full resolution (2026-08-07)

- Added a 1/2 Impostor setup control; two unlocks at the product-spec minimum
  of 8 players and automatically returns to one if the group drops below 8.
- A caught Impostor still gets a final guess. Correct wins for the Impostor
  team; incorrect eliminates that player and starts a second clue, discussion,
  and vote cycle with the remaining players.
- Crew wins only after both Impostors are caught and both guesses are wrong.
  Eliminated players are excluded from later clues, accusations, and votes.
- Updated result copy for plural Impostors and removed the feature from the
  README's out-of-scope list. This section supersedes the 2026-08-06 cut note.

### Game-detail mascot continuity (2026-08-07)

- Replaced the generic game glyph medallion on every game-detail hero with the
  matching expressive moon used by that game's home card.
- Centralized the game-to-expression mapping in `gameMoonExpression.ts` so the
  catalog and detail screens stay visually consistent as mascot art evolves.
- Kept mascots out of setup and core play surfaces; this is a navigation and
  identity cue, not added gameplay decoration.
- Made the detail back button fall back to Home when there is no navigator
  history, avoiding the development-only unhandled `GO_BACK` warning.

### Home library density pass (2026-08-07)

- Kept the crescent mascot as the single home hero and strengthened the wordmark with an intentional portrait lockup.
- Reworked playable games into compact horizontal rows with expressive mascot
  poses, restrained accent washes, and clear navigation affordances.
- Gave each game a purposeful expression of the same crescent mascot without redundant mechanic badges.
- Added transparent masked, detective, pointing, and thinking expressions; Taboo reuses the established shushing pose.
- Simplified playable rows to mascot, full title, and chevron; descriptions and
  session metadata now live on the detail screen, where they do not compete
  with long titles in the home library.

### Amharic decks for all five games (2026-08-07)

Every playable deck now has Amharic fields + category `name_am`:

- Liar 171 · Taboo 330 · Most Likely 180 · Would You Rather 170 · Impostor 252
- Content language EN / Amharic / Mixed applies across all five games
- Native-speaker QA still welcome on tone and phrasing

### Brand icons + Impostor Amharic content (2026-08-06)

- Regenerated `assets/icon.png`, splash, adaptive Android foreground/background/
  monochrome, and favicon from MoonMark geometry (midnight + honey crescent +
  three orbit dots). No EAS profiles yet.
- All 252 Impostor words have `word_am` / `hint_am`; categories have `name_am`.
- Content language EN / Amharic / Mixed unlocked in language gate + Settings.
- Impostor secrets / results use Ethiopic type when content language is am/mixed.
- Other games remain English decks for now.

### Playtest pass 1 cleared (2026-08-06)

Owner playtested on a real phone — all five games okay; no blocking issues
reported. Further polish is elective until the next table finds friction.

### Impostor one shared clue screen (2026-08-06)

After the last role reveal, one clues screen shows who starts + full order.
No per-player “Next player” loop — table gives clues verbally, then
**Start discussion**. Spec §3 Steps 4–5 updated.

### Spicy decks grown (2026-08-06)

Spicy restored in UI, then English decks padded so the tier is playable:

- Impostor 8 → 30 · Liar 2 → 20 · Taboo 0 → 27 · Most Likely 2 → 29 ·
  Would You Rather 24 → 44
- Tone: dating / exes / confessions / social awkwardness (PG-13), not explicit

### Settings about dialogs (2026-08-06)

- Settings About: Privacy + Terms placeholder dialogs (local-only copy).
- Spicy briefly cut then restored the same day.

### 3D MoonFace mascot unlocked (2026-08-06)

§18.8 now allows the soft 3D nightcap mascot for personality moments; flat
`MoonMark` stays the logo. `MoonFace` loads PNGs from `assets/mascot/`
(ready / secret / caught / delighted / loading / comingSoon) on Home, boot,
pass-the-phone, Impostor accusation/results, Liar/Taboo finals, and locked
game details. Style sheet kept in `design-reference/`.

### Flat MoonFace character system (2026-08-06)

Superseded the same day by the 3D unlock above. Brief flat SVG experiment
(Ready / Secret / Caught / Delighted) lived briefly before the product lock
changed.

### Taboo deck exhaustion: fair resolution + no frozen turn (2026-08-06)

Two bugs on the same path. Owner's call was "let the trailing team finish its
turn, then compare."

**1. Matches could be won on a turn advantage.** `beginPlaying` responded to an
empty deck by jumping to `final` and crowning `leadingWinner()` — bypassing the
equal-turns guarantee that the normal ending path enforces. Team A could win
having played one more turn than Team B.

**2. Mid-turn exhaustion froze the turn.** `markCorrect` / `markSkip` /
`markViolation` / `discardCard` all drew via `withNextCard`, which sets
`currentCard: null` while leaving `phase: 'playing'`. Every action then guards
on `!session.currentCard`, so nothing worked until the timer expired.

Fix — new `deckExhausted` flag on the session plus `withNextCardOrRecycle()`:

- Spec §2.6 permits card repeats *only* when the deck is exhausted. That
  allowance is now spent exactly once, to cover the turn the trailing team is
  owed, so no match ends on a turn advantage.
- Mid-turn draws recycle instead of freezing; if even that yields nothing the
  turn closes to `turn_summary` rather than locking up.
- `applyTurnAndAdvance` settles the match once the deck has been recycled and
  turns are equal — checked *before* the sudden-death branch, so the game can't
  open a sudden death there are no cards for.
- If the trailing team truly can't be given its turn, the result is a **tie**:
  comparing scores over unequal turns is the thing being fixed.

Not runtime-verified (no test runner in the repo) — desk-checked across equal
turns, owed turn, mid-turn exhaustion, and the sudden-death collision.

### Two-Impostor mode cut from MVP (2026-08-06)

The app shipped a mode that README "Out of scope" and spec §3.6 both say should
wait for one-Impostor to be stable — and its resolution was genuinely wrong, not
just simplified.

§3.6 requires a second clue-and-vote cycle when a caught Impostor guesses wrong,
and that regular players win *only* after both Impostors are caught.
`machine.ts` did `winner: correct ? 'impostor' : 'crew'`, so a wrong guess ended
the round with the crew winning while the second Impostor sat undetected. Roles
were assigned correctly for two; the round never accounted for the second one.

- New `TWO_IMPOSTOR_ENABLED = false` in `src/domain/impostor/types.ts`, applied
  in `createImpostorSession`'s count clamp. Sessions are always 1 Impostor.
- The 1/2 `Segmented` control is gone from the Impostor quick setup.
- `assignRoles` keeps its two-Impostor support and `impostorCount` stays
  `1 | 2`, so the mode returns by flipping one flag and restoring one block.
- Dropped the now-unused `note` prop from `QuickControlBlock` rather than
  leaving a speculative API behind.

### Taboo deck 150 → 303, Friends tier 20 → 119 (2026-08-06)

Taboo was the only game where a legitimate setup quietly broke: a Friends-only
group had **20 cards**, and `beginPlaying` responds to an exhausted deck by
jumping to `final` and crowning `leadingWinner()` — so the match ended early
with a possibly-undeserved winner rather than an error.

- +153 cards, 33–34 per category across all 9. Family 184 · Friends 119.
- Weighted to the gap: ~2/3 of the new cards are Friends.
- Taboo's `friends` tier means *harder / more niche to describe* (the existing
  Kitfo, Tej, Dulet), not risqué — new cards follow that reading. No Spicy
  written; that tier is still locked and may be cut.
- Existing IDs untouched; the growth diff is purely additive (2295 insertions,
  0 deletions).

**Fixed 3 pre-existing duplicate targets** (all in the original 150). The same
word existed in two categories, and `excludedCardIds` de-dupes by card id, not
by word — so with all categories selected (the default) the same target could
come up twice in one session with a different forbidden list:

- `taboo_everyday_life_027` Backpack → Suitcase (kept in `school`)
- `taboo_places_043` Stadium → Post office (kept in `sports`)
- `taboo_school_071` Teacher → School bell (kept in `jobs`)

IDs preserved so recent-card history and local reports still resolve. All 303
targets are now unique.

### Would You Rather is tap-to-choose, not physical + countdown (2026-08-05)

**Product-spec override — §7.4 and §7.5 steps 3-4 are superseded for this game.**
The spec locks "simultaneous physical choice" with left/right pointing and an
optional 3-second countdown. Owner's call: the ceremony was too much ritual for
the simplest launch game.

- The room argues out loud, then **someone taps the option they agreed on**.
  One verdict per dilemma — no per-player input, so no pass-the-phone.
- Re-tapping the other side changes the verdict, so misreading the table costs
  one tap instead of being a dead end.
- `countdown` phase and `countdownValue` are gone. `WouldRatherPhase` is now
  `choice | discuss | ended`, with `chosen: 'a' | 'b' | null` on the session.
  `beginCountdown` / `tickCountdown` replaced by `chooseSide(side)`.
- Setup and how-to-play copy no longer mention pointing or counting down.

Still true to §7.5 step 3 — no neutral answer, the group must land on one.
**Who's Most Likely To keeps physical pointing and its 3-2-1**; digital voting
for that game is explicitly out of MVP scope (README), so the two games now use
different input models on purpose.

Note: this removes the natural home for the open "group split counters" idea —
a single verdict has no split to count. If that comes back, it needs per-player
tapping, which is the model this change deliberately rejected.

### Who's the Liar? deck 90 → 153 pairs (2026-08-05)
Was the thinnest real deck and the closest game to the hero. Now 17 per
category across all 9, hitting the 150+ launch target from CONTENT.md.

- Family 81 · Friends 70 · Spicy 2 (unchanged — **no new Spicy**, that tier is
  locked and may be cut; writing for it now would be waste).
- Existing IDs untouched and unrenumbered — they are keys in recent-card
  history and local reports. The diff is purely additive: 567 insertions, 0
  deletions.
- New pairs keep the deck's signature real-vs-performed framing ("What do you
  cook to impress someone? / What do you cook when nobody is watching?") so
  answers overlap and the Liar can blend in, per CONTENT.md's rules.

### Quick setup for all five games + merged discussion screens (2026-08-05)

**Quick setup everywhere.** The Impostor overview pattern now covers every
game. `Play` opens `setup/review` for all five; defaults are already playable,
so the only required action is Start game.

- New `src/components/setup/QuickSetup.tsx` — shared chrome (drill-down link
  rows, inline controls, optional More options). All five games use it; the old
  `ReviewChrome` stat-card + Edit-pill layout is gone.
- Inline per game: Impostor — count, category hint, timer · Liar — random answer
  order · Taboo — turn length, target score · Most Likely / Would You Rather —
  session length.
- `setup/options` is now advanced-only and keeps just Impostor (voting mode,
  random start) and Taboo (skip penalty). Liar, Most Likely and Would You
  Rather have nothing left there, so the route redirects back to the overview.
- Drill-downs (players / categories / content) end in **Done → back to the
  overview** for every game, and no longer show a 01/04 progress rail — there
  is no linear journey left to be step 1 of.
- Every session's **Change setup** now returns to the overview instead of
  dropping into `setup/players`.
- Fixed: starting a game only cleared *some* other games' sessions (nobody
  cleared Would You Rather). `useStartGame()` in `review.tsx` now clears all
  four others, so a stale session can never outlive its game.

**Discussion is a moment, not a screen** (Would You Rather + Who's Most Likely
To). Both games pushed a separate discuss screen that re-rendered the same card
*smaller* and added a "Why?" / "Who got the most points?" prompt — taking the
wording away exactly when the room was arguing about it.

- One card, three states: read → count down → locked. The card never moves,
  shrinks, or gets replaced; the countdown runs as an overlay over it.
- The footer keeps the same three slots in every state (disabled while
  counting), so nothing shifts under the argument.
- Machines are unchanged — `choice/prompt → countdown → discuss` still drives
  the stage rail and skip-vs-next semantics. This is a view-only change.

Spec note (AGENTS.md override log): §14.12 lists Discussion as its own screen
in the recommended Would You Rather sequence, and the shared setup journey
implies category → content → options → review. Both are now single overviews /
single cards. §7.5 step 5 is unaffected — nothing stops the group talking, and
the app no longer instructs them to.

### Impostor quick setup (2026-08-05)
- Replaced the mandatory four-step Impostor setup journey with one ready-to-play overview.
- Players, categories, and content remain editable drill-down screens; common hint and timer controls are available inline.
- Advanced voting and starting-player choices live under More options, and Change setup returns to the overview.

### Playability hardening (2026-08-05)
- Persistent recent-card deprioritization and locally reported-card suppression
- Report controls across all five games; Settings reset clears both stores
- Active-session Android Back confirmation and disabled iOS session swipe-back
- Taboo auto-pauses when the app backgrounds
- Content-level availability counts prevent zero-card setup combinations
- Removed setup toggles whose timer/scoring behavior was not implemented
- Would You Rather deck expanded from 50 to 150 dilemmas

### UI restraint pass (2026-08-05)
- Reduced ambient particles, global bloom, card glows, and decorative hairlines
- Simplified home tiles and wordmark; routine setup/game lists no longer stagger in
- Replaced repeated pill treatment with quieter labels and shortened instructional copy
- Kept motion and emphasis for meaningful reveal, countdown, selection, and dialog states

### Would You Rather vertical slice + content validation (2026-08-05)
- Category/content/options/review setup with no player-name detour
- Physical A/B choice, 3-2-1 reveal, discussion, skip, rematch, and results
- 50 curated English dilemmas across all 10 MVP categories
- `npm run validate:content` checks every bundled deck for structural errors

### Who’s Most Likely To vertical slice (2026-08-05)
Playable: optional names → categories → content → card count → prompt → 3-2-1-Point → discuss → end. 153 English prompts.

### Shared session kit + Amharic UI chrome + Taboo (2026-08-05)
- **Session kit** — `SessionShell` + `PassPhoneHandoff` under `src/components/session/` (configurable stage rails)
- **i18n** — `src/i18n/` EN/AM catalogs; Home, Language gate, Settings, session chrome use `useT()`
- **Taboo** — playable vertical slice: teams, timer, Correct/Skip/Violation, turn summary, sudden death, 150 English cards

### Who’s the Liar? vertical slice (2026-08-04)
Playable end to end alongside Impostor:

- Setup — players / categories / content / options / review (game-aware screens)
- Session machine in `src/domain/liar/machine.ts`
- Private question reveal (no “You are the Liar” label)
- Answer order → answers → discussion → private vote + runoff
- Result shows both questions + Liar identity
- English deck: 90 pairs across 9 categories

### Secret-screen privacy + language gate (2026-08-04)
- **Privacy** — screenshot blocking removed (2026-08-06); re-add only if asked.
- **Language gate** — first launch → `/language` (interface EN/AM, content EN
  with Amharic/Mixed marked soon) → Home. Returning users skip. Editable later
  under Settings → Language.

### Reveal polish + Settings + deck growth (2026-08-04)
- **Pass-the-phone** — turn counter, avatar initial, clearer privacy copy.
- **Reveal** — true hold-to-unlock (~480ms ring fill); secret enters from
  `scale(0.96)` + opacity; success haptic; hide on background.
- **Settings** — Sound, Vibration, Reduce motion (persisted); Reset recent cards.
  Vibration gates all haptics; Reduce motion ORs with the OS switch.
- **Deck** — English Impostor words → ~193 (≥30 per category).

### Stronger UI redesign pass (2026-08-04)
Not polish — composition and feel:

- **Home** — brand (moon + CHEREKA CHEWATA) is the hero; playable games share equal tiles under Play; locked games sit quieter under Coming next.
- **Motion** — enter is 240ms strong ease-out from `scale(0.97)` + rise (was 380ms); stagger 40ms; snappier press springs.
- **Segmented** — sliding thumb instead of each option painting its own border.
- **ProgressRail** — shared animated rail for setup + session stages.
- **Game details** — open steps list, no nested “how to play” card shell.
- **GameTile** — equal play surface for playable titles; compact = coming-soon row only.

### In-app dialogs replace system Alert.alert (2026-08-04)
`Alert.alert` renders as a stock OS sheet — white background, system font — which
broke the lit-room aesthetic at every confirmation moment (end game, Spicy
content warning, start errors, exhausted deck).

- `src/components/ui/Dialog.tsx` — glass `Surface` card over a scrim, centred
  (modals are the one place `transform-origin` stays centre), enters from
  `scale(0.94)` + opacity rather than `scale(0)`, `ease-out` ~220ms.
- End-game confirmation moved from a `confirmEndGame()` helper duplicated
  across all 9 session phases into `SessionShell` itself, next to the button
  that triggers it. Phases now just pass the already-confirmed action.
- Replaced in: end game, Spicy content warning (`setup/content-level.tsx`),
  start-session error (`setup/review.tsx`), exhausted-deck notice (result phase).
- Also swapped four hardcoded `'Outfit_900Black'` / `'SpaceMono_700Bold'`
  strings in `ImpostorSessionView.tsx` for `theme/typography.ts`'s `family`
  tokens — same fonts, one source of truth.

### Visual pass — Step 7 tokens actually implemented (2026-08-04)
The locked palette was in place but the rest of the visual system was not, so
every screen fell back to system type on flat fills.

- **Fonts now load.** `tokens.font` roles (Outfit / Plus Jakarta Sans / Space
  Mono / Noto Sans Ethiopic) are real files loaded in `app/_layout.tsx` behind
  the splash. Scale lives in `src/theme/typography.ts`.
- **Atmosphere.** `src/components/ui/Backdrop.tsx` — lamp bloom, accent bloom,
  dust, vignette. Replaces the flat `#0D0B1C` fill on every screen.
- **Surfaces.** Gradient fills + top hairline + coloured glow instead of
  `borderWidth: 1` on flat cards.
- **Icons.** `src/components/ui/Icon.tsx` (Lucide geometry) replaces the emoji
  and text glyphs (⚙︎ ✓ ↑ ↓ ✕ ••••••).
- **Motion + haptics.** `PressableScale`, staggered list entry, timer ring,
  hold-to-reveal pulse — all gated on `useReducedMotion()`.

Token note (per AGENTS.md): `src/theme/tokens.ts` was **added to, not
changed** — `overlay`, `alpha()`, `glow()`, `elevation`. Palette, type roles,
radius, space, motion and game accents are untouched.

New deps: `expo-linear-gradient`, `react-native-svg`, `expo-splash-screen`,
`@expo-google-fonts/*` (outfit, plus-jakarta-sans, space-mono,
noto-sans-ethiopic). `GameCatalogEntry` gained an `icon` field.

### Impostor voting default = group decides (2026-08-04)
- Setup option `votingMode`: `group` (default) | `private`
- Group path: discussion → tap accused (or deadlock → Impostor wins)
- Private path kept as optional anonymous pass-the-phone voting + runoff

### Impostor vertical slice (2026-08-04)
Playable one-Impostor flow end to end:

- Player setup — add / rename / reorder / defaults / last group (AsyncStorage)
- Categories, content level (Spicy acknowledgement), options, review
- Session machine in `src/domain/impostor/machine.ts`
- Pass-the-phone handoff + press-and-hold reveal (hides on background)
- Clues → discussion → accuse / optional private vote → result loop
- Accusation reveal → final guess (Correct / Incorrect) → result
- Rematch (new word, same setup), change setup, home

Routes: `app/game/[gameId]/setup/*`, `app/session/[sessionId].tsx`.
Secrets stay in memory only — never in route params.

### Project foundation (2026-08-04)
- Expo TypeScript app, README / ARCHITECTURE / TASKS / PRODUCT_SPEC
- Design tokens, Home library, English placeholder Impostor deck

---

## Locked product decisions (do not reopen without TASKS note)

- Seven playable games; Impostor remains the hero / first vertical slice.
- One shared phone; no account required; offline play required.
- Family / Friends / Spicy; Spicy off by default.
- Lamp Honey primary CTA.
- Familiar English game names for now.
