import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { CanMatchFn, ResolveFn, UrlSegment } from '@angular/router';
import { RenderMode } from '@angular/ssr';
import manifest from '../../../generated/content/manifest.json';
import { GuideFeature } from '../../core/feature';

/** Ids of the component pages the build produced (src/generated/content/manifest.json). */
const pages: readonly { readonly id: string; readonly langs: readonly string[] }[] = manifest.pages;

/** Matches 'components/:id' only for an id in the content manifest. */
export const componentPageMatch: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const id = segments[1]?.path;
  return id !== undefined && pages.some((page) => page.id === id);
};

/**
 * Resolver of a view, loaded with the view: the content loaders, the example loaders
 * and the listing highlighter stay out of the initial bundle.
 */
function lazyResolver(view: 'brief' | 'reference'): ResolveFn<unknown> {
  return (route) => {
    const injector = inject(EnvironmentInjector);
    return import('./page-data.resolver').then((m) => runInInjectionContext(injector, () => m.resolvePage(route, view)));
  };
}

/** Prerender parameters: every language of every page in the content manifest. */
async function pageParams(langs: readonly string[]): Promise<Record<string, string>[]> {
  return pages.flatMap((page) => langs.filter((lang) => page.langs.includes(lang)).map((lang) => ({ lang, id: page.id })));
}

export const feature: GuideFeature = {
  id: 'component-pages',
  order: 30,
  routes: [
    {
      path: 'components/:id',
      canMatch: [componentPageMatch],
      loadComponent: () => import('./component-layout').then((m) => m.ComponentLayout),
      children: [
        {
          path: '',
          pathMatch: 'full',
          resolve: { page: lazyResolver('brief') },
          loadComponent: () => import('./brief-page').then((m) => m.BriefPage),
        },
        {
          path: 'reference',
          pathMatch: 'full',
          resolve: { page: lazyResolver('reference') },
          loadComponent: () => import('./reference-page').then((m) => m.ReferencePage),
        },
      ],
    },
  ],
  serverRoutes: (langs) => [
    { path: 'components/:id', renderMode: RenderMode.Prerender, getPrerenderParams: () => pageParams(langs) },
    { path: 'components/:id/reference', renderMode: RenderMode.Prerender, getPrerenderParams: () => pageParams(langs) },
  ],
};
