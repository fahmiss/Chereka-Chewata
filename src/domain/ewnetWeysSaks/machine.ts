import { buildEwnetDeck } from '../../content/ewnetWeysSaks';
import { createId, playerName, shuffle } from '../shared/utils';
import { recordPlayed } from '../../storage/contentHistory';
import {
  EWNET_MAX_PLAYERS,
  EWNET_MIN_PLAYERS,
  type ContentLanguage,
  type EwnetAnswer,
  type EwnetSession,
  type EwnetSetup,
} from './types';

const normalize = (value: string) =>
  value.trim().toLocaleLowerCase().replace(/[’']/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/^(a|an|the) /, '');

const NUMBER_WORDS: Record<string, string> = { zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10', eleven: '11', twelve: '12', thirteen: '13' };
function matchesTruth(session: EwnetSession, raw: string) {
  const value = normalize(raw);
  const truth = normalize(currentQuestion(session).answer_en);
  return (NUMBER_WORDS[value] ?? value) === (NUMBER_WORDS[truth] ?? truth);
}

export function createEwnetSession(
  setup: EwnetSetup,
  contentLanguage: ContentLanguage = 'en',
  sessionId = createId('sess'),
): EwnetSession | { error: string } {
  if (setup.players.length < EWNET_MIN_PLAYERS || setup.players.length > EWNET_MAX_PLAYERS) {
    return { error: `Ewnet weys Saks needs ${EWNET_MIN_PLAYERS}–${EWNET_MAX_PLAYERS} players.` };
  }
  if (setup.players.some((player) => !player.displayName.trim())) {
    return { error: 'Every player needs a name.' };
  }
  const deck = buildEwnetDeck(
    { categoryIds: setup.categoryIds, contentLevels: setup.contentLevels, contentLanguage },
    setup.roundCount,
  );
  if (!deck.length) return { error: 'No questions match this setup.' };
  const ids = setup.players.map((player) => player.id);
  recordPlayed('ewnet_weys_saks', deck[0]!.id);
  return {
    sessionId,
    setup,
    contentLanguage,
    phase: 'round_intro',
    deck,
    roundIndex: 0,
    bluffOrder: shuffle(ids),
    bluffIndex: 0,
    bluffs: {},
    knownTruthIds: [],
    answers: [],
    voteOrder: [],
    voteIndex: 0,
    votes: {},
    scores: Object.fromEntries(ids.map((id) => [id, 0])),
  };
}

export function rematchEwnetSession(session: EwnetSession) {
  return createEwnetSession(session.setup, session.contentLanguage, session.sessionId);
}

export const currentQuestion = (session: EwnetSession) => session.deck[session.roundIndex]!;
export const currentBlufferId = (session: EwnetSession) => session.bluffOrder[session.bluffIndex] ?? null;
export const currentVoterId = (session: EwnetSession) => session.voteOrder[session.voteIndex] ?? null;
export const ewnetPlayerName = (session: EwnetSession, id: string | null) =>
  playerName(session.setup.players, id);

export function startBluffs(session: EwnetSession): EwnetSession {
  if (session.phase !== 'round_intro') return session;
  return { ...session, phase: 'bluff_handoff' };
}

export function readyForPrivateStep(session: EwnetSession): EwnetSession {
  if (session.phase === 'bluff_handoff') return { ...session, phase: 'bluff_entry' };
  if (session.phase === 'vote_handoff') return { ...session, phase: 'vote_select' };
  return session;
}

export function validateBluff(session: EwnetSession, raw: string): string | null {
  const value = normalize(raw);
  if (!value) return 'Write a believable answer first.';
  if (!matchesTruth(session, raw) && Object.values(session.bluffs).some((item) => normalize(item) === value)) {
    return 'That answer is already in the mix. Try another.';
  }
  return null;
}

export function submitBluff(session: EwnetSession, raw: string): EwnetSession {
  if (session.phase !== 'bluff_entry' || validateBluff(session, raw)) return session;
  const playerId = currentBlufferId(session);
  if (!playerId) return session;
  const bluffs = { ...session.bluffs, [playerId]: raw.trim() };
  const bluffIndex = session.bluffIndex + 1;
  if (bluffIndex < session.bluffOrder.length) {
    return { ...session, bluffs, bluffIndex, phase: 'bluff_handoff' };
  }
  const truth: EwnetAnswer = {
    id: `truth_${currentQuestion(session).id}`,
    text: currentQuestion(session).answer_en,
    authorId: null,
    isTruth: true,
  };
  const knownTruthIds = Object.entries(bluffs).filter(([, text]) => matchesTruth(session, text)).map(([id]) => id);
  const lies: EwnetAnswer[] = Object.entries(bluffs).filter(([id]) => !knownTruthIds.includes(id)).map(([authorId, text]) => ({
    id: `lie_${session.roundIndex}_${authorId}`,
    text,
    authorId,
    isTruth: false,
  }));
  return {
    ...session,
    bluffs,
    knownTruthIds,
    bluffIndex,
    answers: shuffle([truth, ...lies]),
    voteOrder: shuffle(session.setup.players.map((player) => player.id)),
    voteIndex: 0,
    votes: {},
    phase: 'vote_handoff',
  };
}

export function voteOptions(session: EwnetSession): EwnetAnswer[] {
  const voterId = currentVoterId(session);
  return session.answers.filter((answer) => answer.authorId !== voterId);
}

export function castVote(session: EwnetSession, answerId: string): EwnetSession {
  if (session.phase !== 'vote_select') return session;
  const voterId = currentVoterId(session);
  if (!voterId || !voteOptions(session).some((answer) => answer.id === answerId)) return session;
  const votes = { ...session.votes, [voterId]: answerId };
  const voteIndex = session.voteIndex + 1;
  if (voteIndex < session.voteOrder.length) {
    return { ...session, votes, voteIndex, phase: 'vote_handoff' };
  }
  const scores = { ...session.scores };
  for (const id of session.knownTruthIds) scores[id] = (scores[id] ?? 0) + 2;
  for (const [playerId, pickedId] of Object.entries(votes)) {
    const picked = session.answers.find((answer) => answer.id === pickedId);
    if (!picked) continue;
    if (picked.isTruth && !session.knownTruthIds.includes(playerId)) scores[playerId] = (scores[playerId] ?? 0) + 2;
    else if (picked.authorId) scores[picked.authorId] = (scores[picked.authorId] ?? 0) + 1;
  }
  return { ...session, votes, voteIndex, scores, phase: 'round_result' };
}

export function fooledCount(session: EwnetSession, answerId: string): number {
  return Object.values(session.votes).filter((picked) => picked === answerId).length;
}

export function nextRound(session: EwnetSession): EwnetSession {
  if (session.phase !== 'round_result') return session;
  const roundIndex = session.roundIndex + 1;
  if (roundIndex >= session.deck.length) return { ...session, phase: 'final' };
  recordPlayed('ewnet_weys_saks', session.deck[roundIndex]!.id);
  return {
    ...session,
    phase: 'round_intro',
    roundIndex,
    bluffOrder: shuffle(session.setup.players.map((player) => player.id)),
    bluffIndex: 0,
    bluffs: {},
    knownTruthIds: [],
    answers: [],
    voteOrder: [],
    voteIndex: 0,
    votes: {},
  };
}

export function ewnetStandings(session: EwnetSession) {
  return session.setup.players
    .map((player) => ({ ...player, score: session.scores[player.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);
}
