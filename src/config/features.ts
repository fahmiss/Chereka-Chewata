/**
 * Product switches for features that are implemented but not currently exposed.
 * Keep paused language and content work intact for later releases.
 */
export const featureFlags = {
  languageSelection: false,
  amharicInterface: false,
  amharicContent: false,
  spicyContent: false,
} as const;

export function isContentLevelAvailable(level: string): boolean {
  return level !== 'spicy' || featureFlags.spicyContent;
}
