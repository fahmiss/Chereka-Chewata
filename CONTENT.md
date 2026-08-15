# Content guide

Bundled decks live under [`content/`](content/). Loaders in [`src/content/`](src/content/) filter by category, content level, language, and local suppressions.

## Current packs

| Game | Path | Status |
|---|---|---|
| Impostor categories | `content/categories/impostor.json` | 9 categories with `name_am` |
| Impostor words | `content/impostor/words.en.json` | 292 with `word_am` / `hint_am` (Family 223 · Friends 39 · Spicy 30) |
| Who’s the Liar categories | `content/categories/whos_the_liar.json` | 9 with `name_am` |
| Who’s the Liar pairs | `content/whos_the_liar/pairs.en.json` | 201 with `main_question_am` / `liar_question_am` |
| Taboo categories | `content/categories/taboo.json` | 10 with `name_am` |
| Taboo cards | `content/taboo/cards.en.json` | 370 with `target_am` / `forbidden_am` |
| Most Likely categories | `content/categories/most_likely.json` | 7 with `name_am` |
| Most Likely prompts | `content/most_likely/prompts.en.json` | 225 with `prompt_am` |
| Would You Rather categories | `content/categories/would_you_rather.json` | 10 with `name_am` |
| Would You Rather dilemmas | `content/would_you_rather/dilemmas.en.json` | 218 with `option_a_am` / `option_b_am` |
| Bomb categories | `content/categories/bomb.json` | 9 with `name_am` |
| Bomb category prompts | `content/bomb/cards.json` | 54 with `prompt_am` |
| Quiz categories | `content/categories/quiz.json` | 10 knowledge categories with `name_am` |
| Quiz questions | `content/quiz/questions.json` | 60 bilingual four-choice questions |

## Category taxonomy

Every game draws its categories from the same standardized vocabulary, so an
id like `food_and_drink` means the same thing and gets the same icon in every
game (see `CATEGORY_ICONS` in `app/game/[gameId]/setup/categories.tsx`). Not
every game exposes every category — each `content/categories/<game>.json`
lists only the ones relevant to that game, some starting empty (0 items) as
scaffolding for future content.

| id | name |
|---|---|
| `everyday_life` | Everyday Life |
| `food_and_drink` | Food & Drink |
| `entertainment_pop_culture` | Entertainment & Pop Culture |
| `football` | Football |
| `sports` | Sports |
| `places_and_travel` | Places & Travel |
| `school_and_work` | School & Work |
| `people_and_relationships` | People & Relationships |
| `ethiopia_and_culture` | Ethiopia & Culture |
| `animals_and_nature` | Animals & Nature |
| `random` | Random |

Ethiopian content is not confined to `ethiopia_and_culture` — Ethiopian foods,
artists, cities, and football clubs live inside the normal topic categories
alongside their international counterparts (e.g. Tibs sits in `food_and_drink`
next to Pizza). `ethiopia_and_culture` is reserved for content that's
specifically and only Ethiopian (Addis-specific local life, diaspora
experience, national culture) rather than a topic that merely has Ethiopian
examples.

### Tags

`tags?: string[]` on a content item is an optional sub-topic marker — it does
not replace `category_id` and an item still belongs to exactly one category.
Tags exist so a broad category (e.g. `people_and_relationships`) can still
distinguish Friends-flavored content from Family- or Dating-flavored content
without spawning a new top-level category per audience. Current tags in use:
`Friends`, `Family`, `Couples`, `Dating`, `Weddings`, `Work`, `Addis`,
`Diaspora`, `Ethiopian`, `Absurd`, `Deep`, `Funny`. There is no tag-filtering
UI yet — tags are metadata for now, available for a future filter/search
affordance.

Content levels (`family` / `friends` / `spicy`) are a separate axis from both
category and tags — see `app/game/[gameId]/setup/content-level.tsx`.

Quiz deliberately extends the shared social-card taxonomy with knowledge
subjects that do not make sense as maturity levels: `general_knowledge`,
`geography_places`, `history`, and `science_technology`. Its difficulty
(`easy` / `medium` / `hard` / setup-only `mixed`) measures knowledge difficulty
and must never be mapped to Family / Friends / Spicy. Football remains separate
from Sports. Ethiopian questions can carry an `Ethiopian` tag inside normal
subjects as well as living in `ethiopia_and_culture`.

## Content language

Settings / language gate: English, Amharic, Mixed.

All seven games filter and display via `localizeText` / `localizeList` and `settings.contentLanguage`.

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
  "category_id": "everyday_life",
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
  "category_id": "food_and_drink",
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
  "category_id": "food_and_drink",
  "tags": ["Ethiopian"],
  "content_level": "family",
  "difficulty": "easy",
  "active": true
}
```

`forbidden_am` must match `forbidden_en` length (index-aligned). Minimum usable: 150 cards (better: 300+).

## Content validation

Run `npm run validate:content` to catch duplicate IDs, missing fields, invalid
content levels, unknown `category_id`s (must exist in that game's
`content/categories/*.json`), and malformed Taboo forbidden-word lists.

## Adding Quiz questions

Quiz is offline-first and uses one correct answer plus exactly three incorrect
answers. Answer order is shuffled when each question is shown; correctness is
stored independently of array position.

```json
{
  "id": "quiz_geo_001",
  "question_en": "What is the capital of Kenya?",
  "question_am": "የኬንያ ዋና ከተማ ምንድን ነው?",
  "correct_answer_en": "Nairobi",
  "correct_answer_am": "ናይሮቢ",
  "incorrect_answers_en": ["Mombasa", "Kampala", "Dar es Salaam"],
  "incorrect_answers_am": ["ሞምባሳ", "ካምፓላ", "ዳሬሰላም"],
  "explanation_en": "Nairobi is the capital and largest city of Kenya.",
  "explanation_am": "ናይሮቢ የኬንያ ዋና ከተማ እና ትልቁ ከተማ ነው።",
  "category_id": "geography_places",
  "difficulty": "easy",
  "tags": ["africa"],
  "source_name": null,
  "source_url": null,
  "source_license": null,
  "verified_at": null,
  "active": true
}
```

Rules:

- Keep IDs stable after release.
- The three incorrect answers must be unique and must not repeat the correct answer.
- If Amharic answers are present, keep all three arrays index-aligned.
- `source_name`, `source_url`, `source_license`, and `verified_at` are optional
  metadata for future externally sourced content; they are not gameplay UI.
- Prefer durable facts. Time-sensitive facts require a source and a clear
  verification date.
- Quiz selection filters category and difficulty, prefers recent-history misses,
  and recycles only after the eligible pool is exhausted.

## Later games

Keep IDs stable once content ships.
