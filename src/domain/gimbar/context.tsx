import { getGimbarCategories } from '../../content/gimbar';
import { createGameSession } from '../shared/createGameSession';
import { createPlayerSetup } from '../shared/createPlayerSetup';
import { defaultPlayers } from '../shared/utils';
import { createGimbarSession, rematchGimbarSession } from './machine';
import {
  GIMBAR_MAX_PLAYERS,
  GIMBAR_MIN_PLAYERS,
  type GimbarSession,
  type GimbarSetup,
} from './types';

/** Browsers report device motion inconsistently, so web starts on tap. */
// Paused 2026-10-30: tilt did not register on device. Tap halves are the
// only control until it's fixed; flip back to `Platform.OS !== 'web'` then.
export const GIMBAR_TILT_SUPPORTED: boolean = false;

export function defaultGimbarSetup(): GimbarSetup {
  return {
    players: defaultPlayers(4),
    categoryIds: getGimbarCategories().map((category) => category.id),
    contentLevels: ['family', 'friends'],
    spicyAcknowledged: false,
    turnSeconds: 60,
    roundsPerPlayer: 1,
    control: GIMBAR_TILT_SUPPORTED ? 'tilt' : 'tap',
  };
}

const setup = createPlayerSetup<GimbarSetup>({
  name: 'Gimbar',
  minPlayers: GIMBAR_MIN_PLAYERS,
  maxPlayers: GIMBAR_MAX_PLAYERS,
  defaults: defaultGimbarSetup,
  allCategoryIds: () => getGimbarCategories().map((category) => category.id),
  usesCategories: true,
});

const session = createGameSession<GimbarSession, GimbarSetup>({
  name: 'Gimbar',
  create: (draft, language) => createGimbarSession(draft, language),
  rematch: rematchGimbarSession,
});

export const GimbarSetupProvider = setup.Provider;
export const useGimbarSetup = setup.useSetup;
export const GimbarSessionProvider = session.Provider;
export const useGimbarSession = session.useSession;
