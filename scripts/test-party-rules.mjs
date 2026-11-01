/** Focused regression checks for fair turns, hidden answers and factual decks. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const modules = new Map();
const storage = { getItem: async () => null, setItem: async () => {}, multiRemove: async () => {} };
function load(file) {
  if (modules.has(file)) return modules.get(file).exports;
  const module = { exports: {} };
  modules.set(file, module);
  const localRequire = (id) => {
    if (id === '@react-native-async-storage/async-storage') return storage;
    if (!id.startsWith('.')) return require(id);
    const base = resolve(dirname(file), id);
    const target = [base, `${base}.ts`, `${base}.tsx`, `${base}.json`].find((p) => existsSync(p) && statSync(p).isFile());
    assert.ok(target, `Resolve ${id}`);
    return target.endsWith('.json') ? JSON.parse(readFileSync(target, 'utf8')) : load(target);
  };
  const compiled = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`, { filename: file })(localRequire, module, module.exports);
  return module.exports;
}
const domain = (name) => load(resolve(root, `src/domain/${name}/machine.ts`));
const players = (count) => Array.from({ length: count }, (_, i) => ({ id: `p${i}`, displayName: `Player ${i + 1}` }));
const base = { players: players(2), categoryIds: ['animals'], contentLevels: ['family'], spicyAcknowledged: false };

// Result explanations must match distinct endings, especially draws and give-up.
const reasons = load(resolve(root, 'src/domain/shared/resultReasons.ts'));
const resultBase = { setup: { players: players(4) }, accusedPlayerId: null };
assert.match(reasons.impostorResultReason({ ...resultBase, winner: 'crew' }), /caught every Impostor/);
assert.match(reasons.impostorResultReason({ ...resultBase, winner: 'impostor' }), /could not agree/);
assert.match(reasons.impostorResultReason({ ...resultBase, winner: 'impostor', accusedPlayerId: 'p1', accusedIsImpostor: false }), /Player 2 was innocent/);
assert.match(reasons.impostorResultReason({ ...resultBase, winner: 'impostor', accusedPlayerId: 'p1', accusedIsImpostor: true }), /correctly guessed/);
assert.match(reasons.liarResultReason({ ...resultBase, winner: 'group' }), /different question/);
assert.match(reasons.liarResultReason({ ...resultBase, winner: 'liar' }), /could not agree/);
assert.match(reasons.liarResultReason({ ...resultBase, winner: 'liar', accusedPlayerId: 'p1' }), /Player 2 had the common question/);
const unsolved = reasons.insiderResult({ ...resultBase, winner: 'nobody' });
assert.equal(unsolved.title, 'Word not found');
assert.doesNotMatch(unsolved.detail, /time ran out|timer expired/i, 'Give-up and timeout share one machine outcome');
assert.match(reasons.insiderResult({ ...resultBase, winner: 'commons' }).detail, /Master and the Commons win/);
assert.match(reasons.insiderResult({ ...resultBase, winner: 'insider', accusedPlayerId: 'p1' }).detail, /Player 2 was innocent/);
assert.match(reasons.winkResultReason({ winner: 'citizens' }), /Every Killer/);
assert.match(reasons.winkResultReason({ winner: 'killers', setup: { detective: true }, detectiveGuessesLeft: 0 }), /every guess/);
assert.match(reasons.winkResultReason({ winner: 'killers', setup: { detective: true }, detectiveGuessesLeft: 2 }), /No Citizens remained/);
assert.match(reasons.winkResultReason({ winner: 'killers', setup: { detective: false } }), /one Citizen left/);
const draw = { winner: 'tie', scores: { a: 9, b: 4 }, turnsCompleted: { a: 2, b: 1 } };
assert.match(reasons.tabooResultReason(draw), /before both teams could finish equal turns/);
assert.match(reasons.tabooResultReason({ ...draw, scores: { a: 9, b: 9 }, turnsCompleted: { a: 2, b: 2 } }), /Both teams finished on 9/);
console.log('PASS Results: accurate caught, escaped, give-up, detective and draw explanations');

const mn = domain('manNegn');
let man = mn.createManNegnSession(base);
assert.ok(!('error' in man));
for (let i = 0; i < 2; i += 1) { man = mn.revealOthers(man); man = mn.hideAndContinue(man); }
const first = man.activePlayerId;
const identity = man.assignments[first].id;
man = mn.answerYes(man);
assert.equal(man.turnQuestions, 1);
man = mn.startReview(man); man = mn.revealReview(man); man = mn.finishReview(man);
assert.equal(man.turnQuestions, 1);
man = mn.startGuess(man); man = mn.resolveGuess(man, false);
assert.equal(man.phase, 'guess_result');
assert.equal(man.statuses[first], 'playing');
assert.equal(man.lives[first], 1);
assert.deepEqual(mn.resolveGuess(man, true), man, 'Verdicts cannot be applied twice');
man = mn.continueAfterGuess(man); man = mn.answerNo(man);
assert.equal(man.activePlayerId, first);
assert.equal(man.assignments[first].id, identity);
man = mn.startGuess(man); man = mn.resolveGuess(man, false);
assert.equal(man.statuses[first], 'out');
man = mn.continueAfterGuess(man);
assert.notEqual(man.activePlayerId, first);
man = mn.startGuess(man); man = mn.resolveGuess(man, true); man = mn.continueAfterGuess(man);
assert.equal(man.phase, 'result');
assert.equal(man.finishOrder.length, 1);
console.log('PASS Man Negn: chances, review, terminal reveal stages and elimination');

const quiz = domain('quiz');
const quizCategories = JSON.parse(readFileSync(resolve(root, 'content/categories/quiz.json'), 'utf8')).map((c) => c.id);
for (const count of [2, 3, 5, 12]) {
  let session = quiz.createQuizSession({ ...base, players: players(count), categoryIds: quizCategories, playMode: 'compete', questionCount: 10, roundsPerPlayer: 3, difficulty: 'mixed' });
  assert.ok(!('error' in session));
  assert.equal(session.questions.length, count * 3);
  for (let round = 0; round < 3; round += 1) assert.equal(new Set(session.questions.slice(round * count, (round + 1) * count).map((q) => q.difficulty)).size, 1);
  const turns = Object.fromEntries(players(count).map((p) => [p.id, 0]));
  session = quiz.beginQuiz(session);
  while (session.phase !== 'result') {
    turns[quiz.currentQuizPlayer(session).id] += 1;
    session = quiz.selectQuizAnswer(session, session.currentAnswers.find((a) => a.correct).id);
    session = quiz.continueAfterReveal(session);
  }
  assert.ok(Object.values(turns).every((turns) => turns === 3));
  assert.ok(Object.values(session.scores).every((score) => score === 3));
  assert.equal(quiz.rematchQuiz(session).openingPlayerIndex, 1);
}
console.log('PASS Quiz: equal opportunities, matched difficulty, scoring and rotating starter');

const ewContent = load(resolve(root, 'src/content/ewnetWeysSaks.ts'));
const ew = domain('ewnetWeysSaks');
for (const category of ewContent.getEwnetCategories()) {
  const query = { categoryIds: [category.id], contentLevels: ['family', 'friends'], contentLanguage: 'en' };
  const deck = ewContent.buildEwnetDeck(query, 10);
  assert.equal(deck.length, Math.min(10, ewContent.countEwnetQuestions(query)));
  assert.equal(new Set(deck.map((q) => q.id)).size, deck.length);
}
let ewnet = ew.createEwnetSession({ ...base, players: players(3), categoryIds: ['science_technology'], roundCount: 3 });
ewnet = ew.startBluffs(ewnet);
let knownPlayer;
for (let index = 0; index < 3; index += 1) {
  ewnet = ew.readyForPrivateStep(ewnet);
  if (!index) knownPlayer = ew.currentBlufferId(ewnet);
  ewnet = ew.submitBluff(ewnet, index === 0 ? ew.currentQuestion(ewnet).answer_en : `Original bluff ${index}`);
}
assert.equal(ewnet.answers.filter((a) => a.isTruth).length, 1);
assert.deepEqual(ewnet.knownTruthIds, [knownPlayer]);
for (let index = 0; index < 3; index += 1) {
  ewnet = ew.readyForPrivateStep(ewnet);
  assert.ok(ew.voteOptions(ewnet).every((a) => a.authorId !== ew.currentVoterId(ewnet)));
  ewnet = ew.castVote(ewnet, ewnet.answers.find((a) => a.isTruth).id);
}
assert.ok(Object.values(ewnet.scores).every((score) => score === 2), 'Known truth is awarded once, never twice');
assert.equal(ewnet.phase, 'round_result');
console.log('PASS Ewnet: unique facts, merged truth, no self-votes and no double scoring');

const history = load(resolve(root, 'src/storage/contentHistory.ts'));
const manContent = load(resolve(root, 'src/content/manNegn.ts'));
const hiddenQuestion = ewnet.deck[0].id;
history.reportCard('ewnet_weys_saks', hiddenQuestion);
assert.ok(!ewContent.buildEwnetDeck({ categoryIds: ['science_technology'], contentLevels: ['family'], contentLanguage: 'en' }, 100).some((q) => q.id === hiddenQuestion));
const hiddenIdentity = man.assignments[first].id;
history.reportCard('man_negn', hiddenIdentity);
assert.ok(!manContent.getManNegnIdentities({ ...base, contentLanguage: 'en' }).some((q) => q.id === hiddenIdentity));
console.log('PASS Content: reported facts and identities stay hidden');
