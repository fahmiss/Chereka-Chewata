# Amharic Batch 1 — UI mapping report

**Status:** Batch 1 decisions applied; native review in progress  
**Scope:** Menus, navigation, setup, common session chrome  
**Out of scope:** Game card / prompt content decks

## Architecture

- Interface language: `src/i18n/en.ts` + `src/i18n/am.ts` via `useT()` / `translate()`
- Content language (cards): separate `contentLanguage` path — **unchanged**
- Only existing `MessageKey`s were updated. No game-content JSON edited.

## Grammar policy applied

| Screen type | Address form | Examples |
|---|---|---|
| Shared / group setup & end dialogs | Plural (ናችሁ / …ቹ / …ሉ) | `setup.reviewTitle`, `session.endTitle` |
| Keep-playing dismiss (short label) | Neutral short imperative | `session.keepPlaying` → መጫወት ቀጥል |
| Single-player actions on shared phone | Singular polite/common UI short form | `players.add`, `common.back` |
| Individual male/female variants | **Not implemented** — needs runtime player gender; report below |

## Applied mappings (Batch 1 → keys)

| Batch English | Key | Amharic used | Notes |
|---|---|---|---|
| Home | `common.home` | መነሻ | Unchanged |
| Back | `common.back` | ተመለስ | Unchanged |
| Continue | `common.continue` | ቀጥል | Unchanged |
| Settings | `common.settings` / `settings.title` | ቅንብሮች | Unchanged |
| Play | `common.play` / `home.play` | ተጫወት | “Play Now / Start Playing” not separate keys |
| All Games | `home.allGames` | ሁሉም ጨዋታዎች | Unchanged |
| Play Again | `home.playAgain` | እንደገና ተጫወት | Unchanged |
| Coming Soon | `common.soon` / `game.comingSoon` | በቅርቡ | Was በቅርብ — documented overwrite |
| How to Play | `game.howToPlay` | አጨዋወት | Was እንዴት መጫወት — documented overwrite |
| About | `settings.about` | ስለ መተግበሪያው | Was ስለ — documented overwrite |
| Language | `settings.language` | ቋንቋ | Unchanged |
| Players | `setup.players` / `players.eyebrow` | ተጫዋቾች | Unchanged |
| Add Player | `players.add` | ተጫዋች ጨምር | Unchanged |
| Remove Player | `players.remove` | `{name}ን አስወግድ` | Keeps interpolation |
| Enter Your Name | `players.addPlaceholder` | ስምህን አስገባ | Was ስም ጨምር |
| Categories | `setup.categories` | ምድቦች | Unchanged |
| Choose / Pick categories | `setup.categoriesTitle` | ምድቦችን ምረጡ | Group imperative |
| Start Game | `setup.startGame` | ጨዋታውን ጀምር | Fixed typo ገዋታ + Batch wording |
| Ready? (review) | `setup.reviewTitle` | ዝግጁ ናችሁ? | **Approved** — group; no gender collection |
| Back to Home | `game.backHome` | ወደ መነሻ ተመለስ | Was ወደ መነሻ |
| End Game (button) | `session.endConfirm` / `common.end` | ጨርስ | **Approved** — short button label |
| End game? (dialog) | `session.endTitle` | ጨዋታውን ትጨርሳላችሁ? | **Approved** — finish wording, group |
| Keep playing | `session.keepPlaying` | መጫወት ቀጥል | **Approved** — not Cancel; use ሰርዝ only for real cancel |
| Sound | `settings.sound` | ድምፅ | Spelling aligned to Batch (was ድምጽ) |
| Vibration | `settings.vibration` | ንዝረት | Unchanged |

Also fixed recurring typo **ገዋታ → ጨዋታ** across session/game strings.

## Documented overwrites of prior Amharic

| Key | Previous | New | Why |
|---|---|---|---|
| `common.soon` | በቅርብ | በቅርቡ | Batch + more idiomatic |
| `game.comingSoon` | በቅርብ | በቅርቡ | Same |
| `home.comingNext` | በቅርብ የሚመጡ | በቅርቡ የሚመጡ | Same |
| `settings.languageComingSoon` | …በቅርብ… | …በቅርቡ… | Same |
| `game.howToPlay` | እንዴት መጫወት | አጨዋወት | Shorter UI label from Batch |
| `settings.about` | ስለ | ስለ መተግበሪያው | Batch fuller label |
| `settings.sound` | ድምጽ | ድምፅ | Batch spelling |
| `setup.startGame` | ገዋታ ጀምር | ጨዋታውን ጀምር | Typo + Batch |
| `session.endConfirm` | ገዋታ አቁም → ጨዋታውን ጨርስ | ጨርስ | **Approved** short button |
| `session.endTitle` | ገዋታውን አቁም? | ጨዋታውን ትጨርሳላችሁ? | **Approved** finish / group |
| `session.keepPlaying` | መጫወት ቀጥሉ | መጫወት ቀጥል | **Approved** Keep playing label |
| `game.backHome` | ወደ መነሻ | ወደ መነሻ ተመለስ | Batch “Back to Home” |
| `setup.reviewTitle` | ለመጫወት ዝግጁ? → …ናችሁ? | ዝግጁ ናችሁ? | **Approved** Ready? group |
| `players.addPlaceholder` | ስም ጨምር | ስምህን አስገባ | Batch “Enter Your Name” |
| `players.clearTitle` | …ላጽዳ? | …እናጽዳ? | Inclusive group |
| `common.end` | አቁም | ጨርስ | **Approved** with End Game button |

## Product decisions (resolved)

1. **End Game?** — **Approved.** Dialog: ጨዋታውን ትጨርሳላችሁ? · Button: ጨርስ. (Not “Exit” wording.)
2. **Ready?** — **Approved.** Shared screens: ዝግጁ ናችሁ?. No player-gender collection.
3. **Cancel / Keep Playing** — **Approved with adjustment.** Keep playing button: መጫወት ቀጥል. Reserve ሰርዝ for real cancel actions only (add a Cancel key when those screens are i18n’d).

## Still open (non-blocking)

1. **Play / Play Now / Start Playing / Start Game**  
   App has `common.play`, `home.play`, `setup.startGame`, `game.playGame`. Batch collapses several English variants. Kept short **ተጫወት** for Play; **ጨዋታውን ጀምር** only for Start Game.

## Unmatched Batch strings (no `MessageKey` yet — not implemented)

These appear in the Batch list but are **not** wired through `src/i18n` (many are hardcoded in session views). Left for a later chrome pass:

- Games / Choose a Game / Play Now / Start Playing (as distinct from Play)
- Game Setup, Number of Players, All Categories, Random (as UI chrome)
- Difficulty / Easy / Medium / Hard (Quiz difficulty UI still English / content labels)
- Family / Friends / Spicy level titles (hardcoded in `content-level.tsx`)
- Your Turn, Next Player, Pass the Phone, Ready?, I’m Ready, Start/Next Round, Skip, Reveal, Show/Hide Answer, Correct!, Wrong Answer, Time’s Up!, Pause, Resume, Round Complete
- Results, Score, Total Score, Winner, Congratulations!, You Won/Lost, It’s a Tie!
- Music (settings has Sound only), On/Off, Save, Cancel, Confirm, Are You Sure?, Try Again, Something Went Wrong, No Results Found, Loading…, Yes/No

**Recommendation:** Add keys + replace hardcodes in a Batch 1b PR; do not dump Amharic into hardcoded English session files without keys.

## Font / layout notes

- Ethiopic UI already switches via `useT().uiFont` / `uiFontBold`.
- Longer strings to watch on narrow buttons: `settings.about` (ስለ መተግበሪያው), `session.endTitle`, `game.backHome`.
- Needs device check with interface language = Amharic.

## Native review checklist

- [x] Decide End vs Exit dialog copy → End / ጨርስ  
- [x] Ready? on shared screens → ዝግጁ ናችሁ? (no gender)  
- [x] Keep Playing vs Cancel → መጫወት ቀጥል; ሰርዝ for cancel only  
- [ ] Sign off remaining Batch 1 mappings  
- [ ] Batch 1b: key the unmatched in-game chrome strings  
- [ ] In-app pass: home → setup → end dialog with Amharic interface  
