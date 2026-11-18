// Fixture guide trees for the registry-check unit tests. Seven fake
// @hawiyah packages are packed with 'npm pack' once; every tree is a fresh
// copy of a valid template (package.json, package-lock.json, the hidden
// lockfile, node_modules extracted from the fake tarballs, src, scripts,
// angular.json, tsconfig.json, .npmrc and the repository's
// pnpm-workspace.yaml) in a temporary directory. The stub registry answers
// with the fake tarballs' integrity and paths.

import { execFile, execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { NAMES, REGISTRY_URL } from '../messages.mjs';
import { RegistryError } from '../registry.mjs';
import { sha512Integrity } from '../tar.mjs';

const run = promisify(execFile);
export const PIN = '0.3.0';
export const NPMRC = 'engine-strict=true\nsave-exact=true\nfund=false\naudit=false\nregistry=https://registry.npmjs.org/\n';

const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
export const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
export const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

let fixturePromise;

async function packFixtures() {
  const base = mkdtempSync(join(tmpdir(), 'hw-registry-check-'));
  const sources = join(base, 'sources');
  const tarballs = join(base, 'tarballs');
  mkdirSync(tarballs, { recursive: true });
  const packages = {};
  await Promise.all(NAMES.map(async (name) => {
    const dir = join(sources, name);
    mkdirSync(join(dir, 'dist'), { recursive: true });
    writeJson(join(dir, 'package.json'), {
      name: `@hawiyah/${name}`,
      version: PIN,
      license: 'Apache-2.0',
      type: 'module',
      files: ['dist'],
      exports: { '.': './dist/index.js' },
    });
    writeFileSync(join(dir, 'README.md'), `# @hawiyah/${name}\n\nFixture package.\n`);
    writeFileSync(join(dir, 'dist', 'index.js'), `export const name = '${name}';\n`);
    if (name === 'styles') writeFileSync(join(dir, 'dist', 'styles.css'), ':root { --hw-fixture: 1; }\n');
    const { stdout } = await run('npm', ['pack', dir, '--pack-destination', tarballs, '--json', '--loglevel=error'], { cwd: base });
    const [packed] = JSON.parse(stdout);
    const file = join(tarballs, packed.filename);
    packages[name] = { file, integrity: sha512Integrity(readFileSync(file)) };
  }));

  // Template tree: <base>/template/{pnpm-workspace.yaml, guide/...}.
  const repo = join(base, 'template');
  const guide = join(repo, 'guide');
  mkdirSync(join(guide, 'node_modules', '@hawiyah'), { recursive: true });
  writeFileSync(join(repo, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n  - apps/*\n  - examples/*\n');
  const dependencies = Object.fromEntries(NAMES.map((name) => [`@hawiyah/${name}`, PIN]));
  writeJson(join(guide, 'package.json'), { name: 'fixture-guide', version: '0.0.0', private: true, dependencies });
  const lockPackages = {};
  for (const name of NAMES) {
    lockPackages[`node_modules/@hawiyah/${name}`] = {
      version: PIN,
      resolved: `${REGISTRY_URL}@hawiyah/${name}/-/${name}-${PIN}.tgz`,
      integrity: packages[name].integrity,
      license: 'Apache-2.0',
    };
    const target = join(guide, 'node_modules', '@hawiyah');
    const scratch = join(base, 'extract', name);
    mkdirSync(scratch, { recursive: true });
    execFileSync('tar', ['-xzf', packages[name].file, '-C', scratch]);
    renameSync(join(scratch, 'package'), join(target, name));
  }
  writeJson(join(guide, 'package-lock.json'), {
    name: 'fixture-guide',
    version: '0.0.0',
    lockfileVersion: 3,
    requires: true,
    packages: { '': { name: 'fixture-guide', version: '0.0.0', dependencies }, ...lockPackages },
  });
  writeJson(join(guide, 'node_modules', '.package-lock.json'), {
    name: 'fixture-guide', version: '0.0.0', lockfileVersion: 3, requires: true, packages: lockPackages,
  });
  writeFileSync(join(guide, '.npmrc'), NPMRC);
  mkdirSync(join(guide, 'src', 'app'), { recursive: true });
  writeFileSync(join(guide, 'src', 'app', 'app.ts'), "import { name } from '@hawiyah/core';\nexport const label = name;\n");
  writeFileSync(join(guide, 'src', 'styles.css'), "@import '@hawiyah/styles/styles.css';\n");
  mkdirSync(join(guide, 'scripts', 'content'), { recursive: true });
  writeFileSync(join(guide, 'scripts', 'content', 'paths.mjs'), "export const docs = '../docs/components';\n");
  writeJson(join(guide, 'tsconfig.json'), { compilerOptions: { strict: true, module: 'preserve' } });
  writeJson(join(guide, 'angular.json'), {
    projects: { guide: { architect: { build: { options: {
      assets: [{ glob: '*.svg', input: 'node_modules/@hawiyah/styles/dist/assets', output: 'brand' }],
    } } } } },
  });
  fixturePromise.base = base;
  return { base, repo, guide, tarballs, packages };
}

export function fixtures() {
  fixturePromise ??= packFixtures();
  return fixturePromise;
}

let counter = 0;

// A fresh copy of the valid template: returns { repoDir, guideDir }.
export async function makeTree() {
  const fixture = await fixtures();
  counter += 1;
  const repoDir = join(fixture.base, `tree-${counter}`);
  cpSync(fixture.repo, repoDir, { recursive: true, verbatimSymlinks: true });
  return { repoDir, guideDir: join(repoDir, 'guide'), fixture };
}

export function stubRegistry(fixture, overrides = {}) {
  return {
    url: REGISTRY_URL,
    host: 'registry.npmjs.org',
    async view(spec) {
      if (overrides.unreachable) throw new RegistryError('unreachable', 'connect ECONNREFUSED');
      const match = spec.match(/^@hawiyah\/([a-z]+)@(.+)$/);
      if (!match || !fixture.packages[match[1]] || match[2] !== PIN) throw new RegistryError('not-found', `404 ${spec}`);
      return { integrity: fixture.packages[match[1]].integrity, tarball: `${REGISTRY_URL}@hawiyah/${match[1]}/-/${match[1]}-${PIN}.tgz` };
    },
    async tarball(spec) {
      const match = spec.match(/^@hawiyah\/([a-z]+)@/);
      return fixture.packages[match[1]].file;
    },
    async config(key) {
      if (key === 'registry') return overrides.registry ?? REGISTRY_URL;
      return overrides[key] ?? 'undefined';
    },
  };
}

export function editJson(file, edit) {
  const value = readJson(file);
  edit(value);
  writeJson(file, value);
}

// Sets a dependency in package.json and, as npm would, in the lock root.
export function setDependency(guideDir, section, name, value) {
  for (const [file, pick] of [
    [join(guideDir, 'package.json'), (json) => json],
    [join(guideDir, 'package-lock.json'), (json) => json.packages['']],
  ]) {
    editJson(file, (json) => {
      const target = pick(json);
      target[section] ??= {};
      if (value === undefined) delete target[section][name];
      else target[section][name] = value;
      if (Object.keys(target[section]).length === 0) delete target[section];
    });
  }
}

// Writes dist/browser/runtime/ with one published, one bundled file and a
// manifest that matches them.
export function writeRuntime(guideDir) {
  const lock = readJson(join(guideDir, 'package-lock.json'));
  const runtime = join(guideDir, 'dist', 'browser', 'runtime');
  mkdirSync(join(runtime, 'hawiyah', 'core'), { recursive: true });
  mkdirSync(join(runtime, 'bundles'), { recursive: true });
  const published = readFileSync(join(guideDir, 'node_modules', '@hawiyah', 'core', 'dist', 'index.js'));
  writeFileSync(join(runtime, 'hawiyah', 'core', 'index.js'), published);
  const bundled = Buffer.from('export const bundled = true;\n');
  writeFileSync(join(runtime, 'bundles', 'react.js'), bundled);
  const entries = [
    {
      path: 'hawiyah/core/index.js', sha256: sha256(published), bytes: published.length, source: 'published',
      package: '@hawiyah/core', version: PIN, packageIntegrity: lock.packages['node_modules/@hawiyah/core'].integrity, file: 'dist/index.js',
    },
    {
      path: 'bundles/react.js', sha256: sha256(bundled), bytes: bundled.length, source: 'bundled',
      package: '@hawiyah/react', version: PIN, packageIntegrity: lock.packages['node_modules/@hawiyah/react'].integrity, tool: 'esbuild 0.28.2',
    },
  ];
  writeJson(join(runtime, 'manifest.json'), { entries });
  writeJson(join(runtime, 'import-map.json'), { imports: {} });
  return join(guideDir, 'dist', 'browser');
}

export function cleanup() {
  if (fixturePromise?.base) rmSync(fixturePromise.base, { recursive: true, force: true });
}
