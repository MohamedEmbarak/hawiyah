import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { RenderMode } from '@angular/ssr';
import { GuideFeature } from '../../core/feature';

/**
 * Loads the listings the editor shows before hydration with the page, so the example
 * loaders stay out of the initial bundle.
 */
const editorData: ResolveFn<unknown> = (route) => {
  const injector = inject(EnvironmentInjector);
  return import('./editor-data').then((m) => runInInjectionContext(injector, () => m.resolveEditorData(route)));
};

/** Route <lang>/editor/: the full editor (editor.fullEditor). */
export const feature: GuideFeature = {
  id: 'editor',
  order: 40,
  routes: [
    {
      path: 'editor',
      pathMatch: 'full',
      resolve: { editor: editorData },
      loadComponent: () => import('./editor-page').then((m) => m.EditorPage),
    },
  ],
  serverRoutes: (langs) => [
    {
      path: 'editor',
      renderMode: RenderMode.Prerender,
      getPrerenderParams: async () => langs.map((lang) => ({ lang })),
    },
  ],
  nav: {
    path: 'editor/',
    label: { en: 'Editor', ar: 'المحرر' },
    header: true,
    footer: true,
  },
};
