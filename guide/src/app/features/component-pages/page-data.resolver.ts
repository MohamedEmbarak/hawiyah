import { inject, type Type } from '@angular/core';
import { ActivatedRouteSnapshot, RedirectCommand, Router } from '@angular/router';
import { loadContentPage, navigationPage } from '../../content/content-loader';
import type { ContentPage, NavigationPage } from '../../content/model';
import { ExampleSourcesLoader, loadNativeExamples } from '../../examples/example-loader';
import type { ExampleGroup } from '../../examples/page-examples';
import { isLang, type Lang } from '../../i18n/text';

export type ComponentView = 'brief' | 'reference';

/** What a brief or reference view renders, resolved before the view is created. */
export interface ComponentPageData {
  readonly view: ComponentView;
  readonly page: ContentPage;
  /** The page's entry in the navigation index: names, summary and live groups. */
  readonly entry: NavigationPage;
  /** The live groups the view shows: the first one on a brief view, all on a reference view. */
  readonly groups: readonly ExampleGroup[];
}

/** Live groups of a view: the first group for the brief, every group for the reference. */
export function viewGroups(entry: NavigationPage, page: ContentPage, view: ComponentView): NavigationPage['examples'] {
  const groups = entry.examples.filter((group) => page.liveGroups.includes(group.example));
  return view === 'brief' ? groups.slice(0, 1) : groups;
}

/** Loads the content page, the native example components and the listings of the view's live groups. */
export async function loadComponentPage(
  id: string,
  lang: Lang,
  view: ComponentView,
  sources: Pick<ExampleSourcesLoader, 'load'>,
): Promise<ComponentPageData | null> {
  const entry = navigationPage(id);
  if (!entry || !entry.langs.includes(lang)) return null;
  const [page, natives] = await Promise.all([loadContentPage(id, lang), loadNativeExamples(id, lang)]);
  if (!page) return null;
  const groups = await Promise.all(
    viewGroups(entry, page, view).map(async (group): Promise<ExampleGroup> => ({
      id,
      lang,
      example: group.example,
      headingId: group.section,
      native: (natives[group.example] as Type<unknown> | undefined) ?? null,
      sources: await sources.load(id, lang, group.example),
    })),
  );
  return { view, page, entry, groups };
}

/**
 * Resolves a view in an injection context (feature.ts loads this module with the view);
 * a page the build did not produce in this language goes to the 404 page.
 */
export async function resolvePage(route: ActivatedRouteSnapshot, view: ComponentView): Promise<ComponentPageData | RedirectCommand> {
  const router = inject(Router);
  const sources = inject(ExampleSourcesLoader);
  const id = route.paramMap.get('id') ?? '';
  const lang = route.paramMap.get('lang');
  const data = isLang(lang) ? await loadComponentPage(id, lang, view, sources) : null;
  return data ?? new RedirectCommand(router.parseUrl('/404'), { skipLocationChange: true });
}
