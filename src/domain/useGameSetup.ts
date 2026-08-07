import { getGame } from './games';
import { useBombSetup } from './bomb/SetupContext';
import { useSetup } from './impostor/SetupContext';
import { useLiarSetup } from './liar/SetupContext';
import { useMostLikelySetup } from './mostLikely/SetupContext';
import { useTabooSetup } from './taboo/SetupContext';
import { useWouldRatherSetup } from './wouldRather/SetupContext';
import { color } from '../theme/tokens';

/**
 * Shared setup surface for all playable games.
 * Providers stay mounted; this picks the active draft by route gameId.
 */
export function useGameSetup(gameId: string | undefined) {
  const impostor = useSetup();
  const liar = useLiarSetup();
  const taboo = useTabooSetup();
  const mostLikely = useMostLikelySetup();
  const wouldRather = useWouldRatherSetup();
  const bomb = useBombSetup();
  const game = getGame(String(gameId ?? ''));

  const isLiar = gameId === 'whos_the_liar';
  const isTaboo = gameId === 'taboo';
  const isMostLikely = gameId === 'most_likely';
  const isWouldRather = gameId === 'would_you_rather';
  const isBomb = gameId === 'bomb';

  const active = isBomb
    ? bomb
    : isWouldRather
      ? wouldRather
      : isMostLikely
        ? mostLikely
        : isTaboo
          ? taboo
          : isLiar
            ? liar
            : impostor;

  const accent =
    game?.accent ??
    (isMostLikely
      ? color.gameMostLikely
      : isBomb
        ? color.gameBomb
        : isTaboo
          ? color.gameTaboo
          : isLiar
            ? color.gameLiar
            : color.gameImpostor);

  return {
    ...active,
    isLiar,
    isTaboo,
    isMostLikely,
    isWouldRather,
    isBomb,
    isImpostor: !isLiar && !isTaboo && !isMostLikely && !isWouldRather && !isBomb,
    accent,
    gameName: game?.name ?? 'Game',
  };
}
