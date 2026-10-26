import { getGimbarCategories } from '../../content/gimbar';
import { createGameSession } from '../shared/createGameSession';
import { createPlayerSetup } from '../shared/createPlayerSetup';
import { defaultPlayers } from '../shared/utils';
import { createMesobSession, rematchMesobSession } from './machine';
import { MESOB_MAX_PLAYERS, MESOB_MIN_PLAYERS, type MesobSession, type MesobSetup } from './types';

export function defaultMesobSetup(): MesobSetup {
  return {
    players: defaultPlayers(4),
    // Deck top-ups draw from the Gimbar library, so they share its categories.
    categoryIds: getGimbarCategories().map((category) => category.id),
    contentLevels: ['family', 'friends'],
    spicyAcknowledged: false,
    turnSeconds: 45,
    wordsPerPlayer: 3,
    deckTopUp: false,
  };
}

const setup = createPlayerSetup<MesobSetup>({
  name: 'Mesob',
  minPlayers: MESOB_MIN_PLAYERS,
  maxPlayers: MESOB_MAX_PLAYERS,
  defaults: defaultMesobSetup,
  allCategoryIds: () => getGimbarCategories().map((category) => category.id),
  usesCategories: false,
});

const session = createGameSession<MesobSession, MesobSetup>({
  name: 'Mesob',
  create: (draft, language) => createMesobSession(draft, language),
  rematch: rematchMesobSession,
});

export const MesobSetupProvider = setup.Provider;
export const useMesobSetup = setup.useSetup;
export const MesobSessionProvider = session.Provider;
export const useMesobSession = session.useSession;
