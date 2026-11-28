import { inject } from '@angular/core';
import type { ActivatedRouteSnapshot } from '@angular/router';
import { ExampleSourcesLoader, type ExampleSources } from '../../examples/example-loader';
import { DEFAULT_LANG, isLang, type Lang } from '../../i18n/text';
import { DEFAULT_EXAMPLE } from './editor-store';

/**
 * What the editor renders before hydration: the build-time listings of the default
 * example. The query is read only in the browser after hydration, so the server and
 * the first client render always show the default example and agree.
 */
export interface EditorData {
  readonly lang: Lang;
  readonly sources: ExampleSources | null;
}

export async function loadEditorData(lang: Lang, sources: Pick<ExampleSourcesLoader, 'load'>): Promise<EditorData> {
  return { lang, sources: await sources.load(DEFAULT_EXAMPLE.id, lang, DEFAULT_EXAMPLE.example) };
}

/** Resolver body, run in an injection context (feature.ts loads this module lazily). */
export function resolveEditorData(route: ActivatedRouteSnapshot): Promise<EditorData> {
  const lang = route.paramMap.get('lang');
  return loadEditorData(isLang(lang) ? lang : DEFAULT_LANG, inject(ExampleSourcesLoader));
}
