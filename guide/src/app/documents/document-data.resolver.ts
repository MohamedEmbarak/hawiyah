import { inject, type Type } from '@angular/core';
import { ActivatedRouteSnapshot, RedirectCommand, Router } from '@angular/router';
import { loadContentPage, navigationDocument } from '../content/content-loader';
import { pageKey, type DocumentKind } from '../content/kinds';
import type { ContentPage, NavigationDocument } from '../content/model';
import { ExampleSourcesLoader, loadNativeExamples } from '../examples/example-loader';
import type { ExampleGroup } from '../examples/page-examples';
import { isLang, type Lang } from '../i18n/text';

/** What the page of a guide or a template renders, resolved before the page is created. */
export interface DocumentPageData {
  readonly kind: DocumentKind;
  readonly page: ContentPage;
  /** The page's entry in the navigation index. */
  readonly entry: NavigationDocument;
  /** Every live group of the page. */
  readonly groups: readonly ExampleGroup[];
}

/** Loads the content page of a guide or template, the native example components and the listings of its live groups. */
export async function loadDocumentPage(
  kind: DocumentKind,
  slug: string,
  lang: Lang,
  sources: Pick<ExampleSourcesLoader, 'load'>,
): Promise<DocumentPageData | null> {
  const entry = navigationDocument(kind, slug);
  if (!entry || !entry.langs.includes(lang)) return null;
  const key = pageKey(kind, slug);
  const [page, natives] = await Promise.all([loadContentPage(key, lang), loadNativeExamples(key, lang)]);
  if (!page) return null;
  const groups = await Promise.all(
    entry.examples
      .filter((group) => page.liveGroups.includes(group.example))
      .map(async (group): Promise<ExampleGroup> => ({
        id: key,
        lang,
        example: group.example,
        headingId: group.section,
        native: (natives[group.example] as Type<unknown> | undefined) ?? null,
        sources: await sources.load(key, lang, group.example),
      })),
  );
  return { kind, page, entry, groups };
}

/** Resolves the page in an injection context; a page the build did not produce in this language goes to the 404 page. */
export async function resolveDocument(route: ActivatedRouteSnapshot, kind: DocumentKind): Promise<DocumentPageData | RedirectCommand> {
  const router = inject(Router);
  const sources = inject(ExampleSourcesLoader);
  const slug = route.paramMap.get('id') ?? '';
  const lang = route.paramMap.get('lang');
  const data = isLang(lang) ? await loadDocumentPage(kind, slug, lang, sources) : null;
  return data ?? new RedirectCommand(router.parseUrl('/404'), { skipLocationChange: true });
}
