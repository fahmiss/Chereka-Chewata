import { localizeText } from '../../content/localize';
import { pickMizanDeck } from '../../content/mizan';
import { recordPlayed } from '../../storage/contentHistory';
import { createId, otherTeam, playerName, shuffle, splitTeams } from '../shared/utils';
import {
  MIZAN_BANDS,
  MIZAN_MAX_PLAYERS,
  MIZAN_MAX_POINTS,
  MIZAN_MIN_PLAYERS,
  MIZAN_TEAMS_MIN_PLAYERS,
  type ContentLanguage,
  type MizanCall,
  type MizanSession,
  type MizanSetup,
  type MizanSpectrum,
  type TeamId,
} from './types';

/** Targets stay off the very ends so the whole scoring wedge fits on the dial. */
function randomTarget(): number {
  return Math.round(4 + Math.random() * 92);
}

export function clampDial(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function scoreGuess(target: number, guess: number): number {
  const distance = Math.abs(target - guess);
  return MIZAN_BANDS.find((band) => distance <= band.within)?.points ?? 0;
}

function drawSpectrum(
  deck: MizanSpectrum[],
  deckIndex: number,
  previous: MizanSpectrum | null,
): { deck: MizanSpectrum[]; deckIndex: number; spectrum: MizanSpectrum } {
  let nextDeck = deck;
  let index = deckIndex;
  if (index >= nextDeck.length) {
    nextDeck = shuffle(nextDeck);
    index = 0;
    if (nextDeck.length > 1 && previous && nextDeck[0]!.id === previous.id) {
      [nextDeck[0], nextDeck[1]] = [nextDeck[1]!, nextDeck[0]!];
    }
  }
  const spectrum = nextDeck[index]!;
  recordPlayed('mizan', spectrum.id);
  return { deck: nextDeck, deckIndex: index + 1, spectrum };
}

export function createMizanSession(
  setup: MizanSetup,
  contentLanguage: ContentLanguage = 'en',
  sessionId: string = createId('sess'),
): MizanSession | { error: string } {
  const count = setup.players.length;
  if (count < MIZAN_MIN_PLAYERS || count > MIZAN_MAX_PLAYERS) {
    return { error: `Mizan needs ${MIZAN_MIN_PLAYERS}–${MIZAN_MAX_PLAYERS} players.` };
  }
  if (setup.mode === 'teams' && count < MIZAN_TEAMS_MIN_PLAYERS) {
    return { error: 'Teams need at least 4 players. Switch to Together for smaller groups.' };
  }
  if (setup.players.some((player) => !player.displayName.trim())) {
    return { error: 'Every player needs a name.' };
  }
  if (setup.contentLevels.length === 0) return { error: 'Pick at least one content level.' };

  const fresh = pickMizanDeck({ contentLevels: setup.contentLevels, contentLanguage });
  if (fresh.length === 0) return { error: 'No spectrum cards match these levels.' };

  const { deck, deckIndex, spectrum } = drawSpectrum(fresh, 0, null);
  const { teamA, teamB } =
    setup.mode === 'teams'
      ? splitTeams(setup.players)
      : { teamA: setup.players.map((player) => player.id), teamB: [] };

  return {
    sessionId,
    setup,
    contentLanguage,
    phase: 'handoff',
    teamA,
    teamB,
    scores: { a: 0, b: 0 },
    activeTeam: 'a',
    psychicIndex: { a: 0, b: 0 },
    turnNumber: 0,
    deck,
    deckIndex,
    spectrum,
    target: randomTarget(),
    guess: 50,
    call: null,
    result: null,
    winner: null,
  };
}

export function rematchMizanSession(session: MizanSession) {
  return createMizanSession(session.setup, session.contentLanguage, session.sessionId);
}

export function getMizanPlayerName(session: MizanSession, playerId: string): string {
  return playerName(session.setup.players, playerId);
}

export function teamIds(session: MizanSession, team: TeamId): string[] {
  return team === 'a' ? session.teamA : session.teamB;
}

export function currentPsychicId(session: MizanSession): string {
  if (session.setup.mode === 'together') {
    return session.setup.players[session.turnNumber % session.setup.players.length]!.id;
  }
  const ids = teamIds(session, session.activeTeam);
  return ids[session.psychicIndex[session.activeTeam] % ids.length]!;
}

export function spectrumEnds(session: MizanSession): { left: string; right: string } {
  const { spectrum, contentLanguage } = session;
  return {
    left: localizeText(contentLanguage, { en: spectrum.left_en, am: spectrum.left_am }),
    right: localizeText(contentLanguage, { en: spectrum.right_en, am: spectrum.right_am }),
  };
}

/**
 * Teams mode, on the reveal: the target is reached but Team B is still owed
 * its matching turn, so the game is not over yet.
 */
export function answerTurnPending(session: MizanSession): boolean {
  if (session.setup.mode !== 'teams' || session.phase !== 'reveal') return false;
  const { a, b } = session.scores;
  return session.turnNumber % 2 === 0 && Math.max(a, b) >= session.setup.pointsToWin;
}

/** Teams mode: someone has reached the target on equal turns but it is tied. */
export function tiedAtTarget(session: MizanSession): boolean {
  if (session.setup.mode !== 'teams' || session.phase !== 'reveal') return false;
  const { a, b } = session.scores;
  return session.turnNumber % 2 === 1 && a === b && a >= session.setup.pointsToWin;
}

/** Together mode's best possible total, for the result screen. */
export function togetherMaxScore(session: MizanSession): number {
  return session.setup.rounds * MIZAN_MAX_POINTS;
}

export function beginPeek(session: MizanSession): MizanSession {
  if (session.phase !== 'handoff') return session;
  return { ...session, phase: 'peek' };
}

export function finishPeek(session: MizanSession): MizanSession {
  if (session.phase !== 'peek') return session;
  return { ...session, phase: 'guess', guess: 50 };
}

export function setGuess(session: MizanSession, value: number): MizanSession {
  if (session.phase !== 'guess') return session;
  const guess = clampDial(value);
  return guess === session.guess ? session : { ...session, guess };
}

function reveal(session: MizanSession, call: MizanCall | null): MizanSession {
  const points = scoreGuess(session.target, session.guess);
  const opponentRead = session.target < session.guess ? 'left' : 'right';
  const opponentPoint =
    session.setup.mode === 'teams' && points < MIZAN_MAX_POINTS && call === opponentRead;
  const team = session.activeTeam;
  const scores =
    session.setup.mode === 'teams'
      ? {
          ...session.scores,
          [team]: session.scores[team] + points,
          [otherTeam(team)]: session.scores[otherTeam(team)] + (opponentPoint ? 1 : 0),
        }
      : { ...session.scores, a: session.scores.a + points };
  return { ...session, phase: 'reveal', call, scores, result: { points, opponentPoint } };
}

export function lockGuess(session: MizanSession): MizanSession {
  if (session.phase !== 'guess') return session;
  if (session.setup.mode === 'teams') return { ...session, phase: 'call' };
  return reveal(session, null);
}

export function makeCall(session: MizanSession, call: MizanCall): MizanSession {
  if (session.phase !== 'call') return session;
  return reveal(session, call);
}

export function nextTurn(session: MizanSession): MizanSession {
  if (session.phase !== 'reveal') return session;
  const turnNumber = session.turnNumber + 1;

  if (session.setup.mode === 'together') {
    if (turnNumber >= session.setup.rounds) {
      return { ...session, turnNumber, phase: 'final', winner: 'together' };
    }
  } else {
    // Team A always opens, so an even count means both teams had equal turns.
    // A team reaching the target on A's turn still gives B its answer turn.
    const { a, b } = session.scores;
    const equalTurns = turnNumber % 2 === 0;
    if (equalTurns && Math.max(a, b) >= session.setup.pointsToWin && a !== b) {
      return { ...session, turnNumber, phase: 'final', winner: a > b ? 'a' : 'b' };
    }
  }

  const team = session.activeTeam;
  const { deck, deckIndex, spectrum } = drawSpectrum(
    session.deck,
    session.deckIndex,
    session.spectrum,
  );
  return {
    ...session,
    phase: 'handoff',
    turnNumber,
    activeTeam: session.setup.mode === 'teams' ? otherTeam(team) : team,
    psychicIndex:
      session.setup.mode === 'teams'
        ? { ...session.psychicIndex, [team]: session.psychicIndex[team] + 1 }
        : session.psychicIndex,
    deck,
    deckIndex,
    spectrum,
    target: randomTarget(),
    guess: 50,
    call: null,
    result: null,
  };
}

/** Swap a card the psychic cannot clue. A fresh target comes with it. */
export function skipSpectrum(session: MizanSession): MizanSession {
  if (session.phase !== 'handoff' && session.phase !== 'peek') return session;
  const { deck, deckIndex, spectrum } = drawSpectrum(
    session.deck,
    session.deckIndex,
    session.spectrum,
  );
  return { ...session, deck, deckIndex, spectrum, target: randomTarget() };
}
