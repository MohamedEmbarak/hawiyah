import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { CanMatchFn, ResolveFn, UrlSegment } from '@angular/router';
import { RenderMode } from '@angular/ssr';
import routes from '../../../generated/content/document-routes.json';
import { GuideFeature } from '../../core/feature';

/**
 * Ids and languages of the guides the build produced (src/generated/content/document-routes.json,
 * step 20): the one part of their content data in the initial bundle.
 */
const pages: readonly { readonly id: string; readonly langs: readonly string[] }[] = routes.guides;

/** Matches 'guides/:id' only for an id of a built guide. */
export const guideMatch: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const id = segments[1]?.path;
  return id !== undefined && pages.some((page) => page.id === id);
};

/** Resolver of a guide, loaded with the page: the content and example loaders stay out of the initial bundle. */
const guideData: ResolveFn<unknown> = (route) => {
  const injector = inject(EnvironmentInjector);
  return import('../../documents/document-data.resolver').then((m) => runInInjectionContext(injector, () => m.resolveDocument(route, 'guide')));
};

/** Routes <lang>/guides/ (the guides in the order of docs/guides/index.json) and <lang>/guides/:id/. */
export const feature: GuideFeature = {
  id: 'guides',
  order: 22,
  routes: [
    {
      path: 'guides',
      pathMatch: 'full',
      data: { kind: 'guide' },
      loadComponent: () => import('../../documents/document-index-page').then((m) => m.DocumentIndexPage),
    },
    {
      path: 'guides/:id',
      pathMatch: 'full',
      canMatch: [guideMatch],
      resolve: { page: guideData },
      loadComponent: () => import('../../documents/document-page').then((m) => m.DocumentPage),
    },
  ],
  serverRoutes: (langs) => [
    { path: 'guides', renderMode: RenderMode.Prerender, getPrerenderParams: async () => langs.map((lang) => ({ lang })) },
    {
      path: 'guides/:id',
      renderMode: RenderMode.Prerender,
      getPrerenderParams: async () => pages.flatMap((page) => langs.filter((lang) => page.langs.includes(lang)).map((lang) => ({ lang, id: page.id }))),
    },
  ],
  nav: {
    path: 'guides/',
    label: { en: 'Guides', ar: 'الأدلة' },
    header: true,
    footer: true,
  },
};
