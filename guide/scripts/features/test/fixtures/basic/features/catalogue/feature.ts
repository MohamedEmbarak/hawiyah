export const feature = {
  id: 'catalogue',
  order: 20,
  routes: [{ path: 'components', pathMatch: 'full', loadComponent: () => import('./page').then((m) => m.Page) }],
  serverRoutes: () => [],
  nav: { path: 'components/', label: { en: 'Components', ar: 'المكوّنات' }, header: true, footer: true },
};
