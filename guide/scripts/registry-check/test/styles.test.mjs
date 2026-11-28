// HWREG-R8 for the package stylesheet (styles.mjs) and the conditions under which
// step 90 counts as passed (build-steps/90-registry-dist.mjs).
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import step, { requireDerived, stepOptions } from '../../build-steps/90-registry-dist.mjs';
import { format } from '../messages.mjs';
import { deriveStylesBundle, ruleStylesDerived } from '../styles.mjs';

const guideDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const scratch = mkdtempSync(join(tmpdir(), 'hw-styles-derived-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

/** A dist directory holding the given package bundle and media. */
function writeDist(name, css, media) {
  const dir = mkdtempSync(join(scratch, 'dist-'));
  writeFileSync(join(dir, name), css);
  mkdirSync(join(dir, 'media'));
  for (const [path, buffer] of media) writeFileSync(join(dir, path), buffer);
  return dir;
}

async function check(distDir, derive) {
  const messages = [];
  const ctx = { distDir, guideDir, report: (key, params) => messages.push(format(key, params).message) };
  await ruleStylesDerived(ctx, derive);
  return { messages, derived: ctx.derivedStyles ?? null };
}

describe('package stylesheet derived from the installed @hawiyah/styles', () => {
  let real;
  beforeAll(async () => {
    real = await deriveStylesBundle({ guideDir });
  }, 60_000);

  it('the derivation reads only its entry and the three imports of @hawiyah/styles from guide/node_modules', () => {
    const inputs = Object.keys(real.metafile.inputs).filter((path) => path.endsWith('.css'));
    expect(inputs.sort()).toEqual([
      'node_modules/@hawiyah/styles/dist/fonts.css',
      'node_modules/@hawiyah/styles/dist/reset.css',
      'node_modules/@hawiyah/styles/dist/styles.css',
      'src/package-styles.css',
    ]);
    expect(real.media.size).toBeGreaterThan(0);
  });

  it('an output equal to the derivation passes', async () => {
    const dist = writeDist('styles-ABCDEFGH.css', real.css, real.media);
    const result = await check(dist, async () => real);
    expect(result.messages).toEqual([]);
    expect(result.derived).toEqual({ name: 'styles-ABCDEFGH.css', bytes: Buffer.byteLength(real.css), media: real.media.size });
  });

  it('a guide rule in the package bundle differs from the derivation', async () => {
    const dist = writeDist('styles-ABCDEFGH.css', `${real.css}td code{display:inline-block}`, real.media);
    const result = await check(dist, async () => real);
    expect(result.messages).toEqual([
      'registry-check HWREG-R8: styles-ABCDEFGH.css differs from the bundle derived again from the verified @hawiyah/styles; src/styles.css holds only its three imports',
    ]);
    expect(result.derived).not.toBeNull();
  });

  it('a changed, missing or extra media file is reported', async () => {
    const [first, second] = [...real.media.keys()];
    const media = new Map(real.media);
    media.set(first, Buffer.from('<svg/>'));
    media.delete(second);
    media.set('media/guide-icon.svg', Buffer.from('<svg/>'));
    const dist = writeDist('styles-ABCDEFGH.css', real.css, media);
    const result = await check(dist, async () => real);
    expect(result.messages.sort()).toEqual([
      `registry-check HWREG-R8: ${first} differs from the derived file`,
      `registry-check HWREG-R8: ${second} missing from the output`,
      'registry-check HWREG-R8: media/guide-icon.svg is not a file of the package bundle derived from @hawiyah/styles',
    ].sort());
  });

  it('no package bundle, two bundles and a failed derivation are reported', async () => {
    const none = mkdtempSync(join(scratch, 'none-'));
    expect((await check(none, async () => real)).messages).toEqual([
      'registry-check HWREG-R8: the output has 0 package stylesheets styles-<hash>.css (none); expected exactly one',
    ]);
    const two = writeDist('styles-ABCDEFGH.css', real.css, real.media);
    writeFileSync(join(two, 'styles-IJKLMNOP.css'), real.css);
    expect((await check(two, async () => real)).messages[0]).toMatch(/has 2 package stylesheets/);
    const failing = writeDist('styles-ABCDEFGH.css', real.css, real.media);
    expect((await check(failing, async () => { throw new Error('no esbuild'); })).messages).toEqual([
      'registry-check HWREG-R8: the package stylesheet could not be derived again from the verified @hawiyah/styles (no esbuild)',
    ]);
  });
});

describe('step 90 compares what it claims', () => {
  const ctx = (configuration, preview = null) => ({
    guideDir: '/g',
    repoDir: '/',
    browserDir: 'dist/browser',
    outDir: 'dist',
    configuration,
    preview,
    log() {},
  });

  it('derives the runtime in every mode and the package stylesheet in production', () => {
    expect(stepOptions(ctx('production'))).toMatchObject({ mode: 'dist', distDir: '/g/dist/browser', derive: true, deriveStyles: true });
    expect(stepOptions(ctx('development'))).toMatchObject({ mode: 'dist', derive: true, deriveStyles: false });
    expect(stepOptions(ctx('production', { tarballsDir: '/t' }))).toMatchObject({ mode: 'preview', derive: true, deriveStyles: true });
  });

  it('fails a passing check in dist mode that did not derive', async () => {
    const passing = { ok: true, mode: 'dist', findings: [], packages: [], runtime: null, resolved: [] };
    const derived = { files: 1, published: 1, linked: 0, bundled: 0, specifiers: 0, bundles: 0 };
    const styles = { name: 'styles-A.css', bytes: 1, media: 0 };
    expect(() => requireDerived({ ...passing, derived: null, derivedStyles: styles }, ctx('production'))).toThrow(/the runtime was not derived again/);
    expect(() => requireDerived({ ...passing, derived, derivedStyles: null }, ctx('production'))).toThrow(/the package stylesheet was not derived again/);
    expect(() => requireDerived({ ...passing, derived, derivedStyles: null }, ctx('development'))).not.toThrow();
    expect(() => requireDerived({ ...passing, derived, derivedStyles: styles }, ctx('production'))).not.toThrow();
    await expect(step.run(ctx('production'), async () => ({ ...passing, derived: null, derivedStyles: null }))).rejects.toThrow(/step 90 compared less than it must/);
    await expect(step.run(ctx('production'), async (options) => ({ ...passing, pin: '0.3.0', registryUrl: 'r', derived: options.derive ? derived : null, derivedStyles: options.deriveStyles ? styles : null }))).resolves.toBeUndefined();
  });
});
