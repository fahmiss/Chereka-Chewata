# Chereka Chewata — Tasks & Roadmap

Working tracker for what's shipped and what's next. Check items off as they land,
and add new ones at the top of **Open** as they come up. Keep entries specific
enough to act on (file/area + why), not vague.

_Last updated: 2026-08-04._

---

## Open

### Impostor polish after first playtest (2026-08-04)
Vertical slice is playable. Follow-ups once someone runs a real table:

- [ ] Full two-Impostor second-cycle rules (currently simplified)

### Shared UI kit extraction (2026-08-04)
Primary/secondary buttons and setup chrome exist. Extract player chips, toggle,
and secret-card shell into `src/components/ui` as other games land.

### Settings leftovers (2026-08-04)
- [ ] Sound *effects* (cue audio) — toggle is wired and persisted; no audio yet
- [ ] Privacy / terms placeholders

### Who’s the Liar? polish after first playtest (2026-08-04)
Vertical slice is playable. Follow-ups once someone runs a real table:

- [ ] Optional answer / discussion timers in the session UI (options persist)
- [ ] Optional scoring on result
- [ ] Grow English pairs toward 150+

### Taboo polish after first playtest (2026-08-05)
- [ ] Manual team editor (random balanced split is MVP)
- [ ] Grow deck toward 300+
- [ ] Strict-language mode

### Who’s Most Likely polish after first playtest (2026-08-05)
- [ ] Optional digital voting mode
- [ ] Grow prompts toward 300+
- [ ] Couples / close-friends tags

### Would You Rather polish after first playtest (2026-08-05)
- [ ] Grow the initial 50-dilemma deck toward 150+
- [ ] Optional debate timer and group split counters

### Amharic content + typography QA (deferred)
### EAS Build + store assets (deferred)
### Analytics + remote report upload (deferred)

---

## Shipped

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
- **Privacy** — `expo-screen-capture` on Impostor reveal + private vote: blocks
  screenshots/recording; iOS app-switcher blur; Android blank recents tile.
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

- Five launch games; Impostor is the hero / first vertical slice.
- One shared phone; no account required; offline play required.
- Family / Friends / Spicy; Spicy off by default.
- Lamp Honey primary CTA.
- Familiar English game names for now.
