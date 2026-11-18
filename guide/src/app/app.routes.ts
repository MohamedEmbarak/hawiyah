import { Routes } from '@angular/router';
import { features } from '../generated/features';
import { langSegment, localeResolver } from './core/locale';
import { NotFoundPage } from './pages/not-found-page';
import { RootPage } from './pages/root-page';

/** Whether a feature (the landing, from stage 4b) claims '' under ':lang'. */
export const languageRootClaimed = features.some((feature) => feature.routes.some((route) => route.path === ''));

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: RootPage, data: { shell: 'minimal' } },
  { path: '404', component: NotFoundPage, data: { shell: 'minimal' } },
  {
    path: ':lang',
    canMatch: [langSegment],
    resolve: { lang: localeResolver },
    data: { shell: 'full' },
    children: [
      ...(languageRootClaimed ? [] : [{ path: '', pathMatch: 'full' as const, redirectTo: 'components' }]),
      ...features.flatMap((feature) => feature.routes),
    ],
  },
  { path: '**', component: NotFoundPage, data: { shell: 'minimal' } },
];
