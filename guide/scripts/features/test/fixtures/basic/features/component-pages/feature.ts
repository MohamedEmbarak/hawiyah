export const feature = {
  id: 'component-pages',
  order: 30,
  routes: [
    {
      path: 'components/:id',
      data: { kind: 'layout' }, // a nested object without a path
      children: [
        { path: '', loadComponent: () => import('./brief').then((m) => m.Brief) },
        { path: 'reference', loadComponent: () => import('./reference').then((m) => m.Reference) },
      ],
    },
  ],
  serverRoutes: () => [],
};
