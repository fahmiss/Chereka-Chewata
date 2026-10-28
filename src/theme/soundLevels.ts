/**
 * Playback volume by role. Every WAV in assets/sounds is normalized to the
 * same loudness (scripts/generate-sound-kit.mjs), so a role sets how present
 * a sound is, not how loud its file happens to be.
 */
export const SOUND_VOLUME = {
  /** Background bed under talk, e.g. the Bomb fuse. */
  ambient: 0.55,
  /** Quiet confirmations: reveals, passes, last-seconds ticks. */
  soft: 0.6,
  /** Everyday feedback: correct, wrong, countdown beats. */
  cue: 0.72,
  /** Moments that end something: time up, verdicts, wins, explosions. */
  result: 0.82,
} as const;
