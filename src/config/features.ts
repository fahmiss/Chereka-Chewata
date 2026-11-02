/**
 * Product switches for features that are implemented but not currently exposed.
 * Keep paused language and content work intact for later releases.
 */
export const featureFlags = {
  /** Settings + first-launch gate for EN/AM interface and content. */
  languageSelection: true,
  /** Persist and apply Amharic interface chrome (menus, Impostor Batch 2/2B). */
  amharicInterface: true,
  /** Allow content-language preference; decks still fall back when AM missing. */
  amharicContent: true,
  spicyContent: false,
} as const;

export function isContentLevelAvailable(level: string): boolean {
  return level !== 'spicy' || featureFlags.spicyContent;
}
