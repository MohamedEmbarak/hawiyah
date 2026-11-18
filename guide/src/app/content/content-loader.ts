import { contentLoaders } from '../../generated/content/loaders';
import manifestData from '../../generated/content/manifest.json';
import type { ContentLang, ContentManifest, ContentPage, ManifestPage } from './model';

/** src/generated/content/manifest.json, written by build step 20. */
export const contentManifest: ContentManifest = manifestData as ContentManifest;

/** The manifest entry of a component page, or null when the build did not produce it. */
export function manifestPage(id: string): ManifestPage | null {
  return contentManifest.pages.find((page) => page.id === id) ?? null;
}

/** Whether the build produced the page in this language. */
export function hasContentPage(id: string, lang: ContentLang): boolean {
  return manifestPage(id)?.langs.includes(lang) ?? false;
}

/** Loads src/generated/content/pages/<id>.<lang>.json through the generated loader map; null when there is none. */
export async function loadContentPage(id: string, lang: ContentLang): Promise<ContentPage | null> {
  const load = contentLoaders[`${id}/${lang}`];
  if (!load) return null;
  return (await load()).default;
}
