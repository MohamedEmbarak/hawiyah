import { RenderMode } from '@angular/ssr';
import { GuideFeature } from '../../core/feature';

export const feature: GuideFeature = {
  id: 'catalogue',
  order: 20,
  routes: [
    {
      path: 'components',
      pathMatch: 'full',
      loadComponent: () => import('./catalogue-page').then((m) => m.CataloguePage),
    },
  ],
  serverRoutes: (langs) => [
    {
      path: 'components',
      renderMode: RenderMode.Prerender,
      getPrerenderParams: async () => langs.map((lang) => ({ lang })),
    },
  ],
  nav: {
    path: 'components/',
    label: { en: 'Components', ar: 'المكوّنات' },
    header: true,
    footer: true,
  },
};
