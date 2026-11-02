import { useMemo } from 'react';
import { useSettings } from '../domain/settings/SettingsContext';
import { family } from '../theme/typography';
import type { MessageKey } from './en';
import { translate } from './translate';

export type { MessageKey };
export { translate };

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
