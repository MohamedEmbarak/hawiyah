import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
// @ts-expect-error: plain ES module of the build scripts, without type declarations.
import { availableRoutes } from '../../../scripts/index-html/generate.mjs';
// @ts-expect-error: plain ES module of the build scripts, without type declarations.
import { expectedDocuments } from '../../../scripts/postbuild/verify-routes.mjs';

export type Lang = 'ar' | 'en';

export interface GuideDocument {
  /** File under dist/browser. */
  readonly file: string;
  readonly lang: Lang;
  readonly kind: 'page' | 'redirect';
  /** Route without the base, '' for the root. */
  readonly route: string;
}

const generated = join(process.cwd(), 'src', 'generated');
const read = (file: string): unknown => JSON.parse(readFileSync(join(generated, file), 'utf8'));

export const features = read('features.json') as { id: string; order: number; paths: string[]; nav?: { path: string } }[];
const manifestFile = join(generated, 'content', 'manifest.json');
export const manifest = existsSync(manifestFile) ? (read(join('content', 'manifest.json')) as { pages: { id: string }[] }) : null;
export const pages = read('pages.json') as { components: { id: string; name: string; labelAr: string }[] };

/** One built component page of the navigation index (src/generated/content/navigation.json). */
export interface IndexedPage {
  readonly id: string;
  readonly langs: Lang[];
  readonly category: string;
  readonly title: Record<Lang, string>;
  readonly summary: Record<Lang, string>;
  readonly examples: { example: string; section: string; title?: Record<Lang, string> }[];
}

/** The navigation index of the build: the component pages by category. */
export const navigation = read(join('content', 'navigation.json')) as { categories: string[]; pages: IndexedPage[] };

/** An inline node of the page model. */
export interface ModelInline {
  readonly type: string;
  readonly value?: string;
  readonly children?: ModelInline[];
}

/** A table of the page model. */
export interface ModelTable {
  readonly type: 'table';
  readonly caption: string;
  /** The keyboard table of the Accessibility section (5a.8). */
  readonly keyboard?: true;
  readonly columns: { key: string; label: ModelInline[] }[];
  readonly rows: Record<string, ModelInline[]>[];
}

/** The page model of a component page (src/generated/content/pages/<id>.<lang>.json), the parts the specs read. */
export interface PageModel {
  readonly id: string;
  readonly lang: Lang;
  readonly title: string;
  readonly headings: { id: string; level: number; text: string }[];
  readonly liveGroups: string[];
  readonly tables: ModelTable[];
  /** The evidence panel (5a.11). */
  readonly evidence?: {
    readonly name: string;
    readonly built: string[];
    readonly verified: string[];
    readonly entries: { adapter: string; kind: string; tests: string[]; scope: string; command: string; result: string; date: string; source: string }[];
    readonly gaps: { kind: string; adapters: string[] }[];
    readonly notes: string[];
    readonly version: string;
    readonly open: { kind: 'defect' | 'difference'; id?: string; text: ModelInline[]; differences?: { id: string; text: ModelInline[] }[] }[];
  };
}

/** Every table of a model, in document order. */
function tablesOf(node: unknown): ModelTable[] {
  if (Array.isArray(node)) return node.flatMap(tablesOf);
  if (!node || typeof node !== 'object') return [];
  const value = node as Record<string, unknown>;
  if (value['type'] === 'table') return [value as unknown as ModelTable];
  return Object.values(value).flatMap(tablesOf);
}

/** Reads the page model of a built component page. */
export function pageModel(id: string, lang: Lang): PageModel {
  const model = read(join('content', 'pages', `${id}.${lang}.json`)) as Omit<PageModel, 'tables'> & { sections: unknown };
  return { ...model, tables: tablesOf(model.sections) };
}

/** The plain text of inline nodes, as the page shows it. */
export function inlineText(nodes: readonly ModelInline[] = []): string {
  return nodes.map((node) => node.value ?? inlineText(node.children)).join('');
}

/** Every document the build prerendered, as verify-routes expects them. */
export const documents: GuideDocument[] = expectedDocuments({ features, manifest });

/** Language pages (not the root, not 404, not redirect pages), each with its href relative to the base. */
export const languagePages = documents
  .filter((doc) => doc.kind === 'page' && doc.route !== '' && doc.route !== '404')
  .map((doc) => ({ ...doc, href: `${doc.route}/` }));

/** What the pre-paint script may target, as step 35 embedded it. */
export const available: { components: string[]; landing: boolean } = availableRoutes({ features, pages });
