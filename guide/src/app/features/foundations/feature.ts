import { ResolveFn } from '@angular/router';
import { RenderMode } from '@angular/ssr';
import { GuideFeature } from '../../core/feature';

/** Loads the generated model of the page with the page. */
const foundationsModel: ResolveFn<unknown> = (route) => import('../../package-pages/package-page-data').then((m) => m.resolvePackagePage(route, 'foundations'));

/** Route <lang>/foundations/: the tokens of the installed @hawiyah/tokens and the icons of @hawiyah/styles (build step 32). */
export const feature: GuideFeature = {
  id: 'foundations',
  order: 50,
  routes: [
    {
      path: 'foundations',
      pathMatch: 'full',
      resolve: { model: foundationsModel },
      loadComponent: () => import('../../package-pages/foundations-page').then((m) => m.FoundationsPage),
    },
  ],
  serverRoutes: (langs) => [
    { path: 'foundations', renderMode: RenderMode.Prerender, getPrerenderParams: async () => langs.map((lang) => ({ lang })) },
  ],
  nav: {
    path: 'foundations/',
    label: { en: 'Foundations', ar: 'الأسس' },
    header: false,
    footer: true,
  },
};
