import { useMemo } from 'react';
import { useSettings } from '../domain/settings/SettingsContext';
import { family } from '../theme/typography';
import { am } from './am';
import { en, type MessageKey } from './en';

const catalogs = { en, am } as const;

export type { MessageKey };

export function translate(
  language: 'en' | 'am',
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  const catalog = catalogs[language] ?? en;
  let text: string = catalog[key] ?? en[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

/** Interface copy helper bound to Settings.interfaceLanguage. */
export function useT() {
  const { settings } = useSettings();
  const language = settings.interfaceLanguage;

  return useMemo(() => {
    const t = (key: MessageKey, params?: Record<string, string | number>) =>
      translate(language, key, params);
    const isAmharic = language === 'am';
    const uiFont = isAmharic ? family.ethiopic.medium : undefined;
    const uiFontBold = isAmharic ? family.ethiopic.bold : undefined;
    return { t, language, isAmharic, uiFont, uiFontBold };
  }, [language]);
}
