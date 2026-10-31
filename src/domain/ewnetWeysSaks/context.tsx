import { getEwnetCategories } from '../../content/ewnetWeysSaks';
import { createGameSession } from '../shared/createGameSession';
import { createPlayerSetup } from '../shared/createPlayerSetup';
import { defaultPlayers } from '../shared/utils';
import { createEwnetSession, rematchEwnetSession } from './machine';
import { EWNET_MAX_PLAYERS, EWNET_MIN_PLAYERS, type EwnetSession, type EwnetSetup } from './types';

export function defaultEwnetSetup(): EwnetSetup {
  return {
    players: defaultPlayers(4),
    categoryIds: getEwnetCategories().map((category) => category.id),
    contentLevels: ['family', 'friends'],
    spicyAcknowledged: false,
    roundCount: 5,
  };
}

const setup = createPlayerSetup<EwnetSetup>({
  name: 'Ewnet weys Saks',
  minPlayers: EWNET_MIN_PLAYERS,
  maxPlayers: EWNET_MAX_PLAYERS,
  defaults: defaultEwnetSetup,
  allCategoryIds: () => getEwnetCategories().map((category) => category.id),
  usesCategories: true,
});

const session = createGameSession<EwnetSession, EwnetSetup>({
  name: 'Ewnet weys Saks',
  create: createEwnetSession,
  rematch: rematchEwnetSession,
});

export const EwnetSetupProvider = setup.Provider;
export const useEwnetSetup = setup.useSetup;
export const EwnetSessionProvider = session.Provider;
export const useEwnetSession = session.useSession;
