#!/usr/bin/env node
// test:page: the browser tests of one component page (5a.6 of milestone 5),
// against a production build that contains it:
//
//   npm run test:page -- <id> [<playwright option> ...]
//
// It runs `playwright test --project=prod` twice: once over every test whose
// title names a document of the page (the per-page suites: outline, framework
// tabs, editor links and tables of component-page.spec.ts, both halves of the
// styling rule, deep links), once over the page's own spec files
// (tests/e2e/pages/<id>.spec.ts, tests/e2e/<id>/) when they exist. Further
// arguments go to both runs (for example --trace off --reporter=line --output <dir>).
// A run of one page does not judge the union of the structural half of the
// styling rule (README.md, The styling rule): the full suite does.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const guideDir = resolve(fileURLToPath(new URL('..', import.meta.url)));

/** The title filter of the per-page tests of `id`: its routes and the describe of component-page.spec.ts. */
export function titleFilter(id) {
  return `(components/${id}/|component page ${id} \\()`;
}

/** The page's own spec files that exist. */
export function ownSpecs(id, root = guideDir) {
  return [join('tests', 'e2e', 'pages', `${id}.spec.ts`), join('tests', 'e2e', id)].filter((path) => existsSync(join(root, path)));
}

function main(argv) {
  const [id, ...rest] = argv;
  if (!id || !/^[a-z0-9-]+$/.test(id)) throw new Error('usage: npm run test:page -- <id> [<playwright option> ...]');
  const manifestFile = join(guideDir, 'src', 'generated', 'content', 'manifest.json');
  const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : { pages: [] };
  if (!existsSync(join(guideDir, 'dist', 'browser', 'index.html')) || !manifest.pages.some((page) => page.id === id)) {
    throw new Error(`test:page: the production build in dist/ does not contain the page ${id}; run HAWIYAH_BASE_PATH=/hawiyah/ npm run build first (with --pages ${id} for a local gate)`);
  }
  const runs = [['--grep', titleFilter(id)]];
  const specs = ownSpecs(id);
  if (specs.length) runs.push(specs);
  let failed = false;
  for (const args of runs) {
    const command = ['playwright', 'test', '--project=prod', ...args, ...rest];
    console.log(`test:page: npx ${command.join(' ')}`);
    const result = spawnSync('npx', command, { cwd: guideDir, stdio: 'inherit' });
    if (result.status !== 0) failed = true;
  }
  console.log(`test:page: ${id} ${failed ? 'FAILED' : 'OK'} (${runs.length} Playwright run(s): the per-page suites${specs.length ? ` and ${specs.join(', ')}` : ''})`);
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
