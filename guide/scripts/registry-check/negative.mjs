#!/usr/bin/env node
// Real-environment negative controls of the registry check
// (registryCheck.negativeControls.real). Each control works on a temporary
// copy of the guide's inputs under .cache/negative/<n>/guide/ and never
// touches the real node_modules. The unmodified copy must pass first; then
// every control must be rejected with its expected rule code and no other.

import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkRegistry } from './check.mjs';
import { npmRegistry } from './registry.mjs';

const guideDir = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const repoDir = resolve(guideDir, '..');
const root = join(guideDir, '.cache', 'negative');

// Built from segments so that no string literal of this file names a
// repository package path (HWREG-R6 scans this file too).
const repoPath = (...segments) => segments.join('/');

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

function makeCopy(name) {
  const base = join(root, name);
  const copy = join(base, 'guide');
  rmSync(base, { recursive: true, force: true });
  mkdirSync(join(copy, 'node_modules'), { recursive: true });
  for (const entry of ['package.json', 'package-lock.json', '.npmrc', 'angular.json', ...readdirSync(guideDir).filter((file) => /^tsconfig.*\.json$/.test(file))]) {
    if (existsSync(join(guideDir, entry))) cpSync(join(guideDir, entry), join(copy, entry));
  }
  for (const dir of ['src', 'scripts']) {
    if (existsSync(join(guideDir, dir))) cpSync(join(guideDir, dir), join(copy, dir), { recursive: true });
  }
  cpSync(join(guideDir, 'node_modules', '.package-lock.json'), join(copy, 'node_modules', '.package-lock.json'));
  cpSync(join(guideDir, 'node_modules', '@hawiyah'), join(copy, 'node_modules', '@hawiyah'), { recursive: true });
  if (existsSync(join(repoDir, 'pnpm-workspace.yaml'))) cpSync(join(repoDir, 'pnpm-workspace.yaml'), join(base, 'pnpm-workspace.yaml'));
  return copy;
}

function setDependency(copy, name, value) {
  const pkg = readJson(join(copy, 'package.json'));
  pkg.dependencies[name] = value;
  writeJson(join(copy, 'package.json'), pkg);
  // npm records the same specifier in the lock root; mirror it so that only
  // the rule under test reacts.
  const lock = readJson(join(copy, 'package-lock.json'));
  lock.packages[''].dependencies[name] = value;
  writeJson(join(copy, 'package-lock.json'), lock);
}

const CONTROLS = [
  {
    label: 'node_modules/@hawiyah/core replaced by a symbolic link to a copy',
    code: 'HWREG-R5',
    mutate(copy) {
      const target = join(copy, '..', 'core-copy');
      cpSync(join(copy, 'node_modules', '@hawiyah', 'core'), target, { recursive: true });
      rmSync(join(copy, 'node_modules', '@hawiyah', 'core'), { recursive: true, force: true });
      symlinkSync(target, join(copy, 'node_modules', '@hawiyah', 'core'), 'dir');
    },
  },
  {
    label: 'one byte appended to node_modules/@hawiyah/styles/dist/styles.css',
    code: 'HWREG-R5',
    mutate(copy) {
      appendFileSync(join(copy, 'node_modules', '@hawiyah', 'styles', 'dist', 'styles.css'), ' ');
    },
  },
  {
    label: 'package.json @hawiyah/vue set to ^0.3.0',
    code: 'HWREG-R1',
    mutate(copy) {
      setDependency(copy, '@hawiyah/vue', '^0.3.0');
    },
  },
  {
    label: 'package-lock.json resolved of @hawiyah/angular set to a repository path',
    code: 'HWREG-R3',
    mutate(copy) {
      const lock = readJson(join(copy, 'package-lock.json'));
      lock.packages['node_modules/@hawiyah/angular'].resolved = `file:${repoPath('..', 'packages', 'angular')}`;
      writeJson(join(copy, 'package-lock.json'), lock);
    },
  },
  {
    label: 'a src file importing the repository source of @hawiyah/core',
    code: 'HWREG-R6',
    mutate(copy) {
      mkdirSync(join(copy, 'src'), { recursive: true });
      const specifier = repoPath('..', '..', 'packages', 'core', 'src', 'index.ts');
      writeFileSync(join(copy, 'src', 'negative-control.ts'), `import '${specifier}';\n`);
    },
  },
  {
    label: 'the registry adapter pointed at an unreachable host',
    code: 'HWREG-R4',
    registryUrl: 'http://127.0.0.1:9/',
    mutate() {},
  },
];

async function run(copy, shared, registryUrl) {
  const local = npmRegistry({ cwd: copy, cacheDir: join(root, 'cache') });
  const registry = registryUrl
    ? npmRegistry({ cwd: copy, cacheDir: join(root, 'cache'), registryUrl })
    : { ...shared, config: local.config };
  return checkRegistry({ guideDir: copy, repoDir: resolve(copy, '..'), registry });
}

async function main() {
  rmSync(root, { recursive: true, force: true });
  const shared = npmRegistry({ cwd: guideDir });

  const baseline = await run(makeCopy('0-baseline'), shared);
  if (!baseline.ok) {
    for (const finding of baseline.findings) console.error(finding.message);
    console.error('registry-check negative controls: the unmodified copy does not pass; the controls prove nothing');
    return 1;
  }

  let rejected = 0;
  const failures = [];
  for (const [index, control] of CONTROLS.entries()) {
    const copy = makeCopy(`${index + 1}`);
    control.mutate(copy);
    const result = await run(copy, shared, control.registryUrl);
    const codes = [...new Set(result.findings.map((finding) => finding.code))];
    const asExpected = !result.ok && codes.length === 1 && codes[0] === control.code;
    if (asExpected) {
      rejected += 1;
      console.log(`registry-check negative (${index + 1}) ${control.label}: rejected with ${control.code} (${result.findings.length} findings)`);
    } else {
      const got = result.ok ? 'it passed' : `got ${codes.join(', ')}`;
      failures.push(`registry-check negative (${index + 1}) ${control.label}: expected ${control.code} only, ${got}`);
      for (const finding of result.findings) failures.push(`  ${finding.message}`);
    }
  }
  for (const line of failures) console.error(line);
  console.log(`registry-check negative controls: ${rejected} of ${CONTROLS.length} rejected as expected`);
  if (rejected === CONTROLS.length) rmSync(root, { recursive: true, force: true });
  return rejected === CONTROLS.length ? 0 : 1;
}

process.exitCode = await main();
