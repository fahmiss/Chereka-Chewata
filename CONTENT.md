# Content guide

Bundled decks live under [`content/`](content/). Loaders in [`src/content/`](src/content/) filter by category, content level, language, and local suppressions.

## Current packs

| Game | Path | Status |
|---|---|---|
| Impostor categories | `content/categories/impostor.json` | 7 categories with `name_am` (incl. Football) |
| Impostor words | `content/impostor/words.en.json` | 252 with `word_am` / `hint_am` (Family 183 · Friends 39 · Spicy 30) |
| Who’s the Liar categories | `content/categories/whos_the_liar.json` | 9 with `name_am` |
| Who’s the Liar pairs | `content/whos_the_liar/pairs.en.json` | 171 with `main_question_am` / `liar_question_am` |
| Taboo categories | `content/categories/taboo.json` | 9 with `name_am` |
| Taboo cards | `content/taboo/cards.en.json` | 330 with `target_am` / `forbidden_am` |
| Most Likely categories | `content/categories/most_likely.json` | 9 with `name_am` |
| Most Likely prompts | `content/most_likely/prompts.en.json` | 180 with `prompt_am` |
| Would You Rather categories | `content/categories/would_you_rather.json` | 10 with `name_am` |
| Would You Rather dilemmas | `content/would_you_rather/dilemmas.en.json` | 170 with `option_a_am` / `option_b_am` |
| Bomb categories | `content/categories/bomb.json` | 8 with `name_am` |
| Bomb category prompts | `content/bomb/cards.json` | 48 with `prompt_am` |

## Content language

Settings / language gate: English, Amharic, Mixed.

All six games filter and display via `localizeText` / `localizeList` and `settings.contentLanguage`.

- **Amharic** prefers `*_am` fields (falls back to English if missing)
- **Mixed** shows `አማርኛ · English` when both strings differ
- Ethiopic typefaces apply when content language is am/mixed

## Adding Who’s Got the Bomb? prompts

Each card is a category broad enough to produce several quick spoken answers:

```json
{
  "id": "bomb_day_001",
  "prompt_en": "Car brands",
  "prompt_am": "የመኪና ብራንዶች",
  "category_id": "everyday",
  "content_level": "family",
  "active": true
}
```

Avoid categories with only one or two obvious answers. Players judge answers
socially; the app does not maintain an answer dictionary.

## Adding Impostor words

Each item:

```json
{
  "id": "imp_food_006",
  "word_en": "Tibs",
  "word_am": "ጥብስ",
  "category_id": "food_and_drink",
  "hint_en": "Sautéed meat",
  "hint_am": "የተጠበሰ ሥጋ",
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

## Adding Who’s the Liar pairs

Each item:

```json
{
  "id": "liar_food_001",
  "main_question_en": "Which Ethiopian food could you eat every day?",
  "liar_question_en": "Which Ethiopian food would you never order?",
  "main_question_am": "የትኛውን የኢትዮጵያ ምግብ በየቀኑ መብላት ትችላለህ?",
  "liar_question_am": "የትኛውን የኢትዮጵያ ምግብ በፍጹም አታዝዝም?",
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
  "target_am": "ቡና",
  "forbidden_en": ["Jebena", "Cup", "Drink", "Black", "Morning"],
  "forbidden_am": ["ጀበና", "ስኒ", "መጠጥ", "ጥቁር", "ጠዋት"],
  "category_id": "ethiopian_food",
  "content_level": "family",
  "difficulty": "easy",
  "active": true
}
```

`forbidden_am` must match `forbidden_en` length (index-aligned). Minimum usable: 150 cards (better: 300+).

## Content validation

Run `npm run validate:content` to catch duplicate IDs, missing fields, invalid
content levels, and malformed Taboo forbidden-word lists.

## Later games

Keep IDs stable once content ships.
