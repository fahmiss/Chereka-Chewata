import categoriesJson from '../../content/categories/man_negn.json';
import identitiesJson from '../../content/man_negn/identities.en.json';
import type { ContentLanguage, ContentLevel } from '../domain/shared/types';
import type { ManNegnIdentity } from '../domain/manNegn/types';
import { prioritizeFresh, reportedIds } from '../storage/contentHistory';

export type ManNegnCategory = { id: string; name_en: string; sort_order: number; active: boolean };
const categories = (categoriesJson as ManNegnCategory[]).filter((item) => item.active).sort((a, b) => a.sort_order - b.sort_order);
const identities = (identitiesJson as ManNegnIdentity[]).filter((item) => item.active);

export function getManNegnCategories() { return categories; }

export function getManNegnIdentities(query: { categoryIds: string[]; contentLevels: ContentLevel[]; contentLanguage: ContentLanguage }) {
  return identities.filter((item) => query.categoryIds.includes(item.category_id) && query.contentLevels.includes(item.content_level) && !reportedIds('man_negn').has(item.id));
}

export function countManNegnIdentities(query: Parameters<typeof getManNegnIdentities>[0]) { return getManNegnIdentities(query).length; }

export function pickManNegnIdentities(query: Parameters<typeof getManNegnIdentities>[0], count: number, excluded: string[] = []) {
  const pool = getManNegnIdentities(query);
  const fresh = pool.filter((item) => !excluded.includes(item.id));
  const source = fresh.length >= count ? fresh : pool;
  return prioritizeFresh(source, 'man_negn').slice(0, count);
}
