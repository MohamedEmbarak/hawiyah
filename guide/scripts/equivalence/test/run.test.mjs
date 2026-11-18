// Tests of the runner's pure parts: known differences, failure lines, the harness
// server and bundle, the interaction checks' key choice.
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import tabsClick from '../checks/tabs-click.mjs';
import tabsKeyboard, { nextTabKey } from '../checks/tabs-keyboard.mjs';
import { bundleHarness, differenceOf, failureLine, harnessUrl, mountSelector, startHarnessServer, validateKnownDifferences } from '../run.mjs';

const known = JSON.parse(readFileSync(new URL('../known-differences.json', import.meta.url), 'utf8'));
const group = { id: 'tabs', lang: 'ar', example: 'basic', blocks: { vanilla: { line: 19 } } };
const entry = {
  id: 'tabs-bar',
  component: 'tabs',
  aspect: 'structure',
  description: 'Example.',
  source: 'https://github.com/example/example/issues/1',
  approvedBy: 'lead',
};

describe('known differences', () => {
  it('start empty in milestone 4', () => {
    expect(known).toEqual([]);
    expect(validateKnownDifferences(known).errors).toEqual([]);
  });

  it('accept a complete entry approved by the lead', () => {
    const { entries, errors } = validateKnownDifferences([entry]);
    expect(errors).toEqual([]);
    expect(differenceOf({ ...group, differences: 'tabs-bar' }, entries)).toEqual({ entry });
  });

  it('reject incomplete, unapproved, unsourced and repeated entries', () => {
    const { errors } = validateKnownDifferences([
      { ...entry, approvedBy: 'builder' },
      { ...entry, aspect: 'focus', id: 'b' },
      { ...entry, source: 'see notes', id: 'c' },
      { ...entry, description: '', id: 'd', extra: 1 },
      entry,
      entry,
    ]);
    expect(errors.join('\n')).toMatch(/entry 1: approvedBy must be 'lead'/);
    expect(errors.join('\n')).toMatch(/entry 2: aspect must be structure, aria or screenshot/);
    expect(errors.join('\n')).toMatch(/entry 3: source must name/);
    expect(errors.join('\n')).toMatch(/entry 4 has unknown fields extra/);
    expect(errors.join('\n')).toMatch(/entry 4 needs a non-empty description/);
    expect(errors.join('\n')).toMatch(/entry 6: id tabs-bar is repeated/);
    expect(validateKnownDifferences({}).errors).toHaveLength(1);
  });

  it('fail a group that names no entry or an entry of another component', () => {
    const { entries } = validateKnownDifferences([{ ...entry, component: 'button' }]);
    expect(differenceOf({ ...group, differences: 'missing' }, entries).error).toBe(
      'HWE-KD docs/components/tabs.ar.md:19: differences=missing names no entry of scripts/equivalence/known-differences.json',
    );
    expect(differenceOf({ ...group, differences: 'tabs-bar' }, entries).error).toMatch(/documents component button, not tabs/);
  });
});

describe('runner', () => {
  it('formats failures as <code> <file>:<line>: <message>', () => {
    expect(failureLine('HWE-STRUCT', group, 'x')).toBe('HWE-STRUCT docs/components/tabs.ar.md:19: x');
    expect(failureLine('HWE-ARIA', { ...group, lang: 'en' }, 'y')).toBe('HWE-ARIA docs/components/tabs.md:19: y');
  });

  it('reads the mount of each framework', () => {
    expect(mountSelector('angular')).toBe('#hawiyah-preview-root > guide-example');
    expect(mountSelector('vue')).toBe('#hawiyah-preview-root > #app');
  });

  it('chooses the next-tab key by direction and orientation', () => {
    expect(nextTabKey('ltr', 'horizontal')).toBe('ArrowRight');
    expect(nextTabKey('rtl', 'horizontal')).toBe('ArrowLeft');
    expect(nextTabKey('rtl', 'vertical')).toBe('ArrowDown');
    expect(tabsKeyboard.steps.map((step) => step.name)).toEqual(['focus-selected-tab', 'next-tab-key', 'end', 'home']);
    expect(tabsClick.steps.map((step) => step.name)).toEqual(['click-second-tab']);
  });

  const scratch = mkdtempSync(join(tmpdir(), 'hawiyah-equivalence-'));
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));

  it('bundles the harness with the frame sources inlined as text', async () => {
    const file = join(scratch, 'harness.js');
    await bundleHarness(file);
    const code = readFileSync(file, 'utf8');
    expect(code).toContain('hawiyahFrameBootstrap');
    expect(code).toContain('hawiyah-guide-frame');
    expect(code).not.toMatch(/^\s*import\s/m);
  });

  it('serves the harness under the base path and dist files beside it, never writing into dist', async () => {
    const dist = join(scratch, 'dist');
    mkdirSync(dist);
    writeFileSync(join(dist, 'index.html'), '<p>dist</p>');
    const script = join(scratch, 'h.js');
    writeFileSync(script, 'export {};');
    const served = await startHarnessServer({ dir: dist, base: '/hawiyah/', harnessFile: script });
    try {
      const page = await fetch(`${served.origin}/hawiyah/__harness/`);
      const html = await page.text();
      expect(html).toContain('<base href="/hawiyah/">');
      expect(html).toContain('src="__harness/harness.js"');
      expect(await (await fetch(`${served.origin}/hawiyah/__harness/harness.js`)).text()).toBe('export {};');
      expect(await (await fetch(`${served.origin}/hawiyah/`)).text()).toBe('<p>dist</p>');
      expect(harnessUrl(served.origin, '/hawiyah/', group, '0.3.0')).toBe(
        `${served.origin}/hawiyah/__harness/?id=tabs&lang=ar&example=basic&pin=0.3.0&frameworks=vanilla%2Creact%2Cvue%2Cangular`,
      );
    } finally {
      await served.close();
    }
  });
});
