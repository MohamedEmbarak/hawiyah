#!/usr/bin/env node
// The scale fixture of the guide build (leadAmendments A7 and lead decision L10
// of milestone 5, stage 5a): component pages for every id of components.json in
// English and Arabic, written in one process from the scaffold functions of
// content:scaffold and content:scaffold-ar. Nothing of what it writes is
// committed, and it is built only through the documented scope option --docs,
// which keeps the output not deployable:
//
//   node scripts/test/scale/generate.mjs [--out <dir>] [--groups <n>]
//   HAWIYAH_BASE_PATH=/hawiyah/ npm run build -- --docs <dir> --defer-equivalence
//
// --out defaults to .cache/scale/docs (ignored by Git); the pages go to
// <out>/components/. Each generated page is the English scaffold (h1, sections,
// the four API tables from the installed packages, the compliance sentence) with
// a summary, a sentence in each prose section and <n> generic static live groups
// (default 6): one in Example and n - 1 under h3 headings of Variants and states.
// A generic group is the same small piece of package markup in the four
// frameworks (a paragraph and a package Button) and is compared at rest only
// (static); fixture.json beside the pages says so for HWC-LIVE7 of step 20. Each
// API table and the compliance sentence are followed by one generated sentence (HWC-EMPTY). The Arabic page is
// content:scaffold-ar --placeholder of the
// English page. Button and Tabs are copied from docs/components/ instead (their
// relative links rewritten to lead to the same files, the Arabic hashes renewed
// for that change), so the page-specific browser tests and interaction checks of
// the pilots run on the fixture as they do on the guide.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReaders, declaredMembers } from '../../api-tables/members.mjs';
import { stylesVersion } from '../../api-tables/notes.mjs';
import { H2 } from '../../content/config.mjs';
import { frontMatterBlock } from '../../content/hash.mjs';
import { scaffoldArabic } from '../../content/scaffold-ar.mjs';
import { complianceSentence, scaffoldPage, tableProblems } from '../../content/scaffold.mjs';

const guideDir = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const repoDir = resolve(guideDir, '..');
export const DEFAULT_OUT = join(guideDir, '.cache', 'scale', 'docs');
export const DEFAULT_GROUPS = 6;
/** Pages copied from docs/components/ rather than generated. */
export const REAL_PAGES = ['button', 'tabs'];

const docsDir = join(repoDir, 'docs', 'components');

/**
 * A page of docs/components/ with its relative links to repository files written
 * relative to `dir`, so they lead to the same files (links to another component
 * page, fragments and addresses stay).
 */
export function relink(text, dir) {
  return text.replace(/\]\(([^)\s#]+)(#[^)\s]*)?\)/g, (whole, target, fragment = '') => {
    if (/^[a-z]+:/i.test(target) || /^[a-z0-9-]+(\.ar)?\.md$/.test(target)) return whole;
    const moved = relative(dir, resolve(docsDir, target)).split('\\').join('/');
    return `](${moved}${fragment})`;
  });
}

/**
 * One generic static group in the four frameworks: a paragraph and a package
 * Button, written as the Button page writes its variants (a Vue fragment needs a
 * package component: the wrapper of step 25 writes no script block without one).
 */
export function genericGroup(name, index, componentName) {
  const text = `Generic group ${index} of ${componentName}.`;
  const action = `Action ${index}`;
  const lines = (open, paragraph, button) => [open, `  ${paragraph}`, `  ${button}`, '</div>'].join('\n');
  const html = lines('<div class="hw-stack">', `<p class="hw-type">${text}</p>`, `<button class="hw-button" type="button" data-variant="secondary" data-size="md">${action}</button>`);
  const jsx = lines('<div className="hw-stack">', `<p className="hw-type">${text}</p>`, `<Button variant="secondary">${action}</Button>`);
  const vue = lines('<div class="hw-stack">', `<p class="hw-type">${text}</p>`, `<Button variant="secondary">${action}</Button>`);
  const angular = lines('<div class="hw-stack">', `<p class="hw-type">${text}</p>`, `<button hwButton variant="secondary">${action}</button>`);
  return [
    '```html live example=' + name + ' static', html, '```', '',
    '```tsx live example=' + name, jsx, '```', '',
    '```vue live example=' + name, vue, '```', '',
    '```ts live example=' + name + ' framework=angular', `template: \`${angular}\``, '```',
  ].join('\n');
}

const heading = (id) => `## ${H2.find((item) => item.id === id).en}`;

/** The fixture declaration of the scale fixture (scripts/content/pipeline.mjs, readFixture). */
export const FIXTURE = {
  fixture: 'scale',
  showsComponent: 'button',
  reason: 'The generic static groups of the generated pages show a paragraph and a package Button in the four frameworks, not the component of their page.',
};

/**
 * One generated sentence after each API table and after the compliance sentence of a
 * scaffold, so that a generated page is not hollow (HWC-EMPTY of step 20).
 */
export function generatedProse(scaffold) {
  const prose = 'The members of this table are read from the installed packages.';
  let page = scaffold;
  for (const h3 of ['React', 'Vue', 'Angular']) page = page.replace(`\n\n### ${h3}\n`, `\n\n${prose}\n\n### ${h3}\n`);
  page = page.replace(`\n\n${heading('accessibility')}\n`, `\n\n${prose}\n\n${heading('accessibility')}\n`);
  return page.replace(`${complianceSentence('en')}\n`, `${complianceSentence('en')}\n\nA generated page of a fixture names no source of the mapping.\n`);
}

/** The English page of a generated id: the scaffold with a summary, prose and `groups` generic groups. */
export function generatedPage(declared, entry, version, groups = DEFAULT_GROUPS) {
  let page = scaffoldPage(declared, entry, version);
  const summary = `${entry.name} is shown here by a generated page of the scale fixture of the guide build. The page is never deployed.`;
  page = page.replace(`# ${entry.name}\n`, `# ${entry.name}\n\n${summary}\n`);
  const example = [heading('example'), '', `The first generic group of ${entry.name}.`, '', genericGroup('example-1', 1, entry.name)].join('\n');
  const variants = [heading('variants-and-states')];
  for (let index = 2; index <= groups; index += 1) {
    variants.push('', `### Generic group ${index}`, '', `Generic group ${index} of the scale fixture.`, '', genericGroup(`example-${index}`, index, entry.name));
  }
  page = page.replace(`${heading('example')}\n`, `${example}\n\n${groups > 1 ? `${variants.join('\n')}\n\n` : ''}`);
  page = generatedProse(page);
  page = page.replace(`${heading('accessibility')}\n`, `${heading('accessibility')}\n\nThe accessibility section of a generated page.\n`);
  page = page.replace(`${heading('rtl-and-localisation')}\n`, `${heading('rtl-and-localisation')}\n\nThe localisation section of a generated page.\n`);
  return page;
}

/**
 * Writes the fixture: { pages, generated, copied, groups } where pages counts the ids.
 * Throws when the scaffold cannot write an id (a reader problem or a list gap).
 */
export function generateScale({ out = DEFAULT_OUT, groups = DEFAULT_GROUPS } = {}) {
  const nodeModules = join(guideDir, 'node_modules');
  const readers = createReaders({ nodeModules, componentsFile: join(repoDir, 'components.json') });
  const version = stylesVersion(nodeModules);
  const dir = join(out, 'components');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  let generated = 0;
  let copied = 0;
  for (const [id, entry] of readers.components) {
    if (REAL_PAGES.includes(id)) {
      const english = relink(readFileSync(join(docsDir, `${id}.md`), 'utf8'), dir);
      const arabic = relink(readFileSync(join(docsDir, `${id}.ar.md`), 'utf8'), dir);
      writeFileSync(join(dir, `${id}.md`), english);
      // The Arabic front matter holds the hashes of the English sections, whose links moved.
      writeFileSync(join(dir, `${id}.ar.md`), arabic.replace(/^---\n[\s\S]*?\n---/, frontMatterBlock(english)));
      copied += 1;
      continue;
    }
    const declared = declaredMembers(readers, id);
    const problems = tableProblems(declared);
    if (problems.length) throw new Error(`scale: the tables of ${id} cannot be written: ${problems.join('; ')}`);
    const english = generatedPage(declared, entry, version, groups);
    const arabic = scaffoldArabic(english, { entry, declared, map: {}, version, placeholder: true }).text;
    writeFileSync(join(dir, `${id}.md`), english);
    writeFileSync(join(dir, `${id}.ar.md`), arabic);
    generated += 1;
  }
  // The generic groups show the package Button, not the page's component (HWC-LIVE7):
  // the fixture says so in fixture.json, which step 20 reads only outside docs/components.
  writeFileSync(join(out, 'fixture.json'), `${JSON.stringify(FIXTURE, null, 2)}\n`);
  return { dir, pages: generated + copied, generated, copied, groups };
}

function parseArgs(argv) {
  const options = { out: DEFAULT_OUT, groups: DEFAULT_GROUPS };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i + 1];
    if (argv[i] === '--out' && value) options.out = resolve(value);
    else if (argv[i] === '--groups' && /^[1-9]\d?$/.test(value ?? '')) options.groups = Number(value);
    else throw new Error(`scale: unknown or incomplete option ${argv[i]} (usage: generate.mjs [--out <dir>] [--groups <1-99>])`);
    i += 1;
  }
  return options;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = generateScale(parseArgs(process.argv.slice(2)));
    console.log(`scale: ${result.pages} pages in 2 languages in ${result.dir} (${result.generated} generated with ${result.groups} generic static groups each, ${result.copied} copied: ${REAL_PAGES.join(', ')}); build with --docs, never deployable`);
  } catch (error) {
    console.log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

