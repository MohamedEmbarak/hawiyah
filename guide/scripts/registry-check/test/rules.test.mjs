// Unit negative controls of the registry check (registryCheck.negativeControls.unit):
// P1 and N1 to N23, plus the dist and preview modes. Every mutation must fail
// with exactly the expected rule code and the exact message text.

import { appendFileSync, cpSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { checkRegistry, failureLines, successLines } from '../check.mjs';
import { NAMES } from '../messages.mjs';
import { cleanup, editJson, fixtures, makeTree, PIN, readJson, setDependency, sha256, stubRegistry, writeRuntime } from './helpers.mjs';

beforeAll(async () => { await fixtures(); }, 120000);
afterAll(() => cleanup());

async function check(tree, options = {}) {
  const { registryOverrides, ...rest } = options;
  return checkRegistry({
    guideDir: tree.guideDir,
    repoDir: tree.repoDir,
    registry: stubRegistry(tree.fixture, registryOverrides),
    ...rest,
  });
}

const codes = (result) => [...new Set(result.findings.map((finding) => finding.code))].sort();
const messages = (result) => result.findings.map((finding) => finding.message);

async function expectOnly(tree, code, expectedMessages, options) {
  const result = await check(tree, options);
  expect(result.ok).toBe(false);
  expect(codes(result)).toEqual([code].flat().sort());
  for (const message of expectedMessages) expect(messages(result)).toContain(message);
  return result;
}

describe('positive control', () => {
  it('P1: the valid tree passes strict mode with the success lines', async () => {
    const tree = await makeTree();
    const result = await check(tree);
    expect(result.findings).toEqual([]);
    expect(result.ok).toBe(true);
    const lines = successLines(result);
    expect(lines).toHaveLength(8);
    expect(lines[0]).toBe(`registry-check: @hawiyah/tokens@${PIN} ok (lock, registry, files 3)`);
    expect(lines.at(-1)).toBe('registry-check: OK 7 packages @hawiyah/*@0.3.0 from https://registry.npmjs.org/');
  });

  it('P1 (dist): a dist with a matching runtime manifest passes', async () => {
    const tree = await makeTree();
    const distDir = writeRuntime(tree.guideDir);
    const result = await check(tree, { mode: 'dist', distDir });
    expect(result.findings).toEqual([]);
    expect(result.runtime).toEqual({ present: true, files: 4 });
  });
});

describe('HWREG-R1', () => {
  it('N1: a caret range is rejected', async () => {
    const tree = await makeTree();
    setDependency(tree.guideDir, 'dependencies', '@hawiyah/core', '^0.3.0');
    await expectOnly(tree, 'HWREG-R1', ['registry-check HWREG-R1: @hawiyah/core is "^0.3.0"; expected an exact version such as 0.3.0']);
  });

  it('N2: a dist-tag is rejected', async () => {
    const tree = await makeTree();
    setDependency(tree.guideDir, 'dependencies', '@hawiyah/core', 'next');
    await expectOnly(tree, 'HWREG-R1', ['registry-check HWREG-R1: @hawiyah/core is "next"; expected an exact version such as 0.3.0']);
  });

  it('N3: one package at another version is rejected', async () => {
    const tree = await makeTree();
    setDependency(tree.guideDir, 'dependencies', '@hawiyah/core', '0.2.1');
    await expectOnly(tree, 'HWREG-R1', [
      'registry-check HWREG-R1: versions differ: tokens@0.3.0, styles@0.3.0, core@0.2.1, vanilla@0.3.0, react@0.3.0, vue@0.3.0, angular@0.3.0; all seven share one pin',
    ]);
  });

  it('N4: a missing package is rejected', async () => {
    const tree = await makeTree();
    setDependency(tree.guideDir, 'dependencies', '@hawiyah/vue', undefined);
    await expectOnly(tree, 'HWREG-R1', ['registry-check HWREG-R1: @hawiyah/vue is missing from dependencies']);
  });

  it('N5: a package in devDependencies is rejected', async () => {
    const tree = await makeTree();
    setDependency(tree.guideDir, 'dependencies', '@hawiyah/react', undefined);
    setDependency(tree.guideDir, 'devDependencies', '@hawiyah/react', PIN);
    await expectOnly(tree, 'HWREG-R1', [
      'registry-check HWREG-R1: @hawiyah/react is missing from dependencies',
      'registry-check HWREG-R1: @hawiyah/react must be in dependencies only, found in devDependencies',
    ]);
  });
});

describe('HWREG-R2', () => {
  it('N6: a file: specifier is rejected', async () => {
    const tree = await makeTree();
    setDependency(tree.guideDir, 'dependencies', '@hawiyah/core', 'file:../packages/core');
    await expectOnly(tree, 'HWREG-R2', ['registry-check HWREG-R2: @hawiyah/core uses "file:../packages/core"; only exact registry versions are allowed']);
  });

  it('N7: a workspace: specifier is rejected', async () => {
    const tree = await makeTree();
    setDependency(tree.guideDir, 'dependencies', '@hawiyah/core', 'workspace:*');
    await expectOnly(tree, 'HWREG-R2', ['registry-check HWREG-R2: @hawiyah/core uses "workspace:*"; only exact registry versions are allowed']);
  });

  it('N8: an npm: alias is rejected by R2 and R3', async () => {
    const tree = await makeTree();
    setDependency(tree.guideDir, 'dependencies', 'hw-core', 'npm:@hawiyah/core@0.3.0');
    const lockEntry = readJson(join(tree.guideDir, 'package-lock.json')).packages['node_modules/@hawiyah/core'];
    editJson(join(tree.guideDir, 'package-lock.json'), (lock) => {
      lock.packages['node_modules/hw-core'] = { name: '@hawiyah/core', ...lockEntry };
    });
    await expectOnly(tree, ['HWREG-R2', 'HWREG-R3'], [
      'registry-check HWREG-R2: hw-core is an alias ("npm:@hawiyah/core@0.3.0"); aliases are not allowed',
      'registry-check HWREG-R3: node_modules/hw-core is an alias of @hawiyah/core',
    ]);
  });

  it('N9: overrides are rejected', async () => {
    const tree = await makeTree();
    editJson(join(tree.guideDir, 'package.json'), (pkg) => { pkg.overrides = { '@hawiyah/core': PIN }; });
    await expectOnly(tree, 'HWREG-R2', ['registry-check HWREG-R2: package.json has "overrides"; overrides and resolutions are not allowed']);
  });
});

describe('HWREG-R3', () => {
  const setResolved = (tree, name, resolved) => editJson(join(tree.guideDir, 'package-lock.json'), (lock) => {
    lock.packages[`node_modules/@hawiyah/${name}`].resolved = resolved;
  });

  it('N10: a lock entry resolved from a local tarball is rejected', async () => {
    const tree = await makeTree();
    setResolved(tree, 'core', 'file:../x.tgz');
    await expectOnly(tree, 'HWREG-R3', ['registry-check HWREG-R3: @hawiyah/core resolved from "file:../x.tgz"; expected https://registry.npmjs.org/@hawiyah/core/-/core-0.3.0.tgz']);
  });

  it('N11: a lock entry resolved from another registry is rejected', async () => {
    const tree = await makeTree();
    setResolved(tree, 'core', 'https://npm.example.org/@hawiyah/core/-/core-0.3.0.tgz');
    await expectOnly(tree, 'HWREG-R3', ['registry-check HWREG-R3: @hawiyah/core resolved from "https://npm.example.org/@hawiyah/core/-/core-0.3.0.tgz"; expected https://registry.npmjs.org/@hawiyah/core/-/core-0.3.0.tgz']);
  });

  it('N12: a workspace lock entry with link true is rejected', async () => {
    const tree = await makeTree();
    editJson(join(tree.guideDir, 'package-lock.json'), (lock) => {
      lock.packages['packages/core'] = { name: '@hawiyah/core', version: PIN, link: true };
    });
    await expectOnly(tree, 'HWREG-R3', ['registry-check HWREG-R3: lock entry "packages/core" is outside node_modules (workspace or link)']);
  });

  it('N12 (link): a node_modules entry that is a link is rejected', async () => {
    const tree = await makeTree();
    editJson(join(tree.guideDir, 'package-lock.json'), (lock) => {
      const entry = lock.packages['node_modules/@hawiyah/core'];
      lock.packages['node_modules/@hawiyah/core'] = { resolved: 'packages/core', link: true, integrity: entry.integrity };
    });
    await expectOnly(tree, 'HWREG-R3', ['registry-check HWREG-R3: @hawiyah/core is a link in the lockfile']);
  });

  it('N13: a nested copy is rejected', async () => {
    const tree = await makeTree();
    editJson(join(tree.guideDir, 'package-lock.json'), (lock) => {
      lock.packages['node_modules/@hawiyah/angular/node_modules/@hawiyah/core'] = { ...lock.packages['node_modules/@hawiyah/core'] };
    });
    await expectOnly(tree, 'HWREG-R3', ['registry-check HWREG-R3: nested copy of @hawiyah/core at node_modules/@hawiyah/angular/node_modules/@hawiyah/core']);
  });

  it('rejects lockfileVersion 2', async () => {
    const tree = await makeTree();
    editJson(join(tree.guideDir, 'package-lock.json'), (lock) => { lock.lockfileVersion = 2; });
    await expectOnly(tree, 'HWREG-R3', ['registry-check HWREG-R3: lockfileVersion 2; expected 3']);
  });
});

describe('HWREG-R4', () => {
  it('N14: a lock integrity changed by one character is rejected', async () => {
    const tree = await makeTree();
    const original = readJson(join(tree.guideDir, 'package-lock.json')).packages['node_modules/@hawiyah/core'].integrity;
    const changed = `${original.slice(0, 10)}${original[10] === 'A' ? 'B' : 'A'}${original.slice(11)}`;
    for (const file of ['package-lock.json', 'node_modules/.package-lock.json']) {
      editJson(join(tree.guideDir, file), (lock) => { lock.packages['node_modules/@hawiyah/core'].integrity = changed; });
    }
    await expectOnly(tree, 'HWREG-R4', [`registry-check HWREG-R4: @hawiyah/core@0.3.0: lock integrity ${changed} differs from registry ${original}`]);
  });

  it('an unreachable registry fails the check', async () => {
    const tree = await makeTree();
    await expectOnly(tree, 'HWREG-R4', ['registry-check HWREG-R4: registry.npmjs.org could not be reached (connect ECONNREFUSED); the check cannot pass offline'], {
      registryOverrides: { unreachable: true },
    });
  });

  it('a tarball whose bytes differ from the registry integrity is rejected', async () => {
    const tree = await makeTree();
    const corrupt = join(tree.repoDir, 'corrupt.tgz');
    cpSync(tree.fixture.packages.core.file, corrupt);
    appendFileSync(corrupt, Buffer.from([0]));
    const registry = stubRegistry(tree.fixture);
    const tarball = registry.tarball;
    registry.tarball = async (spec) => (spec.startsWith('@hawiyah/core@') ? corrupt : tarball(spec));
    const result = await checkRegistry({ guideDir: tree.guideDir, repoDir: tree.repoDir, registry });
    expect(codes(result)).toEqual(['HWREG-R4']);
    expect(messages(result)[0]).toMatch(/^registry-check HWREG-R4: @hawiyah\/core@0\.3\.0: tarball sha512 sha512-\S+ differs from registry sha512-/);
  });
});

describe('HWREG-R5', () => {
  it('N15: an installed directory replaced by a symbolic link to a copy is rejected', async () => {
    const tree = await makeTree();
    const dir = join(tree.guideDir, 'node_modules', '@hawiyah', 'core');
    const copy = join(tree.repoDir, 'core-copy');
    cpSync(dir, copy, { recursive: true });
    rmSync(dir, { recursive: true });
    symlinkSync(copy, dir, 'dir');
    await expectOnly(tree, 'HWREG-R5', [`registry-check HWREG-R5: node_modules/@hawiyah/core is a symbolic link to ${copy}`]);
  });

  it('N16: one byte changed in an installed dist file is rejected', async () => {
    const tree = await makeTree();
    const file = join(tree.guideDir, 'node_modules', '@hawiyah', 'core', 'dist', 'index.js');
    const bytes = readFileSync(file);
    bytes[0] ^= 1;
    writeFileSync(file, bytes);
    await expectOnly(tree, 'HWREG-R5', ['registry-check HWREG-R5: node_modules/@hawiyah/core/dist/index.js differs from the published tarball']);
  });

  it('N17: an extra installed file is rejected', async () => {
    const tree = await makeTree();
    writeFileSync(join(tree.guideDir, 'node_modules', '@hawiyah', 'core', 'dist', 'extra.js'), 'export {};\n');
    await expectOnly(tree, 'HWREG-R5', ['registry-check HWREG-R5: node_modules/@hawiyah/core/dist/extra.js is not in the published tarball']);
  });

  it('a missing installed file is rejected', async () => {
    const tree = await makeTree();
    rmSync(join(tree.guideDir, 'node_modules', '@hawiyah', 'core', 'README.md'));
    await expectOnly(tree, 'HWREG-R5', ['registry-check HWREG-R5: node_modules/@hawiyah/core/README.md from the published tarball is missing']);
  });

  it('a nested node_modules directory is rejected', async () => {
    const tree = await makeTree();
    mkdirSync(join(tree.guideDir, 'node_modules', '@hawiyah', 'angular', 'node_modules'));
    await expectOnly(tree, 'HWREG-R5', ['registry-check HWREG-R5: node_modules/@hawiyah/angular/node_modules is a nested node_modules directory']);
  });
});

describe('HWREG-R6', () => {
  it('N18: a source file importing the repository package source is rejected', async () => {
    const tree = await makeTree();
    writeFileSync(join(tree.guideDir, 'src', 'app', 'x.ts'), "import '../../../packages/core/src/index';\n");
    await expectOnly(tree, 'HWREG-R6', ['registry-check HWREG-R6: src/app/x.ts:1 imports "../../../packages/core/src/index"; the guide must use the installed package']);
  });

  it('N19: tsconfig.json paths for @hawiyah are rejected', async () => {
    const tree = await makeTree();
    editJson(join(tree.guideDir, 'tsconfig.json'), (config) => { config.compilerOptions.paths = { '@hawiyah/*': ['../packages/*/src'] }; });
    await expectOnly(tree, 'HWREG-R6', ['registry-check HWREG-R6: tsconfig.json defines a path alias for @hawiyah']);
  });

  it('rejects a relative path outside guide/ that is not an allowed content path', async () => {
    const tree = await makeTree();
    writeFileSync(join(tree.guideDir, 'scripts', 'content', 'readme.mjs'), "export const file = '../../../README.md';\n");
    await expectOnly(tree, 'HWREG-R6', ['registry-check HWREG-R6: scripts/content/readme.mjs:1 resolves "../../../README.md" outside guide/ to README.md, which is not an allowed content path']);
  });

  it('rejects an absolute local path and a CSS import of the repository stylesheet', async () => {
    const tree = await makeTree();
    // A synthetic local path, assembled so that no committed file contains one.
    const local = ['', 'home', 'someone', 'hawiyah'].join('/');
    writeFileSync(join(tree.guideDir, 'scripts', 'local.mjs'), `export const dir = '${local}';\n`);
    writeFileSync(join(tree.guideDir, 'src', 'extra.css'), "@import '../../packages/styles/src/styles.css';\n");
    await expectOnly(tree, 'HWREG-R6', [
      `registry-check HWREG-R6: scripts/local.mjs:1 imports "${local}"; the guide must use the installed package`,
      'registry-check HWREG-R6: src/extra.css:1 imports "../../packages/styles/src/styles.css"; the guide must use the installed package',
    ]);
  });

  it('rejects an esbuild alias for @hawiyah', async () => {
    const tree = await makeTree();
    writeFileSync(join(tree.guideDir, 'scripts', 'bundle.mjs'), "export const options = { alias: { '@hawiyah/core': './vendor/core.js' } };\n");
    await expectOnly(tree, 'HWREG-R6', ['registry-check HWREG-R6: scripts/bundle.mjs defines a path alias for @hawiyah']);
  });

  it('allows a relative import of the guide\'s own examples directory and rejects one of the repository examples', async () => {
    const tree = await makeTree();
    mkdirSync(join(tree.guideDir, 'scripts', 'build-steps'), { recursive: true });
    writeFileSync(join(tree.guideDir, 'scripts', 'build-steps', 'step.mjs'), "import { run } from '../examples/cli.mjs';\nexport default run;\n");
    writeFileSync(join(tree.guideDir, 'src', 'app', 'y.ts'), "import '../../../examples/angular/src/main';\n");
    await expectOnly(tree, 'HWREG-R6', ['registry-check HWREG-R6: src/app/y.ts:1 imports "../../../examples/angular/src/main"; the guide must use the installed package']);
  });

  it('allows the guide\'s own examples directory and the allowed content paths', async () => {
    const tree = await makeTree();
    writeFileSync(join(tree.guideDir, 'src', 'app', 'loader.ts'), "import { payload } from './examples/payload';\nexport const out = 'dist/browser/examples/';\nexport const docs = '../components.json';\n");
    const result = await check(tree);
    expect(result.findings).toEqual([]);
  });
});

describe('HWREG-R7', () => {
  it('N20: .npmrc with a @hawiyah registry is rejected', async () => {
    const tree = await makeTree();
    appendFileSync(join(tree.guideDir, '.npmrc'), '@hawiyah:registry=http://localhost:4873/\n');
    await expectOnly(tree, 'HWREG-R7', [
      'registry-check HWREG-R7: guide/.npmrc line "@hawiyah:registry=http://localhost:4873/" is not allowed',
      'registry-check HWREG-R7: @hawiyah:registry is set to http://localhost:4873/',
    ], { registryOverrides: { '@hawiyah:registry': 'http://localhost:4873/' } });
  });

  it('rejects another effective registry', async () => {
    const tree = await makeTree();
    await expectOnly(tree, 'HWREG-R7', ['registry-check HWREG-R7: the npm registry is http://localhost:4873/; expected https://registry.npmjs.org/'], {
      registryOverrides: { registry: 'http://localhost:4873/' },
    });
  });
});

describe('HWREG-R8', () => {
  it('N22: a changed runtime file is rejected', async () => {
    const tree = await makeTree();
    const distDir = writeRuntime(tree.guideDir);
    appendFileSync(join(distDir, 'runtime', 'hawiyah', 'core', 'index.js'), '//\n');
    await expectOnly(tree, 'HWREG-R8', ['registry-check HWREG-R8: runtime/manifest.json lists hawiyah/core/index.js, which is missing or has another sha256'], { mode: 'dist', distDir });
  });

  it('N22 (published): a manifest that records a changed published file is rejected', async () => {
    const tree = await makeTree();
    const distDir = writeRuntime(tree.guideDir);
    const file = join(distDir, 'runtime', 'hawiyah', 'core', 'index.js');
    appendFileSync(file, '//\n');
    editJson(join(distDir, 'runtime', 'manifest.json'), (manifest) => { manifest.entries[0].sha256 = sha256(readFileSync(file)); });
    await expectOnly(tree, 'HWREG-R8', ['registry-check HWREG-R8: runtime/hawiyah/core/index.js differs from the installed published file'], { mode: 'dist', distDir });
  });

  it('N23: a runtime file missing from the manifest is rejected', async () => {
    const tree = await makeTree();
    const distDir = writeRuntime(tree.guideDir);
    editJson(join(distDir, 'runtime', 'manifest.json'), (manifest) => { manifest.entries.pop(); });
    await expectOnly(tree, 'HWREG-R8', ['registry-check HWREG-R8: runtime/bundles/react.js is not listed in runtime/manifest.json'], { mode: 'dist', distDir });
  });

  it('rejects a derived file whose source integrity differs from the lock', async () => {
    const tree = await makeTree();
    const distDir = writeRuntime(tree.guideDir);
    editJson(join(distDir, 'runtime', 'manifest.json'), (manifest) => { manifest.entries[1].packageIntegrity = 'sha512-other'; });
    const lockIntegrity = readJson(join(tree.guideDir, 'package-lock.json')).packages['node_modules/@hawiyah/react'].integrity;
    await expectOnly(tree, 'HWREG-R8', [`registry-check HWREG-R8: bundles/react.js was derived from @hawiyah/react@0.3.0 with integrity sha512-other; the lock has ${lockIntegrity}`], { mode: 'dist', distDir });
  });

  it('passes a dist without runtime/ while step 60 does not exist', async () => {
    const tree = await makeTree();
    mkdirSync(join(tree.guideDir, 'dist', 'browser'), { recursive: true });
    const result = await check(tree, { mode: 'dist', distDir: join(tree.guideDir, 'dist', 'browser') });
    expect(result.findings).toEqual([]);
    expect(successLines(result, { distLabel: 'dist/browser' }).at(-2)).toBe('registry-check: DIST dist/browser has no runtime/ directory; HWREG-R8 has nothing to compare before stage 4b');
  });

  it('rejects a dist without runtime/manifest.json once step 60 exists', async () => {
    const tree = await makeTree();
    mkdirSync(join(tree.guideDir, 'dist', 'browser'), { recursive: true });
    mkdirSync(join(tree.guideDir, 'scripts', 'build-steps'), { recursive: true });
    writeFileSync(join(tree.guideDir, 'scripts', 'build-steps', '60-runtime.mjs'), 'export default {};\n');
    await expectOnly(tree, 'HWREG-R8', ['registry-check HWREG-R8: runtime/manifest.json is missing'], { mode: 'dist', distDir: join(tree.guideDir, 'dist', 'browser') });
  });
});

describe('HWREG-R9', () => {
  it('N21: a workspace glob that matches guide is rejected', async () => {
    const tree = await makeTree();
    appendFileSync(join(tree.repoDir, 'pnpm-workspace.yaml'), '  - guide\n');
    await expectOnly(tree, 'HWREG-R9', ['registry-check HWREG-R9: pnpm-workspace.yaml glob "guide" matches guide/; the guide must stay outside the workspace']);
  });

  it('rejects a catch-all workspace glob', async () => {
    const tree = await makeTree();
    appendFileSync(join(tree.repoDir, 'pnpm-workspace.yaml'), "  - '*'\n");
    await expectOnly(tree, 'HWREG-R9', ['registry-check HWREG-R9: pnpm-workspace.yaml glob "*" matches guide/; the guide must stay outside the workspace']);
  });
});

describe('output and preview mode', () => {
  it('failure output lists every finding, then the count', async () => {
    const tree = await makeTree();
    setDependency(tree.guideDir, 'dependencies', '@hawiyah/core', '^0.3.0');
    setDependency(tree.guideDir, 'dependencies', '@hawiyah/vue', undefined);
    const result = await check(tree);
    expect(failureLines(result)).toEqual([
      'registry-check HWREG-R1: @hawiyah/vue is missing from dependencies',
      'registry-check HWREG-R1: @hawiyah/core is "^0.3.0"; expected an exact version such as 0.3.0',
      'registry-check: FAILED 2 findings',
    ]);
  });

  async function previewTree() {
    const tree = await makeTree();
    const tarballsDir = join(tree.repoDir, 'package-check');
    cpSync(tree.fixture.tarballs, tarballsDir, { recursive: true });
    for (const name of NAMES) {
      const value = `file:${relative(tree.guideDir, join(tarballsDir, `hawiyah-${name}-${PIN}.tgz`))}`;
      setDependency(tree.guideDir, 'dependencies', `@hawiyah/${name}`, value);
      editJson(join(tree.guideDir, 'package-lock.json'), (lock) => { lock.packages[`node_modules/@hawiyah/${name}`].resolved = value; });
    }
    return { tree, tarballsDir };
  }

  it('preview mode accepts a tree installed from the local tarballs', async () => {
    const { tree, tarballsDir } = await previewTree();
    const result = await check(tree, { mode: 'preview', previewDir: tarballsDir });
    expect(result.findings).toEqual([]);
    expect(successLines(result, { previewLabel: '../package-check' })).toEqual(['registry-check: PREVIEW 7 packages from local tarballs at ../package-check']);
  });

  it('strict mode rejects the same preview tree with R1 and R3 findings', async () => {
    const { tree } = await previewTree();
    const result = await check(tree);
    expect(result.ok).toBe(false);
    expect(codes(result)).toEqual(['HWREG-R1', 'HWREG-R2', 'HWREG-R3']);
    expect(messages(result)).toContain('registry-check HWREG-R1: no @hawiyah dependency has an exact version; the pin cannot be determined');
  });

  it('preview mode rejects a changed local tarball', async () => {
    const { tree, tarballsDir } = await previewTree();
    appendFileSync(join(tarballsDir, `hawiyah-core-${PIN}.tgz`), Buffer.from([0]));
    const result = await check(tree, { mode: 'preview', previewDir: tarballsDir });
    expect(codes(result)).toEqual(['HWREG-R4']);
    expect(messages(result)[0]).toMatch(/^registry-check HWREG-R4: @hawiyah\/core@0\.3\.0: lock integrity sha512-\S+ differs from hawiyah-core-0\.3\.0\.tgz \(sha512-/);
  });
});

describe('build steps 05 and 90', () => {
  it('step 05 selects strict mode, preview mode with the preview context, and refuses a stray preview environment', async () => {
    const { registryMode } = await import('../../build-steps/05-registry.mjs');
    expect(registryMode({ preview: null }, {})).toEqual({ mode: 'strict' });
    expect(registryMode({ preview: { commit: 'abc1234', tarballsDir: '/x' } }, {})).toEqual({ mode: 'preview', previewDir: '/x' });
    expect(() => registryMode({ preview: null }, { HAWIYAH_PREVIEW_BUILD: '1' })).toThrow('registry-check: --preview is only valid in a preview build');
  });

  it('preview mode with a dist directory also checks the runtime files', async () => {
    const tree = await makeTree();
    const tarballsDir = join(tree.repoDir, 'package-check');
    cpSync(tree.fixture.tarballs, tarballsDir, { recursive: true });
    for (const name of NAMES) {
      const value = `file:${relative(tree.guideDir, join(tarballsDir, `hawiyah-${name}-${PIN}.tgz`))}`;
      setDependency(tree.guideDir, 'dependencies', `@hawiyah/${name}`, value);
      editJson(join(tree.guideDir, 'package-lock.json'), (lock) => { lock.packages[`node_modules/@hawiyah/${name}`].resolved = value; });
    }
    const distDir = writeRuntime(tree.guideDir);
    editJson(join(distDir, 'runtime', 'manifest.json'), (manifest) => { manifest.entries.pop(); });
    const result = await check(tree, { mode: 'preview', previewDir: tarballsDir, distDir });
    expect(messages(result)).toEqual(['registry-check HWREG-R8: runtime/bundles/react.js is not listed in runtime/manifest.json']);
  });
});
