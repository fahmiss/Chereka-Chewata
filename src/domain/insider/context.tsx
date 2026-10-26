import { getImpostorCategories } from '../../content/impostor';
import { createGameSession } from '../shared/createGameSession';
import { createPlayerSetup } from '../shared/createPlayerSetup';
import { defaultPlayers } from '../shared/utils';
import { createInsiderSession, rematchInsiderSession } from './machine';
import {
  INSIDER_MAX_PLAYERS,
  INSIDER_MIN_PLAYERS,
  type InsiderSession,
  type InsiderSetup,
} from './types';

export function defaultInsiderSetup(): InsiderSetup {
  return {
    players: defaultPlayers(5),
    categoryIds: getImpostorCategories().map((category) => category.id),
    contentLevels: ['family', 'friends'],
    spicyAcknowledged: false,
    timerSeconds: 300,
    votingMode: 'group',
  };
}

const setup = createPlayerSetup<InsiderSetup>({
  name: 'Insider',
  minPlayers: INSIDER_MIN_PLAYERS,
  maxPlayers: INSIDER_MAX_PLAYERS,
  defaults: defaultInsiderSetup,
  allCategoryIds: () => getImpostorCategories().map((category) => category.id),
  usesCategories: true,
});

const session = createGameSession<InsiderSession, InsiderSetup>({
  name: 'Insider',
  create: (draft, language) => createInsiderSession(draft, language),
  rematch: rematchInsiderSession,
});

export const InsiderSetupProvider = setup.Provider;
export const useInsiderSetup = setup.useSetup;
export const InsiderSessionProvider = session.Provider;
export const useInsiderSession = session.useSession;
