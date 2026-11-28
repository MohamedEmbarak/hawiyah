import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { TestInfo } from '@playwright/test';
import { INHERITED_ALLOWED, PLACEMENT_ALLOWED, entryKey } from './styling-rule';

// The structural half of the styling rule runs per page. Each passing page test writes
// the listed declarations a rule on that page used into
// <outputDir>/structure-used/<label>.json; the union over every page is judged by the
// global teardown when every page ran in this run, and by scripts/e2e/merge.mjs over
// the shards of guide.yml (README.md, "The styling rule").

/** Directory of the structure results under a project's output directory. */
export const USED_DIR = 'structure-used';

/** Every listed declaration, as entryKey writes it. */
export const LISTED: readonly string[] = [...PLACEMENT_ALLOWED, ...INHERITED_ALLOWED].map(entryKey);

/** Writes the declarations a passing structure test used. */
export function recordUsed(testInfo: TestInfo, label: string, used: Iterable<string>): void {
  const dir = join(testInfo.project.outputDir, USED_DIR);
  mkdirSync(dir, { recursive: true });
  const name = label.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page';
  writeFileSync(join(dir, `${name}.json`), `${JSON.stringify({ label, used: [...new Set(used)].sort(), listed: LISTED }, null, 2)}\n`);
}
