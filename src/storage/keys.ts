/** AsyncStorage key namespace — keep stable across releases. */
export const storageKeys = {
  settings: 'chereka.settings.v1',
  lastPlayerGroup: 'chereka.players.lastGroup.v1',
  cardHistory: 'chereka.content.history.v1',
  reportedCards: 'chereka.content.reported.v1',
  hasCompletedLanguageGate: 'chereka.onboarding.languageGate.v1',
} as const;
