import { color } from './tokens';

/**
 * One colour per seat, borrowed from the game palette. The Players tab and
 * the in-game handoffs share it, so a player keeps their colour all night.
 */
export const SEAT_COLORS = [
  color.gameImpostor,
  color.gameLiar,
  color.gameMostLikely,
  color.gameTaboo,
  color.gameWouldRather,
  color.gameQuiz,
  color.gameMizan,
  color.gameWinkKiller,
  color.gameGimbar,
  color.gameMesob,
  color.gameInsider,
  color.gameBomb,
] as const;

/** Colour for a zero-based seat index; wraps past the end of the palette. */
export function seatColor(index: number): string {
  const n = SEAT_COLORS.length;
  return SEAT_COLORS[((index % n) + n) % n]!;
}
