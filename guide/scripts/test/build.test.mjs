// Tests of the step runner scripts/build.mjs: the step files are exactly the
// planned steps, and a missing or unplanned step stops the build.
import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DEVELOPMENT_SKIPS, GENERATE_STEPS, PLANNED_STEPS, parseArgs, planned, resolvePlan } from '../build.mjs';

const stepsDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'build-steps');
const stepFiles = readdirSync(stepsDir).filter((f) => f.endsWith('.mjs'));

describe('build plan', () => {
  it('the files of scripts/build-steps are exactly PLANNED_STEPS', () => {
    expect(stepFiles.map((f) => f.replace(/\.mjs$/, '')).sort()).toEqual([...PLANNED_STEPS].sort());
    expect(readdirSync(stepsDir).filter((f) => !f.endsWith('.mjs'))).toEqual([]);
  });

  it('each step declares the configurations the plan runs it in', async () => {
    for (const id of PLANNED_STEPS) {
      const step = (await import(pathToFileURL(join(stepsDir, `${id}.mjs`)).href)).default;
      expect(step.id, id).toBe(id);
      expect(step.generate, id).toBe(GENERATE_STEPS.includes(id));
      expect(step.configurations.includes('production'), id).toBe(true);
      expect(step.configurations.includes('development'), id).toBe(!DEVELOPMENT_SKIPS.includes(id));
    }
  });

  it('fails when a planned step file is missing', () => {
    const files = stepFiles.filter((f) => f !== '80-equivalence.mjs' && f !== '90-registry-dist.mjs');
    expect(() => resolvePlan(files, parseArgs([]))).toThrow(
      'planned step file(s) missing in scripts/build-steps: 80-equivalence, 90-registry-dist',
    );
    // Also when the missing step is not run by the requested configuration.
    expect(() => resolvePlan(files, parseArgs(['--generate-only']))).toThrow('80-equivalence');
  });

  it('fails on a step file that is not planned and on an unknown --only id', () => {
    expect(() => resolvePlan([...stepFiles, '55-extra.mjs'], parseArgs([]))).toThrow('step file(s) not in PLANNED_STEPS: 55-extra');
    expect(() => resolvePlan(stepFiles, parseArgs(['--only', '20-content,21-nothing']))).toThrow('--only names unknown step(s): 21-nothing');
  });

  it('returns the planned steps of each configuration in order', () => {
    expect(resolvePlan(stepFiles, parseArgs([]))).toEqual(PLANNED_STEPS);
    expect(resolvePlan(stepFiles, parseArgs(['--configuration', 'development']))).toEqual(
      PLANNED_STEPS.filter((id) => !DEVELOPMENT_SKIPS.includes(id)),
    );
    expect(resolvePlan(stepFiles, parseArgs(['--generate-only']))).toEqual(GENERATE_STEPS);
    expect(resolvePlan(stepFiles, parseArgs(['--only', '90-registry-dist,20-content']))).toEqual(['20-content', '90-registry-dist']);
    expect(planned('80-equivalence', parseArgs(['--configuration', 'development']))).toBe(false);
  });
});
