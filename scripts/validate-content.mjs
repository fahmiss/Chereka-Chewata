import { readFile } from 'node:fs/promises';

const decks = [
  ['Impostor', 'content/impostor/words.en.json', 'content/categories/impostor.json', ['word_en']],
  ["Who's the Liar", 'content/whos_the_liar/pairs.en.json', 'content/categories/whos_the_liar.json', ['main_question_en', 'liar_question_en']],
  ['Taboo', 'content/taboo/cards.en.json', 'content/categories/taboo.json', ['target_en', 'forbidden_en']],
  ["Who's Most Likely", 'content/most_likely/prompts.en.json', 'content/categories/most_likely.json', ['prompt_en']],
  ['Would You Rather', 'content/would_you_rather/dilemmas.en.json', 'content/categories/would_you_rather.json', ['option_a_en', 'option_b_en']],
  ["Who's Got the Bomb", 'content/bomb/cards.json', 'content/categories/bomb.json', ['prompt_en']],
];

let failed = false;
for (const [name, path, categoriesPath, required] of decks) {
  const cards = JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
  const categories = JSON.parse(await readFile(new URL(`../${categoriesPath}`, import.meta.url), 'utf8'));
  const categoryIds = new Set(categories.map((category) => category.id));
  const ids = new Set();
  const levels = { family: 0, friends: 0, spicy: 0 };
  for (const [index, card] of cards.entries()) {
    const missing = ['id', 'category_id', 'content_level', 'active', ...required].filter((key) => card[key] === undefined || card[key] === '');
    if (missing.length) { console.error(`${path}[${index}] missing ${missing.join(', ')}`); failed = true; }
    if (ids.has(card.id)) { console.error(`${path}: duplicate id ${card.id}`); failed = true; }
    ids.add(card.id);
    if (card.category_id && !categoryIds.has(card.category_id)) { console.error(`${path}: ${card.id} has unknown category_id ${card.category_id}`); failed = true; }
    if (!(card.content_level in levels)) { console.error(`${path}: invalid level ${card.content_level}`); failed = true; }
    else levels[card.content_level] += 1;
    if (required.includes('forbidden_en') && (!Array.isArray(card.forbidden_en) || card.forbidden_en.length < 3)) { console.error(`${path}: ${card.id} needs at least 3 forbidden words`); failed = true; }
  }
  console.log(`${name}: ${cards.length} cards · family ${levels.family} · friends ${levels.friends} · spicy ${levels.spicy}`);
}

{
  const path = 'content/quiz/questions.json';
  const categoriesPath = 'content/categories/quiz.json';
  const cards = JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
  const categories = JSON.parse(await readFile(new URL(`../${categoriesPath}`, import.meta.url), 'utf8'));
  const categoryIds = new Set();
  const ids = new Set();
  const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
  const optionalSources = ['source_name', 'source_url', 'source_license', 'verified_at'];

  if (!Array.isArray(categories) || !Array.isArray(cards)) {
    console.error('Quiz categories and questions must both be JSON arrays.');
    failed = true;
  } else {
    for (const [index, category] of categories.entries()) {
      if (!category || typeof category !== 'object' || Array.isArray(category)) {
        console.error(`${categoriesPath}[${index}] must be an object`);
        failed = true;
        continue;
      }
      if (typeof category.id !== 'string' || !category.id.trim()) {
        console.error(`${categoriesPath}[${index}] needs a non-empty id`);
        failed = true;
      } else if (categoryIds.has(category.id)) {
        console.error(`${categoriesPath}: duplicate id ${category.id}`);
        failed = true;
      } else {
        categoryIds.add(category.id);
      }
      if (typeof category.name_en !== 'string' || !category.name_en.trim()) {
        console.error(`${categoriesPath}[${index}] needs name_en`);
        failed = true;
      }
      if (typeof category.active !== 'boolean') {
        console.error(`${categoriesPath}[${index}] active must be boolean`);
        failed = true;
      }
    }

    for (const [index, card] of cards.entries()) {
      const label = `${path}[${index}]`;
      if (!card || typeof card !== 'object' || Array.isArray(card)) {
        console.error(`${label} must be an object`);
        failed = true;
        continue;
      }

      if (typeof card.id !== 'string' || !card.id.trim()) {
        console.error(`${label} needs a non-empty id`);
        failed = true;
      } else if (ids.has(card.id)) {
        console.error(`${path}: duplicate id ${card.id}`);
        failed = true;
      } else {
        ids.add(card.id);
      }

      if (!categoryIds.has(card.category_id)) {
        console.error(`${path}: ${card.id ?? label} has unknown category_id ${card.category_id}`);
        failed = true;
      }
      if (!(card.difficulty in difficultyCounts)) {
        console.error(`${path}: ${card.id ?? label} has invalid difficulty ${card.difficulty}`);
        failed = true;
      } else {
        difficultyCounts[card.difficulty] += 1;
      }
      if (typeof card.active !== 'boolean') {
        console.error(`${path}: ${card.id ?? label} active must be boolean`);
        failed = true;
      }

      for (const key of ['question_en', 'correct_answer_en']) {
        if (typeof card[key] !== 'string' || !card[key].trim()) {
          console.error(`${path}: ${card.id ?? label} needs non-empty ${key}`);
          failed = true;
        }
      }

      const wrong = card.incorrect_answers_en;
      if (!Array.isArray(wrong) || wrong.length !== 3 || wrong.some((item) => typeof item !== 'string' || !item.trim())) {
        console.error(`${path}: ${card.id ?? label} needs exactly 3 non-empty incorrect_answers_en`);
        failed = true;
      } else {
        const normalizedWrong = wrong.map((item) => item.trim().toLocaleLowerCase('en'));
        if (new Set(normalizedWrong).size !== 3) {
          console.error(`${path}: ${card.id ?? label} has duplicate incorrect answers`);
          failed = true;
        }
        const correct = typeof card.correct_answer_en === 'string'
          ? card.correct_answer_en.trim().toLocaleLowerCase('en')
          : '';
        if (normalizedWrong.includes(correct)) {
          console.error(`${path}: ${card.id ?? label} repeats the correct answer among incorrect answers`);
          failed = true;
        }
      }

      if (card.incorrect_answers_am !== undefined) {
        if (
          !Array.isArray(card.incorrect_answers_am) ||
          card.incorrect_answers_am.length !== 3 ||
          card.incorrect_answers_am.some((item) => typeof item !== 'string' || !item.trim())
        ) {
          console.error(`${path}: ${card.id ?? label} needs exactly 3 non-empty incorrect_answers_am when present`);
          failed = true;
        }
      }
      const hasAnyAmharic = ['question_am', 'correct_answer_am', 'incorrect_answers_am']
        .some((key) => card[key] !== undefined);
      if (
        hasAnyAmharic &&
        (
          typeof card.question_am !== 'string' || !card.question_am.trim() ||
          typeof card.correct_answer_am !== 'string' || !card.correct_answer_am.trim() ||
          !Array.isArray(card.incorrect_answers_am) || card.incorrect_answers_am.length !== 3
        )
      ) {
        console.error(`${path}: ${card.id ?? label} has an incomplete Amharic answer set`);
        failed = true;
      }

      if (card.tags !== undefined && (!Array.isArray(card.tags) || card.tags.some((tag) => typeof tag !== 'string' || !tag.trim()))) {
        console.error(`${path}: ${card.id ?? label} tags must be non-empty strings`);
        failed = true;
      }
      for (const key of optionalSources) {
        if (card[key] !== undefined && card[key] !== null && typeof card[key] !== 'string') {
          console.error(`${path}: ${card.id ?? label} ${key} must be a string or null`);
          failed = true;
        }
      }
    }
  }

  console.log(`Quiz: ${cards.length} questions · easy ${difficultyCounts.easy} · medium ${difficultyCounts.medium} · hard ${difficultyCounts.hard}`);
}

if (failed) process.exitCode = 1;
