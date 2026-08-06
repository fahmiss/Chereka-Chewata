# Content guide

Bundled decks live under [`content/`](content/). Loaders in [`src/content/`](src/content/) filter by category, content level, language, and local suppressions.

## Current packs

| Game | Path | Status |
|---|---|---|
| Impostor categories | `content/categories/impostor.json` | 7 categories (incl. Football) |
| Impostor words | `content/impostor/words.en.json` | 252 words with `word_am` / `hint_am` (Family 183 · Friends 39 · Spicy 30); Football 37 |
| Who’s the Liar categories | `content/categories/whos_the_liar.json` | 9 MVP categories |
| Who’s the Liar pairs | `content/whos_the_liar/pairs.en.json` | 171 English question pairs (Family 81 · Friends 70 · Spicy 20) |
| Taboo categories | `content/categories/taboo.json` | 9 MVP categories |
| Taboo cards | `content/taboo/cards.en.json` | 330 English cards (Family 184 · Friends 119 · Spicy 27) |
| Most Likely categories | `content/categories/most_likely.json` | 9 MVP categories |
| Most Likely prompts | `content/most_likely/prompts.en.json` | 180 English prompts (Family 50 · Friends 101 · Spicy 29) |
| Would You Rather categories | `content/categories/would_you_rather.json` | 10 MVP categories |
| Would You Rather dilemmas | `content/would_you_rather/dilemmas.en.json` | 170 English dilemmas (Family 74 · Friends 52 · Spicy 44) |

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
- Include `word_am` / `hint_am` for Amharic + Mixed content language

## Content language

Settings / language gate: English, Amharic, Mixed.

- **Impostor** reads `word_am` / `hint_am` (and category `name_am`)
- Other games still English-only until their Amharic packs ship
- Mixed Impostor secrets render as `አማርኛ · English` when both differ

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
