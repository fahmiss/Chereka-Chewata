import { getManNegnCategories } from '../../content/manNegn';
import { createGameSession } from '../shared/createGameSession';
import { createPlayerSetup } from '../shared/createPlayerSetup';
import { defaultPlayers } from '../shared/utils';
import { createManNegnSession, rematchManNegnSession } from './machine';
import { MAN_NEGN_MAX_PLAYERS, MAN_NEGN_MIN_PLAYERS, type ManNegnSession, type ManNegnSetup } from './types';

export function defaultManNegnSetup(): ManNegnSetup {
  return { players: defaultPlayers(2), categoryIds: getManNegnCategories().map((c) => c.id), contentLevels: ['family'], spicyAcknowledged: false };
}
const setup = createPlayerSetup<ManNegnSetup>({ name: 'Man Negn', minPlayers: MAN_NEGN_MIN_PLAYERS, maxPlayers: MAN_NEGN_MAX_PLAYERS, defaults: defaultManNegnSetup, allCategoryIds: () => getManNegnCategories().map((c) => c.id), usesCategories: true });
const session = createGameSession<ManNegnSession, ManNegnSetup>({ name: 'Man Negn', create: createManNegnSession, rematch: rematchManNegnSession });
export const ManNegnSetupProvider = setup.Provider;
export const useManNegnSetup = setup.useSetup;
export const ManNegnSessionProvider = session.Provider;
export const useManNegnSession = session.useSession;
