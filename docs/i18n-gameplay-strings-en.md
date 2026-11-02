# Gameplay & how-to English strings (source inventory)

**Purpose:** Actual user-visible English for Amharic UI translation.  
**Rule:** Quoted from app source only — not invented menu copy.  
**Excluded:** Content decks (`content/**` words, prompts, questions).  
**Shared chrome** (all games) is listed first; then each game.

Translate in context. Prefer **group address** on shared screens; per-player sheets may need singular later.

---

## Shared in-session chrome

Used across many games (`SessionShell`, `SessionMenu`, pass/hold/result helpers, i18n defaults).

### Game menu / end / restart
- How to play
- Back to game
- Restart entire game?
- All scores and round progress will reset. Players and setup choices stay the same. New cards, roles, or teams may be drawn.
- Restart entire game
- Keep playing
- End game?
- This round will be lost. Secrets are cleared.
- End game
- Game menu
- Rules and feedback controls stay one tap away.
- Sound
- Gameplay cues and effects
- Vibration
- Feedback on taps, reveals, and votes
- Menu
- Open game menu *(a11y)*
- Dismiss game menu *(a11y)*

### Pass the phone
- Hand the phone to
- Face the screen away from the table. Nobody else should see.
- I'm ready
- Player {index} of {total} *(a11y)*

### Hold to reveal
- Hold to reveal
- Secret shown *(a11y)*

### Private screen guard
- Private screen hidden
- Hand the phone back to {name}. Everyone else, look away before continuing.
- I'm {name} — resume

### Results footer
- Play again
- Change setup
- Another game

### Report card
- Report card
- Hide this card?
- It won’t appear again on this device. You can reset hidden cards in Settings.
- Report and hide
- Cancel

### Teams
- Team A
- Team B
- vs

### Game details (every game)
- How to play
- Back to games
- Play {name}
- Game not found
- Back home
- Soon
- Coming soon
- Full rules unlock when this game ships.

---

## 1. Impostor

### How to play
1. Everyone sees the same secret word — except the Impostor.
2. Take turns giving one short clue. Never say, spell, or translate the word.
3. Argue, vote, then let a caught Impostor guess the word.

### Catalog
- Impostor
- Find the player who does not know the secret word.
- 3–15 players
- ~10 min

### Gameplay UI
- Pass the phone
- I'm ready
- Private reveal · {n}/{total}
- Hold to reveal
- Hold until the ring fills — then read your secret.
- Secret word
- You are the
- IMPOSTOR
- Category: {categoryName}
- Blend in. Find the word.
- Hide and continue
- Clues
- Clues · Round 2
- {name} starts
- One short clue each, in order. Leave the phone on the table.
- One Impostor remains. Give one new short clue each.
- Don’t say the secret word, spell it, translate it, or rhyme with it.
- Start discussion
- Discussion
- Talk it out
- Find the remaining Impostor
- The first Impostor is out. Discuss the new clues and find their hidden teammate.
- When you’re ready, each player votes privately on this phone.
- Argue in the room. When the group agrees, tap who you’re accusing.
- WHO’S FAKING?
- WHO’S LEFT?
- Time up
- Remaining
- End discussion early
- Start private voting
- Choose accused
- Group decision
- Who is the group accusing?
- Select the player your group suspects, then confirm.
- Accuse this player
- Deadlock — Impostor wins
- Private vote
- Runoff vote
- {name}’s private vote
- Choose the Impostor, then confirm your vote. / Choose the remaining Impostor, then confirm your vote.
- Confirm vote
- Reveal
- IMPOSTOR
- NOT THE IMPOSTOR
- Caught. A correct guess wins; an incorrect guess starts round two for the remaining Impostor.
- Caught — one chance to guess the secret word out loud.
- The group accused an innocent player. The Impostor wins.
- Final guess
- See result
- {name} guesses
- Say one word aloud. The group confirms whether it matches.
- GUESS THE WORD
- Correct
- Incorrect
- Incorrect — round 2
- Result
- Crew wins
- Impostor wins
- Impostors win
- The crew caught every Impostor, and the final word guess was wrong.
- The group could not agree on an Impostor, so the Impostor side wins.
- The caught Impostor correctly guessed the secret word.
- {name} was innocent. The Impostor escaped the accusation.
- Impostor: / Impostors:
- Votes
- Deck exhausted
- Every card in this deck has been used. Change categories or content level to keep playing.
- Got it

---

## 2. Who's the Liar?

### How to play
1. Everyone gets a question privately — one player got a different one.
2. Answer aloud in order. Do not read your question out loud.
3. Argue it out, then tap who the group thinks is the Liar.

### Catalog
- Who's the Liar?
- One player answers a different question. Spot them.
- 3–15 players
- ~10 min

### Gameplay UI
- Pass the phone
- I'm ready
- Private reveal · {n}/{total}
- Hold to reveal
- Hold until the ring fills — then read your question.
- Your question
- Answer aloud later. Do not read the question out loud.
- Hide and continue
- Answers
- {name} starts
- Give one concise answer each, then discuss who got a different question.
- Do not paraphrase the question. Never ask what the exact question was.
- Start private voting
- Choose the Liar
- Group decision
- Who is the group accusing?
- Select the player your group suspects, then confirm.
- Accuse this player
- Deadlock — Liar wins
- Your vote
- Runoff vote
- Choose who got a different question, then lock your vote.
- Lock vote
- Result
- Group wins
- Liar wins
- The group correctly identified the player with the different question.
- The group could not agree on the Liar, so the Liar wins.
- {name} had the common question. The Liar escaped the accusation.
- Liar:
- Common question
- Liar’s question
- Votes
- Deck exhausted
- Every card in this deck has been used. Change categories or content level to keep playing.
- Got it

---

## 3. Taboo

### How to play
1. Split into two teams. One describer sees the word and the forbidden list.
2. Get teammates to guess before time runs out — without saying banned words.
3. Correct +1, violation −1. First team to the target score wins.

### Catalog
- Taboo
- Help your team guess the word without saying the forbidden clues.
- 4–20 players
- ~15 min

### Gameplay UI
- Team A / Team B
- Sudden death
- Round ready
- {Team}'s turn
- The other team watches for forbidden words. Only the describer sees the card.
- Describer
- Only this player should see the card. Sit a watcher beside them if you want.
- Start {seconds}s
- Paused
- {Team} playing
- Seconds
- Hurry
- +{correct} · skip {skips} · foul {violations}
- Describe
- Don’t say
- Deck exhausted this turn.
- Correct
- Skip ({n})
- Violation
- Pause
- Resume
- Turn summary
- {Team} scored {n}
- Fix a mis-tap with −1 or +1 before continuing.
- Skipped
- Violations
- Turn points
- −1
- +1
- Next team
- Final
- It’s a tie
- {Team} wins
- Game over
- Both teams finished on {n} points.
- {Team} finished ahead, {a}–{b}, after equal turns.
- The match has ended.
- Play again shuffles teams and deals fresh cards.
- Play with the same teams
- Could not rematch
- No cards match these categories and levels.
- Got it

---

## 4. Who's Most Likely To

### How to play
1. Read a “Who is most likely to…” prompt aloud.
2. Countdown together — then everyone points at once.
3. Laugh, argue, next prompt. No scores required.

### Catalog
- Who's Most Likely To
- Read a prompt and point to the person who fits it best.
- 3+ players
- ~10 min

### Gameplay UI
- Prompt {n} · {remaining} left
- Fingers up
- Read aloud, then count down and point together.
- Argue it out. No official winner needed.
- Who’s most likely to…
- Start countdown
- Next prompt
- Finish session
- Skip prompt
- Point together
- Point now
- POINT!
- EVERYONE POINTS NOW
- GET READY
- Hold your choice.
- Choose one person. Reveal together.
- Session
- That’s a wrap
- {n} prompt(s) completed together. Everyone’s picks are part of the fun.
- No prompts completed this session. Try a fresh set together.

---

## 5. Tikus Dinich

### How to play
1. Read the category and heat the potato. Its ending time stays completely hidden.
2. Say a new valid answer (no repeats), then pass the phone.
3. Whoever holds the phone when the potato becomes too hot loses the round.

### Catalog
- Tikus Dinich
- Name an answer, pass the hot potato, and hope it stays warm a little longer.
- 2–15 players
- ~10 min

### Gameplay UI
- Round {n}
- {starter} starts
- Give an answer, then pass the phone. The ending time stays hidden.
- Category
- Heat the potato
- Skip category
- Live round
- Your category
- POTATO HOT
- ONE ANSWER
- PASS IT
- STARTED WITH {STARTER} · NO REPEATS
- Round over
- Who was holding the phone?
- That player loses this round.
- TOO HOT!
- New category · random starter.

---

## 6. Would You Rather

### How to play
1. Read both choices out loud. No neutral answers allowed.
2. Argue it out — everyone has to defend a side.
3. Tap the one the room agreed on, then move to the next dilemma.

### Catalog
- Would You Rather
- Pick between two difficult choices and defend your answer.
- 2+ players
- ~10 min

### Gameplay UI
- Dilemma {n}/{total}
- Debate it, then tap the choice your group agrees on.
- Tap the other choice if the room changes its mind.
- OPTION A
- OR
- OPTION B
- Tap a choice above
- Next dilemma
- Finish session
- Skip dilemma
- Session complete
- That’s a wrap
- {n} dilemma(s) settled by the group. Every choice gave you something to debate.
- No dilemmas settled this session. Try a fresh set together.

---

## 7. Quiz

### How to play
1. Each question has four choices. Pick one, then reveal the answer and a short explanation.
2. Pass & Play is casual — no scores, just pass the phone.
3. Compete gives everyone the same number of questions, with matched difficulty each round. The starter rotates on rematch.

### Catalog
- Quiz
- Answer four-choice trivia casually or compete for the top score.
- 2+ players
- ~10–20 min

### Gameplay UI
- Compete
- Pass & Play
- Ready for Quiz?
- Begin Quiz
- {n} players · {rounds} questions each · +1 for each correct answer. Everyone gets the same difficulty each round.
- {n} questions · answer, reveal, then pass the phone
- Question {n} of {total}
- Tap one answer to reveal the result.
- {name}’s turn
- {score} pts
- Nice! +1
- Nice!
- Not this time
- See results
- Next question
- Session complete
- It’s a tie!
- {name} wins!
- That’s the round!
- questions
- group accuracy

---

## 8. Gimbar

### How to play
1. The guesser holds the phone sideways on their forehead, screen facing the room.
2. Everyone else acts, hums, and describes — never say the word.
3. Tap the right half when you get it, left to pass. Most cards wins.

### Catalog
- Gimbar
- Hold the phone to your forehead while friends act, hum and describe.
- 2–20 players
- ~10 min

### Gameplay UI
- {name} guesses
- Screen facing the room. Everyone else acts, hums and describes.
- PHONE TO FOREHEAD
- Controls
- Tilt screen down: got it
- Tap the right half: got it
- Tilt screen up: pass
- Tap the left half: pass
- Motion sensor unavailable, so this turn uses taps.
- Turn the phone so the words read upright for the room.
- Start {seconds}s
- On your forehead, {name}
- Screen facing the room
- Pass
- Got it
- Got it!
- Pause turn
- Tilt down: got it · Tilt up: pass
- Paused
- {name}'s turn is paused
- {s}s left · {n} guessed so far
- The card stays hidden until you resume.
- Resume
- End this turn
- Time
- {name} got {n}
- Tap a card to fix a mistake.
- No cards this turn.
- See results
- Next player
- Final
- No points this time
- {name} wins
- It’s a tie
- Could not rematch
- No cards match these categories and levels.
- Got it

---

## 9. Mesob

### How to play
1. Everyone secretly drops a few names or things into the mesob. Then split into two teams.
2. Round 1: describe freely. Round 2: one word only. Round 3: act it out in silence.
3. The same slips return every round, so jokes build. Most slips guessed wins.

### Round rule titles
- Describe — Say anything except the words on the slip.
- One word — Give exactly one word per slip. No gestures.
- Act it out — No words, no sounds. Gestures only.

### Catalog
- Mesob
- Fill the basket with names, then guess them three ways: talk, one word, act.
- 4–20 players
- ~20 min

### Gameplay UI
- Fill the mesob
- You'll write a few slips in private. Keep them secret until the game.
- I'm ready
- Slips · {n}/{total}
- {name}, add {count}
- Names, places or things the whole room could guess. Famous people, family jokes, foods.
- e.g. Abebe Bikila
- Another slip
- You already wrote this one.
- Already in the mesob. Try another.
- Drop them in
- Let the deck pick for me
- Round {n} of 3
- Start round
- {n} slips in the mesob
- Same slips all game. Remember them: they come back in rounds 2 and 3.
- Every slip goes back in. Same slips, harder rule.
- {name} keeps going with {seconds}s.
- Round {n} · {rule}
- {Team}: {name}
- Only {name} looks at the phone. {rule}
- Start {seconds}s
- {n} slips left this round
- The slip stays hidden until you resume.
- Got it
- Skip
- Pause / Resume
- Paused. The slip is hidden.
- Time
- {Team} got {n}
- Tap a slip to put it back if it was not really guessed.
- Nothing guessed this turn.
- Undo
- Next team
- Mesob empty
- It’s a tie
- {Team} wins
- Game over
- What was in the mesob
- New slips and shuffled teams.

---

## 10. Mizan

### How to play
1. A scale sits between two opposites — like Mild ← → Spicy. Only the psychic sees a hidden target on it.
2. They give one clue that belongs on that scale (near Spicy → “Grandma’s mitmita”), then stay quiet.
3. Everyone else slides the needle to where the clue sits. Closer to the target scores more (4, 3, or 2).

### Catalog
- Mizan
- Read each other’s minds on a scale between two opposites.
- 2–20 players
- ~15 min

### Gameplay UI
- Psychic
- {Team} · Psychic
- I'm the psychic
- Only {psychic} sees the target. {Team} guesses with {teammates}.
- Only the psychic sees the target. Everyone else, look away from the screen.
- Private peek
- Hold until the ring fills, then memorise where the target sits.
- Give one clue that sits where the bright wedge is. Then hide the screen.
- Hide and give my clue
- New card
- Hold to reveal
- {Team} guessing
- Everyone guessing
- {psychic}, give your clue
- −1 / +1
- Lock it in
- Round {n}/{rounds} · {score} points
- {Opponents}'s call
- Left or right?
- {Opponents}: is the hidden target left or right of the needle? A correct call earns 1 point.
- ← Left
- Right →
- Reveal
- Bullseye! 4 points
- {n} points
- Missed
- Next turn
- Final
- Game over
- {score} / {max}
- In sync at last.
- One mind. Remarkable.
- Mostly in sync.
- Plenty to argue about.
- No spectrum cards match these levels.

---

## 11. Wink Killer

### How to play
1. The phone secretly deals roles. One player is the Killer.
2. The Killer winks at victims; when winked, count to five, then fall dramatically.
3. Accuse if you saw it. Catch the Killer before the room empties — a wrong accuse can knock you out.

### Catalog
- Wink Killer
- A secret killer strikes with a wink. Catch them before the room empties.
- 4–30 players
- ~10 min

### Gameplay UI
- Secret role
- Private reveal · {n}/{total}
- Hold until the ring fills, then read your role.
- Hide and continue
- You are the Killer / You are a Killer
- You are the Detective
- You are a Citizen
- In the open
- is the Detective
- Only the Detective may accuse, with 3 guesses. The Detective cannot be winked.
- Start playing
- Wink Killer
- KEEP YOUR EYES OPEN
- Phone face down. Pick it up to mark someone out or accuse.
- Still in
- Out
- winked
- wrong accusation
- Back in
- Marked someone by mistake? Tap Back in.
- Someone was winked out
- Detective accuses
- Make an accusation
- Winked out
- Who fell?
- Pick the player who was winked out.
- Mark out
- Cancel
- Accusation
- Who is accusing?
- If they are wrong, they are out.
- Next
- Who is accused?
- Pick the player they think is the killer.
- Accuse
- {name} is a Killer!
- {name} is innocent
- See result
- Keep playing
- Result
- Citizens win
- Killer wins
- Killers win
- Killer(s):
- Out, in order
- caught

---

## 12. Insider

### How to play
1. The Master knows the secret word and may only answer Yes, No, or I don’t know.
2. Phase 1: ask yes/no questions and find the word before time runs out.
3. Phase 2: one of you already knew it — vote to catch the Insider.

### Catalog
- Insider
- Guess the secret word with yes/no questions, then expose who already knew it.
- 4–12 players
- ~10 min

### Gameplay UI
- The Master
- is the Master
- Everyone, the Master included, now sees a private role card.
- Deal secret roles
- You are the Master
- You are the Insider
- You are a Common
- Hide and continue
- Insider
- FIND THE WORD
- Ask {master} yes/no questions. {master} taps when someone says the word.
- Category: {name}
- If time runs out before anyone says the word, everyone loses.
- Someone said the word
- We give up
- Give up?
- Nobody wins this round. The word and the Insider are revealed.
- Give up
- Keep asking
- Word found
- Now, who already knew?
- The word was
- Found with {clock} left
- Start private voting
- Choose the Insider
- Who is the Insider?
- Accuse this player
- Deadlock: Insider wins
- Your vote
- Runoff vote
- Choose who secretly knew the word, then lock your vote.
- Lock vote
- Word not found
- Insider caught!
- Insider wins
- Word
- Votes
- New word · next Master.
- Could not rematch
- No words match these categories and levels.
- Got it

---

## 13. Ewnet weys Saks

### How to play
1. Everyone privately writes a believable bluff, or submits the real answer if they know it.
2. The real answer is mixed with the bluffs. Pass the phone and vote privately.
3. Earn 2 points for submitting or choosing the truth, once per round, and 1 point each time someone picks your bluff.

### Catalog
- Ewnet weys Saks
- Invent believable answers, find the truth, and score when your friends fall for your bluff.
- 3–8 players
- ~15 min

### Gameplay UI
- Round {n} of {total}
- Question
- Do not say possible answers aloud.
- Write a believable bluff, or submit the truth if you know it. Keep possible answers private.
- Write answers
- Private bluff
- Keep your submitted answer private.
- Your private answer
- Submit a bluff or the truth. A true submission earns 2 points at the reveal, once only.
- Type a bluff or the truth…
- We check your answer only at the reveal.
- Lock my answer
- Write a believable answer first.
- That answer is already in the mix. Try another.
- Private vote
- Others should not see your choice.
- Find the truth
- Find the true answer. You cannot choose your own bluff.
- Round {n} reveal
- The truth is out
- TRUE
- {n} fooled
- Already knew it:
- Standings
- See final scores
- Next round
- Final scores
- It’s a tie!
- {name} wins!

---

## 14. Man Negn?

### How to play
1. Pass the phone. Each player privately memorizes everyone else's identity — never their own.
2. On your turn, ask one yes/no question. Yes lets you ask again; No passes the turn. Use Review the others if you forget.
3. Say one guess aloud. The group taps Correct or Wrong while your identity stays hidden. Reveal only after a correct guess or your final miss.

### Catalog
- Man Negn?
- See everyone else's identity, then discover your own with yes/no questions.
- 2–5 players
- ~15 min

### Gameplay UI
- See the others
- Private look · {n}/{total}
- Memorize everyone else. Your own identity stays hidden.
- Hold until the ring fills. Keep the screen private.
- Hide and pass
- Everyone except you
- SOLVED
- OUT
- Man Negn?
- {name}’s turn
- {n} guess(es) left
- Your identity is hidden
- WHO AM I?
- Ask a yes/no question.
- Start broad: person, place, object, or something else?
- Yes — keep asking
- {n} Yes answer(s) this turn
- Yes
- No
- Yes: keep asking · No: next player
- Buzz to guess
- Review the others
- Private review
- Everyone else, look away. Your own identity will stay hidden.
- Review privately
- Refresh your memory. Your own identity is still hidden.
- Hide and return
- Say one guess aloud
- {name}, who are you?
- Your identity stays secret until you solve it or use both guesses.
- Correct
- Wrong
- Keep asking
- Guess result
- You got it!
- Out of guesses
- One more chance
- 1 guess left
- Continue
- Finished
- {name} finished first
- Nobody solved it

---

## Suggested translation order

1. Shared chrome  
2. Impostor  
3. Who's the Liar  
4. Taboo  
5. Remaining games in the order above  

Send Amharic back keyed to these exact English lines (or grouped by section) so we can wire `MessageKey`s without guessing.
