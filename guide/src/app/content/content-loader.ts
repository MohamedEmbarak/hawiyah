import { contentLoaders } from '../../generated/content/loaders';
import navigationData from '../../generated/content/navigation.json';
import type { ContentLang, ContentPage, NavigationIndex, NavigationPage } from './model';

/**
 * src/generated/content/navigation.json, written by build step 20. Only lazy chunks
 * import this module; the content manifest is not part of any browser bundle.
 */
export const navigationIndex: NavigationIndex = navigationData as NavigationIndex;

/** The navigation entry of a component page, or null when the build did not produce it. */
export function navigationPage(id: string): NavigationPage | null {
  return navigationIndex.pages.find((page) => page.id === id) ?? null;
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
