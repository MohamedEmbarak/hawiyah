// Shared paths and runners of the content pipeline tests.

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { processPair, readComponents } from '../pipeline.mjs';

export const fixturesDir = resolve(fileURLToPath(new URL('./fixtures', import.meta.url)));
export const docsDir = join(fixturesDir, 'docs');
export const componentsDir = join(docsDir, 'components');
export const invalidDir = join(fixturesDir, 'invalid');
export const guideDir = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
export const repoDir = resolve(guideDir, '..');
export const components = readComponents(join(docsDir, 'components.json'));

/**
 * Fixture A stands for a component that no package exports (HWC-LIVE7): it is
 * shown by the package Button and by a paragraph, as a fake component would name
 * its own class, export and selector.
 */
export const fixtureNames = {
  vanilla: { classes: ['hw-button', 'hw-type'], hook: 'fixture-a' },
  react: ['Button', 'p'],
  vue: ['Button', 'p'],
  angular: { selectors: ['button[hwButton]', 'p'], classes: ['HwButtonDirective'] },
};

export const read = (path) => readFileSync(path, 'utf8');
export const validEn = () => read(join(componentsDir, 'fixture-a.md'));
export const validAr = () => read(join(componentsDir, 'fixture-a.ar.md'));

/**
 * Runs the pair check for fixture-a with one side replaced.
 * @param {{ en?: string, ar?: string, enLabel?: string, arLabel?: string }} replace
 */
export function runPair(replace = {}) {
  return processPair({
    id: 'fixture-a',
    entry: components.get('fixture-a'),
    enText: replace.en ?? validEn(),
    arText: replace.ar ?? validAr(),
    enPath: join(componentsDir, 'fixture-a.md'),
    arPath: join(componentsDir, 'fixture-a.ar.md'),
    enLabel: replace.enLabel,
    arLabel: replace.arLabel,
    exceptions: replace.exceptions,
    repoDir,
    componentsDir,
    built: new Set(['fixture-a']),
    names: replace.names ?? fixtureNames,
    fixture: null,
    liveExceptions: replace.liveExceptions ?? [],
    claimExceptions: replace.claimExceptions ?? [],
  });
}

/** Runs the pair check with an invalid fixture file in place of its side. */
export function runInvalid(name) {
  const text = read(join(invalidDir, name));
  const label = `invalid/${name}`;
  return name.endsWith('.ar.md') ? runPair({ ar: text, arLabel: label }) : runPair({ en: text, enLabel: label });
}
