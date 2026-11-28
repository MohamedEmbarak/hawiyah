#!/usr/bin/env node
// The fixture of the two document kinds: the pages of docs/components/, one guide
// (guide:fixture-guide) and one template (template:fixture-template), so that the
// content step, step 25, step 80, the prerendered routes and the browser tests of
// guides and templates run on a real build before a writer adds the first page.
// Nothing of what it writes is committed; it is built only through --docs, which keeps
// the output not deployable:
//
//   node scripts/test/kinds/generate.mjs [--out <dir>]
//   HAWIYAH_BASE_PATH=/hawiyah/ npm run build -- --docs .cache/kinds/docs --pages guide:fixture-guide,template:fixture-template
//   npx playwright test --project=prod kinds/
//
// The English and Arabic sources are scripts/test/kinds/fixtures/<kind>/<id>(.ar).md;
// the Arabic front matter is written from the English page (content:hash), so the
// fixture stays in step when its English text changes.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { frontMatterBlock } from '../../content/hash.mjs';
import { KINDS } from '../../content/kinds.mjs';

const guideDir = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const repoDir = resolve(guideDir, '..');
export const DEFAULT_OUT = join(guideDir, '.cache', 'kinds', 'docs');
const SOURCES = join(guideDir, 'scripts', 'test', 'kinds', 'fixtures');
/** The pages of the fixture by kind. */
export const FIXTURE_PAGES = Object.freeze({ guide: ['fixture-guide'], template: ['fixture-template'] });

/**
 * The links of a page copied into the fixture inside the repository (.cache/kinds/docs):
 * a link to a page of the copy (an id of the same directory, or ../components/,
 * ../guides/ and ../templates/) stays; any other relative link is rewritten to the file
 * it names beside docs/<kind> of the repository.
 */
export function relinkCopy(text, kind, dir) {
  // A copy outside the repository resolves its links as docs/<kind> does (the content step).
  if (relative(repoDir, dir).startsWith('..')) return text;
  return text.replace(/\]\(([^)\s#]+)(#[^)\s]*)?\)/g, (whole, target, fragment = '') => {
    if (/^[a-z]+:/i.test(target) || /^(?:\.\.\/(?:components|guides|templates)\/)?[a-z0-9-]+(\.ar)?\.md$/.test(target)) return whole;
    const moved = relative(dir, resolve(repoDir, 'docs', KINDS[kind].dir, target)).split('\\').join('/');
    return `](${moved}${fragment})`;
  });
}

/** Writes the fixture: { dir, components, guides, templates }. */
export function generateKinds({ out = DEFAULT_OUT } = {}) {
  rmSync(out, { recursive: true, force: true });
  const components = join(out, KINDS.component.dir);
  mkdirSync(components, { recursive: true });
  const source = join(repoDir, 'docs', 'components');
  const copied = readdirSync(source).filter((name) => /^[a-z0-9-]+(\.ar)?\.md$/.test(name) && name !== 'README.md');
  for (const name of copied) {
    let text = relinkCopy(readFileSync(join(source, name), 'utf8'), 'component', components);
    // The Arabic copy takes the section hashes of the English copy, whose links were rewritten.
    if (name.endsWith('.ar.md')) {
      const english = relinkCopy(readFileSync(join(source, name.replace(/\.ar\.md$/, '.md')), 'utf8'), 'component', components);
      text = text.replace(/^---\n[\s\S]*?\n---/, frontMatterBlock(english));
    }
    writeFileSync(join(components, name), text);
  }
  for (const [kind, ids] of Object.entries(FIXTURE_PAGES)) {
    const dir = join(out, KINDS[kind].dir);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.json'), `${JSON.stringify({ pages: ids }, null, 2)}\n`);
    for (const id of ids) {
      const english = relinkCopy(readFileSync(join(SOURCES, KINDS[kind].dir, `${id}.md`), 'utf8'), kind, dir);
      const arabic = relinkCopy(readFileSync(join(SOURCES, KINDS[kind].dir, `${id}.ar.md`), 'utf8'), kind, dir);
      writeFileSync(join(dir, `${id}.md`), english);
      writeFileSync(join(dir, `${id}.ar.md`), `${frontMatterBlock(english, kind)}\n${arabic}`);
    }
  }
  return { dir: out, components: copied.length, guides: FIXTURE_PAGES.guide.length, templates: FIXTURE_PAGES.template.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const at = args.indexOf('--out');
  const out = at >= 0 ? resolve(args[at + 1]) : DEFAULT_OUT;
  const result = generateKinds({ out });
  console.log(`kinds: ${result.components} component files copied, ${result.guides} guide and ${result.templates} template in ${result.dir} (fixture-guide, fixture-template); build with --docs, never deployable`);
}
