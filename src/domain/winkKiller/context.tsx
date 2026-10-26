import { createGameSession } from '../shared/createGameSession';
import { createPlayerSetup } from '../shared/createPlayerSetup';
import { defaultPlayers } from '../shared/utils';
import { createWinkKillerSession, rematchWinkKillerSession } from './machine';
import {
  WINK_MAX_PLAYERS,
  WINK_MIN_PLAYERS,
  type WinkKillerSession,
  type WinkKillerSetup,
} from './types';

export function defaultWinkKillerSetup(): WinkKillerSetup {
  return {
    players: defaultPlayers(6),
    // No cards: roles are the whole game.
    categoryIds: [],
    contentLevels: ['family'],
    spicyAcknowledged: false,
    killerCount: 1,
    detective: false,
  };
}

const setup = createPlayerSetup<WinkKillerSetup>({
  name: 'Wink Killer',
  minPlayers: WINK_MIN_PLAYERS,
  maxPlayers: WINK_MAX_PLAYERS,
  defaults: defaultWinkKillerSetup,
  allCategoryIds: () => [],
  usesCategories: false,
});

const session = createGameSession<WinkKillerSession, WinkKillerSetup>({
  name: 'Wink Killer',
  create: (draft, language) => createWinkKillerSession(draft, language),
  rematch: rematchWinkKillerSession,
});

export const WinkKillerSetupProvider = setup.Provider;
export const useWinkKillerSetup = setup.useSetup;
export const WinkKillerSessionProvider = session.Provider;
export const useWinkKillerSession = session.useSession;
