# Content guide

Bundled decks live under [`content/`](content/). Loaders in [`src/content/`](src/content/) filter by category, content level, language, and local suppressions.

## Current packs

| Game | Path | Status |
|---|---|---|
| Impostor categories | `content/categories/impostor.json` | English labels |
| Impostor words | `content/impostor/words.en.json` | ~190 English words (≥30 per category) |
| Who’s the Liar categories | `content/categories/whos_the_liar.json` | 9 MVP categories |
| Who’s the Liar pairs | `content/whos_the_liar/pairs.en.json` | 90 English question pairs |
| Taboo categories | `content/categories/taboo.json` | 9 MVP categories |
| Taboo cards | `content/taboo/cards.en.json` | 150 English cards (target + forbidden) |
| Most Likely categories | `content/categories/most_likely.json` | 9 MVP categories |
| Most Likely prompts | `content/most_likely/prompts.en.json` | 153 English prompts |
| Would You Rather categories | `content/categories/would_you_rather.json` | 10 MVP categories |
| Would You Rather dilemmas | `content/would_you_rather/dilemmas.en.json` | 50 English dilemmas |

## Adding Impostor words

Each item:

```json
{
  "id": "imp_food_006",
  "word_en": "Tibs",
  "category_id": "food_and_drink",
  "hint_en": "Sautéed meat",
  "difficulty": "easy",
  "content_level": "family",
  "active": true
}
```

Rules from the product spec:

- Family by default; Friends / Spicy must be intentional
- Easy mode: no obscure words
- Prefer ≥30 active words per visible category before playtests
- Launch target: 150+ Impostor words minimum, 300+ better

## Adding Who’s the Liar pairs

Each item:

```json
{
  "id": "liar_food_001",
  "main_question_en": "Which Ethiopian food could you eat every day?",
  "liar_question_en": "Which Ethiopian food would you never order?",
  "category_id": "food",
  "content_level": "family",
  "difficulty": "medium",
  "active": true
}
```

Rules:

- Answers should plausibly overlap so the Liar can blend in
- Avoid person-vs-object mismatch pairs
- Avoid single-correct-answer trivia
- Minimum usable: 80 pairs (better: 150+)

## Adding Taboo cards

Each item:

```json
{
  "id": "taboo_ethiopian_food_001",
  "target_en": "Coffee",
  "forbidden_en": ["Jebena", "Cup", "Drink", "Black", "Morning"],
  "category_id": "ethiopian_food",
  "content_level": "family",
  "difficulty": "easy",
  "active": true
}
```

Minimum usable: 150 cards (better: 300+).

## Content validation

Run `npm run validate:content` to catch duplicate IDs, missing fields, invalid
content levels, and malformed Taboo forbidden-word lists.

## Later games

Keep IDs stable once content ships.
