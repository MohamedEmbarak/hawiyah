import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { RenderMode } from '@angular/ssr';
import { GuideFeature } from '../../core/feature';

/**
 * Loads the example data of the install section with the page, so the example
 * loaders stay out of the initial bundle.
 */
const landingData: ResolveFn<unknown> = (route) => {
  const injector = inject(EnvironmentInjector);
  return import('./landing-data').then((m) => runInInjectionContext(injector, () => m.resolveLandingData(route)));
};

/** Route <lang>/: the landing. It claims the language root, so the redirect to the catalogue is dropped. */
export const feature: GuideFeature = {
  id: 'landing',
  order: 10,
  routes: [
    {
      path: '',
      pathMatch: 'full',
      resolve: { landing: landingData },
      loadComponent: () => import('./landing-page').then((m) => m.LandingPage),
    },
  ],
  serverRoutes: (langs) => [
    {
      path: '',
      renderMode: RenderMode.Prerender,
      getPrerenderParams: async () => langs.map((lang) => ({ lang })),
    },
  ],
};
