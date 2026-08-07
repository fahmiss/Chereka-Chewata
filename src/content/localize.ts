import type { ContentLanguage } from '../domain/settings/types';

type LocalizedFields = {
  en?: string;
  am?: string;
};

/** Pick display copy for the active content language. Falls back to English. */
export function localizeText(
  language: ContentLanguage,
  fields: LocalizedFields,
): string {
  const en = fields.en?.trim() ?? '';
  const am = fields.am?.trim() ?? '';
  if (language === 'am') return am || en;
  if (language === 'mixed') {
    if (am && en && am !== en) return `${am} · ${en}`;
    return am || en;
  }
  return en || am;
}

export function hasAmharicText(fields: LocalizedFields): boolean {
  const am = fields.am?.trim() ?? '';
  const en = fields.en?.trim() ?? '';
  return Boolean(am) && am !== en;
}

/** Deck filter: EN needs English; Amharic/Mixed need an Amharic field. */
export function matchesContentLanguage(
  language: ContentLanguage,
  fields: LocalizedFields,
): boolean {
  if (language === 'en') return Boolean(fields.en?.trim());
  return Boolean(fields.am?.trim());
}

export function localizeList(
  language: ContentLanguage,
  en: string[],
  am?: string[],
): string[] {
  if (language === 'en' || !am?.length) return en;
  if (language === 'am') {
    return en.map((item, index) => am[index]?.trim() || item);
  }
  return en.map((item, index) => {
    const amItem = am[index]?.trim();
    if (amItem && amItem !== item) return `${amItem} · ${item}`;
    return amItem || item;
  });
}
