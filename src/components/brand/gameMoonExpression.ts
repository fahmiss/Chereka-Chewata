import type { GameId } from '../../domain/games';
import type { MoonExpression } from './MoonFace';

/**
 * One mascot identity per game, shared by catalog and detail surfaces so the
 * visual promise made on the home screen carries through after selection.
 */
export const GAME_MOON_EXPRESSION: Record<GameId, MoonExpression> = {
  impostor: 'impostor',
  whos_the_liar: 'detective',
  taboo: 'secret',
  most_likely: 'pointing',
  would_you_rather: 'thinking',
  bomb: 'bomb',
};
