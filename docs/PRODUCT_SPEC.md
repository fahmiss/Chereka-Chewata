# Chereka Chewata — MVP Games & Rules Specification

**Status:** Working product specification  
**Version:** 0.4  
**Date:** 2026-08-04  
**Purpose:** Serve as the living product, game-rules, UX-flow, and design-system specification for the Chereka Chewata MVP.

> The game names in this document are temporary familiar names. Ethiopian/localized names can be created later without changing the underlying mechanics.

---

## 1. MVP Game Lineup

Chereka Chewata includes these seven playable games:

1. **Impostor**
2. **Who’s the Liar?**
3. **Taboo**
4. **Who’s Most Likely To**
5. **Would You Rather**
6. **Who’s Got the Bomb?**
7. **Quiz**

### Why these seven

Together, they cover the main types of social party-game play:

| Game | Main experience | Competitive? | Secret information? | Best group type |
|---|---|---:|---:|---|
| Impostor | Bluffing and deduction | Yes | Yes | Friends, family, mixed groups |
| Who’s the Liar? | Answering and deduction | Yes | Yes | Friends, couples, mixed groups |
| Taboo | Fast word explanation | Yes | Yes | Teams, family, friends |
| Who’s Most Likely To | Group voting and conversation | No by default | No | Friends, coworkers, family |
| Would You Rather | Forced choices and debate | No by default | No | Any group |
| Who’s Got the Bomb? | Fast category answers and hot-potato tension | Yes | Hidden fuse | Friends, family, mixed groups |
| Quiz | Four-choice trivia: casual passing or scored round-robin play | Optional | No | Friends, family, mixed groups |

This is enough variety for an MVP without creating too many systems at once.

---

# 2. Shared Product Rules

These rules apply across the MVP unless a game overrides them.

## 2.1 Device model

- One shared phone or tablet.
- No account required to begin playing.
- All seven games must work offline after installation and content download.
- The app must never require every player to install the app.

## 2.2 Language model

The interface language and content language should be independent settings.

### Interface language

- English
- Amharic

### Content language

- English
- Amharic
- Mixed English and Amharic

A user may therefore use an English interface while playing Amharic content.

## 2.3 Player setup

Games that need identities should support:

- Manual player names
- Quick default names: Player 1, Player 2, etc.
- Reordering players
- Removing a player before the game begins
- Saving the current group locally for quick rematches

Player names are required for:

- Impostor
- Who’s the Liar?
- Who’s Got the Bomb?
- Quiz Compete
- Optional scored versions of Taboo
- Optional host-led versions of Who’s Most Likely To

Player names are not required for:

- Standard Would You Rather
- Standard Who’s Most Likely To
- Quiz Pass & Play

## 2.4 Content filters

Social-game cards support the following content levels:

- **Family:** suitable for mixed-age groups
- **Friends:** playful, mildly personal, or embarrassing
- **Spicy:** dating, exes, confessions, and mature social questions

Spicy content must be disabled by default and require an explicit selection.
Quiz is the explicit exception: it uses knowledge difficulty (Easy / Medium /
Hard / Mixed) and does not expose maturity levels in setup.

## 2.5 Common controls

Every gameplay screen should provide:

- Pause when a timer is active
- Skip card
- Report card
- End game
- Sound toggle
- Vibration toggle

To prevent accidental exits, **End game** should require confirmation.

## 2.6 Card repetition

- Do not repeat a card during the same session unless the available deck is exhausted.
- Recently played cards should be deprioritized in future sessions.
- A card skipped by the group should not reappear during that session.
- A reported card should be hidden locally until reviewed or the app data is reset.

## 2.7 Session completion

At the end of any game, show:

- Play again
- Change categories
- Change players, when relevant
- Choose another game
- Session summary, when scoring exists

---

# 3. Game One: Impostor

## 3.1 Product role

Impostor should be the hero game and the first game presented to many new users. It is easy to explain, works well on one phone, and creates strong replay behavior.

## 3.2 Familiar game concept

Most players receive the same secret word. One hidden player is the Impostor and does not know the word. Players take turns giving clues, then vote for who they believe is the Impostor. If caught, the Impostor gets one final attempt to guess the secret word.

## 3.3 Player count

- Minimum: 3
- Recommended: 4–10
- Maximum for MVP: 15

### Number of impostors

- 3–7 players: 1 Impostor
- 8–12 players: default 1; allow optional 2
- 13–15 players: default 2; allow 1 or 2

Two-Impostor mode should be optional and may be marked as advanced.

## 3.4 Setup options

Required:

- Player names
- Content category or categories
- Content level
- Number of Impostors

Optional:

- Clue timer
- Discussion timer
- Impostor hint
- Random starting player
- Scoring

### Recommended defaults

- One Impostor
- No clue timer
- Two-minute discussion timer, disabled by default
- Impostor sees the category but no direct hint
- Random starting player enabled
- Scoring disabled for casual play

## 3.5 Round flow

### Step 1: Select secret content

The app randomly chooses one active word from the selected categories and language.

### Step 2: Assign roles

- All regular players receive the same secret word.
- The Impostor receives an Impostor role screen.
- By default, the Impostor may see the category, but not the secret word.

### Step 3: Private role reveal

For each player:

1. Show a pass-the-phone screen with the player’s name.
2. Require a deliberate press-and-hold or tap to reveal.
3. Show the secret role or word.
4. Hide it before passing to the next player.

The app should prevent accidental double taps from exposing the next player’s card.

### Step 4: Choose the first player

The app randomly selects a starting player after all roles are viewed.

The Impostor may be selected first. Do not protect the Impostor from this; the risk is part of the familiar game.

After the last secret is hidden, show **one shared clue screen**: who starts, the speaking order, and the clue rules. Do not step the phone through each player with “Next player.”

### Step 5: Give clues

Beginning with the selected player, every player gives one short verbal clue related to the word, using the order on screen.

Default rule:

- A clue should be one word or a very short phrase.
- Players must not say the secret word.
- Players should not spell, translate, rhyme with, or state the first letter of the word.

The phone stays on the table for the whole clue round. It does not need to record clues. When the group is done, they advance to discussion.

### Step 6: Discussion

After everyone gives one clue, players may discuss and accuse each other.

Recommended behavior:

- Allow the group to start voting immediately.
- If the optional discussion timer is enabled, show a countdown.
- The group can end the timer early.

### Step 7: Accuse / vote

**Default: group decides**

The group argues and decides in the room. Someone taps the accused player on the shared phone. There is no point collecting public ballots in the app — the phone only records the outcome.

- Optional control: **Deadlock — Impostor wins** when the table cannot agree (same spirit as a second-tie).

**Optional: private pass-the-phone voting**

If enabled in setup, each player privately votes on the shared phone.

For each voter:

1. Display the voter’s name.
2. Let them select one other player.
3. Hide the selection before passing the phone.

Rules for private mode:

- A player cannot vote for themselves.
- In two-Impostor mode, regular players still vote for one suspect during each vote.
- Impostors may vote and may vote for each other.

### Step 8: Resolve the vote

#### Group mode

The tapped player is accused. No in-app tally or runoff.

#### Private mode — clear majority/plurality

The player with the most votes is accused.

#### Private mode — tie

Use a runoff vote among tied players.

- Only tied players appear as options.
- Tied players may not vote in the runoff if this would still leave at least two eligible voters.
- If excluding them would leave too few voters, everyone votes except players cannot vote for themselves.

#### Private mode — second tie / group deadlock

- The Impostor survives and wins the round in one-Impostor mode.
- In two-Impostor mode, no one is eliminated and the round continues to the final result as an Impostor-team win.

This avoids endless revoting.

### Step 9: Reveal

If the accused player is not an Impostor:

- Reveal that the group accused an innocent player.
- The Impostor wins immediately.

If the accused player is an Impostor:

- Reveal the Impostor.
- Give the Impostor one final guess of the secret word.

The final guess is entered by selecting from no list; it is spoken aloud and then confirmed by the group using:

- Correct
- Incorrect

This keeps the game social and avoids showing possible answers.

### Step 10: Determine winner

#### Regular players win when

- They identify the Impostor, and
- The Impostor fails to guess the secret word.

#### Impostor wins when

- An innocent player receives the most votes, or
- The vote remains tied after the runoff, or
- The Impostor is caught but correctly guesses the secret word.

## 3.6 Two-Impostor mode

For MVP, use a simple shared-team rule:

- Two players independently see that they are Impostors.
- They are not told the other Impostor’s identity.
- If the group accuses a regular player, both Impostors win.
- If the group catches one Impostor, that player attempts the final word guess.
- If the guess is wrong, the group must complete a second clue-and-vote cycle to catch the remaining Impostor.
- The regular players win only after both Impostors are caught and neither successfully steals the round by guessing the word.

Because this mode adds complexity, it may be deferred until after the one-Impostor MVP is stable.

## 3.7 Optional scoring

Scoring should be off by default.

Suggested scoring:

- Each regular player: +1 if the regular team wins
- Impostor: +2 for surviving the vote
- Impostor: +1 for correctly guessing the secret word after being caught
- No points for regular players when an innocent player is accused

Use cumulative scoring across a selected number of rounds.

## 3.8 Content requirements

Each Impostor item needs:

```yaml
id: imp_food_001
word_en: "Kitfo"
word_am: "ክትፎ"
category_id: ethiopian_food
language_support:
  - en
  - am
  - mixed
hint_en: "Traditional food"
hint_am: "ባህላዊ ምግብ"
difficulty: easy
content_level: family
active: true
```

Recommended launch volume:

- Minimum usable: 150 words
- Better launch target: 300+ words
- At least 30 words in every visible category

## 3.9 MVP categories

- Ethiopian Food
- Addis Ababa
- Ethiopian Cities and Places
- Music and Celebrities
- School and University
- Football
- Everyday Objects
- Animals
- Jobs
- General Entertainment

## 3.10 Edge cases

- If a player accidentally sees another role, provide **Restart round with a new word**.
- If the chosen category has fewer than 15 available unseen words, warn before starting long sessions.
- Never place a word and its obvious translation in the same related-word variant.
- Do not use obscure words in Easy mode.

---

# 4. Game Two: Who’s the Liar?

## 4.1 Product role

This game combines personal answers with social deduction. It should feel conversational rather than like a word-clue variation of Impostor.

## 4.2 Familiar game concept

Most players receive the same question. One player, the Liar, receives a different but related question. Everyone answers aloud. The group then votes for the person they believe answered a different question.

## 4.3 Player count

- Minimum: 3
- Recommended: 4–10
- Maximum for MVP: 15
- One Liar per round

## 4.4 Setup options

Required:

- Player names
- Content categories
- Content level

Optional:

- Answer order
- Answer timer
- Discussion timer
- Scoring

Recommended defaults:

- Random answer order
- 20-second answer timer disabled by default
- Discussion timer disabled by default
- Scoring disabled

## 4.5 Question-pair design

Every card contains two related questions whose answers could plausibly overlap.

Good pair:

- Main: “Which Ethiopian food could you eat every day?”
- Liar: “Which Ethiopian food would you never order?”

Weak pair:

- Main: “What is your favorite color?”
- Liar: “Who is your favorite singer?”

The Liar must be able to blend in by listening to other answers. The questions should not force obviously different answer types.

## 4.6 Round flow

### Step 1: Select a question pair

The app selects one active pair from the chosen categories and language.

### Step 2: Assign the Liar

One player is selected randomly.

### Step 3: Private question reveal

Each player privately views their question using the same pass-the-phone protection as Impostor.

- Regular players see the main question.
- The Liar sees the alternate question.
- No player is directly told “You are the Liar.”

This is important: the Liar should infer that they may have a different question, but should not know with certainty whether their question is the common one.

### Step 4: Select answer order

The app randomly chooses the first player.

The Liar may answer first.

### Step 5: Answer aloud

Every player gives one concise answer.

Rules:

- Do not reveal or paraphrase the full question.
- Players may explain briefly, but long explanations should be discouraged.
- Players should not intentionally give a meaningless answer solely to hide.

The phone displays the current player’s name and a Next button.

### Step 6: Optional discussion

After all answers:

- Players may discuss inconsistencies.
- Players may ask each person one brief follow-up question.
- No one may ask, “What exact question did you receive?”

### Step 7: Private vote

Each player votes for one other player using the shared phone.

- No self-voting.
- The Liar also votes.

### Step 8: Resolve ties

- First tie: runoff among tied players.
- Second tie: the Liar wins.

### Step 9: Reveal both questions and the Liar

Show:

- The common question
- The alternate question
- The Liar’s identity
- Each player’s vote, optionally

## 4.7 Winning rules

### Group wins when

- The Liar receives the most votes after any runoff.

### Liar wins when

- Another player receives the most votes, or
- The final vote remains tied.

There is no final secret-word guess in this game.

## 4.8 Optional scoring

- Each regular player: +1 when the group identifies the Liar
- Liar: +2 when another player is accused
- Liar: +1 when the final vote is tied

## 4.9 Content requirements

```yaml
id: liar_food_001
main_question_en: "Which Ethiopian food could you eat every day?"
liar_question_en: "Which Ethiopian food would you never order?"
main_question_am: "በየቀኑ መብላት የምትችለው የኢትዮጵያ ምግብ የትኛው ነው?"
liar_question_am: "ፈጽሞ ማዘዝ የማትፈልገው የኢትዮጵያ ምግብ የትኛው ነው?"
category_id: food
content_level: family
difficulty: medium
active: true
```

Recommended launch volume:

- Minimum usable: 80 pairs
- Better launch target: 150+ pairs

## 4.10 MVP categories

- Food
- Addis Life
- Friends
- School and University
- Family
- Music and Entertainment
- Travel
- Relationships
- Everyday Preferences

## 4.11 Edge cases

- Avoid question pairs where one answer must be a person and the other must be an object.
- Avoid factual questions with only one correct answer.
- Avoid questions that expose sensitive personal information in Family mode.
- The same player should not be selected as Liar in consecutive rounds when there are four or more players, unless all players have already had the role.

---

# 5. Game Three: Taboo

## 5.1 Product role

Taboo provides fast, competitive team play and gives Chereka Chewata a language-heavy game that can become especially strong in Amharic and mixed-language packs.

## 5.2 Familiar game concept

A describer tries to make teammates guess a target word without saying the target word or any listed forbidden words. The opposing team watches for rule violations. Teams earn points for correctly guessed cards before time expires.

## 5.3 Player count

- Minimum: 4
- Recommended: 6–12
- Maximum: 20
- Two teams required

For exactly three players, an optional casual mode could be added later, but it is not part of the MVP.

## 5.4 Team setup

- Create Team A and Team B.
- Players may assign themselves or use random assignment.
- Teams should differ in size by no more than one player.
- Each round rotates the describer within the active team.

## 5.5 Setup options

Required:

- Teams
- Content categories
- Content language
- Content level

Optional:

- Round timer
- Points to win or number of rounds
- Skip penalty
- Strict-language mode

Recommended defaults:

- 60-second round timer
- First team to 15 points
- Maximum three skips per turn
- No point penalty for skips in casual mode
- One-point penalty when a forbidden word is used

## 5.6 Round flow

### Step 1: Choose describer

The active team selects or is assigned one describer.

### Step 2: Give phone to describer

Only the describer should see the card. The opposing team may appoint one watcher to monitor forbidden words, or the phone can be angled so the watcher can see the forbidden list.

Recommended digital flow:

- Describer sees target and forbidden words.
- Watcher can sit beside the describer.
- Large buttons: Correct, Skip, Violation.

### Step 3: Start timer

When the describer taps Start, the countdown begins and the first card appears.

### Step 4: Describe target

The describer may speak freely except they may not:

- Say the target word
- Say any forbidden word
- Use part of the target word
- Spell the target word
- Give the first letter
- Say “rhymes with” followed by a rhyming clue
- Translate the target word into another supported language when strict-language mode is enabled
- Use direct gestures or sound effects when the selected rules prohibit them

### Recommended MVP rule on gestures

Classic verbal mode should prohibit acting and gestures. A future “anything goes except forbidden words” mode may allow them.

### Step 5: Correct guess

When a teammate says the target word:

- Tap Correct.
- Add +1 point.
- Immediately load the next card.

Minor pronunciation differences should count if the group agrees the intended word was guessed.

### Step 6: Skip

- Tap Skip to move to another card.
- By default, no point is gained or lost.
- Maximum three skips per turn.
- A stricter mode may subtract one point per skip.

### Step 7: Violation

If the describer uses the target or a forbidden word:

- Tap Violation.
- Subtract one point from that turn’s score, or mark the card as −1.
- Immediately move to the next card.

The score for a turn may become negative unless casual mode prevents scores below zero.

Recommended default: a team’s total game score cannot fall below zero.

### Step 8: End turn

When time expires:

- Freeze the card.
- Do not count a guess spoken after the buzzer.
- Show correct, skipped, and violated card totals.
- Rotate to the other team.

### Step 9: End game

The game ends when:

- A team reaches the target score after both teams have had the same number of turns, or
- The chosen number of rounds is complete.

If Team A reaches the target first, Team B still receives its matching final turn.

### Tie

If tied after equal turns:

- Play one sudden-death turn per team with 30 seconds.
- Repeat if still tied.

## 5.7 Scoring

- Correct: +1
- Violation: −1
- Skip: 0 by default
- Unfinished card when timer ends: 0

## 5.8 Content requirements

Every card should contain one target and three to five forbidden words.

```yaml
id: taboo_food_001
target_en: "Coffee"
target_am: "ቡና"
forbidden_en:
  - "Jebena"
  - "Cup"
  - "Drink"
  - "Black"
  - "Morning"
forbidden_am:
  - "ጀበና"
  - "ሲኒ"
  - "መጠጥ"
  - "ጥቁር"
  - "ጠዋት"
category_id: ethiopian_everyday
content_level: family
difficulty: easy
active: true
```

Recommended launch volume:

- Minimum usable: 150 cards
- Better launch target: 300+ cards

## 5.9 MVP categories

- Ethiopian Food
- Everyday Life
- Places
- Music and Entertainment
- School
- Jobs
- Animals
- Sports
- General Words

## 5.10 Language rules

Because the app supports multilingual groups, define modes clearly:

### Flexible mode — default

Players may describe in any language, but they cannot say the target word or its obvious direct translation.

### Strict selected-language mode

Players must describe only in the chosen content language.

Flexible mode is recommended for launch because it matches natural Ethiopian group conversation.

## 5.11 Edge cases

- Inflected or conjugated forms of forbidden words should count as violations when clearly derived from the same word.
- The group or watcher has final authority on disputed violations.
- If a card contains a translation inconsistency, allow reporting from the round summary.
- Never place the target itself inside a compound forbidden word or vice versa unless the rule is intentional.

---

# 6. Game Four: Who’s Most Likely To

## 6.1 Product role

This is a low-friction conversation game designed to create laughter, accusations, and shareable reactions. It should be playable immediately with almost no setup.

## 6.2 Familiar game concept

The app displays a “Who is most likely to…” statement. After it is read aloud, everyone simultaneously points to the person who best fits the statement. The group discusses the result and continues to the next prompt.

## 6.3 Player count

- Minimum: 3
- Recommended: 4–12
- Maximum: 20+

The game technically works with two players, but the MVP should recommend at least three.

## 6.4 Setup options

Required:

- Content categories
- Content level

Optional:

- Player names
- Number of cards
- Voting method
- Score mode

Recommended defaults:

- No player names required
- 20 cards per session
- Physical simultaneous pointing
- No scoring

## 6.5 Round flow

### Step 1: Display prompt

Example:

> Who is most likely to say “I’m nearby” while still at home?

One person reads the prompt aloud.

### Step 2: Prepare to vote

The reader says or taps a countdown:

- Three
- Two
- One
- Point

A short sound or vibration may mark the reveal.

### Step 3: Vote simultaneously

Everyone points to one person in the group.

Rules:

- Players may point to themselves.
- Players should choose only one person.
- No changing after seeing other votes.

### Step 4: Discuss

The group may explain or debate its choices.

The app does not need to determine a winner.

### Step 5: Continue

Tap Next for another prompt.

## 6.6 Optional digital voting mode

For groups who prefer private voting:

1. Player names are required.
2. Pass the phone to each voter.
3. Each player selects one name.
4. Reveal the result as a vote count.

Digital voting should be optional because it slows down a game that is normally fast and physical.

## 6.7 Optional score mode

Not recommended as the default.

Possible version:

- The player receiving the most votes earns one “Most Likely” point.
- After a chosen number of prompts, show humorous titles based on totals.

Avoid calling the highest score the winner because receiving the most votes is not always positive.

## 6.8 Tie handling

No formal tie resolution is needed in standard mode. Multiple players may share the result.

In digital mode:

- Show all tied players.
- Do not revote.

## 6.9 Content requirements

```yaml
id: likely_addis_001
prompt_en: "Who is most likely to say ‘I’m nearby’ while still at home?"
prompt_am: "ገና ቤት ሆኖ ‘ደርሻለሁ’ የሚለው ማነው?"
category_id: addis_life
content_level: friends
intensity: mild
active: true
```

Recommended launch volume:

- Minimum usable: 150 prompts
- Better launch target: 300+ prompts

## 6.10 MVP categories

- Friends
- Family
- School and University
- Addis Life
- Relationships
- Work
- Diaspora
- Weddings and Events
- General Funny

## 6.11 Content-writing rules

Prompts should:

- Be quickly understood when read once
- Usually name a recognizable behavior
- Invite playful disagreement
- Avoid implying serious crimes or harmful conduct
- Avoid ethnic, religious, or political stereotypes
- Avoid body-shaming
- Avoid forcing disclosure of trauma or private sexual information

## 6.12 Edge cases

- If a prompt does not fit the group, allow immediate skip.
- Avoid repeating the same person-target pattern too often.
- Some prompts may support audience tags such as couples-only or close-friends-only.

---

# 7. Game Five: Would You Rather

## 7.1 Product role

Would You Rather is the simplest launch game. It provides quick, accessible conversation for nearly any group and requires no player setup.

## 7.2 Familiar game concept

The app presents two options. Every player must choose one; choosing neither is not allowed. Players may explain and debate their decisions before continuing.

## 7.3 Player count

- Minimum: 2
- Recommended: 3–12
- Maximum: Unlimited in practical group play

## 7.4 Setup options

Required:

- Content categories
- Content level

Optional:

- Number of questions
- Choice reveal style
- Debate timer
- Majority prediction mode

Recommended defaults:

- 20 questions
- Simultaneous physical choice
- No timer
- No scoring

## 7.5 Round flow

### Step 1: Display dilemma

Example:

> Would you rather give up injera for one year or give up coffee for one year?

### Step 2: Read both choices

Players should hear both options before deciding.

### Step 3: Commit to one choice

No neutral answer is allowed.

Recommended physical voting:

- Left hand or point left for Option A
- Right hand or point right for Option B

The app may display a three-second countdown before everyone reveals.

### Step 4: Reveal simultaneously

All players reveal their choice at the same time.

### Step 5: Explain and debate

Players may explain why they chose their option.

The app should not force every player to speak; the group controls the conversation.

### Step 6: Continue

Tap Next.

## 7.6 Optional digital group result

The app may allow users to enter the number choosing A and B using two counters. This can show the group split without requiring player names.

For example:

- Option A: 5
- Option B: 3

This should be optional to preserve quick play.

## 7.7 Optional Majority Prediction mode

A future or optional MVP variation:

1. One active player predicts which option the majority will choose.
2. Everyone votes.
3. The active player receives one point for a correct prediction.
4. Rotate active player.

This creates a competitive mode without changing the familiar core game.

## 7.8 Tie handling

No tie resolution is needed. A 50/50 split is itself an interesting result.

## 7.9 Content requirements

```yaml
id: wyr_food_001
option_a_en: "Give up injera for one year"
option_b_en: "Give up coffee for one year"
option_a_am: "ለአንድ ዓመት እንጀራ መተው"
option_b_am: "ለአንድ ዓመት ቡና መተው"
category_id: ethiopian_food
content_level: family
intensity: mild
active: true
```

Recommended launch volume:

- Minimum usable: 150 dilemmas
- Better launch target: 300+ dilemmas

## 7.10 MVP categories

- Ethiopian Life
- Food
- Friends
- Relationships
- Money and Lifestyle
- School and Work
- Travel
- Absurd Choices
- Deep Choices
- Diaspora

## 7.11 Content-writing rules

A good dilemma should:

- Contain exactly two understandable options
- Force a meaningful choice
- Avoid one obviously superior answer
- Be answerable without specialist knowledge
- Create discussion, surprise, or humor
- Avoid real-world dangerous challenges

## 7.12 Edge cases

- If someone refuses both choices, the group may tease them, but the app should simply display “Choose one.”
- Avoid dilemmas involving graphic harm in default packs.
- Questions involving money should use ETB where local context matters.

---

# 8. Shared Content Data Model

A normalized content system will make localization, remote updates, premium packs, reporting, and analytics easier.

## 8.1 Common fields

```yaml
id: string
game_type: impostor | whos_the_liar | taboo | most_likely | would_you_rather
category_ids: [string]
pack_ids: [string]
content_level: family | friends | spicy
difficulty: easy | medium | hard
language_support: [en, am, mixed]
audience_tags: [general, friends, family, couples, university, diaspora]
region_tags: [all, addis, ethiopia, diaspora]
active: boolean
premium: boolean
version: integer
created_at: datetime
updated_at: datetime
report_count: integer
```

Each game then adds its own fields as defined in the game sections.

## 8.2 Content pack model

```yaml
id: pack_ethiopian_starter
name_en: "Ethiopian Starter"
name_am: "የኢትዮጵያ መነሻ"
description_en: "Food, places, everyday life and familiar references."
game_types:
  - impostor
  - taboo
  - most_likely
  - would_you_rather
content_level: family
premium: false
active: true
```

## 8.3 Category model

```yaml
id: ethiopian_food
name_en: "Ethiopian Food"
name_am: "የኢትዮጵያ ምግብ"
icon_key: food
sort_order: 10
active: true
```

---

# 9. Shared Session Data Model

```yaml
session_id: string
game_type: string
started_at: datetime
ended_at: datetime | null
language: en | am | mixed
content_level: family | friends | spicy
selected_category_ids: [string]
selected_pack_ids: [string]
player_count: integer
players:
  - id: string
    display_name: string
round_number: integer
cards_seen: [string]
cards_skipped: [string]
cards_reported: [string]
score_enabled: boolean
scores:
  player_or_team_id: integer
settings: object
```

Sensitive roles and secret content should exist only for the active round and should be cleared when the round ends.

---

# 10. Minimum Screens Required by These Rules

## Shared screens

1. Game library
2. Game details and short rules
3. Content level selection
4. Category or pack selection
5. Player setup, where required
6. Game settings
7. Active game screen
8. End-game confirmation
9. Session result
10. Report-card sheet

## Secret-information screens

Used by Impostor and Who’s the Liar:

1. Pass to named player
2. Tap or hold to reveal
3. Secret role/question
4. Hide and pass onward

## Voting screens

Used by Impostor and Who’s the Liar:

1. Pass to voter
2. Select suspect
3. Confirm privately
4. Vote processing
5. Tie runoff, when needed
6. Reveal result

## Team screens

Used by Taboo:

1. Team assignment
2. Describer rotation
3. Timed card screen
4. Turn summary
5. Scoreboard

---

# 11. Rule Explanation Standard

Each game should have two levels of explanation.

## 11.1 Quick explanation

Visible before play and limited to about three short steps.

Example for Impostor:

1. Everyone sees the same word except the Impostor.
2. Give clues without saying the word.
3. Vote, then let the Impostor guess if caught.

## 11.2 Full rules

Accessible through “How to play” and includes:

- Goal
- Setup
- Turn flow
- What is not allowed
- Voting or scoring
- Tie handling
- Winning conditions

The app should never force experienced players to read the full rules before playing.

---

# 12. MVP Decisions That Are Now Locked

Unless user testing gives strong evidence otherwise:

- The seven playable games are Impostor, Who’s the Liar?, Taboo, Who’s Most Likely To, Would You Rather, Who’s Got the Bomb?, and Quiz.
- All games are designed for one shared phone.
- No account is required.
- Offline play is required.
- Impostor defaults to group-decides accusation (tap the accused); private pass-the-phone voting is optional.
- Who’s the Liar defaults to group-decides accusation (tap the accused); private pass-the-phone voting is optional.
- Impostor receives one final word guess when caught.
- Who’s the Liar does not include a final guess.
- Taboo uses two teams and a 60-second default timer.
- Who’s Most Likely To uses physical simultaneous pointing by default.
- Would You Rather uses forced choice and simultaneous reveal by default.
- Scoring is optional for social games and enabled by default only for Taboo.
- Family, Friends, and Spicy are the three content levels.
- English, Amharic, and Mixed are content options.
- Game names remain familiar working names for now.

---

# 13. Deferred Decisions

These do not block initial development:

- Final Ethiopian names for each game
- Final logo and visual identity
- Premium pricing
- Online multiplayer
- Shared custom packs
- User accounts
- Public user-generated content
- Additional Ethiopian languages
- Two-Impostor mode release timing
- Majority Prediction mode for Would You Rather
- Digital voting mode for Who’s Most Likely To

---

# 14. App Navigation and Screen-by-Screen UX

## 14.1 Navigation principle

The MVP should feel playable within seconds. Do not use a mandatory account, long onboarding carousel, social feed, or complex bottom navigation.

Recommended top-level structure:

- **Home:** game library and continue/replay actions
- **Packs:** optional content browsing and filtering
- **Settings:** language, sound, vibration, accessibility, and legal information

For the earliest build, Home may be the only persistent main screen. Packs can open as a secondary screen, and Settings can open from a top-right icon. This keeps the first implementation simple while preserving a scalable structure.

## 14.2 Global navigation rules

- Use normal back navigation during setup.
- During active gameplay, back should open a confirmation sheet rather than immediately exiting.
- Preserve setup choices when returning from a game-details or category screen.
- Do not preserve secret-role screens in navigation history.
- Lock screenshots or app previews on secret-role screens where technically practical.
- If the app is backgrounded during a private reveal, hide the secret immediately and require the same player to reveal again.
- A session interrupted by a crash or accidental close may resume only from a public gameplay state, never from a revealed secret screen.

## 14.3 First-launch flow

### Screen 1: Brand splash

Purpose:

- Display the Chereka Chewata identity while the app loads local content and settings.

Requirements:

- Keep it brief.
- No button is required unless loading fails.
- Route returning users directly to Home.
- Route first-time users to Language Selection.

### Screen 2: Language selection

Purpose:

- Select the interface language and initial content language.

Controls:

- Interface: English or Amharic
- Content: English, Amharic, or Mixed
- Continue

Rules:

- Store selections locally.
- Both settings remain editable later.
- For the functionality-first prototype, English may be the only populated content library while the other options remain hidden or marked as coming later.

### Screen 3: Optional one-screen introduction

This screen is optional and should be skipped in the earliest functional build.

If included, it should communicate only:

- One phone
- Multiple players
- Pass, reveal, and play

Provide **Start playing** and **Skip**. Do not create a multi-page onboarding carousel.

## 14.4 Home screen

Purpose:

- Let users understand the available games and start one quickly.

Required elements:

- Chereka Chewata wordmark or compact header
- Settings button
- Featured game area, with Impostor as the default hero game
- Cards for all seven playable games
- Recently played or Play Again section, once history exists
- Optional content-level indicator

Each game card should show:

- Familiar working game name
- One-sentence explanation
- Recommended player count
- Approximate session length, where useful
- Simple icon or placeholder illustration
- Play button or whole-card tap target

Recommended game-card descriptions:

- **Impostor:** Find the player who does not know the secret word.
- **Who’s the Liar?:** One player answers a different question. Spot them.
- **Taboo:** Help your team guess the word without saying the forbidden clues.
- **Who’s Most Likely To:** Read a prompt and point to the person who fits it best.
- **Would You Rather:** Pick between two difficult choices and defend your answer.

Empty or unavailable games should not appear in the production MVP. Do not fill the home screen with disabled future-game cards.

## 14.5 Game details screen

Purpose:

- Explain the selected game without forcing users through the full rules.

Required elements:

- Game name
- Short explanation
- Minimum and recommended player count
- Typical duration
- Content-level badges
- **Play** button
- **How to play** expandable section or modal

Optional:

- Preview example card
- Last-used setup summary
- Quick Play button using previous settings

Rules:

- Experienced users should be able to start without opening full instructions.
- Full rules must remain available from setup and pause menus.

## 14.6 Shared setup flow

The setup flow should be assembled from reusable steps. Only show steps relevant to the selected game.

Recommended order:

1. Players or teams
2. Content categories
3. Content level
4. Game-specific options
5. Review and start

A visible progress indicator is optional. If used, it should show meaningful labels rather than only numbered dots.

### Player setup screen

Used by:

- Impostor
- Who’s the Liar?
- Optional named-player modes

Required controls:

- Add player
- Edit player name
- Delete player
- Reorder players
- Generate default names
- Continue

Validation:

- Enforce the selected game’s minimum and maximum player counts.
- Prevent blank names.
- Duplicate names may be allowed but should show a warning because they make voting confusing.

Convenience behavior:

- Remember the last group locally.
- Offer **Use last group**.
- Allow **Player 1, Player 2...** with one tap.

### Team setup screen

Used by standard Taboo.

Required controls:

- Two team names, defaulting to Team A and Team B
- Optional assignment of player names to teams
- Randomize teams, if named players are used
- Starting team selection, random by default

The MVP does not need more than two teams.

### Category selection screen

Required behavior:

- Support selecting one or multiple categories.
- Include **Select all**.
- Show available-card count when known.
- Disable categories with too few eligible cards for the chosen settings.

Functionality-first English placeholder categories may include:

- Everyday Objects
- Food and Drink
- Places
- Entertainment
- School and Work
- People and Personality
- Random

These are temporary test categories and can be replaced by Ethiopian categories later without changing the flow.

### Content level screen

Required choices:

- Family
- Friends
- Spicy

Recommended behavior:

- Family selected by default for a first session.
- Multiple levels may be combined, such as Family + Friends.
- Spicy requires an explicit acknowledgement the first time it is enabled.
- Remember the user’s choice locally, but always show the active level before starting.

### Game options screen

Only display settings relevant to the chosen game.

Examples:

**Impostor**

- Number of Impostors
- Voting mode (group decides default / private in-app)
- Show category to Impostor
- Discussion timer
- Scoring

**Who’s the Liar?**

- Discussion timer
- Private digital voting
- Scoring

**Taboo**

- Round duration
- Number of rounds or target score
- Skip penalty
- Forbidden-word penalty

**Who’s Most Likely To**

- Number of prompts
- Named-player mode
- Digital voting, deferred/optional

**Would You Rather**

- Number of prompts
- Discussion timer
- Anonymous digital choice, optional

### Review and start screen

Show a compact summary:

- Game
- Players or teams
- Categories
- Content levels
- Important options

Primary action:

- **Start game**

Secondary actions:

- Edit each section
- Save as preferred setup, deferred unless trivial to implement

## 14.7 Shared private handoff pattern

Used by Impostor, Who’s the Liar?, and private digital voting.

### Pass-the-phone screen

Display:

- Current player’s name
- “Pass the phone to [Name]”
- A large **I’m ready** button
- Reminder not to let others see the screen

Do not show any secret information on this screen.

### Secret reveal screen

Interaction:

- Press and hold to reveal is preferred because it reduces accidental exposure.
- Tap to reveal is acceptable for the first prototype.
- Releasing the hold may hide the content again.

Controls:

- Hide and continue
- Optional reveal-again before continuing

Security behavior:

- Never advance on the initial reveal tap.
- Require a separate deliberate action to finish the player’s turn.
- Cover the content immediately when the app loses focus.

### Handoff completion screen

After a player hides their card:

- Confirm that the screen is hidden.
- Show the next player’s name.
- Do not allow swiping backward to previous secrets.

## 14.8 Impostor screens

Recommended active-game sequence:

1. Setup
2. Private role reveal for every player
3. Starting-player announcement
4. Clue-order screen
5. Discussion screen
6. Accuse (group tap by default, or optional private voting + runoff)
7. Accusation reveal
8. Impostor final guess, if caught
9. Round result
10. Session summary or rematch

### Starting-player announcement

Show:

- “[Name] gives the first clue”
- Player order
- Begin button

### Clue-order screen

Show:

- Current speaker
- Upcoming order
- Next player button
- Optional clue timer

The app does not need to record spoken clues.

### Discussion screen

Show:

- Secret discussion timer, if enabled
- Start voting
- Pause
- Rules reminder

Do not reveal the secret word here.

### Voting screen

For each voter:

- Show voter name
- List eligible suspects
- Confirm vote
- Hide selection before handoff

### Accusation reveal

Build suspense, then show:

- Accused player
- Whether they are an Impostor

If correct:

- Continue to final secret-word guess

If incorrect:

- Follow the round-resolution rule already defined in the Impostor specification.

### Final guess screen

Show the caught Impostor a category reminder and one chance to state or select the word.

MVP recommendation:

- The group confirms **Correct** or **Incorrect** manually.
- Do not require speech recognition or free-text matching.

### Result screen

Show:

- Winning side
- Secret word
- Impostor identity
- Vote distribution
- Points, only if scoring is enabled

Actions:

- Play another round
- Same setup, new word
- Change categories
- End game

## 14.9 Who’s the Liar? screens

Recommended active-game sequence:

1. Setup
2. Private question reveal
3. Answer-order announcement
4. Group answer/discussion screen
5. Private voting
6. Tie runoff, when needed
7. Liar reveal
8. Round result
9. Rematch

### Private question reveal

- Regular players see the main question.
- The Liar sees the alternate question.
- The app should not visually distinguish the two card types.

### Answer-order screen

Show:

- First player
- Full answer order
- Optional answer timer

### Discussion screen

Show only public information:

- Whose turn it is to answer
- Next answer button
- Start voting

Do not display either question during public discussion unless the rules specifically call for revealing them after voting.

### Liar reveal and result

Show:

- Liar identity
- Main question
- Liar’s alternate question
- Vote distribution
- Points, if enabled

Actions match the shared result pattern.

## 14.10 Taboo screens

Recommended sequence:

1. Team setup
2. Category and options
3. Round-ready screen
4. Active clue card and timer
5. Round summary
6. Team switch
7. Final score

### Round-ready screen

Show:

- Active team
- Clue giver, if players are named
- Opposing team’s watcher reminder
- Start timer

### Active clue card screen

Show prominently:

- Target word
- Forbidden words
- Countdown timer
- Correct button
- Skip button
- Violation button
- Pause

Interaction rules:

- Correct loads the next card and awards a point.
- Skip loads the next card and applies the configured rule.
- Violation loads the next card and applies the configured penalty.
- Prevent accidental double scoring with brief input locking.
- When time expires, freeze controls immediately.

### Round summary

Show:

- Correct cards
- Skipped cards
- Violations
- Points earned
- Running team scores
- Next team button

Allow correction of the round score before continuing, because physical groups may tap the wrong button.

### Final score screen

Show:

- Winning team or tie
- Final scores
- Optional sudden-death round after a tie

Actions:

- Rematch
- New teams
- Change categories
- Choose another game

## 14.11 Who’s Most Likely To screens

Recommended sequence:

1. Optional setup
2. Category and content-level selection
3. Prompt screen
4. Pointing countdown
5. Optional discussion
6. Next prompt
7. Session ending

### Prompt screen

Show:

- One prompt in large readable text
- Read aloud button only if text-to-speech is added later
- **Ready to point** button
- Skip/report controls

### Pointing countdown

Use a clear countdown:

- 3
- 2
- 1
- Point

The phone does not need to detect or record physical votes.

### Discussion state

After pointing:

- Keep the prompt visible.
- Show **Next prompt**.
- Optionally show a light timer to prevent the session from stalling.

### End session

This game has no required winner. Show:

- Number of prompts played
- Play again
- Change pack
- Choose another game

Avoid fake scores unless digital voting is deliberately enabled later.

## 14.12 Would You Rather screens

Recommended sequence:

1. Category and content-level selection
2. Choice prompt
3. Simultaneous choice countdown
4. Discussion
5. Next prompt
6. Session ending

### Choice prompt screen

Show:

- Option A
- Option B
- Ready button
- Skip/report controls

For physical simultaneous play, players decide mentally or choose a side of the room before reveal.

### Choice reveal

Use a countdown and then display:

- **Show your choice**

Optional digital mode:

- Each player privately selects A or B through the handoff pattern.
- Results appear as totals only after everyone votes.
- This mode can be deferred because it adds friction to a simple social game.

### Discussion state

Keep both choices visible and provide:

- Next question
- Optional discussion timer

### End session

Show:

- Questions played
- Play again
- Change categories
- Choose another game

No winner is required.

## 14.13 Pause and active-session menu

Accessible from every active game.

Options:

- Resume
- How to play
- Sound on/off
- Vibration on/off
- Restart round
- End game

Rules:

- Restart round must confirm because it may reshuffle roles or cards.
- End game must confirm and clearly state whether progress will be lost.
- Never expose secret roles from the pause menu.

## 14.14 Shared report-card flow

When Report is selected:

- Hide or pause the current card.
- Offer concise reasons:
  - Offensive or inappropriate
  - Incorrect or confusing
  - Duplicate
  - Translation problem
  - Other
- Allow optional short feedback later; not required in MVP.
- Locally suppress the card from the rest of the session.
- If offline, queue the report for later upload when a backend exists.

For the functionality-first prototype, reports may be stored only in local debug data.

## 14.15 Settings screen

Required settings:

- Interface language
- Content language
- Sound
- Vibration
- Reduce motion
- Reset recent-card history
- Restore purchases, once purchases exist
- Privacy policy
- Terms
- App version

Optional later:

- Text size
- High-contrast mode
- Manage downloaded packs
- Account and cloud sync

## 14.16 Accessibility requirements

- Do not rely on color alone to communicate roles, choices, or scoring.
- Maintain readable contrast.
- Support system text scaling without breaking secret cards.
- Provide reduce-motion behavior for dramatic reveals and countdowns.
- Use large touch targets during timed gameplay.
- Provide vibration alternatives through visible countdowns and labels.
- Amharic typography must be tested at all supported sizes before localization launch.

## 14.17 Minimum route/state map

Framework-specific route names may differ, but the product states should map roughly to:

```text
/
/home
/settings
/packs
/game/:gameId
/game/:gameId/setup/players
/game/:gameId/setup/teams
/game/:gameId/setup/categories
/game/:gameId/setup/content-level
/game/:gameId/setup/options
/game/:gameId/setup/review
/session/:sessionId/handoff
/session/:sessionId/reveal
/session/:sessionId/play
/session/:sessionId/vote
/session/:sessionId/result
/session/:sessionId/summary
```

Implementation note:

- Secret data must live in session state, not route parameters.
- Do not encode words, questions, roles, or votes in URLs.
- A state-machine approach is preferred over allowing arbitrary navigation between gameplay routes.

## 14.18 MVP screen inventory

Shared screens:

1. Splash
2. Language selection
3. Home
4. Game details
5. Player setup
6. Team setup
7. Category selection
8. Content-level selection
9. Game options
10. Setup review
11. Pass-the-phone
12. Secret reveal
13. Pause menu
14. Report card
15. Result
16. Session summary
17. Settings

Game-specific gameplay screens:

18. Impostor clue order
19. Impostor discussion
20. Impostor voting
21. Impostor accusation reveal
22. Impostor final guess
23. Who’s the Liar answer order
24. Who’s the Liar discussion
25. Who’s the Liar voting
26. Taboo round-ready
27. Taboo active timer/card
28. Taboo round summary
29. Who’s Most Likely prompt/countdown
30. Would You Rather choice/countdown

These do not need to be thirty separate code files. Reuse shared shells and state-driven components wherever possible.

## 14.19 Implementation priority

Build screens in this order:

1. Home and game details
2. Shared setup components
3. Pass-the-phone and secret reveal
4. Impostor full flow
5. Shared voting and results
6. Who’s the Liar full flow
7. Taboo timer and scoring flow
8. Who’s Most Likely To flow
9. Would You Rather flow
10. Settings, reports, accessibility, and polish

Impostor should be the first complete vertical slice. Do not build all home and setup screens for five games before proving one full playable session end to end.

---


# 15. Step 6 — Visual Identity Direction

## 15.1 Brand position

Chereka Chewata should feel like a lively Ethiopian game night after dark: social, witty, slightly mischievous, welcoming, and easy to understand at a glance.

The visual identity must avoid four extremes:

- It must not look childish or designed only for children.
- It must not look luxurious, serious, or corporate.
- It must not depend on obvious Ethiopian flag colors or decorative cultural motifs.
- It must not look like a direct visual copy of Splash or another party-game app.

### Locked brand direction

**Playful night energy**

Core associations:

- Moonlight
- Passing one phone around
- Secrets and hidden roles
- Conversation and laughter
- Friendly competition
- Bold game cards
- Fast, low-friction play

## 15.2 Brand hierarchy

Use **Chereka** as the primary brand word and **Chewata** as the descriptor.

Preferred wordmark hierarchy:

```text
CHEREKA
Chewata
```

Alternative bilingual lockup:

```text
CHEREKA
ጨዋታ
```

The product may eventually be referred to casually as **Chereka**, but the full working product name remains **Chereka Chewata**.

## 15.3 Logo concept

### Primary concept: crescent moon + layered game cards

The logo mark should combine:

- A simple crescent moon
- Two overlapping rounded cards
- A subtle suggestion of passing, rotation, or reveal

The mark should remain recognizable at small app-icon size and must not contain detailed illustrations or thin decorative lines.

### Logo behavior

- Use a simplified icon-only version for the app icon and loading state.
- Use the full wordmark on onboarding, store assets, and marketing.
- Avoid placing letters inside the icon.
- Avoid dice, game controllers, crowns, masks, and Ethiopian flag symbolism in the primary mark.
- The crescent must feel playful rather than religious or astronomical.

## 15.4 Color system

The product uses a dark neutral foundation with one warm moonlight accent and distinct colors for each game.

### Core brand tokens

```text
brand.midnight.950   #0C1024   Primary app background
brand.midnight.900   #131A33   Elevated background
brand.midnight.800   #1B2442   Cards and panels
brand.moon.100       #FFF3C8   Warm highlight and logo accent
brand.lilac.400      #A78BFA   Primary action accent
brand.lilac.500      #8B5CF6   Pressed/strong accent
neutral.white        #FFFFFF   Primary text
neutral.200          #D7DCEC   Secondary text
neutral.400          #929AB3   Muted text
status.success       #4ADE80
status.warning       #FBBF24
status.danger        #FB7185
```

### Game accent tokens

```text
game.impostor        #FF6B6B   Coral red
game.liar            #A78BFA   Purple
game.taboo           #FB923C   Orange
game.mostLikely      #38BDF8   Sky blue
game.wouldRather     #34D399   Green
```

Rules:

- Game colors identify the current mode but do not replace semantic status colors.
- Never communicate a role or answer through color alone.
- Large background areas should remain midnight/navy; game colors are accents.
- Avoid pure black as the default background.
- Avoid using green, yellow, and red together as the main brand palette.

## 15.5 Typography

Typography must support English and Amharic cleanly and remain readable when a phone is being passed across a group.

### Requirements

- Rounded or friendly geometric character without becoming childish
- Strong Ethiopic glyph support
- Large, high-contrast gameplay text
- Clear distinction between headings, instructions, and secret content
- Support for system text scaling

### Functional type scale

```text
display.xl      44 / 48, bold      Hero game title or major reveal
display.lg      36 / 42, bold      Secret word or result
heading.lg      28 / 34, bold      Screen heading
heading.md      22 / 28, semibold  Card title
body.lg         18 / 26, regular   Gameplay instructions
body.md         16 / 24, regular   Standard interface text
body.sm         14 / 20, regular   Metadata and helper text
label           13 / 16, semibold  Tags and compact controls
```

Implementation rule: choose fonts only after testing actual Amharic samples at all sizes. Do not select a Latin display font that forces Amharic into a visibly unrelated fallback.

## 15.6 Shape, spacing, and elevation

### Radius tokens

```text
radius.sm       12
radius.md       18
radius.lg       24
radius.xl       32
radius.pill     999
```

### Spacing tokens

Use a 4-point base grid:

```text
space.1  4
space.2  8
space.3  12
space.4  16
space.5  20
space.6  24
space.8  32
space.10 40
space.12 48
```

### Elevation

- Use soft contrast and subtle glow rather than heavy drop shadows.
- Active game cards may receive a restrained colored glow.
- Buttons should primarily use fill, border, and scale feedback.
- Avoid glassmorphism as the default component treatment.

## 15.7 Core component language

### Game tile

Must contain:

- Game icon
- Familiar game name
- One-line explanation
- Player-count guidance
- Game accent color
- Optional status such as New, Popular, or Coming later

### Primary button

- Full-width on setup and gameplay screens
- Minimum 52-point height
- High contrast
- Clear verb: Start game, Reveal card, Begin voting, Next player

### Secondary button

- Outlined or low-emphasis fill
- Used for changing settings, skipping, or returning

### Secret card

- Large centered card
- Player name visible before reveal
- Press-and-hold or deliberate tap to reveal
- Clear hidden and revealed states
- Automatically hides before the next handoff
- No secret content visible in route names, accessibility labels before reveal, notifications, or app-switcher previews where platform controls allow prevention

### Player chip/card

- Large enough to tap quickly
- Displays name and optional avatar color or initial
- Selection must include a visible check or border, not color alone

### Timer

- Large numeric value
- Circular or bar progress may be supplementary
- Visible paused state
- Warning at ten seconds through text, motion, sound, or vibration according to settings

## 15.8 Motion and haptics

Motion should create energy without slowing play.

### Recommended motion

- Card reveal: 180–240 ms flip or vertical uncover
- Screen transition: 180–220 ms
- Button press: subtle scale to 0.98
- Vote selection: short bounce or snap
- Result celebration: 600–1000 ms, skippable
- Pass-the-phone moon: slow 8–12 degree rotation or orbit

### Rules

- Never animate secret content before the deliberate reveal action.
- Respect Reduce Motion.
- Do not require users to wait through decorative animation.
- Use one short haptic for selection, a stronger haptic for reveal/result, and repeated countdown haptics only when enabled.

## 15.9 Icon and illustration style

- Use bold, rounded, simple icons for UI chrome (Lucide-style geometry).
- Game icons should communicate mechanic, not merely decorate the card.
- The Chereka moon mascot may use soft 3D rendering (nightcap character) for
  personality moments — see §18.8. The primary logo mark stays flat.
- Illustrations may use moons, stars, cards, speech bubbles, and playful poses.
- Avoid culturally generic safari imagery, overused coffee imagery, national flags, and traditional patterns used only as decoration.

## 15.10 Key-screen visual direction

### Home / game library

- Midnight background
- Compact Chereka wordmark at top
- Warm moon accent
- One large featured Impostor tile
- Four smaller game tiles below
- Recently played or saved group only after these features exist
- Settings accessible without dominating the screen

### Player setup

- Clear progress label such as `Players · 1 of 4`
- Editable list of player names
- Quick add and reorder controls
- Strong bottom Start/Continue action
- Avoid unnecessary illustrations while users are typing

### Secret reveal

- Player name and privacy instruction first
- Large hidden card occupying most of the screen
- Deliberate reveal interaction
- Revealed word/role displayed at maximum readable size
- One clear Hide and pass action
- Use the current game’s accent without changing the base layout

## 15.11 Dark-mode decision

The MVP uses a dark-first visual system because it supports the Chereka identity and group-play environment.

This is a product theme, not merely the operating-system dark mode. A full light theme is not required for MVP, but contrast and readability must still meet accessibility requirements.

## 15.12 Design do / do not

### Do

- Make the game understandable within seconds.
- Use bold hierarchy and large touch targets.
- Let each game feel distinct inside one shared system.
- Keep secret information visually protected.
- Test layouts with long English and Amharic strings.
- Design for one-handed use while passing the phone.

### Do not

- Clone Splash layouts or illustrations.
- Use excessive gradients, neon glows, or star backgrounds.
- Turn every surface into a floating card.
- Hide important controls behind gestures.
- Use tiny explanatory text during active gameplay.
- make the interface culturally Ethiopian only through stereotypes or decorative motifs.

## 15.13 Step 6 acceptance criteria

Step 6 is considered implemented in design when:

- The logo mark works at app-icon size.
- The home, player setup, and secret reveal screens use the same tokens.
- All seven game colors remain readable on the shared dark foundation.
- English and Amharic samples fit without clipping or unrelated typography.
- Primary actions are obvious without instruction.
- Secret cards cannot be exposed accidentally through normal navigation.
- Reduce Motion and non-color selection states are demonstrated.

---

# 16. Design Implementation Tokens

These values are **locked by Step 7** for the first functional prototype. Semantic names should remain stable even if small contrast adjustments are made after device testing.

```json
{
  "color": {
    "void": "#080714",
    "background": "#0D0B1C",
    "surface": "#1B1533",
    "surfaceRaised": "#241C43",
    "textPrimary": "#F6EFE2",
    "textSecondary": "rgba(246,239,226,0.72)",
    "textMuted": "rgba(246,239,226,0.52)",
    "borderSubtle": "rgba(246,239,226,0.10)",
    "brandPrimary": "#FFB646",
    "brandMystery": "#8C6BFF",
    "dangerUrgency": "#F0563C",
    "success": "#3FD6A8",
    "info": "#4FA3FF",
    "gameImpostor": "#8C6BFF",
    "gameLiar": "#F0563C",
    "gameTaboo": "#FFB646",
    "gameMostLikely": "#3FD6A8",
    "gameWouldRather": "#4FA3FF"
  },
  "font": {
    "displayLatin": "Outfit",
    "bodyLatin": "Plus Jakarta Sans",
    "ethiopic": "Noto Sans Ethiopic",
    "utility": "Space Mono"
  },
  "radius": {
    "small": 12,
    "medium": 18,
    "large": 24,
    "extraLarge": 28,
    "pill": 999
  },
  "motion": {
    "fastMs": 140,
    "standardMs": 200,
    "revealMs": 220,
    "celebrationMs": 800
  },
  "touchTarget": {
    "minimum": 44,
    "primaryButtonHeight": 56
  }
}
```

### Token usage rules

- `brandPrimary` is the main CTA, moon, and key brand highlight. Prefer one dominant honey element per screen.
- `brandMystery` supports secret roles, reveals, and Impostor-specific states.
- Game colors tint cards, headers, phase glyphs, and controls; they do not replace the dark page background.
- `dangerUrgency` may represent countdown urgency or elimination, but must not shame a player.
- Text and controls must still include labels, icons, or shapes when color carries meaning.

---

# 17. Recommended Next Product Task

The next specification update should cover:

1. Functionality-first English test content and starter deck sizes
2. Content-level definitions and safety rules
3. Concrete JSON/database schemas for cards, packs, sessions, and local history
4. Analytics events for starts, completions, skips, reports, and rematches
5. Visual identity and component design only after the core flows can be prototyped

---

# 18. Step 7 — Final Visual-System Lock

This section resolves the exploratory choices in Step 6. Where Step 7 conflicts with earlier provisional values, **Step 7 wins**.

## 18.1 Approved primary logo

The approved primary mark is a **simple crescent moon with three small orbiting game dots**.

Why this direction is locked:

- It remains readable at small app-icon and favicon sizes.
- It represents Chereka without making the product look like only an Impostor game.
- The three colored dots introduce play, variety, and social energy without adding detailed objects.
- It is more timeless than a phone silhouette and less visually fragile than overlapping cards.

Construction guidance:

- Main crescent: `#FFB646`
- Orbiting dots: violet, mint, and ember
- Keep the silhouette flat and geometric.
- Do not add facial features, card details, stars, gradients, or lettering inside the primary icon.
- Produce a one-color version for light surfaces and monochrome use.

## 18.2 Supporting brand marks

The following concepts are approved only for supporting use:

- **Moon and cards:** marketing illustrations, store screenshots, campaign graphics, and onboarding artwork. It is not the default small icon because the cards merge at reduced sizes.
- **Hidden face:** reveal animation, loading moment, or Impostor-specific artwork. It must not become the master brand because the app contains non-deception games.
- **Moon phases:** round counters, loading states, game identifiers, and progress markers.
- **ጨ monogram:** local merchandise, stickers, or a secondary Ethiopian badge after legibility testing.

The moon-and-phone and moon-and-speech-bubble directions are rejected for the core identity.

## 18.3 Wordmark lockup

Primary Latin lockup:

```text
CHEREKA
CHEWATA
```

Rules:

- `CHEREKA` uses Outfit ExtraBold or Black and visually dominates.
- `CHEWATA` uses Space Mono Bold, uppercase, with generous tracking.
- The descriptor should never compete with the main name.
- The full brand may appear horizontally in compact navigation.

Primary Ethiopic lockup:

```text
ጨረቃ
ጨዋታ
```

- Use Noto Sans Ethiopic ExtraBold/Bold for `ጨረቃ`.
- Use Medium/Semibold for `ጨዋታ`.
- The Ethiopic lockup is a first-class brand lockup, not decorative translation text.

## 18.4 Locked palette

Core palette:

| Token | Value | Role |
|---|---|---|
| Void | `#080714` | Deepest background and overscroll |
| Midnight | `#0D0B1C` | Default app background |
| Plum | `#1B1533` | Standard cards and panels |
| Raised | `#241C43` | Elevated/selected surfaces |
| Moonlight | `#F6EFE2` | Primary text and light surfaces |
| Lamp Honey | `#FFB646` | Main CTA, moon, wordmark accent |
| Dusk Violet | `#8C6BFF` | Mystery, reveal, Impostor |
| Berry Ember | `#F0563C` | Urgency, countdown, Liar |
| Teff Mint | `#3FD6A8` | Success and Most Likely To |
| Sky | `#4FA3FF` | Information and Would You Rather |

The earlier lilac-primary palette is superseded. **Lamp Honey is the primary action color.** Violet is a strong secondary/game color rather than the universal CTA.

## 18.5 Locked game identity system

| Game | Accent | Supporting glyph |
|---|---|---|
| Impostor | `#8C6BFF` | Half-lit moon |
| Who’s the Liar? | `#F0563C` | Opposite half-moon |
| Taboo | `#FFB646` | Eclipse/ring |
| Who’s Most Likely To | `#3FD6A8` | Crescent phase |
| Would You Rather | `#4FA3FF` | Paired moons/circles |

Every game uses both a hue and a distinct phase/shape so the system remains understandable without color.

## 18.6 Locked typography

- **Outfit:** Latin display headings, game titles, major reveals, buttons.
- **Plus Jakarta Sans:** Latin body copy, instructions, forms, settings, supporting interface text.
- **Noto Sans Ethiopic:** all Amharic interface and gameplay text.
- **Space Mono:** timers, round numbers, compact labels, category chips, and short metadata only.

Rules:

- Do not use Space Mono for paragraphs or long buttons.
- Do not force Outfit onto Ethiopic text.
- Avoid Noto Serif Ethiopic in the product UI; reserve it for future editorial or campaign work only.
- Test Amharic with long prompts before finalizing card heights.

## 18.7 Locked component language

- Dark full-screen canvas; not every section sits inside a card.
- Cards use Plum or Raised surfaces, subtle borders, and 18–28 px rounded corners.
- Primary buttons use Lamp Honey with Midnight text and a minimum height of 56 px.
- Secondary buttons use a low-contrast Plum/Raised fill or Moonlight outline.
- Destructive actions use transparent/low-fill styling with Berry Ember text and border; they are not solid red by default.
- Player chips use initials and shape/border states in addition to color.
- Timers use Space Mono numerals; rings are for round time and bars for overall progress.
- Chips are short, uppercase only where appropriate, and never used for full sentences.

## 18.8 Motion and illustration lock

Motion:

- Reveal animation: 180–240 ms.
- Standard transition: around 200 ms.
- Result celebration: maximum 800–1000 ms and immediately skippable.
- Moon-phase progress may rotate or transition subtly.
- Reduce Motion removes flips, orbiting movement, bounce, and confetti.

Illustration:

- Soft 3D rendered moon mascot (nightcap character) is approved for hero,
  empty, loading, result, and marketing moments.
- Keep the primary logo mark (`MoonMark`) flat and geometric — app icon and
  favicon stay silhouette-first; the 3D character is not the logo.
- Mascot may appear in onboarding, empty states, loading, pass-the-phone,
  results, and marketing — not as dense navigation chrome or tiny list glyphs.
- Prefer expression / pose alone at small sizes; drop held props when the UI
  already labels the state.
- Avoid horror cues or generic Ethiopian clichés.

## 18.9 Accessibility lock

- Primary body text must meet WCAG AA contrast against its actual surface.
- Honey buttons use Midnight text rather than white.
- Color is never the only indicator of game, role, selection, success, or error.
- Minimum touch target: 44 × 44 px; primary actions: at least 56 px tall.
- Secret cards require deliberate reveal and immediately re-cover before handoff.
- Support system text scaling without clipping English or Ethiopic.
- Haptics and sound are optional and independently configurable.

## 18.10 Rejected directions

Do not use these in the MVP visual system:

- Purple as the universal CTA color
- Detailed cards inside the primary small icon
- A hidden face as the master logo
- Full-screen saturated game-color backgrounds
- Heavy gradients or permanent neon glows
- Ethiopian flag colors as the core palette
- Decorative traditional patterns without functional meaning
- More than one display font per script
- Bottom navigation with placeholder destinations that do not exist

## 18.11 Step 7 completion status

Step 7 is complete. The design system is sufficiently locked to begin the Impostor vertical-slice screen specification and functional prototype. Small accessibility-driven adjustments are allowed, but new designers or coding agents must not independently replace the approved logo, type roles, or palette without recording a new product decision in this document.

---

# 19. Game Six: Who’s Got the Bomb?

## 19.1 Familiar game concept

The phone displays a category and chooses who starts. The current holder says a
new valid answer and physically passes the phone. A short randomized hidden fuse
continues while the phone moves. Whoever holds it when it explodes loses the
round.

## 19.2 Player count and defaults

- 2–15 named players
- No lives, elimination, scoring, or winner tracking
- One short randomized fuse range, with no player-facing speed control

## 19.3 Round flow

1. Show a public category and randomly choose who starts.
2. Start a hidden randomized fuse; never show its remaining duration.
3. The holder says a unique valid answer and immediately hands the phone to the
   next player; no app interaction is required between answers.
4. Physical passing does not reset or pause the fuse.
5. On explosion, the group identifies the holder, who loses that round.
6. Start another round with a new category and randomly chosen starter.

The fuse deadline remains in in-memory session state, never route parameters.
Backgrounding the app does not pause the fuse. Category cards follow the shared
history/report rules and support English, Amharic, and Mixed content modes.

# 20. Game Seven: Quiz

## 20.1 Product role

Quiz is offline four-choice trivia with two equally visible ways to play. The
mode is selected before setup and must not be collapsed into one scored flow.
Difficulty measures knowledge difficulty and is unrelated to Family / Friends /
Spicy maturity levels.

## 20.2 Pass & Play

**Quick casual trivia. Answer, reveal, then pass the phone.**

- No player names, scores, leaderboard, or invented winner.
- Setup contains only multi-select categories, difficulty, and 10 / 20 / 30
  total questions. Defaults: All Categories, Mixed, 20.
- Flow: `Ready → Question → AnswerReveal → Handoff → Question → … → Result`.
- After reveal the primary action is **Pass the phone**. The handoff says
  **Next player, you’re up** and shows no upcoming question or private secret.
- Result shows questions played and optional group accuracy, with Play again,
  Change setup, and Home.

## 20.3 Compete

**Add players, keep score, and see who knows the most.**

- 2–12 named players using shared player setup and saved-group convenience.
- Questions rotate in player order until the configured total is reached;
  totals are per session, not per player.
- Correct answer: +1. Incorrect answer: 0. No penalties, timers, speed bonuses,
  streaks, multipliers, or power-ups.
- Flow: `Ready → Question → AnswerReveal → Question → … → Result`; public
  trivia does not require a private handoff between competitive turns.
- Highest score wins. Ties are allowed and every first-place player is shown
  equally. Result actions are Play again, Change setup, and Home.
- Rematches reshuffle answers and prefer questions not used recently.

## 20.4 Shared answering rules

- Every question displays exactly four large answers labeled A–D.
- Selecting an answer locks all choices and immediately enters the reveal
  phase without advancing to the next question.
- Reveal visibly marks the selected answer and correct answer with icons/shapes
  as well as color, plays setting-aware sound/haptics, and may show an optional
  explanation.
- The group advances explicitly after reacting; there is no timed auto-advance.
- Question hierarchy is current player (Compete only), category · difficulty,
  question, four choices, and `Question N of total`.

## 20.5 Categories and difficulty

Categories are multi-select with All Categories convenience:

1. General Knowledge
2. Ethiopia & Culture
3. Entertainment & Pop Culture
4. Football
5. Sports
6. Geography & Places
7. Food & Drink
8. History
9. Animals & Nature
10. Science & Technology

Football stays separate from Sports. Difficulty is Easy, Medium, Hard, or
Mixed (default). Ethiopian content belongs both in Ethiopia & Culture and,
using an `Ethiopian` tag, naturally inside Football, Entertainment, Food,
Geography, Sports, and other relevant subjects. The library should feel
Ethiopian and global rather than Ethiopia-only.

## 20.6 Offline content schema

Each active question has a stable ID, bilingual question and answer fields,
one correct answer, exactly three unique incorrect answers, category,
difficulty, optional tags and explanation, and optional provenance metadata:
`source_name`, `source_url`, `source_license`, `verified_at`.

Displayed answers are shuffled for every question. Correctness is carried as
metadata and never inferred from array position after shuffling. English,
Amharic, and Mixed use the shared content-language setting.

At session creation, filter category then difficulty (unless Mixed), prefer
unseen/recently-unused questions, shuffle, and take the requested total. If the
eligible pool is smaller than the request, use every eligible question before
reshuffling and recycling; never fail or create an unusable session.

Validation rejects duplicate IDs, unknown categories, invalid difficulty,
empty questions or correct answers, any count other than three incorrect
answers, duplicate choices, incomplete Amharic arrays, non-boolean `active`,
and malformed optional metadata.

# 21. Research Basis

This specification follows familiar versions of these games rather than copying any single app’s exact wording, interface, artwork, or proprietary content.

Key references consulted:

- Splash’s public app-store description for its one-device, offline, group-game positioning and descriptions of Impostor, Who’s the Liar?, Who’s Most Likely To, Would You Rather, and Taboom.
- Hasbro’s official Taboo product instructions for the classic target-word, forbidden-word, team, timer, violation, and scoring structure.
- Public Impostor game rules for private role reveal, clue rounds, voting, and the caught-Impostor final guess.
- Public Who’s the Liar rules describing one different question and group voting.
- Common Who’s Most Likely To rules using simultaneous pointing and no required winner.
- Common Would You Rather rules using two forced choices and optional explanation or debate.
- Splash’s public listing and common hot-potato word games for the category,
  answer, pass, and hidden-explosion loop used by Who’s Got the Bomb?.

### Reference links

- https://play.google.com/store/apps/details?id=app.cranberry.splash
- https://instructions.hasbro.com/en-us/instruction/taboo-game-instructions
- https://www.imposterofficial.com/how-to-play.html
- https://www.whostheliar.com/
- https://pickmeupgame.com/blogs/pick-me-up-blog/how-to-play-who-s-most-likely-to-game-rules-and-party-setup
- https://wouldyourather.app/how-to-play-would-you-rather/
