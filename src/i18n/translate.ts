import { am } from './am';
import { en, type MessageKey } from './en';

const catalogs = { en, am } as const;

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
