import { readFile } from 'node:fs/promises';

const decks = [
  ['Impostor', 'content/impostor/words.en.json', ['word_en']],
  ["Who's the Liar", 'content/whos_the_liar/pairs.en.json', ['main_question_en', 'liar_question_en']],
  ['Taboo', 'content/taboo/cards.en.json', ['target_en', 'forbidden_en']],
  ["Who's Most Likely", 'content/most_likely/prompts.en.json', ['prompt_en']],
  ['Would You Rather', 'content/would_you_rather/dilemmas.en.json', ['option_a_en', 'option_b_en']],
  ["Who's Got the Bomb", 'content/bomb/cards.json', ['prompt_en']],
];

let failed = false;
for (const [name, path, required] of decks) {
  const cards = JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
  const ids = new Set();
  const levels = { family: 0, friends: 0, spicy: 0 };
  for (const [index, card] of cards.entries()) {
    const missing = ['id', 'category_id', 'content_level', 'active', ...required].filter((key) => card[key] === undefined || card[key] === '');
    if (missing.length) { console.error(`${path}[${index}] missing ${missing.join(', ')}`); failed = true; }
    if (ids.has(card.id)) { console.error(`${path}: duplicate id ${card.id}`); failed = true; }
    ids.add(card.id);
    if (!(card.content_level in levels)) { console.error(`${path}: invalid level ${card.content_level}`); failed = true; }
    else levels[card.content_level] += 1;
    if (required.includes('forbidden_en') && (!Array.isArray(card.forbidden_en) || card.forbidden_en.length < 3)) { console.error(`${path}: ${card.id} needs at least 3 forbidden words`); failed = true; }
  }
  console.log(`${name}: ${cards.length} cards · family ${levels.family} · friends ${levels.friends} · spicy ${levels.spicy}`);
}

if (failed) process.exitCode = 1;
