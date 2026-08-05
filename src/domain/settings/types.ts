export type InterfaceLanguage = 'en' | 'am';
export type ContentLanguage = 'en' | 'am' | 'mixed';

export type AppSettings = {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  /** App-level reduce motion — also ORs with the OS switch. */
  reduceMotion: boolean;
  interfaceLanguage: InterfaceLanguage;
  contentLanguage: ContentLanguage;
};

export const defaultSettings: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  reduceMotion: false,
  interfaceLanguage: 'en',
  contentLanguage: 'en',
};
