import { createGameSession } from '../shared/createGameSession';
import { createPlayerSetup } from '../shared/createPlayerSetup';
import { defaultPlayers } from '../shared/utils';
import { createMizanSession, rematchMizanSession } from './machine';
import { MIZAN_MAX_PLAYERS, MIZAN_MIN_PLAYERS, type MizanSession, type MizanSetup } from './types';

export function defaultMizanSetup(): MizanSetup {
  return {
    players: defaultPlayers(4),
    // Spectra have no topic categories; only content level filters them.
    categoryIds: [],
    contentLevels: ['family', 'friends'],
    spicyAcknowledged: false,
    mode: 'teams',
    pointsToWin: 10,
    rounds: 8,
  };
}

const setup = createPlayerSetup<MizanSetup>({
  name: 'Mizan',
  minPlayers: MIZAN_MIN_PLAYERS,
  maxPlayers: MIZAN_MAX_PLAYERS,
  defaults: defaultMizanSetup,
  allCategoryIds: () => [],
  usesCategories: false,
});

const session = createGameSession<MizanSession, MizanSetup>({
  name: 'Mizan',
  create: (draft, language) => createMizanSession(draft, language),
  rematch: rematchMizanSession,
});

export const MizanSetupProvider = setup.Provider;
export const useMizanSetup = setup.useSetup;
export const MizanSessionProvider = session.Provider;
export const useMizanSession = session.useSession;
