import { contentLoaders } from '../../generated/content/loaders';
import navigationData from '../../generated/content/navigation.json';
import type { DocumentKind } from './kinds';
import type { ContentLang, ContentPage, NavigationDocument, NavigationIndex, NavigationPage } from './model';

/**
 * src/generated/content/navigation.json, written by build step 20. Only lazy chunks
 * import this module; the content manifest is not part of any browser bundle.
 */
export const navigationIndex: NavigationIndex = navigationData as NavigationIndex;

/** The navigation entry of a component page, or null when the build did not produce it. */
export function navigationPage(id: string): NavigationPage | null {
  return navigationIndex.pages.find((page) => page.id === id) ?? null;
}

/** The built guides or templates, in the order of their index.json. */
export function navigationDocuments(kind: DocumentKind, index: NavigationIndex = navigationIndex): readonly NavigationDocument[] {
  return (kind === 'guide' ? index.guides : index.templates) ?? [];
}

/** The navigation entry of a guide or template by its id inside the kind, or null when the build did not produce it. */
export function navigationDocument(kind: DocumentKind, slug: string): NavigationDocument | null {
  return navigationDocuments(kind).find((entry) => entry.slug === slug) ?? null;
}

/** Whether the build produced the page in this language. */
export function hasContentPage(id: string, lang: ContentLang): boolean {
  return navigationPage(id)?.langs.includes(lang) ?? false;
}

/** Loads src/generated/content/pages/<id>.<lang>.json through the generated loader map; null when there is none. */
export async function loadContentPage(id: string, lang: ContentLang): Promise<ContentPage | null> {
  const load = contentLoaders[`${id}/${lang}`];
  if (!load) return null;
  return (await load()).default;
}
