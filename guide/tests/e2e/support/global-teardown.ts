import { join } from 'node:path';
import type { FullConfig } from '@playwright/test';
// @ts-expect-error: plain ES module of the build scripts, without type declarations.
import { readUsed, structureLabels, structureUnion } from '../../../scripts/e2e/merge.mjs';
import { documents } from './routes';
import { USED_DIR } from './structure-used';

// The union of the structure results (support/structure-used.ts): when every page and
// both opened states ran in this run, every listed declaration must be used by a rule
// on some page; an error here fails the run. A filtered or sharded run leaves the
// union to scripts/e2e/merge.mjs, which guide.yml runs over every shard.
export default function globalTeardown(config: FullConfig): void {
  const project = config.projects.find((entry) => entry.name === 'prod');
  if (!project) return;
  const results = readUsed([join(project.outputDir, USED_DIR)]) as { label: string }[];
  if (results.length === 0) return;
  const labels = structureLabels(documents) as string[];
  const union = structureUnion(results, labels) as { complete: boolean; missing: string[]; problems: string[] };
  if (!union.complete) {
    console.log(`styling-structure: ${labels.length - union.missing.length} of ${labels.length} structure results in this run; the union of the used declarations is judged when every page runs, or by scripts/e2e/merge.mjs over the shards`);
    return;
  }
  if (union.problems.length > 0) throw new Error(union.problems.join('\n'));
  console.log(`styling-structure: every listed declaration is used by a rule on some page (${labels.length - 2} pages and 2 opened states)`);
}
