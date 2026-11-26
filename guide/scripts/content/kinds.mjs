// The kinds of document the content step reads (one definition for the scripts):
//
//   component  docs/components/<id>.md   key <id>             /<lang>/components/<id>/ (brief) and reference/
//   guide      docs/guides/<id>.md       key guide:<id>       /<lang>/guides/<id>/
//   template   docs/templates/<id>.md    key template:<id>    /<lang>/templates/<id>/
//
// A component page is listed by components.json; a guide or a template by the
// index.json of its directory ({ "pages": ["<id>", ...] }, in the order of the
// guide). The key of a page is what the manifest, the live groups (group key
// <key>/<lang>/<example>), pending-translation.json and check:page use: the kind
// prefix keeps the ids of guides and templates apart from component ids. A key is
// never written into a file or directory name as it is (an artifact upload refuses a
// colon): pathKey() replaces the colon by a full stop, which no component id holds.

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const KINDS = Object.freeze({
  component: Object.freeze({ dir: 'components', route: 'components', prefix: '', contractFiles: ['README.md'] }),
  guide: Object.freeze({ dir: 'guides', route: 'guides', prefix: 'guide:', contractFiles: ['README.md', 'glossary.md'] }),
  template: Object.freeze({ dir: 'templates', route: 'templates', prefix: 'template:', contractFiles: ['README.md'] }),
});

/** The kinds that are read from an index.json: guides and templates. */
export const DOCUMENT_KINDS = Object.freeze(['guide', 'template']);

/** An id of a page inside its kind. */
export const PAGE_ID = /^[a-z][a-z0-9-]*$/;

/** The key of a page: the id of a component page, <kind>:<id> for a guide or a template. */
export function pageKey(kind, id) {
  if (!KINDS[kind]) throw new Error(`content: unknown kind ${kind}`);
  return `${KINDS[kind].prefix}${id}`;
}

/** { kind, id } of a key ('button', 'guide:getting-started', 'template:service'), or null for a malformed key. */
export function parseKey(key) {
  const match = /^(?:(guide|template):)?([a-z0-9][a-z0-9-]*)$/.exec(String(key ?? ''));
  if (!match) return null;
  return { kind: match[1] ?? 'component', id: match[2] };
}

/** Whether a string is a key of some kind. */
export const isKey = (key) => parseKey(key) !== null;

/** The form of a key in file and directory names: guide:x is guide.x. */
export const pathKey = (key) => String(key).replace(':', '.');

/** The key of a path form (guide.x is guide:x). */
export const keyOfPath = (path) => String(path).replace(/^(guide|template)\./, '$1:');

/**
 * The base-relative address of a page in a language: the reference view of a
 * component page, the page of a guide or a template.
 */
export function pageHref(kind, lang, id) {
  if (kind === 'component') return `${lang}/components/${id}/reference/`;
  return `${lang}/${KINDS[kind].route}/${id}/`;
}

/**
 * The directories of the three kinds. Without --docs: docs/components, docs/guides and
 * docs/templates of the repository. With --docs <dir>: when <dir> holds a components
 * directory, the three directories below <dir> (a missing one holds no page);
 * otherwise <dir> is the components directory and guides and templates are read from
 * the repository.
 * @param {{ repoDir: string, docsDir?: string | null }} options
 */
export function kindDirs({ repoDir, docsDir = null }) {
  const repo = Object.fromEntries(Object.entries(KINDS).map(([kind, def]) => [kind, join(repoDir, 'docs', def.dir)]));
  if (!docsDir) return repo;
  const root = resolve(docsDir);
  if (existsSync(join(root, KINDS.component.dir))) {
    return Object.fromEntries(Object.entries(KINDS).map(([kind, def]) => [kind, join(root, def.dir)]));
  }
  return { ...repo, component: root };
}

/**
 * The ids an index.json lists, in order: { ids, error }. A missing file lists none.
 * @param {string} dir The directory of a kind.
 */
export function readIndex(dir) {
  const file = join(dir, 'index.json');
  if (!existsSync(file)) return { ids: [], error: null, exists: false };
  let data;
  try {
    data = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    return { ids: [], error: `index.json is not valid JSON: ${error.message}`, exists: true };
  }
  const keys = Object.keys(data ?? {});
  if (!data || typeof data !== 'object' || Array.isArray(data) || keys.join(',') !== 'pages' || !Array.isArray(data.pages)) {
    return { ids: [], error: 'index.json must be { "pages": ["<id>", ...] }', exists: true };
  }
  const bad = data.pages.filter((id) => typeof id !== 'string' || !PAGE_ID.test(id));
  if (bad.length) return { ids: [], error: `index.json lists ${bad.map((id) => JSON.stringify(id)).join(', ')}, which is not an id (${PAGE_ID})`, exists: true };
  const repeated = data.pages.filter((id, index) => data.pages.indexOf(id) !== index);
  if (repeated.length) return { ids: [], error: `index.json lists ${repeated.join(', ')} more than once`, exists: true };
  return { ids: data.pages, error: null, exists: true };
}

/** The directory a kind is written in, in the repository (links of a copy resolve as they would there). */
export const homeDir = (repoDir, kind) => join(repoDir, 'docs', KINDS[kind].dir);

/** The fixed outline of a template: these h2 sections, in this order, each required and at most once. */
export const TEMPLATE_H2 = Object.freeze([
  { id: 'example', en: 'Example', ar: 'مثال', required: true },
  { id: 'composition', en: 'Composition', ar: 'المكوّنات المستخدمة', required: true },
  { id: 'platforms-code-reference', en: 'Platforms Code reference', ar: 'مرجع كود المنصات', required: true },
]);

/**
 * Whether an entry of a lead's list, which names its page by repository path
 * (docs/components/rating.ar.md), names this page file. A page read from a copy of
 * docs/ (a fixture built with --docs) is the same document when its path below the
 * docs directory is the same: components/rating.ar.md.
 */
export function sameDocument(entryFile, file) {
  if (entryFile === file) return true;
  const tail = (path) => /(?:^|\/)((?:components|guides|templates)\/[^/]+\.md)$/.exec(String(path).replace(/\\/g, '/'))?.[1];
  const a = tail(entryFile);
  return Boolean(a) && a === tail(file);
}
