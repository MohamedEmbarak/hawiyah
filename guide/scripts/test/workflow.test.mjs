// The shape of .github/workflows/guide.yml (5a.1): one build without scope options,
// the single-page check tests after it (lead decision L12 of 5a), step 80 in four
// shards and the browser tests in eight (L11) on that build, and a final job that needs
// every shard job and fails unless the build is deployable and the union of the shard
// reports covers every live group and every test. The sparse checkout and the path
// filters are compared with build-inputs.json in build-inputs.test.mjs.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const guideDir = fileURLToPath(new URL('../../', import.meta.url));
const text = readFileSync(join(guideDir, '..', '.github', 'workflows', 'guide.yml'), 'utf8');
const workflow = parse(text);
const runs = (job) => job.steps.filter((step) => typeof step.run === 'string').map((step) => step.run);
const allRuns = Object.values(workflow.jobs).flatMap(runs);

describe('guide.yml', () => {
  it('has a build, the equivalence and browser test shards, and a final job', () => {
    expect(Object.keys(workflow.jobs)).toEqual(['build', 'equivalence', 'e2e', 'complete']);
  });

  it('never limits a build or a test run: no --pages, --docs, --only, --draft, --grep or --pass-with-no-tests', () => {
    for (const command of allRuns) {
      expect(command).not.toMatch(/--(?:pages|docs|only|draft|grep|grep-invert|pass-with-no-tests|last-failed|update-snapshots)\b/);
      expect(command).not.toMatch(/\btest\.only\b/);
    }
  });

  it('builds once, with every step but 80, and lists the browser tests of that build', () => {
    const build = runs(workflow.jobs.build);
    const builds = allRuns.filter((command) => /npm run build(?!:)\b/.test(command));
    expect(builds).toEqual(['npm run build -- --defer-equivalence']);
    expect(build).toContain('npm run build -- --defer-equivalence');
    expect(build.some((command) => command.includes('npx playwright test --project=prod --list --reporter=json > .cache/e2e/list.json'))).toBe(true);
    for (const name of ['equivalence', 'e2e', 'complete']) {
      expect(workflow.jobs[name].steps.some((step) => step.uses?.startsWith('actions/download-artifact@') && step.with?.name === 'guide-build'), name).toBe(true);
    }
  });

  it('runs the single-page check tests in the build job right after the production build', () => {
    const build = runs(workflow.jobs.build);
    const at = build.indexOf('npm run build -- --defer-equivalence');
    expect(at).toBeGreaterThanOrEqual(0);
    expect(build[at + 1]).toBe('npm run test:check-page');
    expect(allRuns.filter((command) => command.includes('test:check-page'))).toEqual(['npm run test:check-page']);
  });

  it('runs step 80 in 4 shards and the browser tests in 8 shards, 1..n of n over the whole build', () => {
    for (const [name, count] of [['equivalence', 4], ['e2e', 8]]) {
      const job = workflow.jobs[name];
      expect(job.needs, name).toBe('build');
      const shards = job.strategy.matrix.shard;
      const total = shards.length;
      expect(total, name).toBe(count);
      expect(shards, name).toEqual(Array.from({ length: total }, (_, n) => n + 1));
      expect(job.strategy['fail-fast'], name).toBe(false);
    }
    const total = workflow.jobs.equivalence.strategy.matrix.shard.length;
    expect(runs(workflow.jobs.equivalence)).toContain(`node scripts/equivalence/run.mjs --shard \${{ matrix.shard }}/${total} --report .cache/equivalence/shard-\${{ matrix.shard }}.json`);
    expect(runs(workflow.jobs.e2e)).toContain(`npx playwright test --project=prod --shard=\${{ matrix.shard }}/${workflow.jobs.e2e.strategy.matrix.shard.length} --reporter=line,json`);
  });

  it('ends with a job that needs every shard job and fails unless the build is deployable and the shards cover everything', () => {
    const complete = workflow.jobs.complete;
    expect([...complete.needs].sort()).toEqual(['build', 'e2e', 'equivalence']);
    // It runs when a needed job failed, so a failure is reported as its failure, not as a skip.
    expect(complete.if).toBe('${{ always() }}');
    const commands = runs(complete).join('\n');
    expect(commands).toMatch(/\[ "\$BUILD" = success \] && \[ "\$EQUIVALENCE" = success \] && \[ "\$E2E" = success \]/);
    expect(complete.steps.find((step) => step.name === 'Every job and shard passed').env).toEqual({
      BUILD: '${{ needs.build.result }}',
      EQUIVALENCE: '${{ needs.equivalence.result }}',
      E2E: '${{ needs.e2e.result }}',
    });
    expect(commands).toContain('node scripts/build-scope.mjs --require-deployable --dir dist');
    expect(commands).toContain('node scripts/equivalence/merge.mjs --manifest src/generated/content/manifest.json');
    expect(commands).toContain('node scripts/e2e/merge.mjs --list .cache/e2e/list.json');
  });

  // Verification 1 of 07763ce (G7 of the 5a fix round): a continue-on-error passed the shape test.
  it('lets no job or step continue on an error, and runs every step of the final job', () => {
    const found = [];
    for (const [name, job] of Object.entries(workflow.jobs)) {
      if ('continue-on-error' in job) found.push(`job ${name}: continue-on-error ${job['continue-on-error']}`);
      for (const [index, step] of (job.steps ?? []).entries()) {
        if ('continue-on-error' in step) found.push(`job ${name} step ${step.name ?? index + 1}: continue-on-error ${step['continue-on-error']}`);
      }
    }
    expect(found).toEqual([]);
    expect(text).not.toMatch(/continue-on-error/);
    const always = (value) => /^(?:\$\{\{\s*)?always\(\)(?:\s*\}\})?$/.test(String(value).trim());
    const complete = workflow.jobs.complete;
    expect(always(complete.if), `complete if: ${complete.if}`).toBe(true);
    expect(complete.steps.filter((step) => 'if' in step && !always(step.if)).map((step) => `${step.name ?? step.uses}: if ${step.if}`)).toEqual([]);
  });

  it('uploads the hidden .cache directories it needs', () => {
    const upload = workflow.jobs.build.steps.find((step) => step.name === 'Upload the build');
    expect(upload.with['include-hidden-files']).toBe(true);
    for (const path of ['guide/dist/browser', 'guide/dist/build-info.json', 'guide/src/generated', 'guide/.cache/content', 'guide/.cache/e2e/list.json']) {
      expect(upload.with.path).toContain(path);
    }
  });
});
