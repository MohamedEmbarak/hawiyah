#!/usr/bin/env node
// The frame fixture: the pages of docs/components/
// and one generated page of a page-level component whose live group carries
// frame and width=390, so that the framed Angular result, its two equivalence
// widths and the evidence panel of a component without recorded evidence are
// tested on a real build. Nothing of what it writes is committed; it is built
// only through --docs, which keeps the output not deployable:
//
//   node scripts/test/frame/generate.mjs [--out <dir>]
//   HAWIYAH_BASE_PATH=/hawiyah/ npm run build -- --docs .cache/frame/docs
//   GUIDE_E2E_PORT=<port> npx playwright test --project=prod pages/framed.spec.ts pages/evidence.spec.ts equivalence/native-vs-frame.spec.ts
//
// The generated page is PageHeader (page-header): it renders an h1 of its own,
// it has no controller (so no keyboard checks), no evidence entry in
// components.json and a Known defects entry of CHANGELOG.md. Its English page is
// the scaffold of content:scaffold with a summary, one sentence per prose
// section and the framed group; the Arabic page is the placeholder sibling of
// content:scaffold-ar --placeholder.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReaders, declaredMembers } from '../../api-tables/members.mjs';
import { stylesVersion } from '../../api-tables/notes.mjs';
import { H2 } from '../../content/config.mjs';
import { frontMatterBlock } from '../../content/hash.mjs';
import { scaffoldArabic } from '../../content/scaffold-ar.mjs';
import { scaffoldPage } from '../../content/scaffold.mjs';
import { generatedProse, relink } from '../scale/generate.mjs';

const guideDir = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const repoDir = resolve(guideDir, '..');
export const DEFAULT_OUT = join(guideDir, '.cache', 'frame', 'docs');
/** The generated page-level component of the fixture. */
export const FRAMED_ID = 'page-header';
const docsDir = join(repoDir, 'docs', 'components');
const heading = (id) => `## ${H2.find((item) => item.id === id).en}`;

/** The framed group of the fixture: a PageHeader with a title, a description and one action. */
export function framedGroup() {
  const html = [
    '<header class="hw-page-header">',
    '  <div class="hw-page-header-main">',
    '    <div>',
    '      <h1>Requests</h1>',
    '      <p>Track the requests you submitted.</p>',
    '    </div>',
    '    <div class="hw-page-header-actions">',
    '      <button class="hw-button" type="button" data-variant="primary" data-size="md">New request</button>',
    '    </div>',
    '  </div>',
    '</header>',
  ].join('\n');
  const tsx = '<PageHeader title="Requests" description="Track the requests you submitted." actions={<Button variant="primary">New request</Button>} />';
  const vue = [
    '<PageHeader title="Requests" description="Track the requests you submitted.">',
    '  <template #actions><Button variant="primary">New request</Button></template>',
    '</PageHeader>',
  ].join('\n');
  const angular = 'template: `<hw-page-header title="Requests" description="Track the requests you submitted."><button hwButton variant="primary">New request</button></hw-page-header>`';
  return [
    '```html live example=page frame width=390 static', html, '```', '',
    '```tsx live example=page', tsx, '```', '',
    '```vue live example=page', vue, '```', '',
    '```ts live example=page framework=angular', angular, '```',
  ].join('\n');
}

/** The English page of the framed fixture id. */
export function framedPage(declared, entry, version) {
  let page = generatedProse(scaffoldPage(declared, entry, version));
  page = page.replace(`# ${entry.name}\n`, `# ${entry.name}\n\n${entry.name} is shown here by a generated page of the frame fixture of the guide build. The page is never deployed.\n`);
  page = page.replace(`${heading('example')}\n`, `${heading('example')}\n\nThe page header renders its own h1, so its Angular result is shown in a frame.\n\n${framedGroup()}\n`);
  page = page.replace(`${heading('accessibility')}\n`, `${heading('accessibility')}\n\nThe accessibility section of a generated page.\n`);
  page = page.replace(`${heading('rtl-and-localisation')}\n`, `${heading('rtl-and-localisation')}\n\nThe localisation section of a generated page.\n`);
  return page;
}

/** Writes the fixture: { dir, copied, generated }. */
export function generateFrame({ out = DEFAULT_OUT } = {}) {
  const nodeModules = join(guideDir, 'node_modules');
  const readers = createReaders({ nodeModules, componentsFile: join(repoDir, 'components.json') });
  const dir = join(out, 'components');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const copied = [];
  for (const name of readdirSync(docsDir).filter((file) => /^[a-z0-9-]+\.md$/.test(file) && file !== 'README.md')) {
    const id = name.slice(0, -3);
    const english = relink(readFileSync(join(docsDir, `${id}.md`), 'utf8'), dir);
    const arabic = relink(readFileSync(join(docsDir, `${id}.ar.md`), 'utf8'), dir);
    writeFileSync(join(dir, `${id}.md`), english);
    writeFileSync(join(dir, `${id}.ar.md`), arabic.replace(/^---\n[\s\S]*?\n---/, frontMatterBlock(english)));
    copied.push(id);
  }
  const entry = readers.components.get(FRAMED_ID);
  const declared = declaredMembers(readers, FRAMED_ID);
  const version = stylesVersion(nodeModules);
  const english = framedPage(declared, entry, version);
  writeFileSync(join(dir, `${FRAMED_ID}.md`), english);
  writeFileSync(join(dir, `${FRAMED_ID}.ar.md`), scaffoldArabic(english, { entry, declared, map: {}, version, placeholder: true }).text);
  return { dir, copied, generated: [FRAMED_ID] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const argv = process.argv.slice(2);
    if (argv.length && (argv[0] !== '--out' || !argv[1] || argv.length > 2)) throw new Error('frame: usage: generate.mjs [--out <dir>]');
    const result = generateFrame({ out: argv[1] ? resolve(argv[1]) : DEFAULT_OUT });
    console.log(`frame: ${result.copied.length + 1} pages in 2 languages in ${result.dir} (${result.copied.join(', ')} copied, ${FRAMED_ID} generated with one framed group); build with --docs, never deployable`);
  } catch (error) {
    console.log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
