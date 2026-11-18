import { RenderMode, ServerRoute } from '@angular/ssr';
import { features } from '../generated/features';
import { LANGS } from './i18n/text';
import { languageRootClaimed } from './app.routes';

const langParams = async () => LANGS.map((lang) => ({ lang }));

/** A feature's server route, with its path moved under ':lang/'. */
function underLang(route: ServerRoute): ServerRoute {
  return { ...route, path: route.path ? `:lang/${route.path}` : ':lang' } as ServerRoute;
}

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: '404', renderMode: RenderMode.Prerender },
  ...(languageRootClaimed ? [] : [{ path: ':lang', renderMode: RenderMode.Prerender, getPrerenderParams: langParams } as ServerRoute]),
  ...features.flatMap((feature) => feature.serverRoutes(LANGS).map(underLang)),
  { path: '**', renderMode: RenderMode.Client },
];
