import { inject, type Type } from '@angular/core';
import type { ActivatedRouteSnapshot } from '@angular/router';
import { ExampleSourcesLoader, loadNativeExamples, type ExampleListing } from '../../examples/example-loader';
import type { ExampleFramework } from '../../examples/payload';
import { DEFAULT_LANG, isLang, type Lang } from '../../i18n/text';

/** The component page and live group that step 3 of the install section shows. */
export const FIRST_EXAMPLE = { id: 'button', example: 'primary' } as const;

/** What the landing renders from the generated examples, resolved before the page is created. */
export interface LandingData {
  /** The primary file of the group per framework, in the page language. */
  readonly listings: Readonly<Partial<Record<ExampleFramework, ExampleListing>>>;
  /** The native Angular example component of the group, or null when the page was not built. */
  readonly native: Type<unknown> | null;
}

/** Loads the primary listings and the native result of the Button page's first live group. */
export async function loadLandingData(lang: Lang, sources: Pick<ExampleSourcesLoader, 'load'>): Promise<LandingData> {
  const [natives, group] = await Promise.all([
    loadNativeExamples(FIRST_EXAMPLE.id, lang),
    sources.load(FIRST_EXAMPLE.id, lang, FIRST_EXAMPLE.example),
  ]);
  const listings: Partial<Record<ExampleFramework, ExampleListing>> = {};
  if (group) {
    for (const [framework, files] of Object.entries(group) as [ExampleFramework, readonly ExampleListing[]][]) {
      const primary = files[0];
      if (primary) listings[framework] = primary;
    }
  }
  return { listings, native: (natives[FIRST_EXAMPLE.example] as Type<unknown> | undefined) ?? null };
}

/** Resolver body, run in an injection context (feature.ts loads this module lazily). */
export function resolveLandingData(route: ActivatedRouteSnapshot): Promise<LandingData> {
  const lang = route.paramMap.get('lang');
  return loadLandingData(isLang(lang) ? lang : DEFAULT_LANG, inject(ExampleSourcesLoader));
}
