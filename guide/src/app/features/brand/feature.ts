import { ResolveFn } from '@angular/router';
import { RenderMode } from '@angular/ssr';
import { GuideFeature } from '../../core/feature';

/** Loads the generated model of the page with the page. */
const brandModel: ResolveFn<unknown> = (route) => import('../../package-pages/package-page-data').then((m) => m.resolvePackagePage(route, 'brand'));

/** Route <lang>/brand/: the wordmark artwork and the loader of the installed @hawiyah/styles (build step 32). */
export const feature: GuideFeature = {
  id: 'brand',
  order: 52,
  routes: [
    {
      path: 'brand',
      pathMatch: 'full',
      resolve: { model: brandModel },
      loadComponent: () => import('../../package-pages/brand-page').then((m) => m.BrandPage),
    },
  ],
  serverRoutes: (langs) => [
    { path: 'brand', renderMode: RenderMode.Prerender, getPrerenderParams: async () => langs.map((lang) => ({ lang })) },
  ],
  nav: {
    path: 'brand/',
    label: { en: 'Brand', ar: 'العلامة' },
    header: false,
    footer: true,
  },
};
