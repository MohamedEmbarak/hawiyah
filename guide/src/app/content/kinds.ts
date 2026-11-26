/**
 * The kinds of document of the guide, as scripts/content/kinds.mjs defines them: a
 * component page has the key <id>, a guide guide:<id>, a template template:<id>. The key
 * names the page's content model, its live groups and its example payloads; in a file or
 * directory name its colon is a full stop (pathKey).
 */
export type DocumentKind = 'guide' | 'template';
export type PageKind = 'component' | DocumentKind;

/** The route segment of each kind of document. */
export const KIND_ROUTES: Readonly<Record<PageKind, string>> = { component: 'components', guide: 'guides', template: 'templates' };

/** The key of a page of a kind. */
export function pageKey(kind: PageKind, id: string): string {
  return kind === 'component' ? id : `${kind}:${id}`;
}

/** The kind and the id inside the kind of a key. */
export function parseKey(key: string): { kind: PageKind; id: string } {
  const match = /^(guide|template):(.+)$/.exec(key);
  return match ? { kind: match[1] as DocumentKind, id: match[2] } : { kind: 'component', id: key };
}

/** The form of a key in file and directory names: guide:x is guide.x. */
export const pathKey = (key: string): string => key.replace(':', '.');

/** The base-relative path (below <lang>/) of a page: the reference view of a component page, the page of a guide or a template. */
export function pagePathOf(key: string): string {
  const { kind, id } = parseKey(key);
  return kind === 'component' ? `components/${id}/reference/` : `${KIND_ROUTES[kind]}/${id}/`;
}
