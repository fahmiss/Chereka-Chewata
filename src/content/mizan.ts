import type { ContentLevel, MizanSpectrum } from '../domain/mizan/types';
import type { ContentLanguage } from '../domain/settings/types';
import { isContentLevelAvailable } from '../config/features';
import spectraJson from '../../content/mizan/spectra.en.json';
import { prioritizeFresh, reportedIds } from '../storage/contentHistory';
import { matchesContentLanguage } from './localize';

const spectra = spectraJson as MizanSpectrum[];

export function getMizanSpectra(options: {
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): MizanSpectrum[] {
  const levels = new Set(options.contentLevels.filter(isContentLevelAvailable));
  const language = options.contentLanguage ?? 'en';
  const hidden = reportedIds('mizan');
  return spectra.filter(
    (spectrum) =>
      spectrum.active &&
      levels.has(spectrum.content_level) &&
      matchesContentLanguage(language, { en: spectrum.left_en, am: spectrum.left_am }) &&
      !hidden.has(spectrum.id),
  );
}

/** Shuffled deck with recently played spectra at the back. */
export function pickMizanDeck(options: {
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): MizanSpectrum[] {
  return prioritizeFresh(getMizanSpectra(options), 'mizan');
}

export function countMizanSpectra(options: {
  contentLevels: ContentLevel[];
  contentLanguage?: ContentLanguage;
}): number {
  return getMizanSpectra(options).length;
}
