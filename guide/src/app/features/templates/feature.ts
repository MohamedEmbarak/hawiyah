import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { CanMatchFn, ResolveFn, UrlSegment } from '@angular/router';
import { RenderMode } from '@angular/ssr';
import routes from '../../../generated/content/document-routes.json';
import { GuideFeature } from '../../core/feature';

/**
 * Ids and languages of the templates the build produced (src/generated/content/document-routes.json,
 * step 20): the one part of their content data in the initial bundle.
 */
const pages: readonly { readonly id: string; readonly langs: readonly string[] }[] = routes.templates;

/** Matches 'templates/:id' only for an id of a built template. */
export const templateMatch: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const id = segments[1]?.path;
  return id !== undefined && pages.some((page) => page.id === id);
};

/** Resolver of a template, loaded with the page: the content and example loaders stay out of the initial bundle. */
const templateData: ResolveFn<unknown> = (route) => {
  const injector = inject(EnvironmentInjector);
  return import('../../documents/document-data.resolver').then((m) => runInInjectionContext(injector, () => m.resolveDocument(route, 'template')));
};

/** Routes <lang>/templates/ (the templates in the order of docs/templates/index.json) and <lang>/templates/:id/. */
export const feature: GuideFeature = {
  id: 'templates',
  order: 24,
  routes: [
    {
      path: 'templates',
      pathMatch: 'full',
      data: { kind: 'template' },
      loadComponent: () => import('../../documents/document-index-page').then((m) => m.DocumentIndexPage),
    },
    {
      path: 'templates/:id',
      pathMatch: 'full',
      canMatch: [templateMatch],
      resolve: { page: templateData },
      loadComponent: () => import('../../documents/document-page').then((m) => m.DocumentPage),
    },
  ],
  serverRoutes: (langs) => [
    { path: 'templates', renderMode: RenderMode.Prerender, getPrerenderParams: async () => langs.map((lang) => ({ lang })) },
    {
      path: 'templates/:id',
      renderMode: RenderMode.Prerender,
      getPrerenderParams: async () => pages.flatMap((page) => langs.filter((lang) => page.langs.includes(lang)).map((lang) => ({ lang, id: page.id }))),
    },
  ],
  nav: {
    path: 'templates/',
    label: { en: 'Templates', ar: 'القوالب' },
    header: true,
    footer: true,
  },
};
