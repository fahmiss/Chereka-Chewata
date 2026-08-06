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
