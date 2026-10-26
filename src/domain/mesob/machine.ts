import { pickGimbarDeck } from '../../content/gimbar';
import { localizeText } from '../../content/localize';
import { createId, otherTeam, playerName, shuffle, splitTeams } from '../shared/utils';
import {
  MESOB_MAX_PLAYERS,
  MESOB_MIN_CARRY_MS,
  MESOB_MIN_PLAYERS,
  type ContentLanguage,
  type MesobRound,
  type MesobSession,
  type MesobSetup,
  type MesobSlip,
  type TeamId,
} from './types';

export const MESOB_SLIP_MAX_LENGTH = 40;

export function normalizeSlip(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, MESOB_SLIP_MAX_LENGTH);
}

function slipKey(text: string): string {
  return normalizeSlip(text).toLowerCase();
}

export function createMesobSession(
  setup: MesobSetup,
  contentLanguage: ContentLanguage = 'en',
  sessionId: string = createId('sess'),
): MesobSession | { error: string } {
  if (setup.players.length < MESOB_MIN_PLAYERS || setup.players.length > MESOB_MAX_PLAYERS) {
    return { error: `Mesob needs ${MESOB_MIN_PLAYERS}–${MESOB_MAX_PLAYERS} players on two teams.` };
  }
  if (setup.players.some((player) => !player.displayName.trim())) {
    return { error: 'Every player needs a name.' };
  }
  if (setup.contentLevels.length === 0) return { error: 'Pick at least one content level.' };

  const { teamA, teamB } = splitTeams(setup.players);
  return {
    sessionId,
    setup,
    contentLanguage,
    phase: 'entry_handoff',
    teamA,
    teamB,
    scores: { a: 0, b: 0 },
    activeTeam: 'a',
    describerIndex: { a: 0, b: 0 },
    entryOrder: setup.players.map((player) => player.id),
    entryIndex: 0,
    slips: [],
    round: 1,
    basket: [],
    currentSlipId: null,
    turnGuessed: [],
    turnSkips: 0,
    carryMs: null,
    turnMs: setup.turnSeconds * 1000,
    winner: null,
  };
}

export function rematchMesobSession(session: MesobSession) {
  return createMesobSession(session.setup, session.contentLanguage, session.sessionId);
}

export function getMesobPlayerName(session: MesobSession, playerId: string): string {
  return playerName(session.setup.players, playerId);
}

export function teamIds(session: MesobSession, team: TeamId): string[] {
  return team === 'a' ? session.teamA : session.teamB;
}

export function currentWriterId(session: MesobSession): string | null {
  return session.entryOrder[session.entryIndex] ?? null;
}

export function currentDescriberId(session: MesobSession): string | null {
  const ids = teamIds(session, session.activeTeam);
  if (ids.length === 0) return null;
  return ids[session.describerIndex[session.activeTeam] % ids.length] ?? null;
}

export function slipById(session: MesobSession, slipId: string | null): MesobSlip | null {
  if (!slipId) return null;
  return session.slips.find((slip) => slip.id === slipId) ?? null;
}

/** True when this text is already in the basket (case and spacing ignored). */
export function isDuplicateSlip(session: MesobSession, text: string): boolean {
  const key = slipKey(text);
  return !!key && session.slips.some((slip) => slipKey(slip.text) === key);
}

function deckSlips(session: MesobSession, count: number, taken: MesobSlip[]): MesobSlip[] {
  if (count <= 0) return [];
  const used = new Set(taken.map((slip) => slipKey(slip.text)));
  const deck = pickGimbarDeck({
    categoryIds: session.setup.categoryIds,
    contentLevels: session.setup.contentLevels,
    contentLanguage: session.contentLanguage,
  });
  const result: MesobSlip[] = [];
  for (const card of deck) {
    if (result.length >= count) break;
    const text = normalizeSlip(
      localizeText(session.contentLanguage, { en: card.text_en, am: card.text_am }),
    );
    const key = slipKey(text);
    if (!key || used.has(key)) continue;
    used.add(key);
    result.push({ id: createId('slip'), text, authorId: null });
  }
  return result;
}

function finishEntries(session: MesobSession, slips: MesobSlip[]): MesobSession {
  const topUp = session.setup.deckTopUp
    ? deckSlips(session, session.setup.players.length * 2, slips)
    : [];
  const all = [...slips, ...topUp];
  return {
    ...session,
    slips: all,
    entryIndex: session.entryOrder.length,
    round: 1,
    basket: shuffle(all.map((slip) => slip.id)),
    phase: 'round_intro',
  };
}

function advanceWriter(session: MesobSession, slips: MesobSlip[]): MesobSession {
  const entryIndex = session.entryIndex + 1;
  if (entryIndex >= session.entryOrder.length) return finishEntries(session, slips);
  return { ...session, slips, entryIndex, phase: 'entry_handoff' };
}

export function beginEntry(session: MesobSession): MesobSession {
  if (session.phase !== 'entry_handoff') return session;
  return { ...session, phase: 'entry' };
}

/** Adds the writer's slips. Blank and duplicate slips are dropped. */
export function submitSlips(session: MesobSession, texts: string[]): MesobSession {
  if (session.phase !== 'entry') return session;
  const writerId = currentWriterId(session);
  const slips = [...session.slips];
  for (const raw of texts) {
    const text = normalizeSlip(raw);
    if (!text || slips.some((slip) => slipKey(slip.text) === slipKey(text))) continue;
    slips.push({ id: createId('slip'), text, authorId: writerId });
  }
  if (slips.length === session.slips.length) return session;
  return advanceWriter(session, slips);
}

/** The writer lets the deck choose for them. */
export function fillFromDeck(session: MesobSession): MesobSession {
  if (session.phase !== 'entry') return session;
  const added = deckSlips(session, session.setup.wordsPerPlayer, session.slips);
  return advanceWriter(session, [...session.slips, ...added]);
}

export function startRound(session: MesobSession): MesobSession {
  if (session.phase !== 'round_intro') return session;
  return { ...session, phase: 'turn_ready' };
}

export function beginTurn(session: MesobSession): MesobSession {
  if (session.phase !== 'turn_ready') return session;
  if (session.basket.length === 0) return session;
  return {
    ...session,
    phase: 'playing',
    currentSlipId: session.basket[0]!,
    turnGuessed: [],
    turnSkips: 0,
  };
}

function nextTurnState(session: MesobSession): Pick<MesobSession, 'activeTeam' | 'describerIndex'> {
  const team = session.activeTeam;
  return {
    activeTeam: otherTeam(team),
    describerIndex: { ...session.describerIndex, [team]: session.describerIndex[team] + 1 },
  };
}

function finalWinner(scores: Record<TeamId, number>): TeamId | 'tie' {
  if (scores.a === scores.b) return 'tie';
  return scores.a > scores.b ? 'a' : 'b';
}

/** `remainingMs` is the describer's time left, carried if the round ends now. */
export function markCorrect(session: MesobSession, remainingMs: number): MesobSession {
  if (session.phase !== 'playing' || !session.currentSlipId) return session;
  const slipId = session.currentSlipId;
  const basket = session.basket.filter((id) => id !== slipId);
  const scores = { ...session.scores, [session.activeTeam]: session.scores[session.activeTeam] + 1 };
  const guessed = {
    ...session,
    basket,
    scores,
    turnGuessed: [...session.turnGuessed, slipId],
  };

  if (basket.length > 0) return { ...guessed, currentSlipId: basket[0]! };

  if (session.round === 3) {
    return { ...guessed, currentSlipId: null, phase: 'final', winner: finalWinner(scores) };
  }

  const carry = remainingMs >= MESOB_MIN_CARRY_MS ? Math.round(remainingMs) : null;
  return {
    ...guessed,
    ...(carry === null ? nextTurnState(session) : null),
    round: (session.round + 1) as MesobRound,
    basket: shuffle(session.slips.map((slip) => slip.id)),
    currentSlipId: null,
    carryMs: carry,
    turnMs: carry ?? session.setup.turnSeconds * 1000,
    phase: 'round_intro',
  };
}

/** Puts the slip back at the bottom of the basket. */
export function markSkip(session: MesobSession): MesobSession {
  if (session.phase !== 'playing' || !session.currentSlipId) return session;
  if (session.basket.length < 2) return session;
  const slipId = session.currentSlipId;
  const basket = [...session.basket.filter((id) => id !== slipId), slipId];
  return { ...session, basket, currentSlipId: basket[0]!, turnSkips: session.turnSkips + 1 };
}

export function pauseTurn(session: MesobSession): MesobSession {
  if (session.phase !== 'playing') return session;
  return { ...session, phase: 'paused' };
}

export function resumeTurn(session: MesobSession): MesobSession {
  if (session.phase !== 'paused') return session;
  return { ...session, phase: 'playing' };
}

export function expireTurn(session: MesobSession): MesobSession {
  if (session.phase !== 'playing' && session.phase !== 'paused') return session;
  return { ...session, phase: 'turn_summary', currentSlipId: null };
}

/** A slip marked by mistake goes back into the basket. */
export function undoGuess(session: MesobSession, slipId: string): MesobSession {
  if (session.phase !== 'turn_summary' || !session.turnGuessed.includes(slipId)) return session;
  const team = session.activeTeam;
  return {
    ...session,
    turnGuessed: session.turnGuessed.filter((id) => id !== slipId),
    scores: { ...session.scores, [team]: Math.max(0, session.scores[team] - 1) },
    basket: [...session.basket, slipId],
  };
}

export function confirmTurn(session: MesobSession): MesobSession {
  if (session.phase !== 'turn_summary') return session;
  return {
    ...session,
    ...nextTurnState(session),
    carryMs: null,
    turnMs: session.setup.turnSeconds * 1000,
    turnGuessed: [],
    turnSkips: 0,
    phase: 'turn_ready',
  };
}
