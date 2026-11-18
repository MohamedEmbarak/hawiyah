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

/** Every document the build prerendered, as verify-routes expects them. */
export const documents: GuideDocument[] = expectedDocuments({ features, manifest });

/** Language pages (not the root, not 404, not redirect pages), each with its href relative to the base. */
export const languagePages = documents
  .filter((doc) => doc.kind === 'page' && doc.route !== '' && doc.route !== '404')
  .map((doc) => ({ ...doc, href: `${doc.route}/` }));

/** What the pre-paint script may target, as step 35 embedded it. */
export const available: { components: string[]; landing: boolean } = availableRoutes({ features, pages });
