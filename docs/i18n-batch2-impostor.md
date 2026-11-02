# Amharic Batch 2 — Impostor gameplay

**Status:** Proposed (mapped + wired) — awaiting native review and in-app testing  
**Scope:** Impostor how-to steps + the gameplay strings supplied in Batch 2  
**Out of scope:** Content-deck cards; remaining Impostor chrome not in this batch; other games

## Source English

Same lines as in `docs/i18n-gameplay-strings-en.md` § Impostor (how-to + listed gameplay UI).

## Key map

| English | Key | Amharic |
|---|---|---|
| Everyone sees the same secret word… | `impostor.howTo.1` | ከኢምፖስተሩ በስተቀር ሁሉም ተጫዋቾች አንድ አይነት ሚስጥራዊ ቃል ያያሉ። |
| Take turns giving one short clue… | `impostor.howTo.2` | በተራ በተራ ስለ ቃሉ አጭር ፍንጭ ስጡ። … |
| Argue, vote, then let a caught Impostor… | `impostor.howTo.3` | ተወያዩ፣ ድምፅ ስጡና ኢምፖስተሩን ለዩ። … |
| Pass the phone | `session.passPhone` | ስልኩን ለቀጣዩ ተጫዋች ስጥ |
| I'm ready | `session.imReady` | ዝግጁ ነኝ |
| Hold to reveal | `session.holdToReveal` | ለማየት ተጭነህ ቆይ |
| Secret word | `session.secretWord` | ሚስጥራዊ ቃል |
| You are the | `impostor.roleLabel` | ሚና፦ *(gender-neutral; not የአንተ ሚና፦)* |
| IMPOSTOR | `impostor.roleName` | ኢምፖስተር |
| Hide and continue | `session.hideAndContinue` | ደብቅና ቀጥል |
| Start discussion | `impostor.startDiscussion` | ውይይቱን ጀምሩ |
| Talk it out | `impostor.talkItOut` | ተወያዩበት |
| Who is the group accusing? | `impostor.whoAccusing` | ቡድኑ ማንን ነው የሚጠረጥረው? |
| Accuse this player | `impostor.accusePlayer` | ይህን ተጫዋች ምረጥ |
| Confirm vote | `impostor.confirmVote` | ድምፅህን አረጋግጥ |
| Final guess | `impostor.finalGuess` | የመጨረሻ ግምት |
| Correct | `impostor.correct` | ትክክል |
| Incorrect | `impostor.incorrect` | ስህተት |
| Crew wins | `impostor.crewWins` | ቃሉን የሚያውቁት አሸነፉ! |
| Impostor wins | `impostor.impostorWins` | ኢምፖስተሩ አሸነፈ! |
| Got it | `common.gotIt` | ገባኝ *(already Batch 1)* |

### Small extensions (same spirit; not in the pasted table)

| English | Key | Amharic | Why |
|---|---|---|---|
| Impostors win | `impostor.impostorsWin` | ኢምፖስተሮቹ አሸነፉ! | App has plural winner title |
| Impostors *(label)* | `impostor.roleNamePlural` | ኢምፖስተሮች | Result subtitle when 2 Impostors |

## Translation decisions applied

1. **ኢምፖስተር** kept as borrowed name (not ውሸታም).
2. **Role label** uses ሚና፦ — avoids incomplete / gendered “You are the” fragment.
3. **Crew wins** → ቃሉን የሚያውቁት አሸነፉ! (not መርከበኞች).
4. **Accuse this player** → ይህን ተጫዋች ምረጥ (softer selection CTA).
5. **Got it** → ገባኝ only where the player acknowledges (deck-exhausted dialog uses `common.gotIt`).
6. Hold-to-reveal **interaction unchanged**; only the label is translated.
7. How-to stays **three separate steps**.

## Wiring

- `src/i18n/en.ts` / `am.ts` — keys above  
- `src/domain/howToPlay.ts` — Impostor steps via `translate()`  
- `app/game/[gameId]/index.tsx` — details how-to respects interface language  
- `app/session/[sessionId].tsx` — in-menu rules use translated Impostor steps  
- `src/components/impostor/ImpostorSessionView.tsx` — Batch 2 UI strings via `useT()`  
- Primary/Secondary buttons + SessionShell apply Ethiopic UI font when interface = Amharic  

## Follow-up

Remaining Impostor chrome is covered in **Batch 2B** — see `docs/i18n-batch2b-impostor.md`.

## Native review checklist

- [ ] Sign off Batch 2 Amharic wording in-app (interface language = Amharic)  
- [ ] Check long buttons on a narrow phone (pass phone, who accusing, crew wins)  
- [ ] Confirm ሚና፦ reads clearly above ኢምፖስተር  
- [ ] Confirm hold-to-reveal still requires press-and-hold  
- [ ] Next: Who’s the Liar Batch 3  
