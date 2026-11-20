import labels from './categories.json';
import type { Lang, Texts } from './text';

/**
 * Labels of the ten category ids of components.json (categories.json), in Arabic and
 * English: the sections of the catalogue and the groups of the side navigation.
 * scripts/features/test/categories.test.mjs requires a label for every category id.
 */
export const categoryLabels: Texts<Readonly<Record<string, string>>> = labels;

/** The label of a category; the id itself only for an id that has no label (the script test fails then). */
export function categoryLabel(id: string, lang: Lang): string {
  return categoryLabels[lang][id] ?? id;
}
