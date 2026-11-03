import { translate } from '../../i18n/translate';
import type { ImpostorSession } from '../impostor/types';
import type { LiarSession } from '../liar/types';
import type { InsiderSession } from '../insider/types';
import type { WinkKillerSession } from '../winkKiller/types';
import type { TabooSession } from '../taboo/types';
import { playerName } from './utils';

/** Explain the resolved outcome without inventing a new score or win rule. */
export function impostorResultReason(
  session: ImpostorSession,
  language: 'en' | 'am' = 'en',
): string {
  if (session.winner === 'crew') {
    return translate(language, 'impostor.reason.crewCaught');
  }
  if (!session.accusedPlayerId) {
    return translate(language, 'impostor.reason.deadlock');
  }
  if (session.accusedIsImpostor) {
    return translate(language, 'impostor.reason.guessCorrect');
  }
  return translate(language, 'impostor.reason.innocent', {
    name: playerName(session.setup.players, session.accusedPlayerId),
  });
}

export function liarResultReason(session: LiarSession, language: 'en' | 'am' = 'en'): string {
  if (session.winner === 'group') return translate(language, 'liar.reason.group');
  if (!session.accusedPlayerId) return translate(language, 'liar.reason.deadlock');
  return translate(language, 'liar.reason.innocent', { name: playerName(session.setup.players, session.accusedPlayerId) });
}

export function insiderResult(session: InsiderSession): { title: string; detail: string } {
  if (session.winner === 'nobody') return {
    title: 'Word not found',
    detail: 'The round ended before the word was found, so everyone loses.',
  };
  if (session.winner === 'commons') return {
    title: 'Insider caught!',
    detail: 'The group found the word and identified the Insider. The Master and the Commons win.',
  };
  return {
    title: 'Insider wins',
    detail: session.accusedPlayerId
      ? `${playerName(session.setup.players, session.accusedPlayerId)} was innocent. The Insider stayed hidden.`
      : 'The word was found, but the group could not agree on the Insider.',
  };
}

export function winkResultReason(session: WinkKillerSession): string {
  if (session.winner === 'citizens') return 'Every Killer was correctly accused.';
  if (session.setup.detective) return session.detectiveGuessesLeft <= 0
    ? 'The Detective used every guess while a Killer remained.'
    : 'No Citizens remained for the Detective to protect.';
  return 'A Killer remained with no more than one Citizen left.';
}

export function tabooResultReason(
  session: TabooSession,
  language: 'en' | 'am' = 'en',
): string {
  if (session.winner === 'tie') return session.turnsCompleted.a !== session.turnsCompleted.b
    ? translate(language, 'taboo.reason.deckDraw')
    : translate(language, 'taboo.reason.tie', { n: session.scores.a });
  if (session.winner) {
    const other = session.winner === 'a' ? 'b' : 'a';
    return translate(language, 'taboo.reason.win', {
      team: translate(language, session.winner === 'a' ? 'taboo.teamA' : 'taboo.teamB'),
      a: session.scores[session.winner],
      b: session.scores[other],
    });
  }
  return translate(language, 'taboo.reason.ended');
}
