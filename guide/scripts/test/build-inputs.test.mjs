// guide/build-inputs.json is the single source of the repository paths the guide
// build reads: the two path filters and the sparse checkout of the guide workflow
// (in every job) must list exactly these paths (decision E-F).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { BUILD_INPUTS } from '../content/config.mjs';

const guideDir = fileURLToPath(new URL('../../', import.meta.url));
const workflow = parse(readFileSync(join(guideDir, '..', '.github', 'workflows', 'guide.yml'), 'utf8'));
const inputs = JSON.parse(readFileSync(join(guideDir, 'build-inputs.json'), 'utf8')).inputs;

/** The path filter of an input: a directory with /**, a file as it is. */
const filter = (path) => (path.endsWith('/') ? `${path}**` : path);

describe('build inputs', () => {
  it('each input has a reason, and the guide and the docs are inputs', () => {
    for (const entry of inputs) expect(entry.reason.length, entry.path).toBeGreaterThan(10);
    expect(BUILD_INPUTS).toEqual(inputs.map((entry) => entry.path));
    expect(BUILD_INPUTS).toEqual(expect.arrayContaining(['guide/', 'docs/', '.github/workflows/guide.yml']));
  });

  it('the push and pull request path filters of guide.yml are the list', () => {
    const on = workflow.on;
    expect(on.push.paths).toEqual(BUILD_INPUTS.map(filter));
    expect(on.pull_request.paths).toEqual(BUILD_INPUTS.map(filter));
  });

  it('every job of guide.yml checks out the list sparsely and fails when the package sources are present', () => {
    const jobs = Object.entries(workflow.jobs);
    expect(jobs.length).toBeGreaterThan(1);
    for (const [name, job] of jobs) {
      const checkouts = job.steps.filter((step) => typeof step.uses === 'string' && step.uses.startsWith('actions/checkout@'));
      expect(checkouts.length, name).toBe(1);
      const [checkout] = checkouts;
      expect(checkout.with['sparse-checkout-cone-mode'], name).toBe(false);
      const sparse = checkout.with['sparse-checkout'].split('\n').map((line) => line.trim()).filter(Boolean);
      expect(sparse, name).toEqual(BUILD_INPUTS.map((path) => `/${path}`));
      // Right after the checkout, before anything else runs.
      const absent = job.steps[job.steps.indexOf(checkout) + 1];
      expect(absent.name, name).toBe('The package sources are absent');
      for (const dir of ['packages', 'apps', 'examples']) expect(absent.run, name).toContain(dir);
      expect(absent.run, name).toContain('exit 1');
    }
  });
});
