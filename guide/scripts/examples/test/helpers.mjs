// Shared paths of the example compiler tests. Work directories live under
// guide/.cache (gitignored) because the type checkers resolve the installed
// packages from guide/node_modules.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const testDir = dirname(fileURLToPath(import.meta.url));
export const guideDir = resolve(testDir, '..', '..', '..');
export const fixturesDir = join(testDir, 'fixtures');
export const workRoot = join(guideDir, '.cache', 'examples-test');

export const readFixture = (name) => JSON.parse(readFileSync(join(fixturesDir, name), 'utf8'));
